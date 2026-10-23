import React from 'react';
import { useLiveLocation } from '../LiveLocationContext';
import { ShieldCheck, MapPin, Radio, Check, X, AlertTriangle } from 'lucide-react';

export default function LocationConsentBanner({ booking }) {
  const { hasConsented, grantConsent, revokeConsent } = useLiveLocation();

  if (!booking || booking.status !== 'accepted') return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 shadow-sm mb-4 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-800 text-sm">
                Driver Live Location Sharing
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                hasConsented ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {hasConsented ? 'Active (10s intervals)' : 'Consent Required'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-xl">
              <strong>Transparent Privacy Policy:</strong> Your browser GPS coordinates will be transmitted to host{' '}
              <strong className="text-blue-900">{booking.host_name}</strong> every 10 seconds solely to display your approaching distance and estimated arrival time (ETA). 
              Sharing will automatically terminate the moment the charging session begins or if the booking is cancelled.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
          {!hasConsented ? (
            <button
              type="button"
              onClick={grantConsent}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Allow Location Sharing</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={revokeConsent}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Stop Sharing</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
