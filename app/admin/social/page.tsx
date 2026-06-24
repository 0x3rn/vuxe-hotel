"use client";

import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import MediaDisplay from '@/components/MediaDisplay';
import MediaInput from '@/components/admin/MediaInput';
import toast from 'react-hot-toast';

type SocialImage = {
  id: string;
  imageUrl: string;
  order: number;
};

export default function AdminSocialPage() {
  const [images, setImages] = useState<SocialImage[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<SocialImage | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    imageUrl: '',
    order: 0,
  });

  const fetchImages = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "social"));
      const data: SocialImage[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as SocialImage);
      });
      data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setImages(data);
    } catch (error) {
      console.error("Error fetching social images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleOpenModal = (image?: SocialImage) => {
    if (image) {
      setEditingImage(image);
      setFormData({
        id: image.id,
        imageUrl: image.imageUrl,
        order: image.order || 0,
      });
    } else {
      setEditingImage(null);
      setFormData({
        id: '',
        imageUrl: '',
        order: images.length + 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingImage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const imageId = editingImage ? editingImage.id : (formData.id || `social-${Date.now()}`);
      
      const data = {
        imageUrl: formData.imageUrl,
        order: Number(formData.order),
      };

      await setDoc(doc(db, "social", imageId), data);
      
      handleCloseModal();
      fetchImages();
      toast.success("Social image saved successfully!");
    } catch (error) {
      console.error("Error saving social image:", error);
      toast.error("Failed to save social image.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this social post?")) return;
    try {
      await deleteDoc(doc(db, "social", id));
      fetchImages();
      toast.success("Social post deleted successfully!");
    } catch (error) {
      console.error("Error deleting social post:", error);
      toast.error("Failed to delete social post.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-primary">Manage Social Feed</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-primary-foreground px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} /> Add Media
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {images.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group relative flex flex-col">
              <div className="relative aspect-square w-full">
                <MediaDisplay src={image.imageUrl} alt="Social feed item" fill />
              </div>
              <div className="p-4 flex justify-between items-center bg-gray-50 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-500">Order: {image.order}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(image)} 
                    className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-full transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(image.id)} 
                    className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-lg border border-gray-100">
              No social media found. Add some!
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-serif text-gray-900">{editingImage ? 'Edit Media' : 'Add New Media'}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <MediaInput
                label="Media (Image or Video)"
                value={formData.imageUrl}
                onChange={(url) => setFormData({...formData, imageUrl: url})}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input type="number" onWheel={(e) => (e.target as HTMLInputElement).blur()} required value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:outline-none" />
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">Save Media</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
