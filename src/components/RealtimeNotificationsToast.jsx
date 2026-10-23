import React from 'react';
import { useBookings } from '../BookingsContext';
import { Bell, CheckCircle2, XCircle, Zap, Clock, X, ChevronRight } from 'lucide-react';

export default function RealtimeNotificationsToast({ onSelectBooking }) {
  const { liveNotifications, dismissNotification } = useBookings();

  if (!liveNotifications || liveNotifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[2000] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {liveNotifications.map((notif) => {
        return (
          <div
            key={notif.id}
            className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-4 transition-all animate-in slide-in-from-right-5 fade-in duration-300"
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                notif.type === 'booking_request' ? 'bg-amber-100 text-amber-700' :
                notif.type === 'status_accepted' ? 'bg-emerald-100 text-emerald-700' :
                notif.type === 'status_declined' ? 'bg-rose-100 text-rose-700' :
                notif.type === 'status_active' ? 'bg-blue-100 text-blue-700' :
                'bg-brand-100 text-brand-700'
              }`}>
                <Zap className="w-4 h-4 fill-current" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-bold text-xs text-slate-800 leading-tight">
                    {notif.title}
                  </h4>
                  <button
                    type="button"
                    onClick={() => dismissNotification(notif.id)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal line-clamp-2">
                  {notif.message}
                </p>

                {notif.booking && (
                  <button
                    type="button"
                    onClick={() => {
                      dismissNotification(notif.id);
                      if (onSelectBooking) onSelectBooking(notif.booking);
                    }}
                    className="mt-2 text-[11px] font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 transition"
                  >
                    <span>View Booking Details</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
