import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  if (!adminDb) return NextResponse.json({ error: 'Firebase admin not initialized' }, { status: 500 });
  
  const { searchParams } = new URL(request.url);
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  
  if (!checkIn || !checkOut) {
    return NextResponse.json({ error: 'checkIn and checkOut are required' }, { status: 400 });
  }

  try {
    const reqCheckIn = new Date(checkIn).getTime();
    const reqCheckOut = new Date(checkOut).getTime();

    const bookingsSnapshot = await adminDb.collection("bookings")
      .where("status", "in", ["Pending", "Approved"])
      .get();
    
    const overlappingCounts: Record<string, number> = {};
    
    bookingsSnapshot.forEach((doc) => {
      const b = doc.data();
      const bCheckIn = new Date(b.checkInDate).getTime();
      const bCheckOut = new Date(b.checkOutDate).getTime();
      
      // Check if dates overlap: start1 < end2 AND end1 > start2
      if (bCheckIn < reqCheckOut && bCheckOut > reqCheckIn) {
        overlappingCounts[b.roomId] = (overlappingCounts[b.roomId] || 0) + 1;
      }
    });

    return NextResponse.json({ overlappingCounts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
