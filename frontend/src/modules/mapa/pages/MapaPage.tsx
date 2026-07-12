import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon paths broken by bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function MapaPage() {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Read lat/lng from URL query params
  const params = new URLSearchParams(window.location.search);
  const lat = parseFloat(params.get('lat') || '0');
  const lng = parseFloat(params.get('lng') || '0');
  const label = params.get('label') || `${lat}, ${lng}`;

  useEffect(() => {
    if (mapRef.current) return; // already initialized

    const map = L.map('geo-map', {
      center: [lat, lng],
      zoom: 17,
    });

    // Esri satellite tiles — free, no API key required, Google Earth-like quality
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles © Esri',
        maxZoom: 19,
      }
    ).addTo(map);

    // Labels overlay
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, opacity: 0.7 }
    ).addTo(map);

    // Pin marker
    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup(`<strong>${label}</strong><br/>${lat}, ${lng}`).openPopup();

    mapRef.current = map;
    markerRef.current = marker;
  }, []);

  // If lat/lng change (window navigated to new coords), update map
  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;
    mapRef.current.setView([lat, lng], 17);
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current
        .getPopup()
        ?.setContent(`<strong>${label}</strong><br/>${lat}, ${lng}`)
        .openOn(mapRef.current);
    }
  }, [lat, lng]);

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <div id="geo-map" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
