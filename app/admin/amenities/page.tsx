"use client";

import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

type Amenity = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
};

export default function AdminAmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    order: 0,
  });

  const fetchAmenities = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "amenities"));
      const amenitiesData: Amenity[] = [];
      querySnapshot.forEach((doc) => {
        amenitiesData.push({ id: doc.id, ...doc.data() } as Amenity);
      });
      // Sort by order
      amenitiesData.sort((a, b) => (a.order || 0) - (b.order || 0));
      setAmenities(amenitiesData);
    } catch (error) {
      console.error("Error fetching amenities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  const handleOpenModal = (amenity?: Amenity) => {
    if (amenity) {
      setEditingAmenity(amenity);
      setFormData({
        id: amenity.id,
        title: amenity.title,
        description: amenity.description,
        imageUrl: amenity.imageUrl,
        order: amenity.order || 0,
      });
    } else {
      setEditingAmenity(null);
      setFormData({
        id: '',
        title: '',
        description: '',
        imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
        order: amenities.length + 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAmenity(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const amenityId = editingAmenity ? editingAmenity.id : (formData.id || formData.title.toLowerCase().replace(/\s+/g, '-'));
      
      const amenityData = {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        order: Number(formData.order),
      };

      await setDoc(doc(db, "amenities", amenityId), amenityData);
      
      handleCloseModal();
      fetchAmenities();
    } catch (error) {
      console.error("Error saving amenity:", error);
      alert("Failed to save amenity.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this amenity?")) return;
    try {
      await deleteDoc(doc(db, "amenities", id));
      fetchAmenities();
    } catch (error) {
      console.error("Error deleting amenity:", error);
      alert("Failed to delete amenity.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-primary">Manage Amenities</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-primary-foreground px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} /> Add Amenity
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
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Order</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Amenity Title</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {amenities.map((amenity) => (
                <tr key={amenity.id} className="hover:bg-gray-50/50">
                  <td className="py-4 px-6 text-gray-600 font-medium">{amenity.order}</td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{amenity.title}</div>
                    <div className="text-xs text-gray-500">{amenity.id}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600 line-clamp-2 max-w-md">{amenity.description}</div>
                  </td>
                  <td className="py-4 px-6 text-right space-x-3">
                    <button onClick={() => handleOpenModal(amenity)} className="text-blue-600 hover:text-blue-800 transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(amenity.id)} className="text-red-600 hover:text-red-800 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {amenities.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">No amenities found. Add one!</td>
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
              <h2 className="text-xl font-serif text-gray-900">{editingAmenity ? 'Edit Amenity' : 'Add New Amenity'}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {!editingAmenity && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amenity ID (optional)</label>
                  <input type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" placeholder="e.g. michelin-dining" />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input type="number" onWheel={(e) => (e.target as HTMLInputElement).blur()} required value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" rows={4}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="text" required value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" />
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">Save Amenity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
