'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Loader2 } from 'lucide-react';

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

export interface LatLng {
  lat: number;
  lng: number;
}

export interface LocationPickerProps {
  pickupCoords: LatLng;
  destCoords: LatLng;
  onChange: (
    p: LatLng,
    d: LatLng,
    dist: number,
    addressInfo?: { type: 'A' | 'B'; name: string }
  ) => void;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

// Komponen Pembantu Pergerakan Fokus Peta
function MapFlyTo({ center }: { center: LatLng }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 15, { duration: 1.2 });
    }
  }, [map, center]);
  return null;
}

function MapClickHandler({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPickerMap({
  pickupCoords,
  destCoords,
  onChange,
}: LocationPickerProps) {
  const [activeMode, setActiveMode] = useState<'A' | 'B'>('A');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [flyTarget, setFlyTarget] = useState<LatLng | null>(null);

  const calculateDistance = (p1: LatLng, p2: LatLng) => {
    const R = 6371;
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1.lat * Math.PI) / 180) *
        Math.cos((p2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.max(1, Math.round(R * c));
  };

  // Dapatkan Nama Alamat Lengkap berdasarkan Koordinat (Reverse Geocoding)
  const fetchAddressName = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(',');
        return parts.slice(0, 3).join(',').trim();
      }
    } catch {
      // Fallback jika API terhambat
    }
    return `Lokasi (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  };

  // Pencarian Otomatis Tempat (Forward Geocoding) - Diperbarui untuk Jawa Timur
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // PERUBAHAN DI SINI: Menambahkan viewbox Jawa Timur dan bounded=1
        // viewbox = left(lon), top(lat), right(lon), bottom(lat)
        const eastJavaViewbox = "110.8,-6.6,114.6,-8.8"; 
        
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&countrycodes=id&viewbox=${eastJavaViewbox}&bounded=1&limit=8`
        );
        const data = await res.json();
        setSearchResults(data || []);
      } catch {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const shortName = result.display_name.split(',').slice(0, 3).join(',').trim();

    const newTarget = { lat, lng };
    setFlyTarget(newTarget);

    if (activeMode === 'A') {
      const dist = calculateDistance(newTarget, destCoords);
      onChange(newTarget, destCoords, dist, { type: 'A', name: shortName });
    } else {
      const dist = calculateDistance(pickupCoords, newTarget);
      onChange(pickupCoords, newTarget, dist, { type: 'B', name: shortName });
    }

    setSearchQuery('');
    setSearchResults([]);
  };

  const handleMapClick = async (lat: number, lng: number) => {
    const addressName = await fetchAddressName(lat, lng);
    const newCoords = { lat, lng };

    if (activeMode === 'A') {
      const dist = calculateDistance(newCoords, destCoords);
      onChange(newCoords, destCoords, dist, { type: 'A', name: addressName });
    } else {
      const dist = calculateDistance(pickupCoords, newCoords);
      onChange(pickupCoords, newCoords, dist, { type: 'B', name: addressName });
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Mode Selector Tab */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveMode('A')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
            activeMode === 'A'
              ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Pilih Jemput (A)
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('B')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
            activeMode === 'B'
              ? 'bg-rose-600 text-white ring-2 ring-rose-300'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Pilih Tujuan (B)
        </button>
      </div>

      {/* Live Search Input Box */}
      <div className="relative z-20">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder={`Cari nama tempat untuk ${
              activeMode === 'A' ? 'Jemput (A)' : 'Tujuan (B)'
            }...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
          {isSearching && (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600 absolute right-3" />
          )
        }
        </div>

        {/* Search Recommendations Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-50 max-h-52 overflow-y-auto">
            {searchResults.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectSearchResult(item)}
                className="w-full text-left p-3 hover:bg-emerald-50 transition flex items-start gap-2.5 text-xs text-slate-700 font-medium"
              >
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Peta Container */}
      <div className="w-full h-64 rounded-2xl overflow-hidden border border-slate-200 z-0 relative shadow-inner">
        <MapContainer
          center={[pickupCoords.lat, pickupCoords.lng]}
          zoom={14}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <Marker position={[pickupCoords.lat, pickupCoords.lng]} icon={pickupIcon} />
          <Marker position={[destCoords.lat, destCoords.lng]} icon={destIcon} />
          <MapClickHandler onSelect={handleMapClick} />
          {flyTarget && <MapFlyTo center={flyTarget} />}
        </MapContainer>
      </div>
    </div>
  );
}