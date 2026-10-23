import React, { useState } from 'react';
import { X, Play, Square, Zap, DollarSign, Calculator, CheckCircle2 } from 'lucide-react';
import { calculateBilling } from '../utils/billing';

export default function SessionControlModal({ booking, isOpen, onClose, onStopSession }) {
  if (!isOpen || !booking) return null;

  const [kwhDelivered, setKwhDelivered] = useState(booking.estimated_kwh || 20);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const billing = calculateBilling(kwhDelivered, booking.price_per_kwh_pkr);

  const handleStop = async (e) => {
    e.preventDefault();
    if (kwhDelivered <= 0) {
      setError('Please enter valid energy delivered in kWh.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onStopSession(booking.id, Number(kwhDelivered));
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to stop session.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1060] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 fill-current" />
            <h3 className="font-bold text-base">Active Charging Session</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleStop} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <div>
            <h4 className="font-bold text-slate-800 text-sm">{booking.charger_title}</h4>
            <p className="text-xs text-slate-500">Driver: {booking.driver_name}</p>
          </div>

          {/* Meter kWh Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Enter Delivered Units (kWh) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="300"
                required
                value={kwhDelivered}
                onChange={(e) => setKwhDelivered(e.target.value)}
                placeholder="25.4"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-base font-bold pr-14"
              />
              <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">
                kWh
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Read exact units from your charger meter or car dashboard display.
            </p>
          </div>

          {/* Billing Calculation Breakdown */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Session Billing Breakdown
            </span>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Rate per kWh:</span>
              <span className="font-semibold text-slate-800">PKR {booking.price_per_kwh_pkr}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Energy Delivered:</span>
              <span className="font-semibold text-slate-800">{kwhDelivered || 0} kWh</span>
            </div>
            <div className="flex justify-between text-xs text-emerald-700 font-bold pt-1 border-t border-slate-200">
              <span>Host Net Earnings (85%):</span>
              <span>PKR {billing.hostEarningsPkr}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Platform Commission (15%):</span>
              <span>PKR {billing.platformFeePkr}</span>
            </div>
            <div className="flex justify-between items-baseline pt-1 border-t border-slate-200">
              <span className="text-sm font-bold text-slate-800">Total Billed to Driver:</span>
              <span className="text-base font-black text-brand-700">PKR {billing.totalAmountPkr}</span>
            </div>
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
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-500/20 transition flex items-center gap-2"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>{submitting ? 'Finalizing...' : 'Stop Session & Bill'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
