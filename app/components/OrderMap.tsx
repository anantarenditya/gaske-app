'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const createCustomIcon = (svgString: string, size: [number, number], anchor: [number, number]) => {
  return L.divIcon({
    html: svgString,
    className: 'custom-leaflet-marker',
    iconSize: size,
    iconAnchor: anchor,
  });
};

const pickupSvg = `
  <div class="relative flex items-center justify-center">
    <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-75"></span>
    <div class="w-8 h-8 bg-emerald-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">A</div>
  </div>
`;

const destinationSvg = `
  <div class="relative flex items-center justify-center">
    <div class="w-8 h-8 bg-rose-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">B</div>
  </div>
`;

const driverSvg = `
  <div class="relative flex items-center justify-center">
    <span class="animate-pulse absolute inline-flex h-10 w-10 rounded-full bg-emerald-500 opacity-30"></span>
    <div class="w-10 h-10 bg-slate-900 border-2 border-emerald-400 rounded-2xl shadow-xl flex items-center justify-center text-emerald-400 transform hover:scale-110 transition">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
    </div>
  </div>
`;

const pickupIcon = createCustomIcon(pickupSvg, [32, 32], [16, 16]);
const destinationIcon = createCustomIcon(destinationSvg, [32, 32], [16, 16]);
const driverIcon = createCustomIcon(driverSvg, [40, 40], [20, 20]);

export interface OrderMapProps {
  pickupLat: number;
  pickupLng: number;
  destinationLat: number;
  destinationLng: number;
  driverLat?: number | null;
  driverLng?: number | null;
}

function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [60, 60], animate: true });
    }
  }, [map, bounds]);
  return null;
}

export default function OrderMap({
  pickupLat = -7.2575,
  pickupLng = 112.7521,
  destinationLat = -7.2891,
  destinationLng = 112.7344,
  driverLat,
  driverLng,
}: OrderMapProps) {
  const pickupCoords: [number, number] = [pickupLat, pickupLng];
  const destCoords: [number, number] = [destinationLat, destinationLng];

  const coordsList: [number, number][] = [pickupCoords, destCoords];
  if (driverLat && driverLng) {
    coordsList.push([driverLat, driverLng]);
  }

  const bounds: L.LatLngBoundsExpression = coordsList;

  return (
    <div className="w-full h-72 rounded-3xl overflow-hidden border border-slate-100 shadow-md relative z-0">
      <MapContainer
        center={pickupCoords}
        zoom={14}
        scrollWheelZoom={false}
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <Marker position={pickupCoords} icon={pickupIcon}>
          <Popup className="custom-popup">Lokasi Penjemputan (A)</Popup>
        </Marker>

        <Marker position={destCoords} icon={destinationIcon}>
          <Popup className="custom-popup">Lokasi Tujuan (B)</Popup>
        </Marker>

        {driverLat && driverLng && (
          <Marker position={[driverLat, driverLng]} icon={driverIcon}>
            <Popup className="custom-popup">Driver GASKE (Sektor Terdekat)</Popup>
          </Marker>
        )}

        <Polyline
          positions={driverLat && driverLng ? [[driverLat, driverLng], pickupCoords, destCoords] : [pickupCoords, destCoords]}
          color="#059669"
          weight={5}
          opacity={0.8}
        />

        <FitBounds bounds={bounds} />
      </MapContainer>
    </div>
  );
}