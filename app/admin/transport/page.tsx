"use client";

import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

type TransportRequest = {
  id: string;
  bookingRef: string;
  guestName: string;
  email: string;
  pickupLocation: string;
  dropoffLocation: string;
  date: string;
  time: string;
  passengers: number;
  specialRequests: string;
  status: string; // 'Pending', 'Assigned', 'Completed'
  createdAt?: any;
};

export default function AdminTransportPage() {
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data?type=transport');
      if (!res.ok) throw new Error('Failed to fetch transport requests');
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching transport requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'transport',
          id,
          status: newStatus
        })
      });
      
      if (!res.ok) throw new Error('Failed to update status');
      
      fetchRequests();
      toast.success("Status updated successfully.");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    }
  };

  const filteredRequests = requests.filter(r => {
    return statusFilter === 'All' || r.status === statusFilter;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-primary">Transport Requests</h1>
      </div>

      <div className="flex mb-6">
        <div className="flex bg-gray-100 p-1 rounded-full space-x-1 overflow-x-auto max-w-full scrollbar-hide">
          {['All', 'Pending', 'Assigned', 'Completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${statusFilter === tab ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab === 'Pending' ? 'Pending Approval' : tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Guest & Ref</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{req.guestName}</div>
                    <div className="text-xs text-gray-500 font-mono mt-1">{req.bookingRef}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">{req.date}</div>
                    <div className="text-sm text-gray-600">{req.time}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-xs text-gray-500">From: <span className="text-gray-900">{req.pickupLocation}</span></div>
                    <div className="text-xs text-gray-500 mt-1">To: <span className="text-gray-900">{req.dropoffLocation}</span></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">{req.passengers} pax</div>
                    {req.specialRequests && (
                      <div className="text-xs text-gray-500 mt-1 truncate max-w-[150px]" title={req.specialRequests}>
                        {req.specialRequests}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                      req.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      req.status === 'Assigned' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    {req.status === 'Pending' && (
                      <button 
                        onClick={() => handleUpdateStatus(req.id, 'Assigned')} 
                        className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                        title="Mark as Assigned"
                      >
                        <Clock size={20} />
                      </button>
                    )}
                    {req.status === 'Assigned' && (
                      <button 
                        onClick={() => handleUpdateStatus(req.id, 'Completed')} 
                        className="text-green-600 hover:text-green-800 transition-colors p-1"
                        title="Mark as Completed"
                      >
                        <CheckCircle size={20} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No transport requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
