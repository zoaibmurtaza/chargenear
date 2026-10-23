import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Upload, AlertCircle, FileCheck } from 'lucide-react';
import PhotoUploader from './PhotoUploader';

export default function HostVerificationModal({ isOpen, onClose, onSubmit, currentStatus }) {
  if (!isOpen) return null;

  const [setupPhotos, setSetupPhotos] = useState([
    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80'
  ]);
  const [chargerTitle, setChargerTitle] = useState('My EV Charger Setup');
  const [checklist, setChecklist] = useState({
    hasEarthBreaker: true,
    hasFireExtinguisher: true,
    hasWeatherProtection: true,
    dedicatedWiring: true,
    clearEntrance: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleCheck = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checklist).every(Boolean);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!allChecked) {
      setError('Please certify all safety checklist criteria to submit for verification.');
      return;
    }
    if (setupPhotos.length === 0) {
      setError('Please upload at least one photo of your charger setup.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      onSubmit({
        chargerTitle,
        setupPhotoUrl: setupPhotos[0],
        checklist,
      });
      setSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[1070] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Host Safety Verification</h3>
              <p className="text-xs text-emerald-100">Get the trusted "Verified Host" badge on your listings</p>
            </div>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Current Status Banner */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Current Verification Status:</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              currentStatus === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
              currentStatus === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
              'bg-slate-200 text-slate-700'
            }`}>
              {currentStatus === 'approved' ? '✓ Verified Host' :
               currentStatus === 'pending' ? '⏳ Under Admin Review' : 'Not Verified'}
            </span>
          </div>

          {/* Checklist */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Safety Self-Declaration Checklist (Required)
            </label>
            <div className="space-y-2.5">
              {[
                { id: 'hasEarthBreaker', label: 'Dedicated Earth Leakage Breaker (ELCB / RCBO) installed' },
                { id: 'dedicatedWiring', label: 'Heavy gauge wiring (e.g. 6mm or 10mm copper) suitable for high current' },
                { id: 'hasWeatherProtection', label: 'IP54+ weatherproof enclosure or covered porch/garage installation' },
                { id: 'hasFireExtinguisher', label: 'Accessible dry chemical fire extinguisher nearby' },
                { id: 'clearEntrance', label: 'Clear, obstruction-free vehicular parking bay and driveway' },
              ].map((item) => (
                <label
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    checklist[item.id]
                      ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.id]}
                    onChange={() => toggleCheck(item.id)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-xs font-medium leading-relaxed">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Setup Photo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Photo of Charger Setup & Distribution Board
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Upload a clear photo displaying the installed socket/wallbox and the electrical breaker.
            </p>
            <PhotoUploader photos={setupPhotos} onChange={setSetupPhotos} />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-medium transition"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-500/20 transition flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit for Admin Approval'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
