"use client";

import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, Film } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import toast from 'react-hot-toast';

type MediaInputProps = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
};

export default function MediaInput({ value, onChange, label = "Media URL or Upload", required }: MediaInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (e.g. 50MB limit for videos)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be under 50MB");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading media...");

    try {
      const extension = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
      const storageRef = ref(storage, `media/${fileName}`);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      onChange(url);
      toast.success("Upload complete!", { id: toastId });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file. Check Firebase Storage rules.", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            <LinkIcon size={16} />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required && !value}
            placeholder="https://..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            disabled={isUploading}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400 px-2 font-medium">OR</span>
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={isUploading}
            className="flex-shrink-0 flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-4 py-2 rounded border border-zinc-300 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-zinc-500 border-t-zinc-800"></div>
            ) : (
              <Upload size={16} />
            )}
            <span className="text-sm font-medium">{isUploading ? 'Uploading...' : 'Upload File'}</span>
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/mp4,video/webm"
        />
      </div>
      <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
        <ImageIcon size={12} /> <Film size={12} /> Supports Images & Video (mp4, webm) up to 50MB
      </p>
    </div>
  );
}
