"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Search, Eye, CheckCircle, XCircle, Clock, Calendar, DollarSign, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import BookingDrawer from '@/components/admin/BookingDrawer';
import { isToday, isThisWeek, isThisMonth, parseISO, isFuture, isPast } from 'date-fns';

type Booking = {
  id: string;
  guestName: string;
  email: string;
  phone?: string;
  roomId: string;
  roomName: string;
  checkInDate?: string;
  checkIn?: string;
  checkOutDate?: string;
  checkOut?: string;
  totalPrice: number;
  status: string; // 'Pending', 'Confirmed', 'Guest Cancelled', 'System Cancelled', 'Completed'
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

  if (expired) {
    return <span className="text-xs bg-red-50 text-red-800 px-2 py-1 rounded font-medium border border-red-200 shadow-sm">⚠️ Expired</span>;
  }
  return <span className="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded font-medium border border-amber-200 shadow-sm tracking-wide">⏳ {timeLeft}</span>;
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data?type=bookings');
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
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

      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bookings',
          id,
          status: newStatus,
          bookingData: booking
        })
      });
      
      if (!res.ok) throw new Error('Failed to update status');

      fetchBookings();
      toast.success("Booking status updated successfully.");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    }
  };

  // Safe parse ISO date
  const parseDate = (d: string | undefined) => {
    if (!d) return new Date();
    try { return parseISO(d); } catch { return new Date(d); }
  }

  const filteredBookings = bookings.filter(b => {
    // Search
    const matchesSearch = !searchTerm || 
      b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (b.bookingRef && b.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    // Status Filter
    if (statusFilter !== 'All' && b.status !== statusFilter) return false;

    // Time Filter (using checkIn date)
    const checkInDate = parseDate(b.checkInDate || b.checkIn);
    
    if (timeFilter === 'Today') {
      if (!isToday(checkInDate)) return false;
    } else if (timeFilter === 'This Week') {
      if (!isThisWeek(checkInDate)) return false;
    } else if (timeFilter === 'This Month') {
      if (!isThisMonth(checkInDate)) return false;
    } else if (timeFilter === 'Upcoming') {
      if (!isFuture(checkInDate) && !isToday(checkInDate)) return false;
    } else if (timeFilter === 'Completed') {
      const checkOutDate = parseDate(b.checkOutDate || b.checkOut);
      if (!isPast(checkOutDate)) return false;
    }

    return true;
  });

  // Calculate top aggregate metrics
  const metrics = useMemo(() => {
    let pending = 0;
    let confirmed = 0;
    let cancelled = 0;
    let completed = 0;
    let revenue = 0;

    bookings.forEach(b => {
      if (b.status === 'Pending') pending++;
      if (b.status === 'Confirmed') {
        confirmed++;
        revenue += b.totalPrice || 0;
      }
      if (b.status === 'Completed') {
        completed++;
        revenue += b.totalPrice || 0;
      }
      if (b.status.includes('Cancelled')) cancelled++;
    });

    return { total: bookings.length, pending, confirmed, completed, cancelled, revenue };
  }, [bookings]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif text-primary">Manage Bookings</h1>
      </div>

      {/* TOP AGGREGATE METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <span className="text-xs text-gray-500 uppercase font-bold mb-1">Total Bookings</span>
          <span className="text-2xl font-serif text-gray-900">{metrics.total}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex flex-col">
          <span className="text-xs text-amber-600 uppercase font-bold mb-1">Pending</span>
          <span className="text-2xl font-serif text-amber-700">{metrics.pending}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm flex flex-col">
          <span className="text-xs text-emerald-600 uppercase font-bold mb-1">Confirmed</span>
          <span className="text-2xl font-serif text-emerald-700">{metrics.confirmed}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex flex-col">
          <span className="text-xs text-red-600 uppercase font-bold mb-1">Cancelled</span>
          <span className="text-2xl font-serif text-red-700">{metrics.cancelled}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col">
          <span className="text-xs text-blue-600 uppercase font-bold mb-1">Completed</span>
          <span className="text-2xl font-serif text-blue-700">{metrics.completed}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col hidden md:flex">
          <span className="text-xs text-blue-600 uppercase font-bold mb-1">Total Revenue</span>
          <span className="text-2xl font-serif text-blue-700">${metrics.revenue.toLocaleString()}</span>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {['All', 'Pending', 'Confirmed', 'Completed', 'Guest Cancelled', 'System Cancelled'].map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === tab ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="w-full md:w-72 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search name, email, or ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-200 rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mr-2">Time Filters:</span>
          <div className="flex flex-wrap gap-2">
            {['All', 'Today', 'This Week', 'This Month', 'Upcoming', 'Completed'].map(tab => (
              <button
                key={tab}
                onClick={() => setTimeFilter(tab)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${timeFilter === tab ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
              {filteredBookings.map((booking) => {
                const cIn = booking.checkInDate || booking.checkIn;
                const cOut = booking.checkOutDate || booking.checkOut;
                return (
                <tr key={booking.id} className="hover:bg-gray-50/50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{booking.guestName}</div>
                    <div className="text-xs text-gray-500">{booking.email}</div>
                    {booking.phone && <div className="text-xs text-gray-500">{booking.phone}</div>}
                    {booking.bookingRef && <div className="text-xs font-mono text-zinc-500 mt-1">Ref: {booking.bookingRef}</div>}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-gray-900">{booking.roomName}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">{cIn}</div>
                    <div className="text-xs text-gray-400">to {cOut}</div>
                  </td>
                  <td className="py-4 px-6 text-gray-900 font-medium">
                    ${booking.totalPrice}
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
                      className="text-emerald-600 hover:text-emerald-800 transition-colors p-1"
                      title="View Details"
                    >
                      <Eye size={20} />
                    </button>
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
              )})}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <Activity size={32} className="mx-auto text-gray-300 mb-2" />
                    <p>No bookings match the current filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer */}
      {selectedBooking && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedBooking(null)} />
          <BookingDrawer booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
        </>
      )}
    </div>
  );
}
