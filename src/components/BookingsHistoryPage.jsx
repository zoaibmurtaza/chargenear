import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useBookings } from '../BookingsContext';
import { useLiveLocation } from '../LiveLocationContext';
import { useMarketplace } from '../MarketplaceContext';
import MockPaymentModal from './MockPaymentModal';
import SessionControlModal from './SessionControlModal';
import LocationConsentBanner from './LocationConsentBanner';
import HostLiveDriverTrackingCard from './HostLiveDriverTrackingCard';
import ReviewModal from './ReviewModal';
import DisputeModal from './DisputeModal';
import { 
  Calendar, Clock, Zap, MapPin, CheckCircle2, XCircle, Play, 
  Square, CreditCard, Radio, ShieldCheck, Star, AlertTriangle, MessageSquare
} from 'lucide-react';

const STATUS_BADGES = {
  pending: { bg: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Pending Acceptance' },
  accepted: { bg: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Accepted (Ready)' },
  active: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Active Charging' },
  completed: { bg: 'bg-slate-100 text-slate-800 border-slate-200', label: 'Completed' },
  declined: { bg: 'bg-rose-100 text-rose-800 border-rose-200', label: 'Declined' },
  cancelled: { bg: 'bg-gray-100 text-gray-600 border-gray-200', label: 'Cancelled' },
};

export default function BookingsHistoryPage() {
  const { user } = useAuth();
  const {
    bookings,
    updateBookingStatus,
    startSession,
    stopSessionAndDeliver,
    processMockPayment,
    cancelBooking,
  } = useBookings();

  const { startSharingForBooking, stopSharing, hasConsented } = useLiveLocation();
  const { submitReview, hasReviewedBooking, submitDispute } = useMarketplace();

  const [activeTab, setActiveTab] = useState('all');
  const [selectedBookingForPay, setSelectedBookingForPay] = useState(null);
  const [selectedBookingForStop, setSelectedBookingForStop] = useState(null);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [selectedBookingForDispute, setSelectedBookingForDispute] = useState(null);

  const isHost = user?.role === 'host';

  const driverAcceptedBooking = !isHost ? bookings.find((b) => b.status === 'accepted') : null;
  const hostAcceptedBooking = isHost ? bookings.find((b) => b.status === 'accepted') : null;

  useEffect(() => {
    if (!isHost && driverAcceptedBooking && hasConsented) {
      startSharingForBooking(driverAcceptedBooking);
    } else {
      stopSharing();
    }
  }, [isHost, driverAcceptedBooking, hasConsented]);

  const relevantBookings = bookings.filter((b) => {
    if (isHost) {
      if (b.host_id !== user?.id && b.host_id !== 'demo-host-id') return false;
    } else {
      if (b.driver_id !== user?.id && b.driver_id !== 'demo-driver-id') return false;
    }

    if (activeTab === 'pending') return b.status === 'pending';
    if (activeTab === 'active') return b.status === 'active' || b.status === 'accepted';
    if (activeTab === 'completed') return b.status === 'completed';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Driver Location Sharing Consent & Status Banner */}
      {!isHost && driverAcceptedBooking && (
        <LocationConsentBanner booking={driverAcceptedBooking} />
      )}

      {/* Host Live Driver Approaching & ETA Card */}
      {isHost && hostAcceptedBooking && (
        <HostLiveDriverTrackingCard
          booking={hostAcceptedBooking}
          chargerCoordinates={{ lat: 31.4697, lng: 74.3980 }}
        />
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              {isHost ? 'Host Bookings & Sessions' : 'My Charging History'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200/80 text-slate-700">
              {isHost ? 'Host View' : 'Driver View'}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Radio className="w-3 h-3 animate-pulse text-emerald-600" />
              <span>Realtime Synced</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isHost
              ? 'Accept or decline driver slots, control power delivery, review drivers, and manage booking disputes.'
              : 'Live status changes, 10s geolocation sharing, reviews & ratings, and dispute filing.'}
          </p>
        </div>

        {/* Tab filters */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'active', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === tab.id
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {relevantBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Bookings Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {isHost
              ? 'When drivers book your charger, pending requests will appear here in real-time.'
              : 'Browse nearby chargers on the map and send a booking request!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {relevantBookings.map((booking) => {
            const badge = STATUS_BADGES[booking.status] || STATUS_BADGES.pending;
            const startTimeFormatted = new Date(booking.start_time).toLocaleString('en-PK', {
              dateStyle: 'medium',
              timeStyle: 'short',
            });

            const alreadyReviewed = hasReviewedBooking(booking.id);

            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow transition"
              >
                {/* Header row */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/40">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-brand-100">
                      <Zap className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-base">{booking.charger_title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        {booking.payment_status === 'paid_mock' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Paid ({booking.payment_method || 'Mock'})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{booking.charger_address}</span>
                      </p>
                    </div>
                  </div>

                  {/* Summary Pricing */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-black text-brand-700">
                      PKR {booking.total_amount_pkr}
                    </div>
                    <div className="text-xs text-slate-500">
                      {booking.actual_kwh ? (
                        <span className="font-semibold text-emerald-700">{booking.actual_kwh} kWh delivered</span>
                      ) : (
                        <span>Est: {booking.estimated_kwh} kWh ({booking.duration_hours} hrs)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details Bar */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-slate-600">
                  
                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-5">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{startTimeFormatted}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-brand-600" />
                      <span>Rate: PKR {booking.price_per_kwh_pkr}/kWh</span>
                    </div>

                    {isHost ? (
                      <div className="font-semibold text-slate-700">
                        Driver: <span className="text-brand-700">{booking.driver_name}</span> ({booking.driver_phone})
                      </div>
                    ) : (
                      <div className="font-semibold text-slate-700">
                        Host: <span className="text-brand-700">{booking.host_name}</span>
                      </div>
                    )}

                    {isHost && (
                      <div className="bg-emerald-50 px-2 py-1 rounded text-emerald-800 font-bold">
                        Host Net (85%): PKR {booking.host_earnings_pkr}
                      </div>
                    )}
                  </div>

                  {/* Contextual Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">

                    {/* Report / Dispute Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedBookingForDispute(booking)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Report / Dispute Booking"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>

                    {/* Both sides: Leave Review after session completed */}
                    {booking.status === 'completed' && (
                      <button
                        type="button"
                        onClick={() => setSelectedBookingForReview(booking)}
                        disabled={alreadyReviewed}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          alreadyReviewed
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 opacity-80 cursor-default'
                            : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{alreadyReviewed ? 'Reviewed ✓' : 'Rate & Review'}</span>
                      </button>
                    )}

                    {/* Host Pending Actions */}
                    {isHost && booking.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => updateBookingStatus(booking.id, 'accepted')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept Request</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBookingStatus(booking.id, 'declined')}
                          className="px-3.5 py-1.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl font-semibold transition flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </>
                    )}

                    {/* Host Charging Session Controls */}
                    {isHost && booking.status === 'accepted' && (
                      <button
                        type="button"
                        onClick={() => {
                          stopSharing();
                          startSession(booking.id);
                        }}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition flex items-center gap-1.5 animate-pulse"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Session</span>
                      </button>
                    )}

                    {isHost && booking.status === 'active' && (
                      <button
                        type="button"
                        onClick={() => setSelectedBookingForStop(booking)}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-sm transition flex items-center gap-1.5"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop Session & Enter kWh</span>
                      </button>
                    )}

                    {/* Driver Payment Action */}
                    {!isHost && booking.status === 'completed' && booking.payment_status !== 'paid_mock' && (
                      <button
                        type="button"
                        onClick={() => setSelectedBookingForPay(booking)}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-md shadow-brand-500/20 transition flex items-center gap-1.5"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Pay PKR {booking.total_amount_pkr}</span>
                      </button>
                    )}

                    {/* Driver Cancel Pending */}
                    {!isHost && booking.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => cancelBooking(booking.id)}
                        className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:text-red-600 rounded-xl transition"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mock Payment Modal */}
      <MockPaymentModal
        booking={selectedBookingForPay}
        isOpen={Boolean(selectedBookingForPay)}
        onClose={() => setSelectedBookingForPay(null)}
        onPaid={(id, method) => {
          processMockPayment(id, method);
          setSelectedBookingForPay(null);
        }}
      />

      {/* Session Control Modal */}
      <SessionControlModal
        booking={selectedBookingForStop}
        isOpen={Boolean(selectedBookingForStop)}
        onClose={() => setSelectedBookingForStop(null)}
        onStopSession={(id, kwh) => {
          stopSessionAndDeliver(id, kwh);
          setSelectedBookingForStop(null);
        }}
      />

      {/* Rating & Review Modal */}
      <ReviewModal
        booking={selectedBookingForReview}
        isOpen={Boolean(selectedBookingForReview)}
        onClose={() => setSelectedBookingForReview(null)}
        reviewerRole={isHost ? 'host' : 'driver'}
        onSubmit={(revData) => {
          submitReview(revData);
        }}
      />

      {/* Dispute / Report Modal */}
      <DisputeModal
        booking={selectedBookingForDispute}
        isOpen={Boolean(selectedBookingForDispute)}
        onClose={() => setSelectedBookingForDispute(null)}
        onSubmit={(dispData) => {
          submitDispute(dispData);
          alert('Dispute submitted successfully to ChargeNear Admin.');
        }}
      />
    </div>
  );
}
