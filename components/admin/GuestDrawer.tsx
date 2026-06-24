import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { X, Calendar, DollarSign, Activity, ListOrdered } from 'lucide-react';
import { parseISO, format } from 'date-fns';

type Booking = {
  id: string;
  guestName: string;
  email: string;
  phone?: string;
  roomId: string;
  roomName: string;
  checkIn?: string;
  checkInDate?: string;
  checkOut?: string;
  checkOutDate?: string;
  totalPrice: number;
  status: string;
  createdAt?: any;
  checkedIn?: boolean;
  checkedOut?: boolean;
  checkInTime?: any;
  checkOutTime?: any;
};

export default function GuestDrawer({ guest, onClose }: { guest: any, onClose: () => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stay' | 'booking'>('stay');

  useEffect(() => {
    const fetchGuestBookings = async () => {
      try {
        const q = query(collection(db, "bookings"), where("email", "==", guest.email));
        const snap = await getDocs(q);
        const b: Booking[] = [];
        snap.forEach(doc => b.push({ id: doc.id, ...doc.data() } as Booking));
        
        b.sort((x, y) => {
          const xDate = x.checkIn || x.checkInDate || '';
          const yDate = y.checkIn || y.checkInDate || '';
          return new Date(yDate).getTime() - new Date(xDate).getTime();
        });
        
        setBookings(b);
      } catch (error) {
        console.error("Error fetching guest bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGuestBookings();
  }, [guest.email]);

  const completedStays = bookings.filter(b => b.checkedIn && b.checkedOut);

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
        <div>
          <h2 className="text-xl font-serif text-gray-900">{guest.name}</h2>
          <p className="text-xs text-gray-500 mt-1">{guest.email}</p>
          {guest.phone && <p className="text-xs text-gray-400 mt-0.5">{guest.phone}</p>}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* LTV & Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-full">
              <DollarSign size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-emerald-800 uppercase tracking-wider font-semibold">Lifetime Spend</p>
              <p className="text-xl font-medium text-emerald-900">${guest.totalSpend.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Activity size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-blue-800 uppercase tracking-wider font-semibold">Stays</p>
              <p className="text-xl font-medium text-blue-900">{guest.totalBookings}</p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Profile</h3>
          <div className="space-y-3 bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">First Seen</p>
              <p className="text-sm font-medium text-gray-900">{guest.firstStay || 'N/A'}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Last Seen</p>
              <p className="text-sm font-medium text-gray-900">{guest.lastStayFormatted || guest.lastStay || 'N/A'}</p>
            </div>
            {guest.phone && (
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900">{guest.phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div>
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('stay')}
              className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'stay' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              <Calendar size={14} className="inline mr-2 -mt-0.5" /> Stay History
            </button>
            <button
              onClick={() => setActiveTab('booking')}
              className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'booking' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              <ListOrdered size={14} className="inline mr-2 -mt-0.5" /> Booking History
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500 text-center py-4">Loading history...</p>
          ) : activeTab === 'stay' ? (
            // Stay History (Only completed stays)
            completedStays.length > 0 ? (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {completedStays.map(b => {
                  const inTime = b.checkInTime?.toDate ? b.checkInTime.toDate() : new Date(b.checkInTime);
                  const outTime = b.checkOutTime?.toDate ? b.checkOutTime.toDate() : new Date(b.checkOutTime);
                  const cIn = format(inTime, 'MMM d, yyyy');
                  const cOut = format(outTime, 'MMM d, yyyy');

                  return (
                    <div key={b.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-blue-200 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                      <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow transition-shadow ml-4 md:ml-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            Completed
                          </span>
                          <span className="text-xs font-medium text-gray-900">${b.totalPrice}</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{b.roomName}</p>
                        <p className="text-xs text-gray-500 mt-1">{cIn} to {cOut}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">No completed stays found.</p>
            )
          ) : (
            // Booking History (All bookings)
            bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map(b => {
                  const cIn = b.checkIn || b.checkInDate;
                  const cOut = b.checkOut || b.checkOutDate;
                  
                  let tagText = b.status;
                  let tagClass = 'bg-gray-100 text-gray-800';

                  if (b.status === 'Confirmed') {
                    if (b.checkedIn && !b.checkedOut) {
                      tagText = 'Checked-In';
                      tagClass = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
                    } else {
                      tagText = 'Confirmed';
                      tagClass = 'bg-green-100 text-green-800';
                    }
                  } else if (b.status === 'Guest Cancelled') {
                    tagText = 'Guest-Cancelled';
                    tagClass = 'bg-red-100 text-red-800';
                  } else if (b.status === 'System Cancelled') {
                    tagText = 'System-Cancelled';
                    tagClass = 'bg-red-100 text-red-800 opacity-80';
                  } else if (b.status === 'Completed') {
                    tagText = 'Completed';
                    tagClass = 'bg-blue-100 text-blue-800';
                  } else if (b.status === 'Pending') {
                    tagClass = 'bg-amber-100 text-amber-800';
                  } else if (b.status === 'Cancelled') {
                    tagClass = 'bg-red-100 text-red-800';
                  }

                  return (
                    <div key={b.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold text-gray-900">{b.roomName}</p>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${tagClass}`}>
                            {tagText}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{cIn} to {cOut}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">${b.totalPrice}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">No bookings found.</p>
            )
          )}
        </div>

      </div>
    </div>
  );
}
