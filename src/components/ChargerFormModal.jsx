import React, { useState } from 'react';
import LocationPicker from './LocationPicker';
import PhotoUploader from './PhotoUploader';
import { X, Zap, DollarSign, Clock, MapPin, FileText, CheckCircle2 } from 'lucide-react';

const CONNECTOR_TYPES = ['Type 2', 'CCS2', 'GB/T', 'CHAdeMO', 'Type 1'];

export default function ChargerFormModal({ charger, isOpen, onClose, onSave }) {
  if (!isOpen) return null;

  const isEditing = Boolean(charger && charger.id);

  const [formData, setFormData] = useState({
    title: charger?.title || '',
    address: charger?.address || '',
    latitude: charger?.latitude || 31.4697,
    longitude: charger?.longitude || 74.3980,
    connector_type: charger?.connector_type || 'Type 2',
    power_kw: charger?.power_kw || 7.4,
    price_per_kwh_pkr: charger?.price_per_kwh_pkr || 75,
    photos: charger?.photos || [],
    available_hours: charger?.available_hours || '24/7',
    notes: charger?.notes || '',
    status: charger?.status || 'active',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Host earnings calculation (85% to host, 15% platform commission)
  const hostEarningPerKwh = (Number(formData.price_per_kwh_pkr || 0) * 0.85).toFixed(1);
  const platformFee = (Number(formData.price_per_kwh_pkr || 0) * 0.15).toFixed(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide a title for your charger.');
      return;
    }
    if (!formData.address.trim()) {
      setError('Please provide the physical address or location instructions.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onSave({
        ...formData,
        power_kw: parseFloat(formData.power_kw) || 7.4,
        price_per_kwh_pkr: parseFloat(formData.price_per_kwh_pkr) || 75,
        id: charger?.id,
      });
      onClose();
    } catch (err) {
      console.error('Error saving charger:', err);
      setError(err.message || 'Failed to save charger listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {isEditing ? 'Edit Charger Listing' : 'List a New EV Charger'}
              </h2>
              <p className="text-xs text-slate-500">
                Rent your home or commercial charger to EV drivers in Pakistan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Charger Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. DHA Phase 5 Fast 22kW Wallbox"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Street Address & Area <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. House 14, Street 7, Sector Y, DHA Phase 3, Lahore"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm"
            />
          </div>

          {/* Leaflet Map Location Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Exact Location Pin <span className="text-red-500">*</span>
            </label>
            <LocationPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
            />
          </div>

          {/* Connector Type & Power */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Connector Type
              </label>
              <select
                value={formData.connector_type}
                onChange={(e) => setFormData({ ...formData, connector_type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm bg-white"
              >
                {CONNECTOR_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type} {type === 'GB/T' ? '(Chinese EVs - BYD, Changan)' : type === 'Type 2' ? '(European / Standard)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Power Output (kW)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="3.0"
                  max="350.0"
                  value={formData.power_kw}
                  onChange={(e) => setFormData({ ...formData, power_kw: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm pr-12"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-medium text-slate-400">
                  kW
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & 15% Commission Breakdown */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Price per kWh (PKR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-500">
                    PKR
                  </span>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={formData.price_per_kwh_pkr}
                    onChange={(e) => setFormData({ ...formData, price_per_kwh_pkr: e.target.value })}
                    className="w-full pl-14 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Commission card */}
              <div className="bg-white p-3 rounded-lg border border-slate-200/80 text-xs space-y-1 sm:w-60 shadow-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Driver pays:</span>
                  <span className="font-semibold text-slate-800">PKR {formData.price_per_kwh_pkr}/kWh</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Host payout (85%):</span>
                  <span className="font-bold">PKR {hostEarningPerKwh}/kWh</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px] pt-0.5 border-t border-slate-100">
                  <span>Platform fee (15%):</span>
                  <span>PKR {platformFee}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Available Hours */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Available Hours
            </label>
            <input
              type="text"
              value={formData.available_hours}
              onChange={(e) => setFormData({ ...formData, available_hours: e.target.value })}
              placeholder="e.g. 24/7 or Mon-Sat: 08:00 AM - 10:00 PM"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm"
            />
          </div>

          {/* Photos (Supabase storage upload) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Charger Photos
            </label>
            <PhotoUploader
              photos={formData.photos}
              onChange={(urls) => setFormData({ ...formData, photos: urls })}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Access Notes / Parking Instructions
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Call guard on arrival. Parking on driveway under car porch. Wi-Fi available."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Listing Status
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={formData.status === 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="text-brand-600 focus:ring-brand-500"
                />
                <span className="font-medium text-slate-700">Active (Accepting drivers)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="status"
                  value="paused"
                  checked={formData.status === 'paused'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span className="font-medium text-slate-700">Paused (Temporarily off)</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold shadow-sm shadow-brand-500/20 transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Saving...' : isEditing ? 'Update Listing' : 'Publish Charger'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
