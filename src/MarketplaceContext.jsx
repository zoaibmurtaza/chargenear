import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isConfigured } from './supabaseClient';
import { useAuth } from './AuthContext';
import { INITIAL_REVIEWS, INITIAL_VERIFICATIONS, INITIAL_DISPUTES } from './utils/phase5Data';

const MarketplaceContext = createContext(null);

export const MarketplaceProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('chargenear_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [verifications, setVerifications] = useState(() => {
    const saved = localStorage.getItem('chargenear_verifications');
    return saved ? JSON.parse(saved) : INITIAL_VERIFICATIONS;
  });

  const [disputes, setDisputes] = useState(() => {
    const saved = localStorage.getItem('chargenear_disputes');
    return saved ? JSON.parse(saved) : INITIAL_DISPUTES;
  });

  useEffect(() => {
    localStorage.setItem('chargenear_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('chargenear_verifications', JSON.stringify(verifications));
  }, [verifications]);

  useEffect(() => {
    localStorage.setItem('chargenear_disputes', JSON.stringify(disputes));
  }, [disputes]);

  // 1. Submit a Review
  const submitReview = ({ bookingId, chargerId, targetId, targetName, rating, comment }) => {
    const newRev = {
      id: 'rev-' + Date.now(),
      booking_id: bookingId,
      charger_id: chargerId,
      reviewer_id: user?.id || 'demo-user',
      reviewer_name: user?.full_name || 'Anonymous User',
      reviewer_role: user?.role || 'driver',
      target_id: targetId,
      target_name: targetName,
      rating: Number(rating),
      comment,
      created_at: new Date().toISOString(),
    };
    setReviews((prev) => [newRev, ...prev]);
    return newRev;
  };

  // Check if current user has already reviewed a booking
  const hasReviewedBooking = (bookingId) => {
    return reviews.some((r) => r.booking_id === bookingId && r.reviewer_id === user?.id);
  };

  // 2. Submit Host Verification Checklist + Photo
  const submitVerification = ({ chargerTitle, setupPhotoUrl, checklist }) => {
    const newVerif = {
      id: 'verif-' + Date.now(),
      host_id: user?.id || 'demo-host-id',
      host_name: user?.full_name || 'Ahmed Malik',
      host_email: user?.email || 'host.ahmed@chargenear.pk',
      charger_title: chargerTitle,
      status: 'pending',
      setup_photo_url: setupPhotoUrl,
      checklist,
      admin_notes: '',
      reviewed_at: null,
      created_at: new Date().toISOString(),
    };

    setVerifications((prev) => [
      newVerif,
      ...prev.filter((v) => v.host_id !== user?.id),
    ]);
    return newVerif;
  };

  // Check if host is verified
  const getHostVerificationStatus = (hostId) => {
    const found = verifications.find((v) => v.host_id === hostId);
    return found ? found.status : 'unverified'; // 'approved', 'pending', 'rejected', 'unverified'
  };

  // 3. Admin: Update verification status
  const updateVerificationStatus = (verifId, status, adminNotes = '') => {
    setVerifications((prev) =>
      prev.map((v) =>
        v.id === verifId
          ? {
              ...v,
              status,
              admin_notes: adminNotes,
              reviewed_at: new Date().toISOString(),
            }
          : v
      )
    );
  };

  // 4. Submit Dispute / Report on a booking
  const submitDispute = ({ bookingId, reason, description }) => {
    const newDisp = {
      id: 'disp-' + Date.now(),
      booking_id: bookingId,
      reporter_id: user?.id || 'demo-user',
      reporter_name: user?.full_name || 'User',
      reporter_role: user?.role || 'driver',
      reason,
      description,
      status: 'open',
      admin_resolution: '',
      created_at: new Date().toISOString(),
    };
    setDisputes((prev) => [newDisp, ...prev]);
    return newDisp;
  };

  // 5. Admin: Resolve dispute
  const resolveDispute = (disputeId, resolutionText) => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId
          ? {
              ...d,
              status: 'resolved',
              admin_resolution: resolutionText,
              resolved_at: new Date().toISOString(),
            }
          : d
      )
    );
  };

  return (
    <MarketplaceContext.Provider
      value={{
        reviews,
        submitReview,
        hasReviewedBooking,
        verifications,
        submitVerification,
        getHostVerificationStatus,
        updateVerificationStatus,
        disputes,
        submitDispute,
        resolveDispute,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => useContext(MarketplaceContext);
