"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Activity, DollarSign, Calendar, TrendingUp, UserCheck, XCircle } from 'lucide-react';

export default function AnalyticsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState('6m');

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
    
    if (duration === '24h') {
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        grouped[`${d.getHours().toString().padStart(2, '0')}:00`] = 0;
      }
    } else if (duration === '7d') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        grouped[d.toLocaleDateString('default', { weekday: 'short' })] = 0;
      }
    } else if (duration === '30d') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        grouped[`${d.getMonth() + 1}/${d.getDate()}`] = 0;
      }
    } else if (duration === '6m') {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        grouped[d.toLocaleString('default', { month: 'short' })] = 0;
      }
    } else if (duration === '1y') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        grouped[d.toLocaleString('default', { month: 'short' })] = 0;
      }
    }

    bookings.forEach(b => {
      if ((b.status === 'Confirmed' || b.status === 'Completed') && b.createdAt) {
        const date = new Date(b.createdAt);
        const timeDiff = now.getTime() - date.getTime();
        let key = '';

        if (duration === '24h' && timeDiff <= 24 * 60 * 60 * 1000) {
          key = `${date.getHours().toString().padStart(2, '0')}:00`;
        } else if (duration === '7d' && timeDiff <= 7 * 24 * 60 * 60 * 1000) {
          key = date.toLocaleDateString('default', { weekday: 'short' });
        } else if (duration === '30d' && timeDiff <= 30 * 24 * 60 * 60 * 1000) {
          key = `${date.getMonth() + 1}/${date.getDate()}`;
        } else if (duration === '6m' && timeDiff <= 180 * 24 * 60 * 60 * 1000) {
          key = date.toLocaleString('default', { month: 'short' });
        } else if (duration === '1y' && timeDiff <= 365 * 24 * 60 * 60 * 1000) {
          key = date.toLocaleString('default', { month: 'short' });
        }

        if (key && grouped[key] !== undefined) {
          grouped[key] += (b.totalPrice || 0);
        }
      }
    });

    return Object.keys(grouped).map(key => ({
      name: key,
      revenue: grouped[key]
    }));
  }, [bookings, duration]);

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
  const cancelledCount = useMemo(() => bookings.filter(b => b.status.includes('Cancelled')).length, [bookings]);
  const checkedInCount = useMemo(() => bookings.filter(b => b.checkedIn || b.status === 'Completed').length, [bookings]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif text-primary">Analytics Overview</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
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
            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Checked-In</span>
            <span className="text-3xl font-serif text-gray-900">{checkedInCount}</span>
          </div>
          <div className="p-4 bg-blue-50 rounded-full text-blue-500">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Cancelled</span>
            <span className="text-3xl font-serif text-gray-900">{cancelledCount}</span>
          </div>
          <div className="p-4 bg-red-50 rounded-full text-red-500">
            <XCircle size={24} />
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
          <div className="p-4 bg-purple-50 rounded-full text-purple-500">
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
              <select 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 outline-none"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last 1 Year</option>
              </select>
            </div>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(v) => `$${v.toLocaleString()}`} width={80} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`$${value}`, 'Revenue']}
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
