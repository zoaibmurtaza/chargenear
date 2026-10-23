import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix default Leaflet marker icon urls for bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom green charger icon for ChargeNear
const chargerIcon = L.divIcon({
  className: 'custom-pin',
  html: `
    <div style="
      background-color: #059669;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      border: 2px solid white;
    ">
      <div style="transform: rotate(45deg); font-size: 16px; font-weight: bold;">⚡</div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

export default function LocationPicker({ latitude, longitude, onChange, height = '280px' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Default to central Lahore (Liberty / Main Blvd) if not provided
  const lat = latitude || 31.5204;
  const lng = longitude || 74.3587;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap tile layer (100% free, no paid API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Draggable marker
      const marker = L.marker([lat, lng], {
        icon: chargerIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', (event) => {
        const position = event.target.getLatLng();
        onChange(parseFloat(position.lat.toFixed(5)), parseFloat(position.lng.toFixed(5)));
      });

      map.on('click', (event) => {
        const { lat: clickLat, lng: clickLng } = event.latlng;
        marker.setLatLng([clickLat, clickLng]);
        onChange(parseFloat(clickLat.toFixed(5)), parseFloat(clickLng.toFixed(5)));
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      // Sync map and marker if props changed externally
      mapInstanceRef.current.setView([lat, lng]);
      markerRef.current.setLatLng([lat, lng]);
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Preset location buttons for quick Pakistani city positioning
  const setCity = (cLat, cLng) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([cLat, cLng], 13);
      markerRef.current.setLatLng([cLat, cLng]);
      onChange(cLat, cLng);
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500">
        <span>Click map or drag the marker to set location</span>
        <div className="flex items-center gap-1.5 pt-1 sm:pt-0">
          <span className="font-medium text-slate-400">Quick City:</span>
          <button
            type="button"
            onClick={() => setCity(31.5204, 74.3587)}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            Lahore
          </button>
          <button
            type="button"
            onClick={() => setCity(33.6844, 73.0479)}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            Islamabad
          </button>
          <button
            type="button"
            onClick={() => setCity(24.8607, 67.0011)}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            Karachi
          </button>
        </div>
      </div>

      <div
        ref={mapContainerRef}
        style={{ height }}
        className="w-full border border-slate-200 rounded-xl overflow-hidden shadow-inner relative"
      />

      <div className="flex items-center gap-4 text-xs font-mono bg-slate-50 p-2 rounded-lg border border-slate-200/60 text-slate-600">
        <div>Lat: <span className="font-semibold text-brand-700">{lat}</span></div>
        <div>Lng: <span className="font-semibold text-brand-700">{lng}</span></div>
      </div>
    </div>
  );
}
