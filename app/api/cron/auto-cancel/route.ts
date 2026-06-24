import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { parseISO, addHours, startOfDay, isBefore, isAfter } from 'date-fns';

export async function GET(request: Request) {
  try {
    // 1. Authenticate the cron job
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    const roomId = searchParams.get('roomId');

    const isAuthorized = 
      (authHeader === `Bearer ${cronSecret}`) || 
      (searchParams.get('secret') === cronSecret) ||
      (roomId !== null); // Public can trigger cleanup for a specific room

    if (!isAuthorized && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase admin not initialized' }, { status: 500 });
    }

    // Fetch all active bookings (Pending or Confirmed or Completed, we only need Pending/Confirmed)
    const querySnapshot = await adminDb.collection("bookings").where("status", "in", ["Pending", "Confirmed"]).get();
    
    const now = new Date();
    
    // Timeframes
    const REMINDER_PERIOD_MS = 12 * 60 * 60 * 1000; // 12 hours
    const ADMIN_FOLLOWUP_PERIOD_MS = 14 * 60 * 60 * 1000; // 14 hours
    const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000; // 24 hours

    let systemCancelledCount = 0;
    let guestReminderCount = 0;
    let adminFollowUpCount = 0;
    let noShowAlertCount = 0;
    let checkoutReminderCount = 0;

    for (const bookingDoc of querySnapshot.docs) {
      const data = bookingDoc.data();
      
      // If roomId filter is provided, skip other rooms
      if (roomId && data.roomId !== roomId) continue;

      // PENDING BOOKINGS LOGIC
      if (data.status === 'Pending' && data.createdAt) {
        const createdAtDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        const elapsedMs = now.getTime() - createdAtDate.getTime();

        if (elapsedMs > GRACE_PERIOD_MS) {
          // 24 HOURS: System Cancelled
          await adminDb.collection("bookings").doc(bookingDoc.id).update({
            status: 'System Cancelled'
          });

          await adminDb.collection("mail").add({
            to: data.email,
            message: {
              subject: "Reservation Expired - Luxe Hotel",
              html: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
                  <h1 style="color: #111; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">Luxe Hotel</h1>
                  <p>Dear ${data.guestName},</p>
                  <p>We are writing to inform you that your 24-hour reservation hold for the <strong>${data.roomName}</strong> has unfortunately expired.</p>
                  <div style="background-color: #fff5f5; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #b91c1c;"><strong>Status: Auto-Cancelled (Payment window elapsed)</strong></p>
                  </div>
                  <p>We would still absolutely love to host you. Please visit our website again whenever you are ready to make a new reservation.</p>
                  <br/>
                  <a href="https://vuxe-hotel.vercel.app" style="display: inline-block; background-color: #111; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Book Again</a>
                  <br/><br/>
                  <p>Warm regards,<br/><strong>The Luxe Team</strong></p>
                </div>
              `
            }
          });

          systemCancelledCount++;
          continue; // Move to next booking
        } 
        
        if (elapsedMs > ADMIN_FOLLOWUP_PERIOD_MS && data.reminderSent && !data.adminReminderSent) {
          // 14 HOURS: Admin Follow-up
          await adminDb.collection("bookings").doc(bookingDoc.id).update({
            adminReminderSent: true
          });

          await adminDb.collection("mail").add({
            to: "somtoadmin@gmail.com",
            message: {
              subject: `URGENT: Follow-up required for Pending Booking ${data.bookingRef}`,
              html: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
                  <h2 style="color: #b91c1c;">Pending Booking Alert</h2>
                  <p>The booking <strong>${data.bookingRef}</strong> for ${data.guestName} has been pending for over 14 hours. The guest was sent an automated reminder 2 hours ago but has not completed the reservation.</p>
                  <p><strong>Please contact the guest immediately:</strong></p>
                  <ul>
                    <li>Email: ${data.email}</li>
                    <li>Phone: ${data.phone || 'N/A'}</li>
                  </ul>
                  <p>If they do not confirm, this booking will be automatically cancelled by the system in 10 hours.</p>
                </div>
              `
            }
          });

          adminFollowUpCount++;
        } 
        else if (elapsedMs > REMINDER_PERIOD_MS && !data.reminderSent) {
          // 12 HOURS: Guest Reminder
          await adminDb.collection("bookings").doc(bookingDoc.id).update({
            reminderSent: true
          });

          await adminDb.collection("mail").add({
            to: data.email,
            message: {
              subject: "Action Required: Complete Your Luxe Hotel Reservation",
              html: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
                  <h1 style="color: #111; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">Luxe Hotel</h1>
                  <p>Dear ${data.guestName},</p>
                  <p>We noticed that your reservation for the <strong>${data.roomName}</strong> is still pending confirmation.</p>
                  <p>To ensure your suite is perfectly prepared for your arrival, we kindly request that you complete your reservation details and payment within the next 12 hours. As a highly sought-after destination, we can only hold unconfirmed reservations for a maximum of 24 hours.</p>
                  <br/>
                  <p>Our concierge team remains at your disposal should you require any assistance with your itinerary or special arrangements.</p>
                  <br/>
                  <p>Warm regards,<br/><strong>The Luxe Team</strong></p>
                </div>
              `
            }
          });
          
          guestReminderCount++;
        }
      }

      // CONFIRMED BOOKINGS LOGIC
      if (data.status === 'Confirmed') {
        const cInDateStr = data.checkInDate || data.checkIn;
        const cOutDateStr = data.checkOutDate || data.checkOut;
        
        if (!cInDateStr || !cOutDateStr) continue;

        // 36-Hour No-Show Alert (Guest NOT checked in)
        if (!data.checkedIn && !data.noShowAlertSent) {
          try {
            const checkInDateObj = parseISO(cInDateStr);
            const midnightCheckIn = startOfDay(checkInDateObj); // 12:00 AM on check-in date
            const noShowThreshold = addHours(midnightCheckIn, 36); // 36 hours later (e.g., noon the next day)

            if (isAfter(now, noShowThreshold)) {
              await adminDb.collection("bookings").doc(bookingDoc.id).update({
                noShowAlertSent: true
              });

              await adminDb.collection("mail").add({
                to: "somtoadmin@gmail.com",
                message: {
                  subject: `NO-SHOW ALERT: Guest ${data.guestName} (${data.bookingRef})`,
                  html: `
                    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
                      <h2 style="color: #b91c1c;">Potential No-Show</h2>
                      <p>The confirmed booking <strong>${data.bookingRef}</strong> for ${data.guestName} was scheduled for check-in on ${cInDateStr}. It has now been over 36 hours since the start of their check-in date, and they are still not marked as checked-in.</p>
                      <p><strong>Please contact the guest to confirm their arrival:</strong></p>
                      <ul>
                        <li>Email: ${data.email}</li>
                        <li>Phone: ${data.phone || 'N/A'}</li>
                        <li>Room: ${data.roomName}</li>
                      </ul>
                      <p>If the guest is not arriving, please cancel the booking to free up room inventory.</p>
                    </div>
                  `
                }
              });

              noShowAlertCount++;
            }
          } catch (e) {
            console.error("Error calculating no-show threshold:", e);
          }
        }

        // 3-Hour Checkout Reminder (Guest IS checked in)
        if (data.checkedIn && !data.checkedOut && !data.checkoutReminderSent) {
          try {
            const checkOutDateObj = parseISO(cOutDateStr);
            const checkoutTime = addHours(startOfDay(checkOutDateObj), 11); // 11:00 AM standard checkout
            const reminderTime = addHours(checkoutTime, -3); // 8:00 AM (3 hours before)

            // Trigger if we are past the reminder time but before checkout time
            if (isAfter(now, reminderTime) && isBefore(now, checkoutTime)) {
              await adminDb.collection("bookings").doc(bookingDoc.id).update({
                checkoutReminderSent: true
              });

              await adminDb.collection("mail").add({
                to: "somtoadmin@gmail.com",
                message: {
                  subject: `ACTION REQUIRED: Call Room ${data.roomName} for Checkout`,
                  html: `
                    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
                      <h2 style="color: #1d4ed8;">Checkout Courtesy Call Required</h2>
                      <p>The guest <strong>${data.guestName}</strong> in <strong>${data.roomName}</strong> is scheduled to check out today at 11:00 AM.</p>
                      <p>Please call their room to remind them of the upcoming checkout time and assist them with any luggage or transport requests.</p>
                      <p><strong>Booking Ref:</strong> ${data.bookingRef}</p>
                    </div>
                  `
                }
              });

              checkoutReminderCount++;
            }
          } catch (e) {
            console.error("Error calculating checkout reminder:", e);
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Cron operations executed successfully.',
      operations: {
        systemCancelled: systemCancelledCount,
        guestReminders: guestReminderCount,
        adminFollowUps: adminFollowUpCount,
        noShowAlerts: noShowAlertCount,
        checkoutReminders: checkoutReminderCount
      }
    });

  } catch (error: any) {
    console.error('Master cron error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
