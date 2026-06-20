import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  if (!adminDb) return NextResponse.json({ error: 'Firebase admin not initialized' }, { status: 500 });
  
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  
  try {
    if (type === 'bookings') {
      const snap = await adminDb.collection("bookings").orderBy("createdAt", "desc").get().catch(async () => {
        return await adminDb!.collection("bookings").get();
      });
      const data: any[] = snap.docs.map(doc => {
        const d = doc.data();
        if (d.createdAt && typeof d.createdAt.toDate === 'function') {
           d.createdAt = d.createdAt.toDate().toISOString();
        }
        return { id: doc.id, ...d };
      });
      return NextResponse.json(data);
    }
    
    if (type === 'transport') {
      const snap = await adminDb.collection("transport_requests").orderBy("createdAt", "desc").get().catch(async () => {
        return await adminDb!.collection("transport_requests").get();
      });
      const data: any[] = snap.docs.map(doc => {
        const d = doc.data();
        if (d.createdAt && typeof d.createdAt.toDate === 'function') {
           d.createdAt = d.createdAt.toDate().toISOString();
        }
        return { id: doc.id, ...d };
      });
      // Fallback manual sort if orderby index is missing
      data.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        // for transport requests that might just have date and time
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!adminDb) return NextResponse.json({ error: 'Firebase admin not initialized' }, { status: 500 });
  
  try {
    const body = await request.json();
    const { type, id, status, bookingData } = body;
    
    if (type === 'bookings') {
      await adminDb.collection("bookings").doc(id).update({ status });
      if (status === 'Confirmed' && bookingData) {
         const b = bookingData;
         const refDisplay = b.bookingRef ? `<p style="font-size: 18px; margin: 15px 0;"><strong>Booking Reference: <span style="color: #d4af37;">${b.bookingRef}</span></strong></p>` : '';
         const transportInvite = b.bookingRef ? `
          <p style="margin-top: 20px;"><strong>Exclusive Transport Service</strong></p>
          <p>As a confirmed guest, you are invited to book our private chauffeur service. Please use your email and Booking Reference to request a ride.</p>
        ` : '';
        await adminDb.collection("mail").add({
          to: b.email,
          message: {
            subject: "Reservation Confirmed - Luxe Hotel",
            html: `
              <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
                <h1 style="color: #111; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">Luxe Hotel</h1>
                <p>Dear ${b.guestName},</p>
                <p>We are delighted to confirm your reservation for the <strong>${b.roomName}</strong>.</p>
                ${refDisplay}
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Check-in:</strong> ${b.checkInDate}</p>
                  <p style="margin: 5px 0;"><strong>Check-out:</strong> ${b.checkOutDate}</p>
                  <p style="margin: 5px 0;"><strong>Total Price:</strong> $${b.totalPrice.toLocaleString()}</p>
                </div>
                ${transportInvite}
                <br/>
                <p>We look forward to welcoming you.</p>
                <p>Warm regards,<br/><strong>The Luxe Team</strong></p>
              </div>
            `
          }
        });
      }
      return NextResponse.json({ success: true });
    }
    
    if (type === 'transport') {
      await adminDb.collection("transport_requests").doc(id).update({ status });
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
