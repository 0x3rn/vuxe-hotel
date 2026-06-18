"use client";

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DashboardPage() {
  const [stats, setStats] = useState({ bookings: 0, revenue: 0, availableRooms: 0, approvedBookings: 0, cancelledBookings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [roomsSnap, bookingsSnap] = await Promise.all([
          getDocs(collection(db, "rooms")),
          getDocs(collection(db, "bookings"))
        ]);

        let available = 0;
        roomsSnap.forEach(doc => {
          const data = doc.data();
          if (data.isAvailable && typeof data.inventory === 'number' && data.inventory > 0) {
            available += data.inventory;
          }
        });

        let totalRevenue = 0;
        let totalBookings = 0;
        let approvedBookings = 0;
        let cancelledBookings = 0;
        bookingsSnap.forEach(doc => {
          const data = doc.data();
          totalBookings++;
          
          if (data.status === 'Confirmed') {
            approvedBookings++;
            totalRevenue += data.totalPrice || 0;
          } else if (data.status === 'Cancelled') {
            cancelledBookings++;
          }
        });

        setStats({
          bookings: totalBookings,
          revenue: totalRevenue,
          availableRooms: available,
          approvedBookings,
          cancelledBookings
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-serif text-primary mb-8">Dashboard Overview</h1>
      
      {loading ? (
        <div className="flex items-center gap-4 text-gray-500">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
          Loading metrics...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm uppercase tracking-wider mb-2 font-medium">Total Bookings</h3>
            <p className="text-4xl font-serif text-gray-900">{stats.bookings}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full -mr-8 -mt-8"></div>
            <h3 className="text-green-800 text-sm uppercase tracking-wider mb-2 font-medium relative z-10">Approved</h3>
            <p className="text-4xl font-serif text-green-900 relative z-10">{stats.approvedBookings}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-8 -mt-8"></div>
            <h3 className="text-red-800 text-sm uppercase tracking-wider mb-2 font-medium relative z-10">Cancelled</h3>
            <p className="text-4xl font-serif text-red-900 relative z-10">{stats.cancelledBookings}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm uppercase tracking-wider mb-2 font-medium">Total Revenue</h3>
            <p className="text-4xl font-serif text-gray-900">${stats.revenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm uppercase tracking-wider mb-2 font-medium">Available Rooms</h3>
            <p className="text-4xl font-serif text-gray-900">{stats.availableRooms}</p>
          </div>
        </div>
      )}
    </div>
  );
}
