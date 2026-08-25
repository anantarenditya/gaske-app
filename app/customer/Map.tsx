'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const pickupIcon = L.divIcon({
  html: `<div class="w-8 h-8 bg-emerald-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-black text-xs">A</div>`,
  className: 'custom-pin',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const destIcon = L.divIcon({
  html: `<div class="w-8 h-8 bg-rose-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">B</div>`,
  className: 'custom-pin',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface LatLng {
  lat: number;
  lng: number;
}

function MapFlyTo({ center }: { center: LatLng }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 15, { duration: 1.2 });
    }
  }, [map, center]);
  return null;
}

function MapClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapProps {
  pickupCoords: LatLng;
  destCoords: LatLng;
  flyTarget: LatLng | null;
  onMapClick: (lat: number, lng: number) => void;
}

export default function MapComponent({ pickupCoords, destCoords, flyTarget, onMapClick }: MapProps) {
  return (
    <MapContainer center={[pickupCoords.lat, pickupCoords.lng]} zoom={14} className="w-full h-full z-0">
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <Marker position={[pickupCoords.lat, pickupCoords.lng]} icon={pickupIcon} />
      <Marker position={[destCoords.lat, destCoords.lng]} icon={destIcon} />
      <MapClickHandler onSelect={onMapClick} />
      {flyTarget && <MapFlyTo center={flyTarget} />}
    </MapContainer>
  );
}