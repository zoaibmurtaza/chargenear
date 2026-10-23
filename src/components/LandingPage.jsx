import React from 'react';
import { 
  Zap, MapPin, ShieldCheck, DollarSign, Clock, Users, 
  ArrowRight, CheckCircle2, ChevronRight, Car, Sparkles, PhoneCall 
} from 'lucide-react';

export default function LandingPage({ onExploreMap, onBecomeHost, onOpenAuth }) {
  return (
    <div className="space-y-16 py-6 pb-20 animate-in fade-in">
      
      {/* ─── Hero Section ────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-white to-slate-50 pt-8 pb-16 px-4 sm:px-6 rounded-3xl border border-brand-100/80 max-w-6xl mx-auto shadow-sm">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold tracking-wide">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Pakistan's 1st P2P EV Charging Marketplace 🇵🇰</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Charge Your EV Near You. <br />
            <span className="text-brand-600">Earn from Your Home Charger.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Households across Karachi, Lahore, and Islamabad rent their EV wallboxes to nearby drivers. 
            Drivers pay per kWh in PKR, hosts pocket 85% net earnings, and zero real card data is ever stored.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onExploreMap}
              className="w-full sm:w-auto px-7 py-3.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white rounded-2xl font-bold text-sm shadow-lg shadow-brand-500/25 transition flex items-center justify-center gap-2.5 group"
            >
              <MapPin className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition" />
              <span>Explore Chargers on Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onBecomeHost}
              className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-2xl font-bold text-sm shadow-sm transition flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-brand-600 fill-current" />
              <span>Host & Earn PKR</span>
            </button>
          </div>

          {/* Value Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>15% Transparent Platform Fee</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Free OpenStreetMap (No API fees)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>JazzCash & Easypaisa Mock Checkout</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works (Drivers vs Hosts) ───────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How ChargeNear Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Simple 3-step experience designed for Pakistani EV owners & homeowners
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* For Drivers */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">For EV Drivers</h3>
                <span className="text-xs text-slate-500">Find reliable charging without range anxiety</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">Browse Nearby Sockets on Map</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Filter by connector (GB/T, Type 2, CCS2), kW power, and maximum price in PKR.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">Book Slot & Share 10s ETA</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Pick duration and units. When host accepts, share your live GPS ETA safely.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">Plug In & Mock Pay</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Host meters delivered units. Pay via JazzCash/Easypaisa sandbox with zero card risks.</p>
                </div>
              </div>
            </div>
          </div>

          {/* For Hosts */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">For Charger Hosts</h3>
                <span className="text-xs text-slate-500">Monetize idle porch electricity & solar power</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">List Your Charger Pin</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Set address, pin location on Leaflet map, choose connector type and PKR/kWh rate.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">Get Safety Verified</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Complete safety checklist (ELCB breaker, fire extinguisher) for a "Verified Host" badge.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">Keep 85% of Every Session</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Accept bookings in real time, start/stop charging power, and view revenue analytics.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── Supported Connectors in Pakistan ────────── */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 rounded-3xl max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Supporting All EVs in Pakistan
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compatible with Chinese imports, European luxury cars, and Japanese models
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-4xl mx-auto text-center">
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60">
            <span className="font-bold text-sm text-emerald-400 block">GB/T</span>
            <span className="text-[11px] text-slate-400 mt-1 block">BYD Atto 3, Seal, Changan Deepal</span>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60">
            <span className="font-bold text-sm text-emerald-400 block">Type 2 (Mennekes)</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Standard AC Wallboxes, MG 4, ZS EV</span>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60">
            <span className="font-bold text-sm text-emerald-400 block">CCS2 Combo</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Audi e-tron, BMW iX, Taycan, DC Fast</span>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60">
            <span className="font-bold text-sm text-emerald-400 block">CHAdeMO</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Nissan Leaf Japanese Imports</span>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60">
            <span className="font-bold text-sm text-emerald-400 block">Type 1 (J1772)</span>
            <span className="text-[11px] text-slate-400 mt-1 block">US & Japanese Domestic Models</span>
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA Banner ────────────────────────── */}
      <section className="text-center max-w-xl mx-auto space-y-4 px-4">
        <h3 className="text-2xl font-black text-slate-800">
          Ready to Electrify Your Journey?
        </h3>
        <p className="text-xs text-slate-500">
          Sign up with your email to discover chargers or start earning from your driveway today.
        </p>
        <button
          type="button"
          onClick={() => onOpenAuth('signup')}
          className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold text-sm shadow-md transition"
        >
          Create Free Account
        </button>
      </section>

    </div>
  );
}
