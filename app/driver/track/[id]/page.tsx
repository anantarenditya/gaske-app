'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DriverActiveOrder({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    let watchId: number;

    const startTracking = async () => {
      setIsTracking(true);
      
      // watchPosition akan terus memantau pergerakan HP secara realtime
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Update lokasi terbaru driver ke tabel orders di Supabase
          await supabase
            .from('orders')
            .update({ driver_lat: lat, driver_lng: lng })
            .eq('id', params.id);
            
          console.log("Lokasi terkirim ke server:", lat, lng);
        },
        (error) => {
          console.error("Gagal melacak driver:", error);
        },
        { 
          enableHighAccuracy: true, 
          maximumAge: 0, 
          timeout: 5000 
        }
      );
    };

    startTracking();

    // Matikan pelacakan GPS saat driver menutup halaman atau pesanan selesai
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [params.id, supabase]);

  return (
    <div className="p-5 text-center">
      <h2 className="text-xl font-bold">Sedang Mengantar Pesanan...</h2>
      <p className="text-sm text-slate-500 mt-2">
        {isTracking ? "🟢 GPS Aktif - Membagikan lokasi Anda ke Customer" : "🔴 Menunggu Sinyal GPS..."}
      </p>
    </div>
  );
}