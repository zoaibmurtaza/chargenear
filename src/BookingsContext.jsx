import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isConfigured } from './supabaseClient';
import { useAuth } from './AuthContext';
import { realtimeBus } from './realtimeBus';
import { INITIAL_BOOKINGS, calculateBilling } from './utils/billing';

const BookingsContext = createContext(null);

export const BookingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveNotifications, setLiveNotifications] = useState([]);

  const addNotification = (title, message, type = 'info', booking = null) => {
    const notif = {
      id: 'notif-' + Date.now() + Math.random().toString(36).substring(2, 6),
      title,
      message,
      type,
      booking,
      time: new Date(),
    };
    setLiveNotifications((prev) => [notif, ...prev.slice(0, 4)]);
  };

  const dismissNotification = (id) => {
    setLiveNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Load initial bookings
  const loadBookings = async () => {
    setLoading(true);
    try {
      if (isConfigured && user) {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } else {
        const saved = localStorage.getItem('chargenear_bookings');
        if (saved) {
          setBookings(JSON.parse(saved));
        } else {
          setBookings(INITIAL_BOOKINGS);
          localStorage.setItem('chargenear_bookings', JSON.stringify(INITIAL_BOOKINGS));
        }
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user]);

  // Realtime Subscriptions for booking requests and status updates
  useEffect(() => {
    // 1. Listen for new booking requests created
    const unsubReq = realtimeBus.on('booking_requested', (newBooking) => {
      setBookings((prev) => {
        if (prev.some((b) => b.id === newBooking.id)) return prev;
        const updated = [newBooking, ...prev];
        localStorage.setItem('chargenear_bookings', JSON.stringify(updated));
        return updated;
      });

      // Host alert
      if (user?.role === 'host' && (newBooking.host_id === user?.id || newBooking.host_id === 'demo-host-id')) {
        addNotification(
          '⚡ New Booking Request Received!',
          `${newBooking.driver_name} requested a charging slot at "${newBooking.charger_title}" for ${newBooking.estimated_kwh} kWh (PKR ${newBooking.total_amount_pkr}).`,
          'booking_request',
          newBooking
        );
      }
    });

    // 2. Listen for booking status changes (accepted, declined, active, completed, cancelled)
    const unsubStatus = realtimeBus.on('booking_status_updated', ({ bookingId, newStatus, updatedBooking }) => {
      setBookings((prev) => {
        const updated = prev.map((b) => (b.id === bookingId ? { ...b, ...updatedBooking, status: newStatus } : b));
        localStorage.setItem('chargenear_bookings', JSON.stringify(updated));
        return updated;
      });

      // Driver notification when booking is accepted/declined/active
      if (user?.role === 'driver') {
        if (newStatus === 'accepted') {
          addNotification(
            '✅ Booking Accepted by Host!',
            `Your charging request has been accepted. Live location sharing is now active to guide your arrival.`,
            'status_accepted',
            updatedBooking
          );
        } else if (newStatus === 'declined') {
          addNotification(
            '❌ Booking Request Declined',
            `The host was unable to accommodate this time slot. Please try another nearby charger.`,
            'status_declined',
            updatedBooking
          );
        } else if (newStatus === 'active') {
          addNotification(
            '⚡ Charging Session Started!',
            `The host has started your EV charging session. Power is now flowing.`,
            'status_active',
            updatedBooking
          );
        } else if (newStatus === 'completed') {
          addNotification(
            '🎉 Charging Session Completed!',
            `Total delivered: ${updatedBooking?.actual_kwh || '20'} kWh. Total: PKR ${updatedBooking?.total_amount_pkr || 0}. Tap to pay.`,
            'status_completed',
            updatedBooking
          );
        }
      }
    });

    return () => {
      unsubReq();
      unsubStatus();
    };
  }, [user]);

  // Persist state helper
  const saveBookingsState = (updatedList) => {
    setBookings(updatedList);
    localStorage.setItem('chargenear_bookings', JSON.stringify(updatedList));
  };

  // 1. Create booking request
  const createBookingRequest = async ({ charger, startTime, durationHours, estimatedKwh }) => {
    const kwh = parseFloat(estimatedKwh) || 20;
    const { totalAmountPkr, platformFeePkr, hostEarningsPkr } = calculateBilling(kwh, charger.price_per_kwh_pkr);

    const newBooking = {
      id: 'bk-' + Date.now(),
      charger_id: charger.id,
      charger_title: charger.title,
      charger_address: charger.address,
      driver_id: user?.id || 'demo-driver-id',
      driver_name: user?.full_name || 'Hamza Tariq',
      driver_phone: '0300-1234567',
      host_id: charger.host_id || 'demo-host-id',
      host_name: charger.host_name || 'Host User',
      connector_type: charger.connector_type,
      price_per_kwh_pkr: charger.price_per_kwh_pkr,
      start_time: startTime,
      duration_hours: parseFloat(durationHours),
      estimated_kwh: kwh,
      actual_kwh: null,
      total_amount_pkr: totalAmountPkr,
      platform_fee_pkr: platformFeePkr,
      host_earnings_pkr: hostEarningsPkr,
      status: 'pending',
      payment_status: 'unpaid',
      payment_method: null,
      created_at: new Date().toISOString(),
    };

    if (isConfigured && user) {
      const { error } = await supabase.from('bookings').insert([newBooking]);
      if (error) throw error;
      await loadBookings();
    } else {
      const updated = [newBooking, ...bookings];
      saveBookingsState(updated);
    }

    // Broadcast realtime event
    realtimeBus.emit('booking_requested', newBooking);

    return newBooking;
  };

  // 2. Host Accept or Decline
  const updateBookingStatus = async (bookingId, newStatus) => {
    const existing = bookings.find((b) => b.id === bookingId);
    const updatedFields = { status: newStatus, updated_at: new Date().toISOString() };
    const merged = { ...existing, ...updatedFields };

    if (isConfigured && user) {
      const { error } = await supabase
        .from('bookings')
        .update(updatedFields)
        .eq('id', bookingId);
      if (error) throw error;
      await loadBookings();
    } else {
      const updated = bookings.map((b) => (b.id === bookingId ? merged : b));
      saveBookingsState(updated);
    }

    // Realtime broadcast to driver
    realtimeBus.emit('booking_status_updated', {
      bookingId,
      newStatus,
      updatedBooking: merged,
    });
  };

  // 3. Host starts session
  const startSession = async (bookingId) => {
    const existing = bookings.find((b) => b.id === bookingId);
    await updateBookingStatus(bookingId, 'active');

    // Also update charger availability status live to 'busy'
    if (existing?.charger_id) {
      realtimeBus.emit('charger_status_changed', {
        chargerId: existing.charger_id,
        availability: 'busy', // 'available', 'busy', 'offline'
      });
    }
  };

  // 4. Host stops session and inputs delivered kWh
  const stopSessionAndDeliver = async (bookingId, actualKwh) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return;

    const billing = calculateBilling(actualKwh, target.price_per_kwh_pkr);
    const updates = {
      status: 'completed',
      actual_kwh: billing.kwhDelivered,
      total_amount_pkr: billing.totalAmountPkr,
      platform_fee_pkr: billing.platformFeePkr,
      host_earnings_pkr: billing.hostEarningsPkr,
      session_ended_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const merged = { ...target, ...updates };

    if (isConfigured && user) {
      const { error } = await supabase.from('bookings').update(updates).eq('id', bookingId);
      if (error) throw error;
      await loadBookings();
    } else {
      const updated = bookings.map((b) => (b.id === bookingId ? merged : b));
      saveBookingsState(updated);
    }

    // Revert charger availability live to 'available'
    if (target.charger_id) {
      realtimeBus.emit('charger_status_changed', {
        chargerId: target.charger_id,
        availability: 'available',
      });
    }

    // Realtime broadcast completion
    realtimeBus.emit('booking_status_updated', {
      bookingId,
      newStatus: 'completed',
      updatedBooking: merged,
    });
  };

  // 5. Driver processes mock payment
  const processMockPayment = async (bookingId, mockMethod) => {
    const target = bookings.find((b) => b.id === bookingId);
    const updates = {
      payment_status: 'paid_mock',
      payment_method: mockMethod || 'Mock JazzCash',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const merged = { ...target, ...updates };

    if (isConfigured && user) {
      const { error } = await supabase.from('bookings').update(updates).eq('id', bookingId);
      if (error) throw error;
      await loadBookings();
    } else {
      const updated = bookings.map((b) => (b.id === bookingId ? merged : b));
      saveBookingsState(updated);
    }
  };

  // 6. Driver cancels
  const cancelBooking = async (bookingId) => {
    const existing = bookings.find((b) => b.id === bookingId);
    await updateBookingStatus(bookingId, 'cancelled');

    if (existing?.charger_id) {
      realtimeBus.emit('charger_status_changed', {
        chargerId: existing.charger_id,
        availability: 'available',
      });
    }
  };

  return (
    <BookingsContext.Provider
      value={{
        bookings,
        loading,
        liveNotifications,
        dismissNotification,
        createBookingRequest,
        updateBookingStatus,
        startSession,
        stopSessionAndDeliver,
        processMockPayment,
        cancelBooking,
        refreshBookings: loadBookings,
      }}
    >
      {children}
    </BookingsContext.Provider>
  );
};

export const useBookings = () => useContext(BookingsContext);
