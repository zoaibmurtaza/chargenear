import React from 'react';
import { useLiveLocation } from '../LiveLocationContext';
import { haversineDistanceKm, formatDistance } from '../utils/haversine';
import { estimateDrivingEta } from '../utils/eta';
import { Navigation, Radio, Clock, ShieldCheck, Car } from 'lucide-react';

export default function HostLiveDriverTrackingCard({ booking, chargerCoordinates }) {
  const { driverLocations } = useLiveLocation();

  if (!booking || booking.status !== 'accepted') return null;

  const loc = driverLocations[booking.id];

  // Calculate distance & ETA if location is available
  let distanceKm = null;
  let eta = null;

  if (loc && chargerCoordinates) {
    distanceKm = haversineDistanceKm(
      loc.lat,
      loc.lng,
      chargerCoordinates.lat,
      chargerCoordinates.lng
    );
    eta = estimateDrivingEta(distanceKm);
  }

  return (
    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-4 shadow-lg border border-blue-800 mb-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Driver identity & connection state */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">
                Approaching Driver: {booking.driver_name}
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Live GPS</span>
              </span>
            </div>
            <p className="text-xs text-blue-200/80 mt-0.5">
              Charger: {booking.charger_title}
            </p>
          </div>
        </div>

        {/* Live Distance & ETA Widget */}
        {loc && distanceKm != null ? (
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 self-start sm:self-auto">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-blue-200 block">Distance</span>
              <span className="text-base font-black text-white flex items-center gap-1 justify-end">
                <Navigation className="w-3.5 h-3.5 text-blue-300" />
                {formatDistance(distanceKm)}
              </span>
            </div>
            <div className="w-px h-8 bg-blue-400/30" />
            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-300 block">Estimated ETA</span>
              <span className="text-base font-black text-emerald-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {eta.text}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-blue-200/70 bg-white/5 px-3 py-2 rounded-xl flex items-center gap-2">
            <Clock className="w-4 h-4 animate-spin text-blue-300" />
            <span>Waiting for driver's 10s GPS ping (consent enabled)...</span>
          </div>
        )}

      </div>

      <div className="mt-3 pt-2.5 border-t border-blue-800/80 flex items-center justify-between text-[11px] text-blue-300/80">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Location sharing terminates automatically when you tap "Start Session".
        </span>
        {loc && (
          <span className="text-[10px] text-blue-300 font-mono">
            Last ping: {new Date(loc.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
