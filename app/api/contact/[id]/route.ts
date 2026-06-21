import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!adminDb) {
      console.error('Firebase Admin DB is not initialized');
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }

    await adminDb.collection('contact_messages').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
