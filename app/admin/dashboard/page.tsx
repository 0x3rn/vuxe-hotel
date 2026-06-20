import React from 'react';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic'; // Ensure fresh data on each render

export default async function DashboardPage() {
  if (!adminDb) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Firebase Admin is not initialized. Please check your environment variables.</p>
      </div>
    );
  }

  let stats = {
    bookingsPending: 0,
    bookingsConfirmed: 0,
    bookingsCancelled: 0,
    transportPending: 0,
    transportAssigned: 0,
    transportCompleted: 0,
    availableRooms: 0,
    revenue: 0
  };

  try {
    const [roomsSnap, bookingsSnap, transportSnap] = await Promise.all([
      adminDb.collection("rooms").get(),
      adminDb.collection("bookings").get(),
      adminDb.collection("transport_requests").get()
    ]);

    let availableRooms = 0;
    roomsSnap.forEach(doc => {
      const data = doc.data();
      if (data.isAvailable && typeof data.inventory === 'number' && data.inventory > 0) {
        availableRooms += data.inventory;
      }
    });

    let bookingsPending = 0;
    let bookingsConfirmed = 0;
    let bookingsCancelled = 0;
    let revenue = 0;

    bookingsSnap.forEach(doc => {
      const data = doc.data();
      if (data.status === 'Pending') bookingsPending++;
      if (data.status === 'Confirmed') {
        bookingsConfirmed++;
        revenue += data.totalPrice || 0;
      }
      if (data.status === 'Cancelled') bookingsCancelled++;
    });

    let tPending = 0;
    let tAssigned = 0;
    let tCancelled = 0;

    transportSnap.forEach(doc => {
      const data = doc.data();
      if (data.status === 'Pending') tPending++;
      else if (data.status === 'Assigned') tAssigned++;
      else if (data.status === 'Cancelled' || data.status === 'Completed') tCancelled++;
    });

    stats = {
      bookingsPending,
      bookingsConfirmed,
      bookingsCancelled,
      transportPending: tPending,
      transportAssigned: tAssigned,
      transportCompleted: tCancelled,
      availableRooms,
      revenue
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return (
      <div className="p-8 text-center text-red-500">
        <p>Failed to load dashboard metrics due to a server error.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-primary">Dashboard Overview</h1>
      </div>
      
      <div className="space-y-10">
        {/* Revenue & Rooms (Global Stats) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm uppercase tracking-wider mb-2 font-medium">Available Rooms</h3>
            <p className="text-4xl font-serif text-gray-900">{stats.availableRooms}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm uppercase tracking-wider mb-2 font-medium">Total Revenue</h3>
            <p className="text-4xl font-serif text-gray-900">${stats.revenue.toLocaleString()}</p>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Bookings Section */}
        <div>
          <h2 className="text-xl font-serif text-zinc-800 mb-4">Bookings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-yellow-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-50 rounded-bl-full -mr-8 -mt-8"></div>
              <h3 className="text-yellow-800 text-sm uppercase tracking-wider mb-2 font-medium relative z-10">Pending</h3>
              <p className="text-4xl font-serif text-yellow-900 relative z-10">{stats.bookingsPending}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full -mr-8 -mt-8"></div>
              <h3 className="text-green-800 text-sm uppercase tracking-wider mb-2 font-medium relative z-10">Confirmed</h3>
              <p className="text-4xl font-serif text-green-900 relative z-10">{stats.bookingsConfirmed}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-8 -mt-8"></div>
              <h3 className="text-red-800 text-sm uppercase tracking-wider mb-2 font-medium relative z-10">Cancelled</h3>
              <p className="text-4xl font-serif text-red-900 relative z-10">{stats.bookingsCancelled}</p>
            </div>
          </div>
        </div>

        {/* Transport Section */}
        <div>
          <h2 className="text-xl font-serif text-zinc-800 mb-4">Transport Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-yellow-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-50 rounded-bl-full -mr-8 -mt-8"></div>
              <h3 className="text-yellow-800 text-sm uppercase tracking-wider mb-2 font-medium relative z-10">Pending</h3>
              <p className="text-4xl font-serif text-yellow-900 relative z-10">{stats.transportPending}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-8 -mt-8"></div>
              <h3 className="text-blue-800 text-sm uppercase tracking-wider mb-2 font-medium relative z-10">Assigned</h3>
              <p className="text-4xl font-serif text-blue-900 relative z-10">{stats.transportAssigned}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gray-50 rounded-bl-full -mr-8 -mt-8"></div>
              <h3 className="text-gray-600 text-sm uppercase tracking-wider mb-2 font-medium relative z-10">Completed / Cancelled</h3>
              <p className="text-4xl font-serif text-gray-800 relative z-10">{stats.transportCompleted}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
