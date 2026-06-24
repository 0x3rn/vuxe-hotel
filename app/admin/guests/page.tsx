"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Search, Eye, User, Activity, X } from 'lucide-react';
import GuestDrawer from '@/components/admin/GuestDrawer';
import { format } from 'date-fns';

type Guest = {
  email: string;
  name: string;
  phone?: string;
  totalBookings: number;
  totalSpend: number;
  firstStay?: string;
  lastStay?: string;
  lastStayDateObj?: Date;
  lastStayFormatted?: string;
};

export default function AdminGuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [showTopSpenders, setShowTopSpenders] = useState(false);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data?type=bookings');
      if (!res.ok) throw new Error('Failed to fetch bookings for guests');
      const bookings = await res.json();

      const guestMap = new Map<string, Guest>();

      bookings.forEach((b: any) => {
        if (!b.email) return;
        const email = b.email.toLowerCase();
        
        // Status Confirmed or Completed counts towards total spend
        const spend = (b.status === 'Confirmed' || b.status === 'Completed') ? (b.totalPrice || 0) : 0;
        
        const isCompletedStay = b.checkedIn && b.checkedOut && b.checkInTime && b.checkOutTime;
        let stayDateStr = b.checkInDate || b.checkIn;
        let stayDateObj = stayDateStr ? new Date(stayDateStr) : null;
        
        // Use actual timestamps if completed
        if (isCompletedStay) {
            const inTime = b.checkInTime.toDate ? b.checkInTime.toDate() : new Date(b.checkInTime);
            const outTime = b.checkOutTime.toDate ? b.checkOutTime.toDate() : new Date(b.checkOutTime);
            stayDateObj = inTime;
            stayDateStr = `${format(inTime, 'MMM d, yyyy')} - ${format(outTime, 'MMM d, yyyy')}`;
        }
        
        if (guestMap.has(email)) {
          const g = guestMap.get(email)!;
          g.totalBookings += 1;
          g.totalSpend += spend;
          
          if (isCompletedStay && stayDateObj) {
            const currentLastStayObj = g.lastStayDateObj;
            if (!currentLastStayObj || stayDateObj > currentLastStayObj) {
              g.lastStayDateObj = stayDateObj;
              g.lastStayFormatted = stayDateStr;
              g.lastStay = stayDateStr; // For fallback
            }
          }
          if (!g.phone && b.phone) g.phone = b.phone;
          
          guestMap.set(email, g);
        } else {
          guestMap.set(email, {
            email,
            name: b.guestName,
            phone: b.phone,
            totalBookings: 1,
            totalSpend: spend,
            firstStay: b.checkInDate || b.checkIn,
            lastStay: isCompletedStay ? stayDateStr : undefined,
            lastStayDateObj: isCompletedStay ? (stayDateObj || undefined) : undefined,
            lastStayFormatted: isCompletedStay ? stayDateStr : undefined
          });
        }
      });

      const guestArray = Array.from(guestMap.values()).sort((a, b) => b.totalSpend - a.totalSpend);
      setGuests(guestArray);
    } catch (error) {
      console.error("Error fetching guests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const filteredGuests = guests.filter(g => {
    if (!searchTerm) return true;
    return g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           g.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalRevenue = useMemo(() => guests.reduce((sum, g) => sum + g.totalSpend, 0), [guests]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif text-primary">Guest Directory</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Total Guests</span>
            <span className="text-3xl font-serif text-gray-900">{guests.length}</span>
          </div>
          <div className="p-4 bg-gray-50 rounded-full text-gray-400">
            <User size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Avg Lifetime Spend</span>
            <span className="text-3xl font-serif text-gray-900">${guests.length > 0 ? Math.round(totalRevenue / guests.length).toLocaleString() : 0}</span>
          </div>
          <div className="p-4 bg-emerald-50 rounded-full text-emerald-500">
            <Activity size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Top Spender</span>
            <span className="text-2xl font-serif text-gray-900 truncate max-w-[200px] block">{guests[0]?.name || 'N/A'}</span>
            {guests.length > 0 && (
              <button onClick={() => setShowTopSpenders(true)} className="text-xs text-blue-600 hover:text-blue-800 hover:underline mt-1 block">
                View top 100 spenders
              </button>
            )}
          </div>
          <div className="p-4 bg-blue-50 rounded-full text-blue-500">
            <User size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div className="w-full md:w-72 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search guests by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-200 rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Name</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bookings</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spend</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Stay</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredGuests.map((guest, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="py-4 px-6 font-medium text-gray-900">{guest.name}</td>
                  <td className="py-4 px-6 text-gray-500 text-sm">{guest.email}</td>
                  <td className="py-4 px-6 text-gray-900">{guest.totalBookings}</td>
                  <td className="py-4 px-6 text-gray-900 font-medium">${guest.totalSpend.toLocaleString()}</td>
                  <td className="py-4 px-6 text-gray-500 text-sm">{guest.lastStayFormatted || 'No completed stays'}</td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => setSelectedGuest(guest)}
                      className="text-emerald-600 hover:text-emerald-800 transition-colors p-1"
                      title="View Profile"
                    >
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredGuests.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No guests match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedGuest && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedGuest(null)} />
          <GuestDrawer guest={selectedGuest} onClose={() => setSelectedGuest(null)} />
        </>
      )}

      {showTopSpenders && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-serif text-gray-900">Top 100 Spenders</h2>
              <button onClick={() => setShowTopSpenders(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {guests.slice(0, 100).map((g, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 w-6">#{idx + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900">{g.name}</p>
                        <p className="text-xs text-gray-500">{g.email}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-emerald-700">${g.totalSpend.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
