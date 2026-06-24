"use client";

import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Edit2, Trash2, X, Eye, LayoutGrid, List } from 'lucide-react';
import toast from 'react-hot-toast';
import MediaInput from '@/components/admin/MediaInput';
import MediaDisplay from '@/components/MediaDisplay';
import RoomDrawer from '@/components/admin/RoomDrawer';
import BookingDrawer from '@/components/admin/BookingDrawer';
import { isToday, isFuture, isPast, parseISO } from 'date-fns';

type Room = {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  inventory: number;
  amenities: string[];
  imageUrl: string;
  isAvailable: boolean;
  roomNumbers?: string[];
};

type Booking = any;

export default function AdminRoomsPage() {
  const [activeTab, setActiveTab] = useState<'types' | 'live'>('types');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Room Type Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  
  // Drawer state
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Offline Booking Modal state
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [selectedMatrixRoom, setSelectedMatrixRoom] = useState<{ roomId: string, roomName: string, assignedRoomNumber: string } | null>(null);
  const [offlineFormData, setOfflineFormData] = useState({
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
    guestName: '',
    email: '',
    phone: '',
    type: 'Walk-In'
  });
  const [offlineLoading, setOfflineLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    pricePerNight: 0,
    capacity: 2,
    inventory: 1,
    amenities: '', // comma separated
    imageUrl: 'https://placehold.co/800x600/222222/D4AF37?text=New+Room',
    isAvailable: true,
    roomNumbers: [] as string[],
  });

  const fetchRoomsAndBookings = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "rooms"));
      const roomsData: Room[] = [];
      querySnapshot.forEach((doc) => {
        roomsData.push({ id: doc.id, ...doc.data() } as Room);
      });
      roomsData.sort((a, b) => a.name.localeCompare(b.name));
      setRooms(roomsData);

      const bookingsRes = await fetch('/api/admin/data?type=bookings');
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomsAndBookings();
  }, []);

  const handleInventoryChange = (newInventory: number) => {
    let newRoomNumbers = [...formData.roomNumbers];
    const baseName = formData.name || 'Room';
    
    if (newInventory > newRoomNumbers.length) {
      // Add missing rooms
      for (let i = newRoomNumbers.length; i < newInventory; i++) {
        newRoomNumbers.push(`${baseName} - ${(i + 1).toString().padStart(2, '0')}`);
      }
    } else if (newInventory < newRoomNumbers.length) {
      // Remove excess
      newRoomNumbers = newRoomNumbers.slice(0, newInventory);
    }
    
    setFormData({ ...formData, inventory: newInventory, roomNumbers: newRoomNumbers });
  };

  const handleRoomNumberChange = (index: number, val: string) => {
    const newRoomNumbers = [...formData.roomNumbers];
    newRoomNumbers[index] = val;
    setFormData({ ...formData, roomNumbers: newRoomNumbers });
  };

  const handleOpenModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        id: room.id,
        name: room.name,
        description: room.description,
        pricePerNight: room.pricePerNight,
        capacity: room.capacity,
        inventory: room.inventory || 0,
        amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : (room.amenities || ''),
        imageUrl: room.imageUrl,
        isAvailable: room.isAvailable,
        roomNumbers: room.roomNumbers || Array.from({ length: room.inventory || 0 }).map((_, i) => `${room.name} - ${(i + 1).toString().padStart(2, '0')}`),
      });
    } else {
      setEditingRoom(null);
      setFormData({
        id: '',
        name: '',
        description: '',
        pricePerNight: 0,
        capacity: 2,
        inventory: 1,
        amenities: '',
        imageUrl: 'https://placehold.co/800x600/222222/D4AF37?text=New+Room',
        isAvailable: true,
        roomNumbers: ['Room - 01'],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const roomId = editingRoom ? editingRoom.id : (formData.id || formData.name.toLowerCase().replace(/\s+/g, '-'));
      
      const roomData = {
        name: formData.name,
        description: formData.description,
        pricePerNight: Number(formData.pricePerNight),
        capacity: Number(formData.capacity),
        inventory: Number(formData.inventory),
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
        imageUrl: formData.imageUrl,
        isAvailable: formData.isAvailable,
        roomNumbers: formData.roomNumbers,
      };

      await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'rooms', id: roomId, roomData })
      });
      
      handleCloseModal();
      fetchRoomsAndBookings();
      toast.success(editingRoom ? "Room updated successfully!" : "Room created successfully!");
    } catch (error) {
      console.error("Error saving room:", error);
      toast.error("Failed to save room.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    try {
      await fetch(`/api/admin/data?type=rooms&id=${id}`, { method: 'DELETE' });
      fetchRoomsAndBookings();
      toast.success("Room deleted successfully.");
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("Failed to delete room.");
    }
  };

  const parseDate = (d: string | undefined) => {
    if (!d) return new Date();
    try { return parseISO(d); } catch { return new Date(d); }
  }

  const getRoomNumberState = (roomId: string, roomNumber: string) => {
    const activeBookings = bookings.filter(b => 
      b.roomId === roomId && 
      b.assignedRoomNumber === roomNumber &&
      b.status !== 'Cancelled' && 
      b.status !== 'System Cancelled' &&
      b.status !== 'Guest Cancelled' &&
      !b.checkedOut
    );

    if (activeBookings.some(b => b.checkedIn)) {
      return { state: 'red', label: 'Checked-In', booking: activeBookings.find(b => b.checkedIn) };
    }

    const overlappingUnchecked = activeBookings.find(b => {
      const inD = parseDate(b.checkInDate || b.checkIn);
      const outD = parseDate(b.checkOutDate || b.checkOut);
      return (isToday(inD) || isPast(inD)) && (isToday(outD) || isFuture(outD));
    });

    if (overlappingUnchecked) {
      return { state: 'green', label: 'Selected / Arriving', booking: overlappingUnchecked };
    }

    return { state: 'ash', label: 'Available', booking: null };
  };

  const handleSaveOfflineBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatrixRoom) return;
    setOfflineLoading(true);

    try {
      // Find room price
      const roomTypeDoc = rooms.find(r => r.id === selectedMatrixRoom.roomId);
      const pricePerNight = roomTypeDoc?.pricePerNight || 0;
      
      const inDate = new Date(offlineFormData.checkInDate);
      const outDate = new Date(offlineFormData.checkOutDate);
      const diffTime = Math.abs(outDate.getTime() - inDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      const totalPrice = diffDays * pricePerNight;

      const guestName = offlineFormData.guestName.trim() || `Offline Booking / ${offlineFormData.type}`;

      const res = await fetch('/api/admin/drawer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          updateData: {
            guestName,
            email: offlineFormData.email,
            phone: offlineFormData.phone,
            roomId: selectedMatrixRoom.roomId,
            roomName: selectedMatrixRoom.roomName,
            assignedRoomNumber: selectedMatrixRoom.assignedRoomNumber,
            checkInDate: offlineFormData.checkInDate,
            checkOutDate: offlineFormData.checkOutDate,
            totalPrice,
            status: 'Confirmed',
            checkedIn: false,
            checkedOut: false,
            specialRequests: `Offline Booking Type: ${offlineFormData.type}`
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'DOUBLE_BOOKING') {
          toast.error(data.message || "Room is double-booked.");
        } else {
          throw new Error(data.error || "Failed to save offline booking.");
        }
      } else {
        toast.success("Offline booking successfully recorded.");
        setIsOfflineModalOpen(false);
        fetchRoomsAndBookings();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setOfflineLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-serif text-primary">Manage Rooms</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => handleOpenModal()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} /> Add Room
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'types' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          onClick={() => setActiveTab('types')}
        >
          <List size={18} /> Room Types
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'live' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          onClick={() => setActiveTab('live')}
        >
          <LayoutGrid size={18} /> Live Room Status
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-500">Loading rooms...</div>
      ) : activeTab === 'types' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                <th className="p-4 font-medium">Image</th>
                <th className="p-4 font-medium">Name & Details</th>
                <th className="p-4 font-medium">Price/Night</th>
                <th className="p-4 font-medium">Capacity</th>
                <th className="p-4 font-medium">Inventory</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="w-16 h-16 rounded overflow-hidden relative">
                       <MediaDisplay src={room.imageUrl} alt={room.name} fill className="object-cover" />
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{room.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-xs">{room.description}</p>
                  </td>
                  <td className="p-4 font-medium text-gray-900">${room.pricePerNight}</td>
                  <td className="p-4 text-gray-600">{room.capacity} Guests</td>
                  <td className="p-4">
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-medium">
                      {room.inventory} Unit{room.inventory !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${room.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {room.isAvailable ? 'Available' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    <button onClick={() => setSelectedRoom(room)} className="text-gray-400 hover:text-gray-600 transition-colors" title="View Detail">
                      <Eye size={18} />
                    </button>
                    <button onClick={() => handleOpenModal(room)} className="text-blue-600 hover:text-blue-800 transition-colors" title="Edit">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(room.id)} className="text-red-600 hover:text-red-800 transition-colors" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">No rooms found. Add one!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div><span className="text-sm text-gray-600">Available</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-emerald-50 border border-emerald-300 rounded"></div><span className="text-sm text-gray-600">Selected / Arriving</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-50 border border-red-300 rounded"></div><span className="text-sm text-gray-600">Checked-In / Unavailable</span></div>
          </div>
          
          {rooms.map(room => {
            const numbers = room.roomNumbers || [];
            if (numbers.length === 0) return null;
            return (
              <div key={room.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-serif text-gray-900 mb-4">{room.name}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {numbers.map(num => {
                    const status = getRoomNumberState(room.id, num);
                    let bgClass = "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 cursor-pointer";
                    if (status.state === 'green') bgClass = "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm hover:bg-emerald-100 cursor-pointer";
                    if (status.state === 'red') bgClass = "bg-red-50 text-red-800 border-red-300 shadow-sm hover:bg-red-100 cursor-pointer";

                    return (
                      <div 
                        key={num} 
                        onClick={() => {
                          if (status.booking) {
                            setSelectedBooking(status.booking);
                          } else {
                            setSelectedMatrixRoom({ roomId: room.id, roomName: room.name, assignedRoomNumber: num });
                            setIsOfflineModalOpen(true);
                          }
                        }}
                        className={`border rounded-lg p-4 flex flex-col items-center justify-center text-center transition-colors ${bgClass}`}
                      >
                        <span className="font-medium text-sm mb-1">{num}</span>
                        <span className="text-xs opacity-80">{status.label}</span>
                        {status.booking && (
                          <span className="text-xs font-semibold mt-2 truncate w-full" title={status.booking.guestName}>
                            {status.booking.guestName}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Offline Booking Modal */}
      {isOfflineModalOpen && selectedMatrixRoom && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-serif text-gray-900">Mark Room Booked</h2>
              <button onClick={() => setIsOfflineModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveOfflineBooking} className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-4">
                <p className="text-sm font-medium text-amber-800">Assigning: <span className="font-bold">{selectedMatrixRoom.assignedRoomNumber}</span></p>
                <p className="text-xs text-amber-700 mt-1">This will block this physical room off the matrix and the public calendar.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Check-In Date *</label>
                  <input type="date" required value={offlineFormData.checkInDate} onChange={e => setOfflineFormData({...offlineFormData, checkInDate: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Check-Out Date *</label>
                  <input type="date" required value={offlineFormData.checkOutDate} onChange={e => setOfflineFormData({...offlineFormData, checkOutDate: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none text-sm" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Guest Name (Optional)</label>
                <input type="text" value={offlineFormData.guestName} onChange={e => setOfflineFormData({...offlineFormData, guestName: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none text-sm" placeholder="e.g. John Doe" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email (Optional)</label>
                  <input type="email" value={offlineFormData.email} onChange={e => setOfflineFormData({...offlineFormData, email: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none text-sm" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone (Optional)</label>
                  <input type="tel" value={offlineFormData.phone} onChange={e => setOfflineFormData({...offlineFormData, phone: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none text-sm" placeholder="+1 555-0199" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Booking Source</label>
                <select value={offlineFormData.type} onChange={e => setOfflineFormData({...offlineFormData, type: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none text-sm">
                  <option value="Walk-In">Walk-In / Front Desk</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="Third-Party Agent">Third-Party Agent</option>
                  <option value="Other Offline">Other Offline</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button type="button" disabled={offlineLoading} onClick={() => setIsOfflineModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={offlineLoading} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {offlineLoading ? 'Saving...' : 'Confirm Offline Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer */}
      {selectedRoom && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedRoom(null)} />
          <RoomDrawer room={selectedRoom} onClose={() => setSelectedRoom(null)} />
        </>
      )}

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-serif text-gray-900">{editingRoom ? 'Edit Room' : 'Add New Room'}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {!editingRoom && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room ID (optional)</label>
                  <input type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" placeholder="e.g. deluxe-suite" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                <input type="text" required value={formData.name} onChange={e => {
                  const baseName = e.target.value;
                  setFormData({...formData, name: baseName, roomNumbers: formData.roomNumbers.map((r, i) => `${baseName} - ${(i+1).toString().padStart(2, '0')}`) });
                }} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-primary resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price/Night ($)</label>
                  <input type="number" onWheel={(e) => (e.target as HTMLInputElement).blur()} required value={formData.pricePerNight} onChange={e => setFormData({...formData, pricePerNight: Number(e.target.value)})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input type="number" onWheel={(e) => (e.target as HTMLInputElement).blur()} required value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inventory</label>
                  <input type="number" onWheel={(e) => (e.target as HTMLInputElement).blur()} required value={formData.inventory} onChange={e => handleInventoryChange(Number(e.target.value))} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" />
                </div>
              </div>
              
              {/* Room Numbers dynamic inputs */}
              {formData.inventory > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Unique Room Identifiers</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {formData.roomNumbers.map((num, i) => (
                      <input 
                        key={i}
                        type="text" 
                        required 
                        value={num} 
                        onChange={e => handleRoomNumberChange(i, e.target.value)} 
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" 
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">These are the physical room numbers/names guests will be assigned to.</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amenities (comma separated)</label>
                <input type="text" value={formData.amenities} onChange={e => setFormData({...formData, amenities: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" placeholder="Wifi, Pool, Minibar" />
              </div>
              <MediaInput
                label="Room Media"
                value={formData.imageUrl}
                onChange={(url) => setFormData({...formData, imageUrl: url})}
                required
              />
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isAvailable" checked={formData.isAvailable} onChange={e => setFormData({...formData, isAvailable: e.target.checked})} className="rounded text-primary focus:ring-primary" />
                <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">Room is Available</label>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">Save Room</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Drawer for clicking occupied rooms */}
      {selectedBooking && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedBooking(null)} />
          <BookingDrawer booking={selectedBooking} onClose={() => setSelectedBooking(null)} onSave={() => {
            fetchRoomsAndBookings();
          }} />
        </>
      )}
    </div>
  );
}
