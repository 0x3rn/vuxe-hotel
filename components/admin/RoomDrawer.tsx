import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { X, CheckCircle, Clock, XCircle } from 'lucide-react';
import MediaDisplay from '@/components/MediaDisplay';
import { format, parseISO } from 'date-fns';

type Booking = {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  totalPrice: number;
};

export default function RoomDrawer({ room, onClose }: { room: any, onClose: () => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const q = query(collection(db, "bookings"), where("roomId", "==", room.id));
        const snap = await getDocs(q);
        const b: Booking[] = [];
        snap.forEach(doc => b.push({ id: doc.id, ...doc.data() } as Booking));
        
        // sort by checkIn desc
        b.sort((x, y) => {
          return new Date(y.checkIn).getTime() - new Date(x.checkIn).getTime();
        });
        setBookings(b);
      } catch (error) {
        console.error("Error fetching bookings for room:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [room.id]);

  const recentBookings = bookings.slice(0, 5);
  
  // Occupancy Stats Calculation
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed');
  let totalNights = 0;
  
  confirmedBookings.forEach(curr => {
    try {
      const inD = parseISO(curr.checkIn);
      const outD = parseISO(curr.checkOut);
      const nights = Math.ceil((outD.getTime() - inD.getTime()) / (1000 * 3600 * 24));
      if (nights > 0) totalNights += nights;
    } catch {}
  });

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
        <h2 className="text-xl font-serif text-gray-900">{room.name} Details</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Media */}
        <div className="w-full h-48 relative rounded-xl overflow-hidden shadow-sm">
          <MediaDisplay src={room.imageUrl} alt={room.name} fill />
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Price / Night</p>
            <p className="text-lg font-medium text-gray-900">${room.pricePerNight}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Inventory</p>
            <p className="text-lg font-medium text-gray-900">{room.inventory} Unit{room.inventory !== 1 && 's'}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Capacity</p>
            <p className="text-lg font-medium text-gray-900">{room.capacity} Guests</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Status</p>
            <p className={`text-sm font-medium ${room.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
              {room.isAvailable ? 'Available' : 'Booked'}
            </p>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {room.amenities.map((amenity: string, i: number) => (
              <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Occupancy Stats */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Occupancy Stats</h3>
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
            <p className="text-sm text-blue-900 mb-2">Total Confirmed Bookings: <strong className="text-blue-700">{confirmedBookings.length}</strong></p>
            <p className="text-sm text-blue-900">Total Nights Booked: <strong className="text-blue-700">{totalNights}</strong></p>
          </div>
        </div>

        {/* Recent Reservations */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Recent Reservations</h3>
          {loading ? (
            <div className="text-sm text-gray-500">Loading reservations...</div>
          ) : recentBookings.length > 0 ? (
            <div className="space-y-3">
              {recentBookings.map(b => (
                <div key={b.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-medium text-gray-900">{b.guestName}</p>
                    {b.status === 'Confirmed' && <CheckCircle size={14} className="text-green-500" />}
                    {b.status === 'Pending' && <Clock size={14} className="text-amber-500" />}
                    {b.status === 'Cancelled' && <XCircle size={14} className="text-red-500" />}
                  </div>
                  <p className="text-xs text-gray-500">{b.checkIn} to {b.checkOut}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg text-center border border-gray-100">
              No reservations found for this room.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
