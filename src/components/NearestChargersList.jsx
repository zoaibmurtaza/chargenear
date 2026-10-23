import React from 'react';
import { MapPin, Zap, Star, Navigation, Gauge, ChevronRight } from 'lucide-react';
import { formatDistance } from '../utils/haversine';

export default function NearestChargersList({ chargers, isOpen, onToggle, onSelect }) {
  return (
    <>
      {/* Toggle tab */}
      <button
        type="button"
        onClick={onToggle}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white shadow-lg rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition border border-slate-200"
      >
        <MapPin className="w-4 h-4 text-brand-600" />
        <span>Nearest Chargers</span>
        <span className="ml-1 px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
          {chargers.length}
        </span>
      </button>

      {/* List Panel – bottom sheet style */}
      {isOpen && (
        <div className="absolute bottom-0 left-0 right-0 z-[1001] flex justify-center pointer-events-none px-2 pb-2">
          <div className="bg-white w-full max-w-xl rounded-t-2xl shadow-2xl border border-slate-200 pointer-events-auto max-h-[55vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

            {/* Handle & Header */}
            <div className="pt-3 pb-2 px-5 border-b border-slate-100 flex-shrink-0">
              <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-brand-600" />
                  Nearest Chargers
                </h3>
                <button
                  type="button"
                  onClick={onToggle}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {chargers.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  No chargers match your filters in this area.
                </div>
              ) : (
                chargers.map((item) => {
                  const rating = item._rating || (3.5 + Math.random() * 1.5);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelect(item)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition text-left group"
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                        {item.photos && item.photos.length > 0 ? (
                          <img src={item.photos[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Zap className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-800 truncate">{item.title}</h4>
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            item.status === 'active' ? 'bg-emerald-500' : 'bg-amber-400'
                          }`} />
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.address}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                            {item.connector_type}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-0.5">
                            <Gauge className="w-3 h-3" />
                            {item.power_kw} kW
                          </span>
                          <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-current text-amber-500" />
                            {rating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Distance & price */}
                      <div className="text-right flex-shrink-0 space-y-1">
                        {item._distanceKm !== undefined && (
                          <div className="text-xs font-bold text-slate-600 flex items-center justify-end gap-1">
                            <Navigation className="w-3 h-3 text-brand-500" />
                            {formatDistance(item._distanceKm)}
                          </div>
                        )}
                        <div className="text-xs font-black text-brand-700">
                          PKR {item.price_per_kwh_pkr}
                          <span className="font-normal text-slate-400">/kWh</span>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 flex-shrink-0 transition" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
