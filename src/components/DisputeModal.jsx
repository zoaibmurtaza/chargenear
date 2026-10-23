import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, Send } from 'lucide-react';

const REASON_OPTIONS = [
  'Meter kWh Discrepancy',
  'Charger Blocked / Inaccessible',
  'Socket Malfunction / Charging Cut-off',
  'Billing / Overcharge Complaint',
  'Host / Driver Conduct Issue',
  'Other Safety Concern'
];

export default function DisputeModal({ booking, isOpen, onClose, onSubmit }) {
  if (!isOpen || !booking) return null;

  const [reason, setReason] = useState(REASON_OPTIONS[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      onSubmit({
        bookingId: booking.id,
        reason,
        description,
      });
      setSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[1070] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-red-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-base">Report an Issue / Dispute</h3>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">{booking.charger_title}</h4>
            <p className="text-xs text-slate-500">Booking Ref: #{booking.id}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Select Dispute Category
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm bg-white"
            >
              {REASON_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide specifics of what occurred. Our admin team will review and mediate."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm leading-relaxed"
            />
          </div>

          <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-xs text-rose-800 leading-relaxed">
            <ShieldAlert className="w-4 h-4 inline mr-1.5 text-rose-600" />
            This report will be forwarded directly to the ChargeNear Admin panel for investigation.
          </div>

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
              disabled={submitting || !description.trim()}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-bold shadow-md shadow-rose-500/20 transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'File Dispute'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
