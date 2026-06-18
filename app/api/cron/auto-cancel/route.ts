import { NextResponse } from 'next/server';
import { collection, getDocs, query, where, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: Request) {
  try {
    // 1. Authenticate the cron job using a secret header or query param
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    const roomId = searchParams.get('roomId');

    // Allow either Bearer token, ?secret= query param, or a specific roomId cleanup
    const isAuthorized = 
      (authHeader === `Bearer ${cronSecret}`) || 
      (searchParams.get('secret') === cronSecret) ||
      (roomId !== null); // Public can trigger cleanup for a specific room

    if (!isAuthorized && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch bookings to check
    let bookingsQuery = query(collection(db, "bookings"), where("status", "==", "Pending"));
    
    const querySnapshot = await getDocs(bookingsQuery);
    
    const now = new Date();
    const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000; // 24 hours
    let cancelledCount = 0;

    for (const bookingDoc of querySnapshot.docs) {
      const data = bookingDoc.data();
      
      // If roomId filter is provided, skip other rooms
      if (roomId && data.roomId !== roomId) continue;

      if (!data.createdAt) continue;
      
      // createdAt is a Firestore Timestamp
      const createdAtDate = data.createdAt.toDate();
      const elapsedMs = now.getTime() - createdAtDate.getTime();

      if (elapsedMs > GRACE_PERIOD_MS) {
        // 1. Update Booking Status
        await updateDoc(doc(db, "bookings", bookingDoc.id), {
          status: 'Cancelled'
        });

        // 2. Trigger Cancellation Email
        await addDoc(collection(db, "mail"), {
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
                <a href="https://your-hotel-domain.com" style="display: inline-block; background-color: #111; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Book Again</a>
                <br/><br/>
                <p>Warm regards,<br/><strong>The Luxe Team</strong></p>
              </div>
            `
          }
        });

        cancelledCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully cancelled ${cancelledCount} expired bookings.`,
      cancelledCount 
    });

  } catch (error: any) {
    console.error('Auto-cancel cron error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
