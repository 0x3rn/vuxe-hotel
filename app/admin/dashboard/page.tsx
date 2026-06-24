import React from 'react';
import { adminDb } from '@/lib/firebase-admin';
import { Calendar, UserCheck, UserMinus, DollarSign, Clock, Car, MessageSquare, DoorOpen, Activity } from 'lucide-react';

export const dynamic = 'force-dynamic';

function isToday(date: Date) {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

function isSameMonth(date: Date, otherDate: Date) {
  return date.getMonth() === otherDate.getMonth() &&
    date.getFullYear() === otherDate.getFullYear();
}

function parseDateStr(dateStr: string) {
  const [year, month, day] = dateStr.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

export default async function DashboardPage() {
  if (!adminDb) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Firebase Admin is not initialized. Please check your environment variables.</p>
      </div>
    );
  }

  try {
    const [roomsSnap, bookingsSnap, transportSnap, messagesSnap] = await Promise.all([
      adminDb.collection("rooms").get(),
      adminDb.collection("bookings").orderBy("createdAt", "desc").get(),
      adminDb.collection("transport_requests").orderBy("createdAt", "desc").get(),
      adminDb.collection("contact_messages").orderBy("createdAt", "desc").get()
    ]);

    // Calculate Room Stats
    let totalRooms = 0;
    let availableRooms = 0;
    roomsSnap.forEach(doc => {
      const data = doc.data();
      const inv = typeof data.inventory === 'number' ? data.inventory : 1;
      totalRooms += inv;
      if (data.isAvailable && inv > 0) {
        availableRooms += inv;
      }
    });

    const occupiedRooms = totalRooms - availableRooms;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Calculate Booking Stats
    let arrivalsToday = 0;
    let departuresToday = 0;
    let revenueThisMonth = 0;
    let pendingReservations = 0;

    const recentBookings: any[] = [];
    const activities: any[] = [];

    bookingsSnap.forEach(doc => {
      const data = doc.data();
      const b = { id: doc.id, ...data };
      
      if (data.status === 'Pending') pendingReservations++;
      
      if (data.checkIn) {
        try {
          const checkInDate = parseDateStr(data.checkIn);
          if (isToday(checkInDate)) arrivalsToday++;
        } catch(e){}
      }
      
      if (data.checkOut) {
        try {
          const checkOutDate = parseDateStr(data.checkOut);
          if (isToday(checkOutDate)) departuresToday++;
        } catch(e){}
      }

      if ((data.status === 'Confirmed' || data.status === 'Completed') && data.createdAt) {
        const createdDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        if (isSameMonth(createdDate, new Date())) {
          revenueThisMonth += data.totalPrice || 0;
        }
      }

      if (recentBookings.length < 5) {
        recentBookings.push(b);
      }

      if (data.createdAt) {
        const createdDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        activities.push({
          type: 'booking',
          title: `Booking ${data.status} - ${data.guestName}`,
          date: createdDate,
          status: data.status
        });
      }
    });

    // Transport Stats
    let pendingTransport = 0;
    transportSnap.forEach(doc => {
      const data = doc.data();
      if (data.status === 'Pending') pendingTransport++;
      if (data.createdAt) {
        const createdDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        activities.push({
          type: 'transport',
          title: `Transport ${data.status} for ${data.guestName}`,
          date: createdDate,
          status: data.status
        });
      }
    });

    // Message Stats
    let unreadMessages = 0;
    messagesSnap.forEach(doc => {
      const data = doc.data();
      if (data.status === 'Unread') unreadMessages++;
      if (data.createdAt) {
        const createdDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        activities.push({
          type: 'message',
          title: `New Inquiry from ${data.name || data.email || 'Guest'}`,
          date: createdDate,
          status: data.status
        });
      }
    });

    // Sort activities and take top 8
    activities.sort((a, b) => b.date.getTime() - a.date.getTime());
    const recentActivities = activities.slice(0, 8);

    // Determine greeting
    const hour = new Date().getHours();
    let greeting = "Good Evening";
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* HERO GREETING */}
        <div className="bg-secondary text-secondary-foreground p-8 rounded-2xl shadow-lg border border-secondary-foreground/10 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-serif text-primary mb-2">{greeting}, Admin.</h1>
            <p className="text-secondary-foreground/80 text-lg">
              You have <strong className="text-white">{arrivalsToday}</strong> arrivals today, <strong className="text-white">{pendingReservations}</strong> pending reservations, and <strong className="text-white">{unreadMessages}</strong> unanswered guest inquiries.
            </p>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Activity size={120} />
          </div>
        </div>

        {/* ROW 1: KEY DAILY METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Today's Arrivals" value={arrivalsToday} icon={<UserCheck className="text-blue-500" />} />
          <MetricCard title="Today's Departures" value={departuresToday} icon={<UserMinus className="text-orange-500" />} />
          <MetricCard title="Occupancy Rate" value={`${occupancyRate}%`} icon={<Calendar className="text-purple-500" />} />
          <MetricCard title="Revenue This Month" value={`$${revenueThisMonth.toLocaleString()}`} icon={<DollarSign className="text-emerald-500" />} />
        </div>

        {/* ROW 2: ACTION REQUIRED */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Pending Reservations" value={pendingReservations} icon={<Clock className="text-amber-500" />} />
          <MetricCard title="Pending Transport" value={pendingTransport} icon={<Car className="text-sky-500" />} />
          <MetricCard title="Unread Messages" value={unreadMessages} icon={<MessageSquare className="text-rose-500" />} />
          <MetricCard title="Available Rooms" value={availableRooms} icon={<DoorOpen className="text-indigo-500" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ROW 3: RECENT RESERVATIONS */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Recent Reservations</h2>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Guest Name</th>
                    <th className="px-6 py-4 font-medium">Room</th>
                    <th className="px-6 py-4 font-medium">Check-In Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentBookings.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{b.guestName}</td>
                      <td className="px-6 py-4 text-gray-600">{b.roomName}</td>
                      <td className="px-6 py-4 text-gray-600">{b.checkIn}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                          b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                          b.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentBookings.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No recent reservations</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ROW 4: RECENT ACTIVITY FEED */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Activity Feed</h2>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-6">
                {recentActivities.map((act, i) => {
                  // Format the date simply without date-fns to avoid dependency issues
                  const dateStr = act.date.toLocaleDateString() + ' ' + act.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="mt-1">
                        {act.type === 'booking' && <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500" />}
                        {act.type === 'transport' && <div className="w-2 h-2 mt-1.5 rounded-full bg-sky-500" />}
                        {act.type === 'message' && <div className="w-2 h-2 mt-1.5 rounded-full bg-rose-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{act.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{dateStr}</p>
                      </div>
                    </div>
                  );
                })}
                {recentActivities.length === 0 && (
                  <p className="text-sm text-gray-500 text-center">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Dashboard error:", error);
    return <div className="p-8 text-red-500">Failed to load dashboard.</div>;
  }
}

function MetricCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{title}</h3>
        <p className="text-3xl font-serif text-gray-900">{value}</p>
      </div>
      <div className="p-4 bg-gray-50 rounded-full">
        {icon}
      </div>
    </div>
  );
}
