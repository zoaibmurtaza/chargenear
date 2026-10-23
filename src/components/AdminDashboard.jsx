import React, { useState } from 'react';
import { useChargers } from '../ChargersContext';
import { useMarketplace } from '../MarketplaceContext';
import { useBookings } from '../BookingsContext';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, DollarSign, 
  Zap, Calendar, Clock, MapPin, Eye, Check, TrendingUp, Users, Wallet 
} from 'lucide-react';

export default function AdminDashboard() {
  const { chargers, reviewChargerListing } = useChargers();
  const { verifications, updateVerificationStatus, disputes, resolveDispute } = useMarketplace();
  const { bookings } = useBookings();

  const [activeTab, setActiveTab] = useState('listings'); // 'listings', 'finances', 'verifications', 'disputes'
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [activeReviewId, setActiveReviewId] = useState(null);

  // Financial Computations across all bookings
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const totalVolumePkr = completedBookings.reduce((sum, b) => sum + (b.total_amount_pkr || 0), 0);
  const totalPlatformFeesPkr = completedBookings.reduce((sum, b) => sum + (b.platform_fee_pkr || 0), 0); // 15%
  const totalHostPayoutsPkr = completedBookings.reduce((sum, b) => sum + (b.host_earnings_pkr || 0), 0);  // 85%
  const totalKwhDispensed = completedBookings.reduce((sum, b) => sum + (parseFloat(b.actual_kwh) || parseFloat(b.estimated_kwh) || 0), 0);

  const pendingChargers = chargers.filter((c) => c.approval_status === 'pending_approval');
  const activeChargers = chargers.filter((c) => c.approval_status === 'approved' && c.status === 'active');
  const openDisputes = disputes.filter((d) => d.status === 'open');

  const handleApprove = (chargerId) => {
    reviewChargerListing(chargerId, 'approved', reviewNotes || 'Approved by Admin');
    setActiveReviewId(null);
    setReviewNotes('');
  };

  const handleReject = (chargerId) => {
    reviewChargerListing(chargerId, 'rejected', reviewNotes || 'Rejected: Does not meet safety criteria');
    setActiveReviewId(null);
    setReviewNotes('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-in fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">ChargeNear Master Admin</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              Admin Console
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review & approve host charger listings, track all platform finances & commissions, and mediate disputes.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'listings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-brand-600 fill-current" />
            <span>Charger Approvals</span>
            {pendingChargers.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-black animate-pulse">
                {pendingChargers.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('finances')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'finances' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Finances & Commission</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('verifications')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'verifications' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Host Safety Badges</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('disputes')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'disputes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Disputes ({openDisputes.length})</span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: CHARGER LISTING APPROVALS & ACTIVE DIRECTORY ─── */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Host Submissions</span>
              <div className="text-2xl font-black text-amber-600 mt-1">{pendingChargers.length}</div>
              <span className="text-xs text-slate-500">Require review before appearing on driver map</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Live Chargers</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{activeChargers.length}</div>
              <span className="text-xs text-slate-500">Discoverable by drivers nationwide</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Database Listings</span>
              <div className="text-2xl font-black text-slate-800 mt-1">{chargers.length}</div>
              <span className="text-xs text-slate-500">Includes approved, pending & paused</span>
            </div>
          </div>

          {/* Pending Submissions Queue */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Host Listing Approval Queue</h3>
                <p className="text-xs text-slate-500">Accept host listings to make them live on the Leaflet driver map.</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                {pendingChargers.length} Pending
              </span>
            </div>

            {pendingChargers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                ✓ No pending charger listings awaiting review. All current submissions are processed!
              </div>
            ) : (
              <div className="space-y-4">
                {pendingChargers.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl border border-amber-200 bg-amber-50/20 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Pending Review
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{c.address}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900 block">PKR {c.price_per_kwh_pkr} / kWh</span>
                        <span className="text-[11px] text-slate-500">{c.connector_type} • {c.power_kw} kW</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                      <div>Host: <strong className="text-slate-800">{c.host_name}</strong></div>
                      <div>Timings: <strong className="text-slate-800">{c.available_hours || '24/7'}</strong></div>
                      <div>City: <strong className="text-slate-800">{c.city || 'Karachi'}</strong></div>
                      {c.notes && <div>Notes: <em>"{c.notes}"</em></div>}
                    </div>

                    {/* Review actions */}
                    {activeReviewId === c.id ? (
                      <div className="pt-2 space-y-2">
                        <input
                          type="text"
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="Admin review notes (optional)..."
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveReviewId(null)}
                            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(c.id)}
                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApprove(c.id)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                          >
                            Confirm Approval
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setActiveReviewId(c.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Review & Accept Listing</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Master Directory of All Listings */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Active Charger Directory</h3>
              <p className="text-xs text-slate-500">List of all currently registered and approved EV sockets in Pakistan.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-5">Charger Title</th>
                    <th className="py-3 px-5">Host</th>
                    <th className="py-3 px-5">Location</th>
                    <th className="py-3 px-5">Connector</th>
                    <th className="py-3 px-5">Rate</th>
                    <th className="py-3 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {chargers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-5 font-bold text-slate-800">{c.title}</td>
                      <td className="py-3 px-5">{c.host_name || 'Host User'}</td>
                      <td className="py-3 px-5 truncate max-w-[180px]">{c.address}</td>
                      <td className="py-3 px-5">{c.connector_type} • {c.power_kw}kW</td>
                      <td className="py-3 px-5 font-bold text-brand-700">PKR {c.price_per_kwh_pkr}</td>
                      <td className="py-3 px-5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.approval_status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.approval_status === 'approved' ? 'Active' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ─── TAB 2: FINANCES & 15% PLATFORM COMMISSIONS ───────────── */}
      {activeTab === 'finances' && (
        <div className="space-y-6">
          
          {/* Financial KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total GMV Settled</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                PKR {totalVolumePkr.toLocaleString()}
              </div>
              <span className="text-xs text-slate-500">Gross transaction volume in PKR</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-brand-600">
              <span className="text-[10px] uppercase font-bold text-brand-600 block">Platform Commission (15%)</span>
              <div className="text-2xl font-black text-brand-700 mt-1">
                PKR {totalPlatformFeesPkr.toLocaleString()}
              </div>
              <span className="text-xs text-slate-500">ChargeNear net earned revenue</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-emerald-600">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Host Payouts (85%)</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                PKR {totalHostPayoutsPkr.toLocaleString()}
              </div>
              <span className="text-xs text-slate-500">Disbursed to charger hosts</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Power Delivered</span>
              <div className="text-2xl font-black text-blue-600 mt-1">
                {totalKwhDispensed.toFixed(1)} <span className="text-sm font-normal text-slate-500">kWh</span>
              </div>
              <span className="text-xs text-slate-500">Clean units metered</span>
            </div>

          </div>

          {/* Detailed Transaction Ledger */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Platform Revenue & Payout Ledger</h3>
                <p className="text-xs text-slate-500">All completed charging sessions and 15% platform commission breakdown.</p>
              </div>
              <span className="text-xs font-bold text-slate-600">
                {completedBookings.length} Completed Bookings
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-5">Booking Ref</th>
                    <th className="py-3 px-5">Driver</th>
                    <th className="py-3 px-5">Host</th>
                    <th className="py-3 px-5">Delivered</th>
                    <th className="py-3 px-5">Gross Billed</th>
                    <th className="py-3 px-5 font-bold text-brand-700">Platform 15%</th>
                    <th className="py-3 px-5 font-bold text-emerald-700">Host 85%</th>
                    <th className="py-3 px-5">Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {completedBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-5 font-mono text-slate-800">#{b.id}</td>
                      <td className="py-3 px-5 font-semibold text-slate-800">{b.driver_name}</td>
                      <td className="py-3 px-5">{b.host_name}</td>
                      <td className="py-3 px-5">{b.actual_kwh || b.estimated_kwh} kWh</td>
                      <td className="py-3 px-5 font-bold text-slate-900">PKR {b.total_amount_pkr}</td>
                      <td className="py-3 px-5 font-black text-brand-700">PKR {b.platform_fee_pkr}</td>
                      <td className="py-3 px-5 font-black text-emerald-700">PKR {b.host_earnings_pkr}</td>
                      <td className="py-3 px-5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          ✓ Settled (Mock)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ─── TAB 3: HOST SAFETY VERIFICATIONS ────────────────────── */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          {verifications.map((v) => (
            <div key={v.id} className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{v.host_name} ({v.host_email})</h4>
                  <span className="text-xs text-slate-500">{v.charger_title}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  v.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {v.status}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <img src={v.setup_photo_url} alt="" className="w-20 h-20 rounded-xl object-cover border border-slate-200" />
                <div className="text-xs text-slate-600 space-y-1">
                  <div>Earth Breaker (ELCB): <strong>{v.checklist?.hasEarthBreaker ? 'Yes' : 'No'}</strong></div>
                  <div>Fire Extinguisher: <strong>{v.checklist?.hasFireExtinguisher ? 'Yes' : 'No'}</strong></div>
                  <div>Weatherproof Cover: <strong>{v.checklist?.hasWeatherProtection ? 'Yes' : 'No'}</strong></div>
                </div>
              </div>

              {v.status !== 'approved' && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => updateVerificationStatus(v.id, 'approved', 'Approved by Admin')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                  >
                    Approve Safety Badge
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── TAB 4: DISPUTES & REPORTS ───────────────────────────── */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d.id} className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-800 text-xs">Dispute #{d.id} • {d.reason}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 uppercase">{d.status}</span>
              </div>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">"{d.description}"</p>
              {d.status !== 'resolved' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => resolveDispute(d.id, 'Mediation resolved by admin team.')}
                    className="px-4 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold"
                  >
                    Mark Resolved
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
