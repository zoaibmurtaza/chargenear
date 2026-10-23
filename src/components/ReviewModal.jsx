import React, { useState } from 'react';
import { X, Star, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function ReviewModal({ booking, isOpen, onClose, onSubmit, reviewerRole }) {
  if (!isOpen || !booking) return null;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isDriver = reviewerRole === 'driver';
  const targetName = isDriver ? booking.host_name : booking.driver_name;
  const targetId = isDriver ? booking.host_id : booking.driver_id;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      onSubmit({
        bookingId: booking.id,
        chargerId: booking.charger_id,
        targetId,
        targetName,
        rating,
        comment,
      });
      setSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[1070] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-current" />
            <h3 className="font-bold text-base">
              {isDriver ? 'Review Host & Charger' : 'Review Driver'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center">
            <p className="text-xs text-slate-500">
              How was your experience with <strong className="text-slate-800">{targetName}</strong> for {booking.charger_title}?
            </p>

            {/* Interactive Star Rating */}
            <div className="flex items-center justify-center gap-2 my-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-slate-300 hover:scale-110 transition focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {rating === 5 ? '⭐⭐⭐⭐⭐ Excellent' :
               rating === 4 ? '⭐⭐⭐⭐ Very Good' :
               rating === 3 ? '⭐⭐⭐ Average' :
               rating === 2 ? '⭐⭐ Below Expectations' : '⭐ Poor'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Your Review & Feedback
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                isDriver
                  ? "Describe charging speed, host hospitality, parking ease, and reliability..."
                  : "How was the driver's punctuality, parking etiquette, and session wrap-up?"
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-bold shadow-md shadow-amber-500/20 transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Post Review'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
