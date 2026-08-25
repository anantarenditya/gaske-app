'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2 } from 'lucide-react';

// Ikon khusus untuk motor Driver
const motorIcon = L.divIcon({
  html: `<div class="w-10 h-10 bg-white rounded-full border-2 border-emerald-500 shadow-xl flex items-center justify-center text-xl animate-pulse">🏍️</div>`,
  className: 'custom-motor-pin',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

export default function CustomerTracking({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // 1. Ambil lokasi driver saat halaman pertama kali dibuka
    const fetchInitialData = async () => {
      const { data } = await supabase
        .from('orders')
        .select('driver_lat, driver_lng')
        .eq('id', params.id)
        .single();
        
      if (data && data.driver_lat && data.driver_lng) {
        setDriverLocation({ lat: data.driver_lat, lng: data.driver_lng });
      }
    };
    fetchInitialData();

    // 2. Subscribe ke Supabase Realtime untuk memantau pergerakan
    const channel = supabase.channel(`tracking_order_${params.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', // Hanya dengarkan event update
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${params.id}`, // Hanya order ini saja
        },
        (payload) => {
          const newData = payload.new as any;
          if (newData.driver_lat && newData.driver_lng) {
            // Update state, peta Leaflet akan otomatis menggeser motor!
            setDriverLocation({ lat: newData.driver_lat, lng: newData.driver_lng });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.id, supabase]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <div className="bg-slate-800 p-5 shadow-lg z-10">
        <h1 className="text-white font-bold text-lg">Live Tracking Driver</h1>
        <p className="text-emerald-400 text-xs">Driver sedang menuju ke lokasi Anda...</p>
      </div>

      <div className="flex-1 w-full relative">
        {driverLocation ? (
          <MapContainer 
            center={[driverLocation.lat, driverLocation.lng]} 
            zoom={16} 
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {/* Titik Motor Driver yang akan bergerak sendiri */}
            <Marker position={[driverLocation.lat, driverLocation.lng]} icon={motorIcon}>
              <Popup>Driver Anda di sini!</Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-emerald-500" />
            <p className="text-sm">Menunggu koneksi GPS dari Driver...</p>
          </div>
        )}
      </div>
    </div>
  );
}