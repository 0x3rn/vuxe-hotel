import { NextResponse } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      bookingId,
      bookingRef,
      guestName,
      email,
      pickupLocation,
      dropoffLocation,
      date,
      time,
      passengers,
      specialRequests
    } = body;

    if (!bookingId || !bookingRef || !email || !pickupLocation || !dropoffLocation || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if admin is actually initialized properly
    if (!adminDb) {
      console.error('Firebase Admin not initialized. Check your environment variables.');
      return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 });
    }

    // Double check the booking actually exists and is confirmed, to prevent spoofing
    const bookingDoc = await adminDb.collection('bookings').doc(bookingId).get();
    
    if (!bookingDoc.exists) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const bookingData = bookingDoc.data();
    if (bookingData?.status !== 'Confirmed' || bookingData?.email !== email || bookingData?.bookingRef !== bookingRef) {
      return NextResponse.json({ error: 'Invalid booking credentials' }, { status: 403 });
    }

    const transportData = {
      bookingId,
      bookingRef,
      guestName,
      email,
      pickupLocation,
      dropoffLocation,
      date,
      time,
      passengers: parseInt(passengers),
      specialRequests: specialRequests || '',
      status: 'Pending',
      createdAt: FieldValue.serverTimestamp()
    };

    // 1. Write the transport request using Admin SDK
    await adminDb.collection("transport_requests").add(transportData);

    // 2. Send the confirmation email
    await adminDb.collection("mail").add({
      to: email,
      message: {
        subject: "Transport Request Received - Luxe Hotel",
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
            <h1 style="color: #111; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">Luxe Hotel</h1>
            <p>Dear ${guestName},</p>
            <p>We have successfully received your transport request. Our concierge team is currently reviewing it and will assign a chauffeur shortly.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
              <p style="margin: 5px 0;"><strong>Pickup:</strong> ${pickupLocation}</p>
              <p style="margin: 5px 0;"><strong>Drop-off:</strong> ${dropoffLocation}</p>
            </div>
            <br/>
            <p>Warm regards,<br/><strong>The Luxe Team</strong></p>
          </div>
        `
      }
    });

    return NextResponse.json({ success: true, message: 'Transport request submitted successfully' });

  } catch (error: any) {
    console.error('Transport API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
