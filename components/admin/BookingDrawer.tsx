import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Clock, XCircle, Car, Calendar, User, Phone, Mail, FileText, CheckSquare, LogOut, UserMinus, PlusCircle, Edit, Save } from 'lucide-react';
import { differenceInDays, addDays, format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

type Booking = {
  id: string;
  guestName: string;
  email: string;
  phone?: string;
  roomId: string;
  roomName: string;
  checkInDate?: string;
  checkOutDate?: string;
  checkIn?: string;
  checkOut?: string;
  totalPrice: number;
  status: string;
  specialRequests?: string;
  createdAt?: any;
  bookingRef?: string;
  checkedIn?: boolean;
  checkInTime?: any;
  checkedOut?: boolean;
  checkOutTime?: any;
  assignedRoomNumber?: string;
};

export default function BookingDrawer({ booking: initialBooking, onClose, onSave }: { booking: Booking, onClose: () => void, onSave?: () => void }) {
  const [booking, setBooking] = useState<Booking>(initialBooking);
  const [transportRequests, setTransportRequests] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomPrice, setRoomPrice] = useState<number | null>(null);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    checkInDate: initialBooking.checkInDate || initialBooking.checkIn || '',
    checkOutDate: initialBooking.checkOutDate || initialBooking.checkOut || '',
    roomId: initialBooking.roomId,
    assignedRoomNumber: initialBooking.assignedRoomNumber || '',
  });

  // Extend Stay State
  const [isExtending, setIsExtending] = useState(false);
  const [extraNights, setExtraNights] = useState(1);
  const [extendingAction, setExtendingAction] = useState(false);

  useEffect(() => {
    setBooking(initialBooking);
    setEditData({
      checkInDate: initialBooking.checkInDate || initialBooking.checkIn || '',
      checkOutDate: initialBooking.checkOutDate || initialBooking.checkOut || '',
      roomId: initialBooking.roomId,
      assignedRoomNumber: initialBooking.assignedRoomNumber || '',
    });
  }, [initialBooking]);

  useEffect(() => {
    const fetchTransportAndRoom = async () => {
      try {
        const res = await fetch(`/api/admin/drawer?bookingId=${booking.id}&roomId=${booking.roomId}`);
        if (!res.ok) throw new Error("Failed to fetch drawer data");
        const data = await res.json();
        
        setTransportRequests(data.transportRequests || []);
        setRoomPrice(data.roomPrice || null);

        // Fetch all rooms for edit dropdown
        const rRes = await fetch('/api/admin/data?type=rooms');
        if (rRes.ok) {
          const rData = await rRes.json();
          setRooms(rData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransportAndRoom();
  }, [booking.id, booking.roomId]);

  const checkIn = booking.checkIn || booking.checkInDate;
  const checkOut = booking.checkOut || booking.checkOutDate;

  // Actions
  const handleAction = async (action: string, updateData?: any) => {
    try {
      const res = await fetch('/api/admin/drawer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, bookingId: booking.id, updateData })
      });
      if (!res.ok) {
        const err = await res.json();
        if (err.error === 'DOUBLE_BOOKING') {
          toast.error(err.message || "Room is fully booked for these dates.");
          return false;
        }
        throw new Error("Failed to update booking");
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const handleCheckIn = async () => {
    if (!confirm("Confirm guest check-in?")) return;
    const success = await handleAction('checkIn');
    if (success) {
      setBooking({ ...booking, checkedIn: true, status: 'Confirmed' });
      toast.success("Guest checked in successfully.");
      if (onSave) onSave();
    } else {
      toast.error("Check-in failed.");
    }
  };

  const handleCheckOut = async () => {
    if (!confirm("Confirm guest check-out?")) return;
    const success = await handleAction('checkOut');
    if (success) {
      setBooking({ ...booking, checkedOut: true, status: 'Completed' });
      toast.success("Guest checked out successfully.");
      if (onSave) onSave();
    } else {
      toast.error("Check-out failed.");
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking on behalf of the guest?")) return;
    const success = await handleAction('cancel');
    if (success) {
      setBooking({ ...booking, status: 'Guest Cancelled' });
      toast.success("Booking cancelled.");
      if (onSave) onSave();
    } else {
      toast.error("Cancellation failed.");
    }
  };

  const handleExtendStay = async () => {
    if (!checkOut || roomPrice === null) return;
    setExtendingAction(true);
    
    const currentCheckOut = new Date(checkOut);
    const newCheckOut = addDays(currentCheckOut, extraNights);
    const addedCost = extraNights * roomPrice;
    const newTotal = booking.totalPrice + addedCost;
    const newCheckOutStr = format(newCheckOut, 'yyyy-MM-dd');

    const success = await handleAction('extend', {
      checkOutDate: newCheckOutStr,
      totalPrice: newTotal
    });

    if (success) {
      setBooking({ ...booking, checkOutDate: newCheckOutStr, checkOut: newCheckOutStr, totalPrice: newTotal });
      setIsExtending(false);
      toast.success(`Stay extended by ${extraNights} nights.`);
      if (onSave) onSave();
    } else {
      toast.error("Failed to extend stay.");
    }
    setExtendingAction(false);
  };

  const handleSaveEdit = async () => {
    const selectedRoomDoc = rooms.find(r => r.id === editData.roomId);
    const updatePayload = {
      ...editData,
      roomName: selectedRoomDoc ? selectedRoomDoc.name : booking.roomName
    };

    const success = await handleAction('edit', updatePayload);
    if (success) {
      setBooking({ ...booking, ...updatePayload });
      setIsEditing(false);
      toast.success("Booking updated!");
      if (onSave) onSave();
    }
  };

  const selectedRoomType = rooms.find(r => r.id === editData.roomId);
  const availablePhysicalRooms = selectedRoomType?.roomNumbers || [];

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
        <div>
          <h2 className="text-xl font-serif text-gray-900">Booking Details</h2>
          <p className="text-xs text-gray-500 mt-1 font-mono">Ref: {booking.bookingRef || booking.id}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Status & Price */}
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Status</p>
            <div className="flex items-center gap-2">
              {booking.status === 'Confirmed' && <CheckCircle size={18} className="text-emerald-500" />}
              {booking.status === 'Pending' && <Clock size={18} className="text-amber-500" />}
              {booking.status === 'Completed' && <CheckCircle size={18} className="text-blue-500" />}
              {(booking.status.includes('Cancelled')) && <XCircle size={18} className="text-red-500" />}
              <span className={`font-medium ${
                booking.status === 'Confirmed' ? 'text-emerald-700' :
                booking.status === 'Completed' ? 'text-blue-700' :
                booking.status === 'Pending' ? 'text-amber-700' : 'text-red-700'
              }`}>{booking.status}</span>
            </div>
            {booking.checkedIn && !booking.checkedOut && <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded mt-2 inline-block">Checked In</span>}
            {booking.checkedOut && <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded mt-2 inline-block">Checked Out</span>}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Total Price</p>
            <p className="text-2xl font-serif text-gray-900">${booking.totalPrice}</p>
          </div>
        </div>

        {/* Operational Actions */}
        {!isEditing && (
          <div className="space-y-3">
            {(booking.status === 'Confirmed' && !booking.checkedIn) && (
              <button onClick={handleCheckIn} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors">
                <CheckSquare size={18} /> Check In Guest
              </button>
            )}

            {(booking.checkedIn && !booking.checkedOut) && (
              <>
                <button onClick={handleCheckOut} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors">
                  <LogOut size={18} /> Check Out Guest
                </button>

                <button onClick={() => setIsExtending(!isExtending)} className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors">
                  <PlusCircle size={18} /> Extend Stay
                </button>

                {isExtending && (
                  <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-lg space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">Extra Nights</label>
                      <input type="number" min="1" max="30" value={extraNights} onChange={e => setExtraNights(Number(e.target.value))} className="w-full border border-zinc-300 rounded px-3 py-2 text-sm" />
                    </div>
                    {checkOut && roomPrice && (
                      <div className="text-xs text-zinc-600 space-y-1">
                        <p>New Check-Out: <span className="font-semibold text-zinc-900">{format(addDays(new Date(checkOut), extraNights), 'yyyy-MM-dd')}</span></p>
                        <p>Added Cost: <span className="font-semibold text-emerald-600">+${extraNights * roomPrice}</span></p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => setIsExtending(false)} className="flex-1 bg-white border border-zinc-300 text-zinc-600 py-2 rounded text-sm hover:bg-zinc-50">Cancel</button>
                      <button onClick={handleExtendStay} disabled={extendingAction} className="flex-1 bg-zinc-900 text-white py-2 rounded text-sm hover:bg-zinc-800 disabled:opacity-50">Confirm Extend</button>
                    </div>
                  </div>
                )}
              </>
            )}

            {(!booking.checkedIn && !booking.status.includes('Cancelled')) && (
              <button onClick={() => setIsEditing(true)} className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors border border-amber-200">
                <Edit size={18} /> Edit Booking
              </button>
            )}

            {(booking.status === 'Pending' || booking.status === 'Confirmed') && !booking.checkedIn && (
              <button onClick={handleCancel} className="w-full bg-red-50 hover:bg-red-100 text-red-700 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors border border-red-200">
                <UserMinus size={18} /> Cancel Booking
              </button>
            )}
          </div>
        )}

        {/* Guest Details */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
            <User size={16} /> Guest Details
          </h3>
          <div className="space-y-3 bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
            <div>
              <p className="text-xs text-gray-500">Full Name</p>
              <p className="font-medium text-gray-900">{booking.guestName}</p>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={14} className="text-gray-400" />
              <p className="text-sm text-gray-700">{booking.email}</p>
            </div>
            {booking.phone && (
              <div className="flex items-center gap-3">
                <Phone size={14} className="text-gray-400" />
                <p className="text-sm text-gray-700">{booking.phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stay Details */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Calendar size={16} /> Stay Details
          </h3>
          {isEditing ? (
            <div className="space-y-4 bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Room Type</label>
                <select 
                  value={editData.roomId} 
                  onChange={e => setEditData({...editData, roomId: e.target.value, assignedRoomNumber: ''})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Check-In</label>
                  <input 
                    type="date" 
                    value={editData.checkInDate} 
                    onChange={e => setEditData({...editData, checkInDate: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Check-Out</label>
                  <input 
                    type="date" 
                    value={editData.checkOutDate} 
                    onChange={e => setEditData({...editData, checkOutDate: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>
              {(booking.status === 'Confirmed' || booking.status === 'Pending') && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Assign Physical Room Number</label>
                  <select 
                    value={editData.assignedRoomNumber} 
                    onChange={e => setEditData({...editData, assignedRoomNumber: e.target.value})}
                    className="w-full border border-emerald-300 bg-emerald-50 rounded px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">-- Unassigned --</option>
                    {availablePhysicalRooms.map((num: string) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Select a specific physical room to reserve for this guest.</p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button onClick={() => setIsEditing(false)} className="flex-1 bg-white border border-gray-300 text-gray-600 py-2 rounded text-sm hover:bg-gray-50">Cancel</button>
                <button onClick={handleSaveEdit} className="flex-1 bg-amber-600 text-white py-2 rounded text-sm hover:bg-amber-700 flex items-center justify-center gap-2">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
              <div>
                <p className="text-xs text-gray-500">Room Type</p>
                <p className="font-medium text-gray-900">{booking.roomName}</p>
              </div>
              {booking.assignedRoomNumber && (
                <div>
                  <p className="text-xs text-gray-500">Assigned Room</p>
                  <p className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block border border-emerald-200">{booking.assignedRoomNumber}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Check-In</p>
                  <p className="text-sm font-medium text-gray-900">{checkIn}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Check-Out</p>
                  <p className="text-sm font-medium text-gray-900">{checkOut}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Linked Transport */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Car size={16} /> Linked Transport
          </h3>
          {loading ? (
            <p className="text-sm text-gray-500">Loading transport...</p>
          ) : transportRequests.length > 0 ? (
            <div className="space-y-3">
              {transportRequests.map(t => (
                <div key={t.id} className="bg-sky-50 border border-sky-100 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-sky-900">{t.serviceType || 'Airport Transfer'}</p>
                    <span className="text-xs font-bold px-2 py-0.5 bg-sky-200 text-sky-800 rounded-full">{t.status}</span>
                  </div>
                  <p className="text-xs text-sky-700">Flight: {t.flightNumber} | Time: {t.arrivalTime}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">No transport linked.</p>
          )}
        </div>

      </div>
    </div>
  );
}
