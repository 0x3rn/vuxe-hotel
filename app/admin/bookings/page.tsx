"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Search, Eye, CheckCircle, XCircle, Activity, LogIn, LogOut, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import BookingDrawer from '@/components/admin/BookingDrawer';
import { isToday, parseISO, isPast } from 'date-fns';

type Booking = {
  id: string;
  guestName: string;
  email: string;
  phone?: string;
  roomId: string;
  roomName: string;
  assignedRoomNumber?: string;
  checkInDate?: string;
  checkIn?: string;
  checkOutDate?: string;
  checkOut?: string;
  totalPrice: number;
  status: string; // 'Pending', 'Confirmed', 'Guest Cancelled', 'System Cancelled', 'Completed'
  createdAt?: any;
  bookingRef?: string;
  checkedIn?: boolean;
  checkedOut?: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  cancelledTime?: string;
};

const CountdownBadge = ({ createdAt }: { createdAt: any }) => {
  const [timeLeft, setTimeLeft] = useState<string>('Calculating...');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!createdAt) {
      setTimeLeft('N/A');
      return;
    }
    
    const createdDate = new Date(createdAt);
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

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  if (expired) return <span className="text-xs bg-red-50 text-red-800 px-2 py-1 rounded font-medium border border-red-200">⚠️ Expired</span>;
  return <span className="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded font-medium border border-amber-200">⏳ {timeLeft}</span>;
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Confirmed');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data?type=bookings');
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      // sort by date descending
      data.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
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

      const payload: any = {
        type: 'bookings',
        id,
        status: newStatus,
        bookingData: booking
      };

      if (newStatus.includes('Cancelled')) {
        payload.cancelledTime = new Date().toISOString();
      }

      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to update status');

      fetchBookings();
      toast.success("Booking status updated successfully.");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    }
  };

  const handleCheckAction = async (id: string, action: 'checkIn' | 'checkOut') => {
    try {
      const booking = bookings.find(b => b.id === id);
      if (!booking) return;

      const payload: any = {
        type: 'bookings',
        id,
        bookingData: booking
      };

      if (action === 'checkIn') {
        payload.checkedIn = true;
        payload.checkInTime = new Date().toISOString();
      } else {
        payload.checkedOut = true;
        payload.checkOutTime = new Date().toISOString();
      }

      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to perform action');

      fetchBookings();
      toast.success(`Guest ${action === 'checkIn' ? 'checked in' : 'checked out'} successfully!`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update booking.");
    }
  };

  const parseDate = (d: string | undefined) => {
    if (!d) return new Date();
    try { return parseISO(d); } catch { return new Date(d); }
  }

  const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
  const now = new Date();

  // Categorize bookings for tabs
  const getTabCategory = (b: Booking) => {
    if (b.status === 'Pending') return 'Pending';
    if (b.status.includes('Cancelled')) return 'Cancelled';

    const inD = parseDate(b.checkInDate || b.checkIn);
    
    if (b.checkedIn && !b.checkedOut) return 'Checked-In';
    
    if (b.checkedOut) {
      const outTime = b.checkOutTime ? new Date(b.checkOutTime).getTime() : now.getTime();
      if (now.getTime() - outTime <= FORTY_EIGHT_HOURS) {
        return 'Checked-Out';
      }
      return 'Completed'; // Falls into history
    }

    if (b.status === 'Confirmed') {
      const arrivingTodayOrPast = isToday(inD) || isPast(inD);
      if (arrivingTodayOrPast) return 'Not Yet Checked-In';
      return 'Confirmed';
    }

    return 'Other';
  };

  const filteredBookings = bookings.filter(b => {
    if (searchTerm && !b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) && !b.bookingRef?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    if (activeTab === 'Booking History') return true;
    
    return getTabCategory(b) === activeTab;
  });

  const tabs = ['Pending', 'Confirmed', 'Not Yet Checked-In', 'Checked-In', 'Checked-Out', 'Booking History'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif text-primary">Manage Bookings</h1>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => {
              const count = tab === 'Booking History' ? bookings.length : bookings.filter(b => getTabCategory(b) === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === tab ? 'bg-primary text-primary-foreground shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                >
                  {tab}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab ? 'bg-white/20' : 'bg-gray-200'}`}>{count}</span>
                </button>
              );
            })}
          </div>
          <div className="w-full md:w-72 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search name or ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-left min-w-[1000px] border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Room Assignment</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamps</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((booking) => {
                const cIn = booking.checkInDate || booking.checkIn;
                const cOut = booking.checkOutDate || booking.checkOut;
                
                const fmtDate = (d: string | undefined) => {
                  if (!d) return '-';
                  const dt = new Date(d);
                  return dt.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                };

                return (
                <tr key={booking.id} className="hover:bg-gray-50/50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{booking.guestName}</div>
                    <div className="text-xs text-gray-500">{booking.email}</div>
                    {booking.bookingRef && <div className="text-xs font-mono text-zinc-500 mt-1">Ref: {booking.bookingRef}</div>}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-gray-900">{booking.roomName}</div>
                    {booking.assignedRoomNumber ? (
                      <div className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {booking.assignedRoomNumber}
                      </div>
                    ) : (
                      <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> Unassigned
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">{cIn}</div>
                    <div className="text-xs text-gray-400">to {cOut}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-xs text-gray-500 space-y-1">
                      {booking.checkInTime && <div><span className="font-medium">In:</span> {fmtDate(booking.checkInTime)}</div>}
                      {booking.checkOutTime && <div><span className="font-medium">Out:</span> {fmtDate(booking.checkOutTime)}</div>}
                      {booking.cancelledTime && <div className="text-red-600"><span className="font-medium">Cancelled:</span> {fmtDate(booking.cancelledTime)}</div>}
                      {!booking.checkInTime && !booking.checkOutTime && !booking.cancelledTime && <span>-</span>}
                    </div>
                  </td>
                  <td className="py-4 px-6 flex flex-col items-start gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                      booking.status.includes('Cancelled') ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                    {booking.status === 'Pending' && booking.createdAt && (
                      <CountdownBadge createdAt={booking.createdAt} />
                    )}
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button 
                      onClick={() => setSelectedBooking(booking)} 
                      className="text-gray-600 hover:text-primary transition-colors p-1"
                      title="View Details"
                    >
                      <Eye size={20} />
                    </button>
                    {booking.status === 'Pending' && (
                      <>
                        <button onClick={() => handleUpdateStatus(booking.id, 'Confirmed')} className="text-green-600 hover:text-green-800 transition-colors p-1" title="Confirm Booking">
                          <CheckCircle size={20} />
                        </button>
                        <button onClick={() => handleUpdateStatus(booking.id, 'System Cancelled')} className="text-red-600 hover:text-red-800 transition-colors p-1" title="Cancel Booking">
                          <XCircle size={20} />
                        </button>
                      </>
                    )}
                    {getTabCategory(booking) === 'Not Yet Checked-In' && (
                      <button onClick={() => handleCheckAction(booking.id, 'checkIn')} className="bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1 inline-flex">
                        <LogIn size={14} /> Check In
                      </button>
                    )}
                    {getTabCategory(booking) === 'Checked-In' && (
                      <button onClick={() => handleCheckAction(booking.id, 'checkOut')} className="bg-amber-600 text-white hover:bg-amber-700 px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1 inline-flex">
                        <LogOut size={14} /> Check Out
                      </button>
                    )}
                  </td>
                </tr>
              )})}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <Activity size={32} className="mx-auto text-gray-300 mb-2" />
                    <p>No bookings match the current tab filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedBooking && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setSelectedBooking(null)} />
          <BookingDrawer 
            booking={selectedBooking} 
            onClose={() => setSelectedBooking(null)} 
            onSave={() => {
              setSelectedBooking(null);
              fetchBookings();
            }}
          />
        </>
      )}
    </div>
  );
}
