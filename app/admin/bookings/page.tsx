"use client";

import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CheckCircle, XCircle } from 'lucide-react';

type Booking = {
  id: string;
  guestName: string;
  email: string;
  phone?: string;
  roomId: string;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: string; // 'Pending', 'Confirmed', 'Cancelled'
  createdAt?: any;
  bookingRef?: string;
};

const CountdownBadge = ({ createdAt }: { createdAt: any }) => {
  const [timeLeft, setTimeLeft] = useState<string>('Calculating...');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!createdAt) {
      setTimeLeft('N/A');
      return;
    }
    
    // Convert Firestore Timestamp to JS Date
    const createdDate = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
    const expireDate = new Date(createdDate.getTime() + 24 * 60 * 60 * 1000);

    const updateTimer = () => {
      const now = new Date();
      const diff = expireDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setExpired(true);
        setTimeLeft('Expired');
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [createdAt]);

  if (expired) {
    return <span className="text-xs bg-red-50 text-red-800 px-2 py-1 rounded font-medium border border-red-200 shadow-sm">⚠️ Expired</span>;
  }
  return <span className="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded font-medium border border-amber-200 shadow-sm tracking-wide">⏳ {timeLeft}</span>;
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const bookingsData: Booking[] = [];
      querySnapshot.forEach((doc) => {
        bookingsData.push({ id: doc.id, ...doc.data() } as Booking);
      });
      setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings with ordering:", error);
      // Fallback if index is missing for orderBy
      try {
        const querySnapshot = await getDocs(collection(db, "bookings"));
        const bookingsData: Booking[] = [];
        querySnapshot.forEach((doc) => {
          bookingsData.push({ id: doc.id, ...doc.data() } as Booking);
        });
        setBookings(bookingsData);
      } catch (err) {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const booking = bookings.find(b => b.id === id);
      if (!booking) return;

      await updateDoc(doc(db, "bookings", id), {
        status: newStatus
      });

      // Send confirmation email
      if (newStatus === 'Confirmed') {
        const refDisplay = booking.bookingRef ? `<p style="font-size: 18px; margin: 15px 0;"><strong>Booking Reference: <span style="color: #d4af37;">${booking.bookingRef}</span></strong></p>` : '';
        const transportInvite = booking.bookingRef ? `
          <p style="margin-top: 20px;"><strong>Exclusive Transport Service</strong></p>
          <p>As a confirmed guest, you are invited to book our private chauffeur service. Please use your email and Booking Reference to request a ride.</p>
        ` : '';

        await addDoc(collection(db, "mail"), {
          to: booking.email,
          message: {
            subject: "Reservation Confirmed - Luxe Hotel",
            html: `
              <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
                <h1 style="color: #111; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">Luxe Hotel</h1>
                <p>Dear ${booking.guestName},</p>
                <p>We are delighted to confirm your reservation for the <strong>${booking.roomName}</strong>.</p>
                ${refDisplay}
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Check-in:</strong> ${booking.checkInDate}</p>
                  <p style="margin: 5px 0;"><strong>Check-out:</strong> ${booking.checkOutDate}</p>
                  <p style="margin: 5px 0;"><strong>Total Price:</strong> $${booking.totalPrice.toLocaleString()}</p>
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

      fetchBookings();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-primary">Manage Bookings</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50/50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{booking.guestName}</div>
                    <div className="text-xs text-gray-500">{booking.email}</div>
                    {booking.phone && <div className="text-xs text-gray-500">{booking.phone}</div>}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-gray-900">{booking.roomName}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">{booking.checkInDate} to</div>
                    <div className="text-sm text-gray-600">{booking.checkOutDate}</div>
                  </td>
                  <td className="py-4 px-6 text-gray-900 font-medium">
                    ${booking.totalPrice}
                  </td>
                  <td className="py-4 px-6 flex flex-col items-start gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                    {booking.status === 'Pending' && booking.createdAt && (
                      <CountdownBadge createdAt={booking.createdAt} />
                    )}
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    {booking.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => handleUpdateStatus(booking.id, 'Confirmed')} 
                          className="text-green-600 hover:text-green-800 transition-colors p-1"
                          title="Confirm Booking"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(booking.id, 'Cancelled')} 
                          className="text-red-600 hover:text-red-800 transition-colors p-1"
                          title="Cancel Booking"
                        >
                          <XCircle size={20} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No bookings yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
