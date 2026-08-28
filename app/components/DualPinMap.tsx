'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const storeIcon = L.divIcon({
  html: `<div class="w-8 h-8 bg-emerald-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-black text-xs">A</div>`,
  className: 'custom-pin',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const houseIcon = L.divIcon({
  html: `<div class="w-8 h-8 bg-rose-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">B</div>`,
  className: 'custom-pin',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export interface LatLng {
  lat: number;
  lng: number;
}

interface DualPinMapProps {
  storeCoords: LatLng;
  customerCoords: LatLng;
  storeLabel: string;
  customerLabel: string;
  activePinMode: 'STORE' | 'HOUSE';
  flyTarget: LatLng | null;
  onSelectCoords: (lat: number, lng: number) => void;
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

export default function DualPinMap({
  storeCoords,
  customerCoords,
  storeLabel,
  customerLabel,
  activePinMode,
  flyTarget,
  onSelectCoords,
}: DualPinMapProps) {
  const center = activePinMode === 'STORE' ? storeCoords : customerCoords;

  return (
    <div className="w-full h-64 rounded-2xl overflow-hidden border border-slate-200 relative shadow-inner">
      <MapContainer center={[center.lat, center.lng]} zoom={14} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Marker Toko (A) dengan Popup Nama Tempat */}
        <Marker position={[storeCoords.lat, storeCoords.lng]} icon={storeIcon}>
          <Popup>
            <div className="text-xs font-bold text-slate-800">
              <span className="text-emerald-600 uppercase font-black">LOKASI TOKO (A):</span><br />
              {storeLabel || "Belum ada nama toko"}
            </div>
          </Popup>
        </Marker>
        
        {/* Marker Rumah (B) dengan Popup Alamat */}
        <Marker position={[customerCoords.lat, customerCoords.lng]} icon={houseIcon}>
          <Popup>
            <div className="text-xs font-bold text-slate-800">
              <span className="text-rose-600 uppercase font-black">LOKASI RUMAH (B):</span><br />
              {customerLabel || "Memuat alamat..."}
            </div>
          </Popup>
        </Marker>

        <MapClickHandler onSelect={onSelectCoords} />
        {flyTarget && <MapFlyTo center={flyTarget} />}
      </MapContainer>
    </div>
  );
}