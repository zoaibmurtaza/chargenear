import React from 'react';
import { SlidersHorizontal, X, Zap, Gauge, DollarSign, Clock } from 'lucide-react';

const CONNECTOR_OPTIONS = ['All', 'Type 2', 'CCS2', 'GB/T', 'CHAdeMO', 'Type 1'];

export default function FilterPanel({ filters, onChange, isOpen, onToggle, resultCount }) {
  const update = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={onToggle}
        className="absolute top-4 left-4 z-[1000] bg-white shadow-lg rounded-xl px-3 py-2.5 flex items-center gap-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition border border-slate-200"
      >
        <SlidersHorizontal className="w-4 h-4 text-brand-600" />
        <span className="hidden sm:inline">Filters</span>
        {(filters.connectorType !== 'All' || filters.minKw > 0 || filters.maxPrice < 500 || filters.availableNow) && (
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
        )}
      </button>

      {/* Filter Panel (slide-over on mobile, sidebar on desktop) */}
      {isOpen && (
        <div className="absolute top-0 left-0 z-[1001] h-full w-80 max-w-[85vw] bg-white shadow-2xl border-r border-slate-200 flex flex-col">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-slate-800">Search Filters</h3>
            </div>
            <button
              type="button"
              onClick={onToggle}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Controls */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">

            {/* Connector Type */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                <Zap className="w-3.5 h-3.5" />
                Connector Type
              </label>
              <div className="flex flex-wrap gap-2">
                {CONNECTOR_OPTIONS.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => update('connectorType', type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      filters.connectorType === type
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum Power (kW) */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                <Gauge className="w-3.5 h-3.5" />
                Minimum Power
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="150"
                  step="1"
                  value={filters.minKw}
                  onChange={(e) => update('minKw', Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Any</span>
                  <span className="font-bold text-brand-700">{filters.minKw > 0 ? `≥ ${filters.minKw} kW` : 'Any'}</span>
                  <span>150 kW</span>
                </div>
              </div>
            </div>

            {/* Max Price per kWh (PKR) */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                <DollarSign className="w-3.5 h-3.5" />
                Max Price per kWh
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  value={filters.maxPrice}
                  onChange={(e) => update('maxPrice', Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>PKR 10</span>
                  <span className="font-bold text-brand-700">
                    {filters.maxPrice < 500 ? `≤ PKR ${filters.maxPrice}` : 'Any'}
                  </span>
                  <span>PKR 500</span>
                </div>
              </div>
            </div>

            {/* Available Now */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                <Clock className="w-3.5 h-3.5" />
                Availability
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.availableNow}
                    onChange={(e) => update('availableNow', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-200 rounded-full peer-checked:bg-brand-600 transition" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition" />
                </div>
                <span className="text-sm font-medium text-slate-700">Available now only</span>
              </label>
            </div>
          </div>

          {/* Footer with result count & reset */}
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onChange({
                connectorType: 'All',
                minKw: 0,
                maxPrice: 500,
                availableNow: false,
              })}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 transition"
            >
              Reset All
            </button>
            <button
              type="button"
              onClick={onToggle}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition"
            >
              Show {resultCount} charger{resultCount !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="absolute inset-0 z-[1000] bg-black/30 backdrop-blur-[2px]"
        />
      )}
    </>
  );
}
