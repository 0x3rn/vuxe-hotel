"use client";

import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import MediaInput from '@/components/admin/MediaInput';
import MediaDisplay from '@/components/MediaDisplay';

type Experience = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
};

export default function AdminExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    order: 0,
  });

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "experiences"));
      const data: Experience[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Experience);
      });
      data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setExperiences(data);
    } catch (error) {
      console.error("Error fetching experiences:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleOpenModal = (experience?: Experience) => {
    if (experience) {
      setEditingExperience(experience);
      setFormData({
        id: experience.id,
        title: experience.title,
        description: experience.description,
        imageUrl: experience.imageUrl,
        order: experience.order || 0,
      });
    } else {
      setEditingExperience(null);
      setFormData({
        id: '',
        title: '',
        description: '',
        imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
        order: experiences.length + 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExperience(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const experienceId = editingExperience ? editingExperience.id : (formData.id || formData.title.toLowerCase().replace(/\s+/g, '-'));
      
      const data = {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        order: Number(formData.order),
      };

      await setDoc(doc(db, "experiences", experienceId), data);
      
      handleCloseModal();
      fetchExperiences();
      toast.success(editingExperience ? "Experience updated successfully!" : "Experience created successfully!");
    } catch (error) {
      console.error("Error saving experience:", error);
      toast.error("Failed to save experience.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;
    try {
      await deleteDoc(doc(db, "experiences", id));
      fetchExperiences();
      toast.success("Experience deleted successfully!");
    } catch (error) {
      console.error("Error deleting experience:", error);
      toast.error("Failed to delete experience.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-primary">Manage Experiences</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-primary-foreground px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} /> Add Experience
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
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Experience Title</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {experiences.map((experience) => (
                <tr key={experience.id} className="hover:bg-gray-50/50">
                  <td className="py-4 px-6 text-gray-600 font-medium">{experience.order}</td>
                  <td className="py-4 px-6">
                    <div className="w-16 h-12 relative rounded overflow-hidden shadow-sm border border-gray-200">
                      <MediaDisplay src={experience.imageUrl} alt={experience.title} fill />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{experience.title}</div>
                    <div className="text-xs text-gray-500">{experience.id}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600 line-clamp-2 max-w-md">{experience.description}</div>
                  </td>
                  <td className="py-4 px-6 text-right space-x-3">
                    <button onClick={() => handleOpenModal(experience)} className="text-blue-600 hover:text-blue-800 transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(experience.id)} className="text-red-600 hover:text-red-800 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {experiences.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">No experiences found. Add one!</td>
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
              <h2 className="text-xl font-serif text-gray-900">{editingExperience ? 'Edit Experience' : 'Add New Experience'}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {!editingExperience && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience ID (optional)</label>
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
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none resize-none" rows={3}></textarea>
              </div>
              <MediaInput
                label="Experience Media"
                value={formData.imageUrl}
                onChange={(url) => setFormData({...formData, imageUrl: url})}
                required
              />
              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">Save Experience</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
