import { NextResponse } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, subject, message } = body;

    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!adminDb) {
      console.error('Firebase Admin DB is not initialized');
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }

    // Save message to Firestore
    const docRef = await adminDb.collection('contact_messages').add({
      firstName,
      lastName,
      email,
      subject: subject || 'General Inquiry',
      message,
      createdAt: FieldValue.serverTimestamp(),
      status: 'unread',
    });

    // Send Admin Alert Email
    await adminDb.collection('mail').add({
      to: "concierge@luxehotel.com",
      message: {
        subject: `🚨 ALERT: New Guest Inquiry - ${subject || 'General Inquiry'}`,
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
            <h2 style="color: #b91c1c; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">New Inquiry Received</h2>
            <p>A new message has been submitted via the Contact page.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Guest Name:</strong> ${firstName} ${lastName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}?subject=Re: Luxe Hotel Inquiry: ${subject || 'General Inquiry'}">${email}</a></p>
              <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
            </div>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            <p>Please log in to the <a href="https://luxehotel.com/admin/messages" style="color: #1d4ed8; text-decoration: underline;">Admin Dashboard</a> to manage inquiries.</p>
          </div>
        `
      }
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Error saving contact message:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
