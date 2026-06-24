import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  if (!adminDb) return NextResponse.json({ error: 'Firebase admin not initialized' }, { status: 500 });
  
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get('bookingId');
  const roomId = searchParams.get('roomId');
  
  try {
    const data: any = { transportRequests: [], roomPrice: null };

    if (bookingId) {
      const snap = await adminDb.collection("transport_requests").where("bookingId", "==", bookingId).get();
      data.transportRequests = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    if (roomId) {
      const roomDoc = await adminDb.collection("rooms").doc(roomId).get();
      if (roomDoc.exists) {
        data.roomPrice = roomDoc.data()?.pricePerNight || null;
      }
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!adminDb) return NextResponse.json({ error: 'Firebase admin not initialized' }, { status: 500 });
  
  try {
    const body = await request.json();
    const { action, bookingId, updateData } = body;
    
    if (!bookingId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const bRef = adminDb.collection("bookings").doc(bookingId);

    if (action === 'checkIn') {
      await bRef.update({
        checkedIn: true,
        checkInTime: new Date(), // Using backend server time
        status: 'Confirmed'
      });
    } else if (action === 'checkOut') {
      await bRef.update({
        checkedOut: true,
        checkOutTime: new Date(),
        status: 'Completed'
      });
    } else if (action === 'cancel') {
      await bRef.update({
        status: 'Guest Cancelled'
      });
    } else if (action === 'extend') {
      if (!updateData || !updateData.checkOutDate || typeof updateData.totalPrice !== 'number') {
        return NextResponse.json({ error: 'Invalid update data' }, { status: 400 });
      }
      await bRef.update({
        checkOutDate: updateData.checkOutDate,
        checkOut: updateData.checkOutDate,
        totalPrice: updateData.totalPrice
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
