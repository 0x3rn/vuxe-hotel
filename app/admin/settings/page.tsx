"use client";

import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import MediaInput from '@/components/admin/MediaInput';
import MediaDisplay from '@/components/MediaDisplay';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    heroMediaUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=80',
    heroHeadline: 'A Symphony of Luxury and Hospitality',
    heroSubheadline: 'Discover a world of elegance and unparalleled service in the heart of paradise.',
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'settings', 'global');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          heroMediaUrl: data.heroMediaUrl || settings.heroMediaUrl,
          heroHeadline: data.heroHeadline || settings.heroHeadline,
          heroSubheadline: data.heroSubheadline || settings.heroSubheadline,
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), settings, { merge: true });
      toast.success('Site settings updated successfully!');
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif text-primary">Site Settings</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-xl font-serif text-gray-900 border-b border-gray-100 pb-4">Homepage Hero Configuration</h2>
            
            <div className="space-y-4">
              <MediaInput
                label="Hero Background Media"
                value={settings.heroMediaUrl}
                onChange={(url) => setSettings({...settings, heroMediaUrl: url})}
                required
              />
              
              <div className="aspect-video w-full max-w-lg rounded-xl overflow-hidden border border-gray-200 relative mt-4 shadow-sm">
                <MediaDisplay src={settings.heroMediaUrl} alt="Hero Background Preview" fill />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-white font-serif text-xl md:text-2xl mb-2 drop-shadow-md">{settings.heroHeadline}</h3>
                  <p className="text-white/90 text-sm drop-shadow-md">{settings.heroSubheadline}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                <input 
                  type="text" 
                  value={settings.heroHeadline} 
                  onChange={e => setSettings({...settings, heroHeadline: e.target.value})} 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub-headline</label>
                <textarea 
                  value={settings.heroSubheadline} 
                  onChange={e => setSettings({...settings, heroSubheadline: e.target.value})} 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none transition-colors"
                  rows={2}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-all font-medium disabled:opacity-70 shadow-sm"
            >
              {saving ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
