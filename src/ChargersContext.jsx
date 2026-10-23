import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isConfigured } from './supabaseClient';
import { INITIAL_DUMMY_CHARGERS } from './supabaseClient';
import { realtimeBus } from './realtimeBus';

const ChargersContext = createContext(null);

export const ChargersProvider = ({ children }) => {
  const [chargers, setChargers] = useState(() => {
    const saved = localStorage.getItem('chargenear_chargers_v2');
    if (saved) return JSON.parse(saved);

    // Initial seed with approval status:
    // Karachi & Lahore seed chargers start as 'approved'
    const initial = INITIAL_DUMMY_CHARGERS.map((c) => ({
      ...c,
      approval_status: c.approval_status || 'approved', // 'pending_approval', 'approved', 'rejected'
      admin_review_notes: c.admin_review_notes || 'Initial Verified Seed Listing',
    }));
    return initial;
  });

  useEffect(() => {
    localStorage.setItem('chargenear_chargers_v2', JSON.stringify(chargers));
  }, [chargers]);

  // Realtime listener for status changes
  useEffect(() => {
    const unsub = realtimeBus.on('charger_status_changed', ({ chargerId, availability }) => {
      setChargers((prev) =>
        prev.map((c) => (c.id === chargerId ? { ...c, availability } : c))
      );
    });

    const unsubApproval = realtimeBus.on('charger_approval_changed', ({ chargerId, approval_status, admin_review_notes }) => {
      setChargers((prev) =>
        prev.map((c) => (c.id === chargerId ? { ...c, approval_status, admin_review_notes } : c))
      );
    });

    return () => {
      unsub();
      unsubApproval();
    };
  }, []);

  // 1. Host creates a new charger listing (starts in 'pending_approval')
  const addCharger = async (chargerData, hostUser) => {
    const newCharger = {
      ...chargerData,
      id: 'ch-' + Date.now(),
      host_id: hostUser.id,
      host_name: hostUser.full_name,
      host_phone: hostUser.phone || '',
      status: 'active',
      availability: 'available',
      approval_status: 'pending_approval', // Requires Admin approval before appearing on Driver Map
      admin_review_notes: '',
      created_at: new Date().toISOString(),
    };

    if (isConfigured) {
      const { data, error } = await supabase.from('chargers').insert([newCharger]);
      if (error) console.error('Supabase charger insert error:', error);
    }

    setChargers((prev) => [newCharger, ...prev]);
    realtimeBus.emit('new_charger_submitted', newCharger);
    return newCharger;
  };

  // 2. Host edits an existing charger
  const updateCharger = async (chargerId, updatedData, hostUserId) => {
    setChargers((prev) =>
      prev.map((c) => {
        if (c.id === chargerId && c.host_id === hostUserId) {
          return {
            ...c,
            ...updatedData,
            updated_at: new Date().toISOString(),
          };
        }
        return c;
      })
    );
  };

  // 3. Host pauses / resumes their charger
  const toggleChargerStatus = async (chargerId, hostUserId) => {
    setChargers((prev) =>
      prev.map((c) => {
        if (c.id === chargerId && c.host_id === hostUserId) {
          const nextStatus = c.status === 'active' ? 'paused' : 'active';
          const nextAvail = nextStatus === 'active' ? 'available' : 'offline';
          return {
            ...c,
            status: nextStatus,
            availability: nextAvail,
            updated_at: new Date().toISOString(),
          };
        }
        return c;
      })
    );
  };

  // 4. Host deletes their charger
  const deleteCharger = async (chargerId, hostUserId) => {
    setChargers((prev) => prev.filter((c) => !(c.id === chargerId && c.host_id === hostUserId)));
  };

  // 5. Admin: Approve or Reject a host's charger listing
  const reviewChargerListing = async (chargerId, approvalStatus, adminNotes = '') => {
    setChargers((prev) =>
      prev.map((c) => {
        if (c.id === chargerId) {
          return {
            ...c,
            approval_status: approvalStatus, // 'approved' or 'rejected'
            admin_review_notes: adminNotes,
            reviewed_at: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    realtimeBus.emit('charger_approval_changed', {
      chargerId,
      approval_status: approvalStatus,
      admin_review_notes: adminNotes,
    });
  };

  // Public/Driver query: only approved chargers
  const getApprovedChargers = () => {
    return chargers.filter((c) => c.approval_status === 'approved');
  };

  // Host query: strictly this host's chargers only
  const getChargersByHost = (hostId) => {
    if (!hostId) return [];
    return chargers.filter((c) => c.host_id === hostId);
  };

  return (
    <ChargersContext.Provider
      value={{
        chargers,
        addCharger,
        updateCharger,
        toggleChargerStatus,
        deleteCharger,
        reviewChargerListing,
        getApprovedChargers,
        getChargersByHost,
      }}
    >
      {children}
    </ChargersContext.Provider>
  );
};

export const useChargers = () => useContext(ChargersContext);
