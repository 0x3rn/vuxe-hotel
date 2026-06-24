import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  if (!adminDb) return NextResponse.json({ error: 'Firebase admin not initialized' }, { status: 500 });
  
  try {
    const snap = await adminDb.collection("offers").get();
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!adminDb) return NextResponse.json({ error: 'Firebase admin not initialized' }, { status: 500 });
  
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing offer id' }, { status: 400 });
    }

    await adminDb.collection("offers").doc(id).set(data);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!adminDb) return NextResponse.json({ error: 'Firebase admin not initialized' }, { status: 500 });
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing offer id' }, { status: 400 });
    }

    await adminDb.collection("offers").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
