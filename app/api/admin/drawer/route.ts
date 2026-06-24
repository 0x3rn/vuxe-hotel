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
    
    if (!action || (action !== 'create' && !bookingId)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action === 'create') {
      if (!updateData || !updateData.checkInDate || !updateData.checkOutDate || !updateData.roomId) {
        return NextResponse.json({ error: 'Missing required fields for create' }, { status: 400 });
      }

      const roomDoc = await adminDb.collection("rooms").doc(updateData.roomId).get();
      if (!roomDoc.exists) return NextResponse.json({ error: 'Room type not found' }, { status: 404 });
      const inventory = roomDoc.data()?.inventory || 1;

      const reqIn = new Date(updateData.checkInDate).getTime();
      const reqOut = new Date(updateData.checkOutDate).getTime();

      const overlappingSnap = await adminDb.collection("bookings")
        .where("roomId", "==", updateData.roomId)
        .where("status", "in", ["Pending", "Confirmed", "Approved"])
        .get();

      let overlaps = 0;
      let roomNumberOverlap = false;

      overlappingSnap.forEach(doc => {
        const b = doc.data();
        const bIn = new Date(b.checkInDate || b.checkIn).getTime();
        const bOut = new Date(b.checkOutDate || b.checkOut).getTime();
        
        if (bIn < reqOut && bOut > reqIn) {
          overlaps++;
          if (updateData.assignedRoomNumber && b.assignedRoomNumber === updateData.assignedRoomNumber) {
            roomNumberOverlap = true;
          }
        }
      });

      if (overlaps >= inventory) {
        return NextResponse.json({ error: 'DOUBLE_BOOKING', message: 'Room type is fully booked for these dates.' }, { status: 409 });
      }

      if (roomNumberOverlap) {
        return NextResponse.json({ error: 'DOUBLE_BOOKING', message: `Room ${updateData.assignedRoomNumber} is already booked for these dates.` }, { status: 409 });
      }

      const newBooking = {
        ...updateData,
        createdAt: new Date().toISOString()
      };

      const docRef = await adminDb.collection("bookings").add(newBooking);
      return NextResponse.json({ success: true, bookingId: docRef.id });
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
    } else if (action === 'edit') {
      if (!updateData || !updateData.checkInDate || !updateData.checkOutDate || !updateData.roomId) {
        return NextResponse.json({ error: 'Missing required fields for edit' }, { status: 400 });
      }

      const roomDoc = await adminDb.collection("rooms").doc(updateData.roomId).get();
      if (!roomDoc.exists) return NextResponse.json({ error: 'Room type not found' }, { status: 404 });
      const inventory = roomDoc.data()?.inventory || 1;

      const reqIn = new Date(updateData.checkInDate).getTime();
      const reqOut = new Date(updateData.checkOutDate).getTime();

      const overlappingSnap = await adminDb.collection("bookings")
        .where("roomId", "==", updateData.roomId)
        .where("status", "in", ["Pending", "Confirmed", "Approved"])
        .get();

      let overlaps = 0;
      let roomNumberOverlap = false;

      overlappingSnap.forEach(doc => {
        if (doc.id === bookingId) return;
        const b = doc.data();
        const bIn = new Date(b.checkInDate || b.checkIn).getTime();
        const bOut = new Date(b.checkOutDate || b.checkOut).getTime();
        
        if (bIn < reqOut && bOut > reqIn) {
          overlaps++;
          if (updateData.assignedRoomNumber && b.assignedRoomNumber === updateData.assignedRoomNumber) {
            roomNumberOverlap = true;
          }
        }
      });

      if (overlaps >= inventory) {
        return NextResponse.json({ error: 'DOUBLE_BOOKING', message: 'Room type is fully booked for these dates.' }, { status: 409 });
      }

      if (roomNumberOverlap) {
        return NextResponse.json({ error: 'DOUBLE_BOOKING', message: `Room ${updateData.assignedRoomNumber} is already booked for these dates.` }, { status: 409 });
      }

      const currentBookingSnap = await bRef.get();
      if (!currentBookingSnap.exists) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
      const oldData = currentBookingSnap.data() as any;

      const changes: string[] = [];
      
      const inDateOld = oldData.checkInDate || oldData.checkIn;
      if (inDateOld !== updateData.checkInDate) {
        changes.push(`<p style="margin: 5px 0;"><strong>Check-in Date:</strong> Changed from <span style="color: #666; text-decoration: line-through;">${inDateOld || 'None'}</span> to <strong style="color: #10b981;">${updateData.checkInDate}</strong></p>`);
      }

      const outDateOld = oldData.checkOutDate || oldData.checkOut;
      if (outDateOld !== updateData.checkOutDate) {
        changes.push(`<p style="margin: 5px 0;"><strong>Check-out Date:</strong> Changed from <span style="color: #666; text-decoration: line-through;">${outDateOld || 'None'}</span> to <strong style="color: #10b981;">${updateData.checkOutDate}</strong></p>`);
      }

      if (oldData.roomName !== updateData.roomName) {
        changes.push(`<p style="margin: 5px 0;"><strong>Room Type:</strong> Changed from <span style="color: #666; text-decoration: line-through;">${oldData.roomName || 'None'}</span> to <strong style="color: #10b981;">${updateData.roomName}</strong></p>`);
      }

      const oldAssigned = oldData.assignedRoomNumber || 'Unassigned';
      const newAssigned = updateData.assignedRoomNumber || 'Unassigned';
      if (oldAssigned !== newAssigned) {
        changes.push(`<p style="margin: 5px 0;"><strong>Assigned Room:</strong> Changed from <span style="color: #666; text-decoration: line-through;">${oldAssigned}</span> to <strong style="color: #10b981;">${newAssigned}</strong></p>`);
      }

      await bRef.update({
        checkInDate: updateData.checkInDate,
        checkIn: updateData.checkInDate,
        checkOutDate: updateData.checkOutDate,
        checkOut: updateData.checkOutDate,
        roomId: updateData.roomId,
        roomName: updateData.roomName,
        assignedRoomNumber: updateData.assignedRoomNumber || null
      });

      if (changes.length > 0 && oldData.email) {
        const refDisplay = oldData.bookingRef ? `<p style="font-size: 18px; margin: 15px 0;"><strong>Booking Reference: <span style="color: #d4af37;">${oldData.bookingRef}</span></strong></p>` : '';
        
        await adminDb.collection("mail").add({
          to: oldData.email,
          message: {
            subject: "Your Booking Details Have Been Updated - Luxe Hotel",
            html: `
              <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
                <h1 style="color: #111; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">Luxe Hotel</h1>
                <p>Dear ${oldData.guestName},</p>
                <p>Your booking details have been successfully updated by our administrative team. Please review the changes below:</p>
                ${refDisplay}
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #111;">Updated Details</h3>
                  ${changes.join('\n')}
                </div>
                <p>If you have any questions or require further modifications, please contact our concierge.</p>
                <br/>
                <p>Warm regards,<br/><strong>The Luxe Team</strong></p>
              </div>
            `
          }
        });
      }
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
