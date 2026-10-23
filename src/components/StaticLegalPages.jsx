import React from 'react';
import { ShieldCheck, FileText, ArrowLeft } from 'lucide-react';

export default function StaticLegalPages({ page = 'terms', onBack }) {
  const isTerms = page === 'terms';

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 animate-in fade-in">
      
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to App</span>
      </button>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              {isTerms ? <FileText className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                {isTerms ? 'Terms of Service' : 'Privacy Policy'}
              </h1>
              <span className="text-xs text-slate-400">
                ChargeNear Pakistan (P2P EV Marketplace) • Effective Date: October 2026
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        {isTerms ? (
          <div className="space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-800">1. Acceptance of Terms</h2>
              <p>
                By accessing or registering on ChargeNear ("the Platform"), whether as an EV Driver or a Charger Host, you agree to comply with and be bound by these Terms of Service. If you disagree with any part of these terms, you must discontinue use immediately.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-800">2. Platform Role & Peer-to-Peer Model</h2>
              <p>
                ChargeNear acts solely as a technology matchmaking marketplace connecting private charger owners with EV drivers in Pakistan. The platform does not own, inspect on-site, or operate private residential chargers. Hosts are independent contractors responsible for their electrical safety, wiring compliance, and property premises.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-800">3. Commission & PKR Financial Settlement</h2>
              <p>
                Host listings are priced in Pakistani Rupees (PKR) per kWh. For every completed charging slot, the Platform deducts a fifteen percent (15%) service fee, and eighty-five percent (85%) constitutes the host net earnings. All mock sandbox payment transactions simulate settlement without handling real fiat or credit instruments.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-800">4. Electrical Safety & Host Warranties</h2>
              <p>
                Hosts warrant that their EV wallbox, distribution board, Earth Leakage Circuit Breaker (ELCB/RCBO), and parking bay adhere to local electrical standards in Pakistan. The platform disclaims liability for vehicle electrical damage, thermal losses, or grid load fluctuations.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-800">5. Dispute Resolution</h2>
              <p>
                Disputes regarding meter readings, accessibility, or cancellations can be filed via the booking action menu and are mediated neutrally by the ChargeNear admin oversight team.
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-800">1. Strict Zero-Card & Zero-CNIC Policy</h2>
              <p>
                ChargeNear is architected with strict data minimization principles. <strong>We never request, process, or store credit card numbers, debit card details, bank CVVs, or Pakistani National Identity Card (CNIC) numbers.</strong> All payment workflows utilize dummy test sandboxes.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-800">2. Ephemeral Driver Live Location Sharing</h2>
              <p>
                During an active, accepted booking, drivers may opt-in to transmit their browser GPS coordinates at 10-second intervals to the designated host. This transmission is strictly used to display approaching distance and estimated driving ETA. Sharing is terminated immediately upon session commencement or cancellation.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-800">3. Open-Source Map Privacy</h2>
              <p>
                Our interactive map uses OpenStreetMap tiles without paid tracking APIs or third-party telemetry, ensuring your search queries and route views remain confidential.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-800">4. Row Level Security (RLS) Isolation</h2>
              <p>
                Under our PostgreSQL Row Level Security architecture, booking communications and personal earnings are accessible exclusively by the authenticated driver and host parties involved.
              </p>
            </section>
          </div>
        )}

      </div>
    </div>
  );
}
