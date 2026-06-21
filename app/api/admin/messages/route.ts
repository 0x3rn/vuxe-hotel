import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!adminDb) {
      console.error('Firebase Admin DB is not initialized');
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }

    const snapshot = await adminDb.collection('contact_messages')
      .orderBy('createdAt', 'desc')
      .get();
      
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
