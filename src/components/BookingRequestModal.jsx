import React, { useState } from 'react';
import { X, Calendar, Clock, Zap, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function BookingRequestModal({ charger, isOpen, onClose, onSubmit }) {
  if (!isOpen || !charger) return null;

  const { user } = useAuth();
  const defaultDate = new Date(Date.now() + 3600000).toISOString().slice(0, 16);
  const [startTime, setStartTime] = useState(defaultDate);
  const [durationHours, setDurationHours] = useState(2);
  const [estimatedKwh, setEstimatedKwh] = useState(25);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Total calculated based strictly on Host rate (no commission fee displayed to driver)
  const totalAmountPkr = Math.round(Number(estimatedKwh || 0) * Number(charger.price_per_kwh_pkr || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startTime) {
      setError('Please select a start time.');
      return;
    }
    if (estimatedKwh <= 0) {
      setError('Please enter estimated energy requirement in kWh.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onSubmit({
        charger,
        startTime,
        durationHours: Number(durationHours),
        estimatedKwh: Number(estimatedKwh),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit booking request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1050] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Book EV Charging Slot
              </h2>
              <p className="text-xs text-slate-500">
                {charger.title} • {charger.connector_type}
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

        {/* Driver Details Summary */}
        {user && (
          <div className="bg-blue-50/60 px-6 py-3 border-b border-blue-100/60 flex items-center justify-between text-xs text-blue-900">
            <div>
              <span className="font-bold block">{user.full_name} ({user.vehicle_name || 'EV'})</span>
              <span className="text-[11px] text-blue-700 font-mono">Plate: {user.vehicle_number || 'N/A'} • NIC: {user.nic || 'Verified'}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-blue-800 border border-blue-200">
              Driver Verified
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Start Time */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm font-medium"
            />
          </div>

          {/* Duration & Units */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Duration
              </label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm bg-white"
              >
                <option value={1}>1 hour</option>
                <option value={1.5}>1.5 hours</option>
                <option value={2}>2 hours</option>
                <option value={3}>3 hours</option>
                <option value={4}>4 hours</option>
                <option value={6}>6 hours (Full Charge)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Estimated Energy
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="120"
                  step="1"
                  value={estimatedKwh}
                  onChange={(e) => setEstimatedKwh(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm pr-12 font-bold"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">
                  kWh
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Summary: ONLY HOST RATE & ESTIMATED TOTAL (NO COMMISSION) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Estimated Total (PKR)
            </span>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Rate per kWh:</span>
              <span className="font-bold text-slate-800">PKR {charger.price_per_kwh_pkr} / kWh</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Estimated Energy:</span>
              <span className="font-semibold text-slate-800">{estimatedKwh} kWh</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-800">Estimated Total:</span>
              <span className="text-xl font-black text-brand-700">PKR {totalAmountPkr}</span>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              * Final charge is based on actual kWh delivered at session completion.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
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
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-md shadow-brand-500/20 transition flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{submitting ? 'Sending Request...' : 'Send Request'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
