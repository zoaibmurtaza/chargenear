import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { realtimeBus } from './realtimeBus';

const LiveLocationContext = createContext(null);

export const LiveLocationProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Consent state: Driver must consent before sharing live coordinates
  const [hasConsented, setHasConsented] = useState(() => {
    return localStorage.getItem('chargenear_location_consent') === 'true';
  });

  // Active tracking booking id
  const [activeTrackingBooking, setActiveTrackingBooking] = useState(null);

  // Host view: map of bookingId -> { lat, lng, timestamp, driverName }
  const [driverLocations, setDriverLocations] = useState({});

  const watchIdRef = useRef(null);
  const intervalIdRef = useRef(null);

  const grantConsent = () => {
    setHasConsented(true);
    localStorage.setItem('chargenear_location_consent', 'true');
  };

  const revokeConsent = () => {
    setHasConsented(false);
    localStorage.removeItem('chargenear_location_consent');
    stopSharing();
  };

  // Start periodic 10-second geolocation broadcast for Driver during accepted booking
  const startSharingForBooking = (booking) => {
    if (!booking || booking.status !== 'accepted') return;
    setActiveTrackingBooking(booking);

    if (!hasConsented) return; // Wait for consent modal

    // Clear previous
    if (intervalIdRef.current) clearInterval(intervalIdRef.current);

    const broadcastCurrent = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const locData = {
              bookingId: booking.id,
              driverId: user?.id || booking.driver_id,
              driverName: user?.full_name || booking.driver_name,
              hostId: booking.host_id,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              timestamp: Date.now(),
            };

            // Emit via realtime bus
            realtimeBus.emit('driver_live_location', locData);
          },
          (err) => console.warn('Live location error:', err.message),
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }
    };

    // Broadcast immediately and every 10 seconds
    broadcastCurrent();
    intervalIdRef.current = setInterval(broadcastCurrent, 10000);
  };

  const stopSharing = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    setActiveTrackingBooking(null);
  };

  // Listen for live location updates (Host receives driver's updates)
  useEffect(() => {
    const unsub = realtimeBus.on('driver_live_location', (data) => {
      if (data && data.bookingId) {
        setDriverLocations((prev) => ({
          ...prev,
          [data.bookingId]: data,
        }));
      }
    });

    return () => unsub();
  }, []);

  return (
    <LiveLocationContext.Provider
      value={{
        hasConsented,
        grantConsent,
        revokeConsent,
        activeTrackingBooking,
        startSharingForBooking,
        stopSharing,
        driverLocations,
      }}
    >
      {children}
    </LiveLocationContext.Provider>
  );
};

export const useLiveLocation = () => useContext(LiveLocationContext);
