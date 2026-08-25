'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Marker Hijau untuk Toko / Restoran
const storeIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Marker Merah untuk Rumah / Tujuan
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

interface DeliveryMapProps {
  pickupCoords: LatLng; // Lokasi Toko
  destCoords: LatLng;   // Lokasi Rumah
  onChange: (coords: LatLng) => void;
}

// Event handler untuk klik peta (mengubah titik rumah)
function MapEvents({ onChange }: { onChange: (c: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Auto-zoom agar kedua marker terlihat di layar
function MapUpdater({ pickupCoords, destCoords }: { pickupCoords: LatLng, destCoords: LatLng }) {
  const map = useMap();
  useEffect(() => {
    if (pickupCoords && destCoords) {
      const bounds = L.latLngBounds([pickupCoords.lat, pickupCoords.lng], [destCoords.lat, destCoords.lng]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [pickupCoords, destCoords, map]);
  return null;
}

export default function DeliveryMap({ pickupCoords, destCoords, onChange }: DeliveryMapProps) {
  // Mencegah render jika koordinat belum tersedia (mencegah undefined error)
  if (!pickupCoords || !destCoords) return null;

  return (
    <div style={{ height: '260px', width: '100%', borderRadius: '1rem', overflow: 'hidden', zIndex: 0, position: 'relative' }}>
      <MapContainer center={[destCoords.lat, destCoords.lng]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[pickupCoords.lat, pickupCoords.lng]} icon={storeIcon} />
        <Marker position={[destCoords.lat, destCoords.lng]} icon={destIcon} />
        <MapEvents onChange={onChange} />
        <MapUpdater pickupCoords={pickupCoords} destCoords={destCoords} />
      </MapContainer>
    </div>
  );
}