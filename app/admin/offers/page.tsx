"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import MediaInput from '@/components/admin/MediaInput';
import MediaDisplay from '@/components/MediaDisplay';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Offer = {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  discountCode?: string;
  order: number;
  isActive: boolean;
  discountPercentage: number;
  minNights: number;
  applicableRoomIds: string[];
  endDate: string;
  showInTopBar: boolean;
};

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [rooms, setRooms] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // Form state
  const [formData, setFormData] = useState<Offer>({
    id: '',
    title: '',
    description: '',
    mediaUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    discountCode: '',
    order: 0,
    isActive: true,
    discountPercentage: 0,
    minNights: 1,
    applicableRoomIds: ['all'],
    endDate: '',
    showInTopBar: false
  });

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/offers');
      if (!res.ok) throw new Error("Failed to fetch offers");
      const data = await res.json();
      
      // Map legacy imageUrl to mediaUrl
      const mappedData = data.map((o: any) => ({
        ...o,
        mediaUrl: o.mediaUrl || o.imageUrl || '',
        discountPercentage: o.discountPercentage || 0,
        minNights: o.minNights || 1,
        applicableRoomIds: o.applicableRoomIds || ['all'],
        endDate: o.endDate || '',
        showInTopBar: o.showInTopBar || false
      }));
      setOffers(mappedData);
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const snap = await getDocs(collection(db, "rooms"));
      const r: {id: string, name: string}[] = [];
      snap.forEach(doc => r.push({ id: doc.id, name: doc.data().name }));
      setRooms(r);
    } catch (e) {
      console.error("Failed to fetch rooms for dropdown", e);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchRooms();
  }, []);

  const handleOpenModal = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({ ...offer });
    } else {
      setEditingOffer(null);
      setFormData({
        id: '',
        title: '',
        description: '',
        mediaUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        discountCode: '',
        order: offers.length + 1,
        isActive: true,
        discountPercentage: 0,
        minNights: 1,
        applicableRoomIds: ['all'],
        endDate: '',
        showInTopBar: false
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOffer(null);
  };

  const handleRoomSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    // If 'all' is selected among others, just set it to 'all'
    if (selectedOptions.includes('all')) {
      setFormData({ ...formData, applicableRoomIds: ['all'] });
    } else {
      setFormData({ ...formData, applicableRoomIds: selectedOptions });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const offerId = editingOffer ? editingOffer.id : (formData.id || formData.title.toLowerCase().replace(/\s+/g, '-'));
      
      const data = {
        ...formData,
        id: offerId,
        order: Number(formData.order),
        discountPercentage: Number(formData.discountPercentage),
        minNights: Number(formData.minNights)
      };

      const res = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error("Failed to save offer");
      
      handleCloseModal();
      fetchOffers();
      toast.success(editingOffer ? "Offer updated successfully!" : "Offer created successfully!");
    } catch (error) {
      console.error("Error saving offer:", error);
      toast.error("Failed to save offer.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    try {
      const res = await fetch(`/api/admin/offers?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete offer");
      fetchOffers();
      toast.success("Offer deleted successfully!");
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error("Failed to delete offer.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-primary">Manage Special Offers</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-primary-foreground px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} /> Add Offer
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
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Media</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Offer Title</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Rules</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50/50">
                  <td className="py-4 px-6 text-gray-600 font-medium">{offer.order}</td>
                  <td className="py-4 px-6">
                    <div className="w-16 h-12 relative rounded overflow-hidden shadow-sm border border-gray-200">
                      <MediaDisplay src={offer.mediaUrl} alt={offer.title} fill />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{offer.title}</div>
                    <div className="text-xs text-gray-500">{offer.id}</div>
                    {offer.showInTopBar && <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full mt-1 inline-block">Top Bar Active</span>}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-emerald-600">{offer.discountPercentage}% OFF</span> (Min {offer.minNights} nights)
                    </div>
                    {offer.endDate && <div className="text-xs text-red-500 mt-1">Ends: {offer.endDate}</div>}
                    <div className="text-xs text-gray-400 mt-1 line-clamp-1 truncate max-w-[150px]">Rooms: {offer.applicableRoomIds.includes('all') ? 'All Rooms' : offer.applicableRoomIds.length + ' selected'}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${offer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {offer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-3">
                    <button onClick={() => handleOpenModal(offer)} className="text-blue-600 hover:text-blue-800 transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(offer.id)} className="text-red-600 hover:text-red-800 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {offers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No offers found. Add one!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-serif text-gray-900">{editingOffer ? 'Edit Offer' : 'Add New Offer'}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" />
                </div>
                {!editingOffer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Offer ID (URL Friendly)</label>
                    <input type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" placeholder="e.g. summer-sale" />
                  </div>
                )}
                {editingOffer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Code</label>
                    <input type="text" value={formData.discountCode} onChange={e => setFormData({...formData, discountCode: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none resize-none" rows={2}></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage (%)</label>
                  <input type="number" min="0" max="100" required value={formData.discountPercentage} onChange={e => setFormData({...formData, discountPercentage: Number(e.target.value)})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Nights</label>
                  <input type="number" min="1" required value={formData.minNights} onChange={e => setFormData({...formData, minNights: Number(e.target.value)})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Applicable Rooms</label>
                  <select 
                    multiple 
                    size={4}
                    value={formData.applicableRoomIds} 
                    onChange={handleRoomSelection} 
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none"
                  >
                    <option value="all" className="font-bold text-primary">All Rooms</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple. Select "All Rooms" to apply globally.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input type="number" onWheel={(e) => (e.target as HTMLInputElement).blur()} required value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" />
                  
                  {!editingOffer && (
                     <div className="mt-4">
                       <label className="block text-sm font-medium text-gray-700 mb-1">Discount Code</label>
                       <input type="text" value={formData.discountCode} onChange={e => setFormData({...formData, discountCode: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" />
                     </div>
                  )}
                </div>
              </div>
              
              <MediaInput
                label="Offer Media (Image or Video URL)"
                value={formData.mediaUrl}
                onChange={(url) => setFormData({...formData, mediaUrl: url})}
                required
              />

              <div className="flex flex-col gap-3 pt-2 bg-gray-50 p-4 rounded border border-gray-100">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="rounded text-primary focus:ring-primary w-4 h-4" />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-900 cursor-pointer">Offer is Active</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="showInTopBar" checked={formData.showInTopBar} onChange={e => setFormData({...formData, showInTopBar: e.target.checked})} className="rounded text-primary focus:ring-primary w-4 h-4" />
                  <label htmlFor="showInTopBar" className="text-sm font-medium text-gray-900 cursor-pointer">Show in Global Top Announcement Bar</label>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6 sticky bottom-0 bg-white py-4">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">Save Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
