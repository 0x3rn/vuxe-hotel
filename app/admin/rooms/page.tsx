"use client";

import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

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
};

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

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
  });

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "rooms"));
      const roomsData: Room[] = [];
      querySnapshot.forEach((doc) => {
        roomsData.push({ id: doc.id, ...doc.data() } as Room);
      });
      setRooms(roomsData);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

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
        amenities: room.amenities.join(', '),
        imageUrl: room.imageUrl,
        isAvailable: room.isAvailable,
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
      };

      await setDoc(doc(db, "rooms", roomId), roomData);
      
      handleCloseModal();
      fetchRooms();
    } catch (error) {
      console.error("Error saving room:", error);
      alert("Failed to save room.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    try {
      await deleteDoc(doc(db, "rooms", id));
      fetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("Failed to delete room.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-primary">Manage Rooms</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-primary-foreground px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} /> Add Room
        </button>
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
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Room Name</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Night</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50/50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{room.name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{room.id}</div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">${room.pricePerNight}</td>
                  <td className="py-4 px-6 text-gray-600">{room.capacity}</td>
                  <td className="py-4 px-6 text-gray-600">{room.inventory || 0}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs ${room.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {room.isAvailable ? 'Available' : 'Booked'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-3">
                    <button onClick={() => handleOpenModal(room)} className="text-blue-600 hover:text-blue-800 transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(room.id)} className="text-red-600 hover:text-red-800 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">No rooms found. Add one!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
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
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" rows={3}></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price/Night ($)</label>
                  <input type="number" required value={formData.pricePerNight} onChange={e => setFormData({...formData, pricePerNight: Number(e.target.value)})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input type="number" required value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inventory</label>
                  <input type="number" required value={formData.inventory} onChange={e => setFormData({...formData, inventory: Number(e.target.value)})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amenities (comma separated)</label>
                <input type="text" value={formData.amenities} onChange={e => setFormData({...formData, amenities: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" placeholder="Wifi, Pool, Minibar" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="text" required value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" />
              </div>
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
    </div>
  );
}
