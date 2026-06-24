"use client";

import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, X, Car, DollarSign } from 'lucide-react';
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
  // New Schema Fields
  driverName?: string;
  vehicleUsed?: string;
  cost?: number;
};

export default function AdminTransportPage() {
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Assignment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<TransportRequest | null>(null);
  const [assignmentData, setAssignmentData] = useState({
    driverName: '',
    vehicleUsed: '',
    cost: 0,
    status: 'Assigned'
  });

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

  const openAssignModal = (req: TransportRequest) => {
    setSelectedReq(req);
    setAssignmentData({
      driverName: req.driverName || '',
      vehicleUsed: req.vehicleUsed || '',
      cost: req.cost || 0,
      status: 'Assigned'
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e?: React.FormEvent, forceStatus?: string) => {
    if (e) e.preventDefault();
    if (!selectedReq) return;

    try {
      const finalStatus = forceStatus || assignmentData.status;
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'transport',
          id: selectedReq.id,
          ...assignmentData,
          status: finalStatus
        })
      });
      
      if (!res.ok) throw new Error('Failed to update transport');
      
      fetchRequests();
      setIsModalOpen(false);
      setSelectedReq(null);
      toast.success(`Transport ${finalStatus} successfully.`);
    } catch (error) {
      console.error("Error updating transport:", error);
      toast.error("Failed to update transport.");
    }
  };

  const handleQuickComplete = async (req: TransportRequest) => {
    setSelectedReq(req);
    setAssignmentData({
      driverName: req.driverName || '',
      vehicleUsed: req.vehicleUsed || '',
      cost: req.cost || 0,
      status: 'Completed'
    });
    await handleUpdate(undefined, 'Completed');
  };

  const filteredRequests = requests.filter(r => {
    return statusFilter === 'All' || r.status === statusFilter;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-primary">Transport Operations</h1>
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
        <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Guest & Ref</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Route & Pax</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment & Cost</th>
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
                    <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <span className="w-8 inline-block font-semibold">From:</span> 
                      <span className="text-gray-900">{req.pickupLocation}</span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                      <span className="w-8 inline-block font-semibold">To:</span> 
                      <span className="text-gray-900">{req.dropoffLocation}</span>
                    </div>
                    <div className="text-xs font-medium text-blue-700 bg-blue-50 inline-block px-2 py-0.5 rounded">
                      {req.passengers} Passengers
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {req.driverName ? (
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900 font-medium flex items-center gap-1"><Car size={14} className="text-gray-400" /> {req.driverName}</div>
                        <div className="text-xs text-gray-500">{req.vehicleUsed}</div>
                        <div className="text-sm text-emerald-700 font-bold flex items-center gap-1 mt-1"><DollarSign size={14} /> {req.cost}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Not assigned</span>
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
                        onClick={() => openAssignModal(req)} 
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors px-3 py-1.5 rounded text-xs font-medium"
                      >
                        Assign Driver
                      </button>
                    )}
                    {req.status === 'Assigned' && (
                      <>
                        <button 
                          onClick={() => openAssignModal(req)} 
                          className="text-gray-500 hover:text-blue-600 transition-colors p-1 mr-1"
                          title="Edit Assignment"
                        >
                          <Car size={18} />
                        </button>
                        <button 
                          onClick={() => handleQuickComplete(req)} 
                          className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors px-3 py-1.5 rounded text-xs font-medium"
                        >
                          Complete
                        </button>
                      </>
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

      {/* Assignment Modal */}
      {isModalOpen && selectedReq && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-serif text-gray-900">Assign Transport</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => handleUpdate(e)} className="p-6 space-y-4">
              
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-900 font-medium">{selectedReq.guestName} ({selectedReq.passengers} Pax)</p>
                <p className="text-xs text-blue-700 mt-1">{selectedReq.pickupLocation} ➔ {selectedReq.dropoffLocation}</p>
                <p className="text-xs text-blue-700 mt-1 font-bold">{selectedReq.date} @ {selectedReq.time}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                <input 
                  type="text" 
                  required 
                  value={assignmentData.driverName} 
                  onChange={e => setAssignmentData({...assignmentData, driverName: e.target.value})} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" 
                  placeholder="e.g. John Doe" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Used</label>
                <input 
                  type="text" 
                  required 
                  value={assignmentData.vehicleUsed} 
                  onChange={e => setAssignmentData({...assignmentData, vehicleUsed: e.target.value})} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" 
                  placeholder="e.g. Black Mercedes S-Class (XYZ-123)" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
                <input 
                  type="number" 
                  required 
                  value={assignmentData.cost} 
                  onChange={e => setAssignmentData({...assignmentData, cost: Number(e.target.value)})} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" 
                  min="0"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">Save Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
