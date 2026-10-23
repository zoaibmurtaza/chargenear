import React, { useState } from 'react';
import {
  X, Zap, MapPin, Clock, Star, DollarSign, Gauge,
  ChevronLeft, ChevronRight, Bookmark, Navigation, ShieldCheck
} from 'lucide-react';
import { formatDistance } from '../utils/haversine';
import { useMarketplace } from '../MarketplaceContext';

export default function ChargerDetailCard({ charger, distanceKm, onClose, onRequestBooking }) {
  const { getHostVerificationStatus, reviews } = useMarketplace();
  const [photoIndex, setPhotoIndex] = useState(0);

  if (!charger) return null;

  const photos = charger.photos && charger.photos.length > 0 ? charger.photos : [];

  // Host verification check
  const isHostVerified = getHostVerificationStatus(charger.host_id) === 'approved' || charger.host_id === 'demo-host-id';

  // Filter charger reviews
  const chargerReviews = reviews.filter((r) => r.charger_id === charger.id);
  const avgRating = chargerReviews.length > 0
    ? (chargerReviews.reduce((acc, r) => acc + r.rating, 0) / chargerReviews.length).toFixed(1)
    : (charger._rating || 4.8);

  const nextPhoto = () => setPhotoIndex((i) => (i + 1) % photos.length);
  const prevPhoto = () => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1002] flex justify-center pointer-events-none px-3 pb-3 sm:pb-5">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-4 duration-300 max-h-[85vh] flex flex-col">

        {/* Photo Carousel */}
        <div className="relative h-44 sm:h-52 bg-slate-100 flex-shrink-0">
          {photos.length > 0 ? (
            <>
              <img
                src={photos[photoIndex]}
                alt={`${charger.title} - photo ${photoIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 text-white rounded-full hover:bg-black/60 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 text-white rounded-full hover:bg-black/60 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {photos.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition ${
                          i === photoIndex ? 'bg-white scale-110' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Zap className="w-12 h-12" />
            </div>
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badges row */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide shadow-sm backdrop-blur-md ${
              charger.status === 'active'
                ? 'bg-emerald-500/90 text-white'
                : 'bg-amber-500/90 text-white'
            }`}>
              {charger.status === 'active' ? 'Available' : 'Paused'}
            </span>

            {isHostVerified && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 text-emerald-800 backdrop-blur-md shadow-sm flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Host</span>
              </span>
            )}

            {distanceKm !== undefined && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 text-slate-700 backdrop-blur-md shadow-sm flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5" />
                {formatDistance(distanceKm)}
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">

          {/* Title Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-900 leading-tight line-clamp-1">
                {charger.title}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                <span className="line-clamp-1">{charger.address}</span>
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex-shrink-0">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span className="text-sm font-bold text-amber-800">{avgRating}</span>
              <span className="text-[10px] text-amber-600">({chargerReviews.length || 18})</span>
            </div>
          </div>

          {/* Specs row */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200">
              <Zap className="w-3.5 h-3.5 text-brand-600" />
              {charger.connector_type}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200">
              <Gauge className="w-3.5 h-3.5 text-blue-600" />
              {charger.power_kw} kW
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {charger.available_hours || '24/7'}
            </span>
          </div>

          {/* Pricing Card: SHOWS ONLY HOST RATE (NO COMMISSION RATE DISPLAYED) */}
          <div className="bg-brand-50/70 p-4 rounded-2xl border border-brand-200/60">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Charging Rate
                </span>
                <div className="text-3xl font-black text-brand-800 mt-0.5">
                  PKR {charger.price_per_kwh_pkr}
                  <span className="text-sm font-normal text-slate-500 ml-1">/ kWh</span>
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">
                <span className="inline-block px-2.5 py-1 rounded-full bg-white text-emerald-800 font-bold border border-emerald-200">
                  Fixed Host Rate
                </span>
              </div>
            </div>
          </div>

          {/* Access / Parking Notes */}
          {charger.notes && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-600 italic leading-relaxed">
                <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                "{charger.notes}"
              </p>
            </div>
          )}

          {/* Recent Reviews Preview */}
          {chargerReviews.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block">Driver Reviews</span>
              {chargerReviews.slice(0, 2).map((r) => (
                <div key={r.id} className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-center text-slate-500 text-[11px] mb-1">
                    <span className="font-bold text-slate-800">{r.reviewer_name}</span>
                    <span className="text-amber-500 font-bold">★ {r.rating}.0</span>
                  </div>
                  <p className="text-slate-600 italic">"{r.comment}"</p>
                </div>
              ))}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => onRequestBooking(charger)}
              disabled={charger.status !== 'active'}
              className={`flex-1 py-3 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 ${
                charger.status === 'active'
                  ? 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-brand-500/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              {charger.status === 'active' ? 'Request Booking' : 'Currently Unavailable'}
            </button>
            <button
              type="button"
              className="p-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-brand-600 transition"
              title="Save for later"
            >
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
