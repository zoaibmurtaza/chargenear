import React, { useState } from 'react';
import { supabase, isConfigured } from '../supabaseClient';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export default function PhotoUploader({ photos = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    setErrorMsg('');

    try {
      const newUrls = [];

      for (const file of files) {
        if (isConfigured) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
          const filePath = `chargers/${fileName}`;

          const { data, error } = await supabase.storage
            .from('charger-photos')
            .upload(filePath, file);

          if (error) throw error;

          const { data: publicData } = supabase.storage
            .from('charger-photos')
            .getPublicUrl(filePath);

          newUrls.push(publicData.publicUrl);
        } else {
          // Local data URL fallback for development without remote Supabase storage
          const reader = new FileReader();
          const dataUrl = await new Promise((resolve) => {
            reader.onload = (event) => resolve(event.target.result);
            reader.readAsDataURL(file);
          });
          newUrls.push(dataUrl);
        }
      }

      onChange([...photos, ...newUrls]);
    } catch (err) {
      console.error('Photo upload error:', err);
      setErrorMsg(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {photos.map((url, idx) => (
          <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 group bg-slate-100 shadow-sm">
            <img src={url} alt={`Charger photo ${idx + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded-full opacity-90 hover:opacity-100 hover:bg-red-700 transition"
              title="Remove photo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        <label className="w-24 h-24 border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-lg flex flex-col items-center justify-center cursor-pointer transition bg-slate-50 hover:bg-brand-50/30 group">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          <Upload className="w-5 h-5 text-slate-400 group-hover:text-brand-600 mb-1" />
          <span className="text-[11px] font-medium text-slate-500 group-hover:text-brand-700">
            {uploading ? 'Uploading...' : 'Add Photo'}
          </span>
        </label>
      </div>

      {errorMsg && (
        <p className="text-xs text-red-600">{errorMsg}</p>
      )}

      <p className="text-[11px] text-slate-400">
        Upload clear photos showing the charger socket, parking bay, and house entrance.
      </p>
    </div>
  );
}
