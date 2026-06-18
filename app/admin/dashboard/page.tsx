"use client";

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DashboardPage() {
  const [stats, setStats] = useState({ bookings: 0, revenue: 0, availableRooms: 0 });
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
          if (doc.data().isAvailable) available++;
        });

        let totalRevenue = 0;
        let totalBookings = 0;
        bookingsSnap.forEach(doc => {
          const data = doc.data();
          if (data.status !== 'Cancelled') {
            totalRevenue += data.totalPrice || 0;
          }
          totalBookings++;
        });

        setStats({
          bookings: totalBookings,
          revenue: totalRevenue,
          availableRooms: available
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm uppercase tracking-wider mb-2 font-medium">Total Bookings</h3>
            <p className="text-4xl font-serif text-gray-900">{stats.bookings}</p>
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
