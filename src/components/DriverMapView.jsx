import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { haversineDistanceKm } from '../utils/haversine';
import { useBookings } from '../BookingsContext';
import { useChargers } from '../ChargersContext';
import FilterPanel from './FilterPanel';
import NearestChargersList from './NearestChargersList';
import ChargerDetailCard from './ChargerDetailCard';
import BookingRequestModal from './BookingRequestModal';
import { 
  LocateFixed, Loader2, CheckCircle2, Navigation, AlertCircle, Compass 
} from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const chargerPinIcon = (availability) => {
  let bgColor = '#059669';
  let label = '⚡';

  if (availability === 'busy') {
    bgColor = '#ea580c';
  } else if (availability === 'offline' || availability === 'paused') {
    bgColor = '#64748b';
    label = '✕';
  }

  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="
        background-color: ${bgColor};
        color: white;
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        border: 2.5px solid white;
        transition: background-color 0.4s ease;
      ">
        <div style="transform: rotate(45deg); font-size: 14px; font-weight: bold;">${label}</div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const liveUserLocationIcon = L.divIcon({
  className: 'live-driver-pin',
  html: `
    <div style="position:relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
      <div style="
        position: absolute;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: rgba(37, 99, 235, 0.2);
        animation: pulseRing 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
      "></div>
      <div style="
        position: relative;
        width: 20px;
        height: 20px;
        background: #2563eb;
        border: 3.5px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.35);
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function DriverMapView({ onNavigateToBookings }) {
  const { createBookingRequest } = useBookings();
  const { getApprovedChargers } = useChargers();

  const approvedChargers = getApprovedChargers();

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const watchIdRef = useRef(null);

  const [userLocation, setUserLocation] = useState(null);
  const [accuracyMeters, setAccuracyMeters] = useState(null);
  const [locationStatus, setLocationStatus] = useState('requesting');

  const [selectedCharger, setSelectedCharger] = useState(null);
  const [bookingModalCharger, setBookingModalCharger] = useState(null);
  const [bookingToast, setBookingToast] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // REQUIREMENT: Open "Nearest Chargers" list automatically when driver opens the map
  const [listOpen, setListOpen] = useState(true);

  // Maximum nearest radius limit (in km): only show chargers within driver's geographic vicinity
  const [maxRadiusKm, setMaxRadiusKm] = useState(25);

  const [filters, setFilters] = useState({
    connectorType: 'All',
    minKw: 0,
    maxPrice: 500,
    availableNow: false,
  });

  const requestLiveLocation = () => {
    setLocationStatus('requesting');

    if (!('geolocation' in navigator)) {
      setLocationStatus('error');
      setUserLocation({ lat: 24.8607, lng: 67.0011 }); // Karachi default
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setAccuracyMeters(Math.round(accuracy));
        setLocationStatus('granted');

        if (mapInstanceRef.current) {
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            const marker = L.marker([latitude, longitude], {
              icon: liveUserLocationIcon,
              zIndexOffset: 1000,
            }).addTo(mapInstanceRef.current);
            marker.bindTooltip('You are here (Live GPS)', { direction: 'top', offset: [0, -12] });
            userMarkerRef.current = marker;
          }

          if (accuracyCircleRef.current) {
            accuracyCircleRef.current.setLatLng([latitude, longitude]);
            accuracyCircleRef.current.setRadius(accuracy || 25);
          } else {
            accuracyCircleRef.current = L.circle([latitude, longitude], {
              radius: accuracy || 25,
              color: '#3b82f6',
              weight: 1,
              fillColor: '#60a5fa',
              fillOpacity: 0.15,
            }).addTo(mapInstanceRef.current);
          }
        }
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setLocationStatus('denied');
        setUserLocation({ lat: 24.8236, lng: 67.0278 }); // Default Karachi Clifton
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    requestLiveLocation();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // ONLY SHOW NEAREST CHARGERS SORTED STRICTLY BY PROXIMITY (HAVERSINE)
  const nearestChargers = useMemo(() => {
    if (!userLocation) return [];

    let withDistance = approvedChargers.map((c) => ({
      ...c,
      _distanceKm: haversineDistanceKm(userLocation.lat, userLocation.lng, c.latitude, c.longitude),
    }));

    // Filter by proximity radius (only show nearby vicinity chargers)
    let nearby = withDistance.filter((c) => c._distanceKm <= maxRadiusKm);

    // If no chargers within strict radius, take the top 8 closest chargers
    if (nearby.length === 0) {
      nearby = [...withDistance].sort((a, b) => a._distanceKm - b._distanceKm).slice(0, 8);
    } else {
      nearby.sort((a, b) => a._distanceKm - b._distanceKm);
    }

    // Apply active user filters
    return nearby.filter((c) => {
      if (filters.connectorType !== 'All' && c.connector_type !== filters.connectorType) return false;
      if (c.power_kw < filters.minKw) return false;
      if (c.price_per_kwh_pkr > filters.maxPrice) return false;
      if (filters.availableNow && c.availability !== 'available') return false;
      return true;
    });
  }, [approvedChargers, userLocation, maxRadiusKm, filters]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current || !userLocation) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: liveUserLocationIcon,
        zIndexOffset: 1000,
      }).addTo(map);
      userMarker.bindTooltip('You are here (Live GPS)', { direction: 'top', offset: [0, -12] });
      userMarkerRef.current = userMarker;

      if (accuracyMeters) {
        accuracyCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
          radius: accuracyMeters,
          color: '#3b82f6',
          weight: 1,
          fillColor: '#60a5fa',
          fillOpacity: 0.15,
        }).addTo(map);
      }

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation ? 1 : 0]);

  // Render ONLY the nearest chargers on the map
  useEffect(() => {
    if (!markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    nearestChargers.forEach((charger) => {
      const avail = charger.availability || (charger.status === 'active' ? 'available' : 'offline');
      const marker = L.marker([charger.latitude, charger.longitude], {
        icon: chargerPinIcon(avail),
      });

      const statusBadge =
        avail === 'available' ? '<span style="color:#059669;font-weight:bold;">● Available</span>' :
        avail === 'busy' ? '<span style="color:#ea580c;font-weight:bold;">● Busy</span>' :
        '<span style="color:#64748b;font-weight:bold;">● Offline</span>';

      const distText = charger._distanceKm ? ` (${charger._distanceKm < 1 ? Math.round(charger._distanceKm * 1000) + 'm' : charger._distanceKm.toFixed(1) + 'km'})` : '';

      marker.bindTooltip(
        `<strong>${charger.title}</strong><br/>${statusBadge} · <strong>PKR ${charger.price_per_kwh_pkr}/kWh</strong>${distText}`,
        { direction: 'top', offset: [0, -36], className: 'charger-tooltip' }
      );

      marker.on('click', () => {
        setSelectedCharger(charger);
        setListOpen(false);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([charger.latitude, charger.longitude]);
        }
      });

      marker.addTo(markersLayerRef.current);
    });
  }, [nearestChargers]);

  const recenterMap = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 15, { duration: 0.8 });
    } else {
      requestLiveLocation();
    }
  };

  const handleSelectFromList = (charger) => {
    setSelectedCharger(charger);
    setListOpen(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([charger.latitude, charger.longitude], 16, { duration: 0.6 });
    }
  };

  const handleOpenBookingRequest = (charger) => {
    setSelectedCharger(null);
    setBookingModalCharger(charger);
  };

  const handleBookingSubmit = async ({ charger, startTime, durationHours, estimatedKwh }) => {
    await createBookingRequest({ charger, startTime, durationHours, estimatedKwh });
    setBookingToast({
      title: 'Booking Request Sent!',
      desc: `Sent to host for "${charger.title}". Track live updates in your bookings.`,
    });
    setTimeout(() => setBookingToast(null), 5000);
  };

  return (
    <div className="flex-1 relative" style={{ minHeight: 'calc(100vh - 4rem)' }}>
      
      {/* Full-screen Leaflet Map */}
      <div ref={mapContainerRef} className="absolute inset-0" style={{ borderRadius: 0 }} />

      {/* Geolocation Banner */}
      {locationStatus === 'denied' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1050] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-amber-300 text-xs flex items-center gap-3 max-w-md animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-bold text-slate-800 block">Location Access Needed</span>
            <span className="text-slate-500 text-[11px]">
              Enable location access to show chargers nearest to you.
            </span>
          </div>
          <button
            type="button"
            onClick={requestLiveLocation}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex-shrink-0"
          >
            Allow
          </button>
        </div>
      )}

      {/* Booking Toast */}
      {bookingToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1050] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3 max-w-md border border-emerald-500">
          <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-xs">{bookingToast.title}</h4>
            <p className="text-[11px] text-emerald-100">{bookingToast.desc}</p>
          </div>
          {onNavigateToBookings && (
            <button
              type="button"
              onClick={onNavigateToBookings}
              className="px-2.5 py-1 bg-white text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-50 transition"
            >
              View
            </button>
          )}
        </div>
      )}

      {/* Map Legend: "Nearest Chargers" Indicator */}
      <div className="absolute top-4 left-24 sm:left-28 z-[1000] flex items-center gap-2">
        <div className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-700">
          <Compass className="w-4 h-4 text-brand-600" />
          <span>Nearest Chargers: <strong className="text-brand-700">{nearestChargers.length}</strong> nearby</span>
        </div>

        {locationStatus === 'granted' && accuracyMeters && (
          <div className="hidden md:flex items-center gap-1.5 bg-blue-50/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-blue-200 text-[11px] font-bold text-blue-800 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>GPS Active (±{accuracyMeters}m)</span>
          </div>
        )}
      </div>

      {/* Re-center / Locate Button */}
      <button
        type="button"
        onClick={recenterMap}
        className="absolute top-4 right-4 z-[1000] bg-white shadow-lg rounded-xl p-2.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition border border-slate-200 group"
        title="Find & Center on My Exact Location"
      >
        <LocateFixed className="w-5 h-5 group-hover:scale-110 transition text-blue-600" />
      </button>

      {/* Filters */}
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        isOpen={filtersOpen}
        onToggle={() => setFiltersOpen(!filtersOpen)}
        resultCount={nearestChargers.length}
      />

      {/* Nearest Chargers List (Shows immediately by default) */}
      {!selectedCharger && (
        <NearestChargersList
          chargers={nearestChargers}
          isOpen={listOpen}
          onToggle={() => setListOpen(!listOpen)}
          onSelect={handleSelectFromList}
        />
      )}

      {/* Charger Detail Card */}
      {selectedCharger && (
        <ChargerDetailCard
          charger={selectedCharger}
          distanceKm={selectedCharger._distanceKm}
          onClose={() => setSelectedCharger(null)}
          onRequestBooking={handleOpenBookingRequest}
        />
      )}

      {/* Booking Flow Modal */}
      <BookingRequestModal
        charger={bookingModalCharger}
        isOpen={Boolean(bookingModalCharger)}
        onClose={() => setBookingModalCharger(null)}
        onSubmit={handleBookingSubmit}
      />

      <style>{`
        @keyframes pulseRing {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .charger-tooltip {
          font-size: 12px !important;
          font-weight: 500;
          border-radius: 8px !important;
          padding: 6px 10px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </div>
  );
}
