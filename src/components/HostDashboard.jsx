import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useChargers } from '../ChargersContext';
import { useMarketplace } from '../MarketplaceContext';
import ChargerFormModal from './ChargerFormModal';
import HostVerificationModal from './HostVerificationModal';
import { 
  Plus, Edit3, Pause, Play, Trash2, MapPin, Zap, Clock, 
  DollarSign, CheckCircle2, AlertCircle, ShieldAlert, Image as ImageIcon,
  ShieldCheck, BarChart3, Star, AlertTriangle
} from 'lucide-react';

export default function HostDashboard({ onNavigateToEarnings }) {
  const { user } = useAuth();
  const { getChargersByHost, addCharger, updateCharger, toggleChargerStatus, deleteCharger } = useChargers();
  const { getHostVerificationStatus, submitVerification } = useMarketplace();

  // STRICT FILTER: Host ONLY sees their own added chargers!
  const myChargers = getChargersByHost(user?.id);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifModalOpen, setIsVerifModalOpen] = useState(false);
  const [selectedCharger, setSelectedCharger] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const verificationStatus = getHostVerificationStatus(user?.id);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSaveCharger = async (chargerData) => {
    try {
      if (chargerData.id) {
        await updateCharger(chargerData.id, chargerData, user.id);
        showFeedback('success', 'Charger listing updated successfully!');
      } else {
        await addCharger(chargerData, user);
        showFeedback('success', 'Charger listing submitted! It will appear on the map once approved by Admin.');
      }
    } catch (err) {
      showFeedback('error', err.message || 'Failed to save charger.');
    }
  };

  const handleToggle = async (charger) => {
    await toggleChargerStatus(charger.id, user.id);
    showFeedback('success', `Listing status updated to ${charger.status === 'active' ? 'Paused' : 'Active'}`);
  };

  const handleDelete = async (chargerId) => {
    if (window.confirm('Are you sure you want to delete this charger listing?')) {
      await deleteCharger(chargerId, user.id);
      showFeedback('success', 'Charger listing removed.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Host Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Host Portal
            </span>

            {/* Verification Badge */}
            {verificationStatus === 'approved' ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Host</span>
              </span>
            ) : verificationStatus === 'pending' ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Verification Under Review</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsVerifModalOpen(true)}
                className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-300 transition flex items-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                <span>Get Verified Badge</span>
              </button>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Logged in as <strong>{user?.full_name}</strong> ({user?.email}). Manage your own EV sockets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onNavigateToEarnings && (
            <button
              type="button"
              onClick={onNavigateToEarnings}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm shadow-sm transition"
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Earnings Analytics</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setSelectedCharger(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Charger</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border shadow-sm transition animate-in fade-in ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Host Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">My Listed Chargers</span>
          <div className="text-2xl font-black text-slate-800 mt-1">{myChargers.length}</div>
          <span className="text-xs text-slate-500">Only your private sockets appear here</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Approved by Admin</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {myChargers.filter((c) => c.approval_status === 'approved').length}
          </div>
          <span className="text-xs text-emerald-600 font-medium">Visible to nearby drivers on map</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Review</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {myChargers.filter((c) => c.approval_status === 'pending_approval').length}
          </div>
          <span className="text-xs text-slate-500">Awaiting Admin inspection</span>
        </div>
      </div>

      {/* Charger Listings: EXCLUSIVELY THIS HOST'S CHARGERS */}
      {myChargers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <Zap className="w-8 h-8 fill-current" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">You haven't added any chargers yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add your EV wallbox, set your rate in PKR/kWh, specify availability timings, and submit for admin review.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedCharger(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Your Charger Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myChargers.map((charger) => {
            const isApproved = charger.approval_status === 'approved';
            return (
              <div
                key={charger.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                {/* Image & Status Badges */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  {charger.photos && charger.photos.length > 0 ? (
                    <img src={charger.photos[0]} alt={charger.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                      <ImageIcon className="w-8 h-8 mb-1 opacity-60" />
                      <span className="text-xs">No Photo</span>
                    </div>
                  )}

                  {/* Approval State Badge */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                      isApproved 
                        ? 'bg-emerald-600/90 text-white' 
                        : charger.approval_status === 'rejected'
                        ? 'bg-rose-600/90 text-white'
                        : 'bg-amber-500/90 text-white'
                    }`}>
                      {isApproved ? '✓ Approved' : charger.approval_status === 'rejected' ? '✕ Rejected' : '⏳ Pending Review'}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                      charger.status === 'active' ? 'bg-slate-900/80 text-white' : 'bg-gray-500/80 text-white'
                    }`}>
                      {charger.status === 'active' ? 'Active' : 'Paused'}
                    </span>
                  </div>

                  {/* Connector Badge */}
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900/80 text-white backdrop-blur-md">
                      {charger.connector_type} • {charger.power_kw} kW
                    </span>
                  </div>
                </div>

                {/* Info Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base line-clamp-1">{charger.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="line-clamp-1">{charger.address}</span>
                    </p>
                  </div>

                  {/* Pricing (Host Rate) */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Rate per kWh</span>
                      <span className="text-base font-black text-slate-900">PKR {charger.price_per_kwh_pkr}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block">Net Payout (85%)</span>
                      <span className="text-xs font-bold text-emerald-700">PKR {(charger.price_per_kwh_pkr * 0.85).toFixed(0)}</span>
                    </div>
                  </div>

                  {/* Timings */}
                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Availability: <strong className="text-slate-700">{charger.available_hours || '24/7'}</strong></span>
                    </div>
                    {charger.notes && (
                      <p className="text-xs text-slate-400 italic line-clamp-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                        "{charger.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCharger(charger);
                          setIsModalOpen(true);
                        }}
                        className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                        title="Edit Listing"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggle(charger)}
                        className={`p-2 rounded-xl border transition ${
                          charger.status === 'active'
                            ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }`}
                        title={charger.status === 'active' ? 'Pause Listing' : 'Activate Listing'}
                      >
                        {charger.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(charger.id)}
                      className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Charger Modal */}
      <ChargerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        charger={selectedCharger}
        onSave={handleSaveCharger}
      />

      {/* Host Verification Modal */}
      <HostVerificationModal
        isOpen={isVerifModalOpen}
        onClose={() => setIsVerifModalOpen(false)}
        currentStatus={verificationStatus}
        onSubmit={(data) => {
          submitVerification(data);
          showFeedback('success', 'Safety checklist submitted for Admin approval!');
        }}
      />

    </div>
  );
}
