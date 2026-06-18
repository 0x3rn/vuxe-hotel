"use client";

import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
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
      await updateDoc(doc(db, "bookings", id), {
        status: newStatus
      });
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
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
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
