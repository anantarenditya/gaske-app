'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Marker Hijau (Titik A / Jemput)
const pickupIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Marker Merah (Titik B / Tujuan)
const destIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export interface LatLng {
  lat: number;
  lng: number;
}

interface RideMapProps {
  pickupCoords: LatLng;
  destCoords: LatLng;
  activeTab: 'A' | 'B'; // Menentukan sedang memilih titik A atau B
  onChange: (pickup: LatLng, dest: LatLng) => void;
}

function MapClickHandler({ activeTab, pickupCoords, destCoords, onChange }: { activeTab: 'A' | 'B', pickupCoords: LatLng, destCoords: LatLng, onChange: (p: LatLng, d: LatLng) => void }) {
  useMapEvents({
    click(e) {
      const clicked = { lat: e.latlng.lat, lng: e.latlng.lng };
      if (activeTab === 'A') {
        onChange(clicked, destCoords);
      } else {
        onChange(pickupCoords, clicked);
      }
    },
  });
  return null;
}

function MapBoundsUpdater({ pickupCoords, destCoords }: { pickupCoords: LatLng, destCoords: LatLng }) {
  const map = useMap();
  useEffect(() => {
    if (pickupCoords && destCoords) {
      const bounds = L.latLngBounds([pickupCoords.lat, pickupCoords.lng], [destCoords.lat, destCoords.lng]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [pickupCoords, destCoords, map]);
  return null;
}

export default function RideMap({ pickupCoords, destCoords, activeTab, onChange }: RideMapProps) {
  if (!pickupCoords || !destCoords) return null;

  return (
    <div style={{ height: '260px', width: '100%', borderRadius: '1rem', overflow: 'hidden', zIndex: 0, position: 'relative' }}>
      <MapContainer center={[pickupCoords.lat, pickupCoords.lng]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[pickupCoords.lat, pickupCoords.lng]} icon={pickupIcon} />
        <Marker position={[destCoords.lat, destCoords.lng]} icon={destIcon} />
        <MapClickHandler activeTab={activeTab} pickupCoords={pickupCoords} destCoords={destCoords} onChange={onChange} />
        <MapBoundsUpdater pickupCoords={pickupCoords} destCoords={destCoords} />
      </MapContainer>
    </div>
  );
}