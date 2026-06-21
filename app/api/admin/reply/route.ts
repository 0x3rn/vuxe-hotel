import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messageId, toEmail, guestName, originalSubject, replyBody } = body;

    if (!messageId || !toEmail || !replyBody) {
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

    // Send the reply email via Firebase Email Extension
    await adminDb.collection('mail').add({
      to: toEmail,
      message: {
        subject: `Re: Luxe Hotel Inquiry: ${originalSubject}`,
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
            <p>Dear ${guestName},</p>
            <p style="white-space: pre-wrap; line-height: 1.6;">${replyBody}</p>
            <br/>
            <p>Warm regards,<br/><strong>The Luxe Concierge Team</strong></p>
            <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 30px 0;" />
            <p style="color: #666; font-size: 12px;">This is a reply to your inquiry regarding "${originalSubject}".</p>
          </div>
        `
      }
    });

    // Optionally update the message status to 'replied' in the database
    await adminDb.collection('contact_messages').doc(messageId).update({
      status: 'replied',
      repliedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending reply:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
