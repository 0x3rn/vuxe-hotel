"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Activity, DollarSign, Calendar, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
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
    fetchBookings();
  }, []);

  // Compute Revenue Trend Data
  const revenueData = useMemo(() => {
    const grouped: Record<string, number> = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('default', { month: 'short' });
      grouped[key] = 0;
    }

    bookings.forEach(b => {
      if ((b.status === 'Confirmed' || b.status === 'Completed') && b.createdAt) {
        const date = new Date(b.createdAt);
        const key = date.toLocaleString('default', { month: 'short' });
        if (grouped[key] !== undefined) {
          grouped[key] += (b.totalPrice || 0);
        }
      }
    });

    return Object.keys(grouped).map(key => ({
      name: key,
      revenue: grouped[key]
    }));
  }, [bookings]);

  // Compute Status Distribution
  const statusData = useMemo(() => {
    let pending = 0, confirmed = 0, cancelled = 0, completed = 0;
    bookings.forEach(b => {
      if (b.status === 'Pending') pending++;
      if (b.status === 'Confirmed') confirmed++;
      if (b.status === 'Completed') completed++;
      if (b.status.includes('Cancelled')) cancelled++;
    });
    return [
      { name: 'Confirmed', value: confirmed, color: '#10b981' },
      { name: 'Completed', value: completed, color: '#3b82f6' },
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'Cancelled', value: cancelled, color: '#ef4444' }
    ];
  }, [bookings]);

  // Quick stats
  const totalRev = useMemo(() => bookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed').reduce((a, c) => a + (c.totalPrice || 0), 0), [bookings]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif text-primary">Analytics Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Total Bookings</span>
            <span className="text-3xl font-serif text-gray-900">{bookings.length}</span>
          </div>
          <div className="p-4 bg-gray-50 rounded-full text-gray-400">
            <Activity size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Total Revenue</span>
            <span className="text-3xl font-serif text-gray-900">${totalRev.toLocaleString()}</span>
          </div>
          <div className="p-4 bg-emerald-50 rounded-full text-emerald-500">
            <DollarSign size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Avg Booking Value</span>
            <span className="text-3xl font-serif text-gray-900">${statusData[0]?.value > 0 ? Math.round(totalRev / statusData[0].value).toLocaleString() : 0}</span>
          </div>
          <div className="p-4 bg-blue-50 rounded-full text-blue-500">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend (Last 6 Months)</h2>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`$${value}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Pie Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Booking Status</h2>
            <div className="flex-1 min-h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
