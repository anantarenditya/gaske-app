'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2 } from 'lucide-react';
import Notification from '@/components/Notification';

// Ikon khusus untuk motor Driver
const motorIcon = L.divIcon({
  html: `<div class="w-10 h-10 bg-white rounded-full border-2 border-emerald-500 shadow-xl flex items-center justify-center text-xl animate-pulse">🏍️</div>`,
  className: 'custom-motor-pin',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

export default function CustomerTracking({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Kompatibilitas aman untuk Next.js 15+ dan 16+
  const resolvedParams = 'then' in params ? use(params) : params;
  const orderId = resolvedParams.id;

  const router = useRouter();
  const supabase = createClient();
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>('');

  // State untuk Notifikasi Melayang
  const [notif, setNotif] = useState({
    show: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'info' | 'warning',
  });

  const showNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setNotif({ show: true, title, message, type });
    setTimeout(() => {
      setNotif((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  useEffect(() => {
    // 1. Ambil data awal order (lokasi & status) saat halaman dibuka
    const fetchInitialData = async () => {
      const { data } = await supabase
        .from('orders')
        .select('driver_lat, driver_lng, status')
        .eq('id', orderId)
        .single();
        
      if (data) {
        if (data.driver_lat && data.driver_lng) {
          setDriverLocation({ lat: data.driver_lat, lng: data.driver_lng });
        }
        if (data.status) {
          setOrderStatus(data.status);
        }
      }
    };
    fetchInitialData();

    // 2. Subscribe ke Supabase Realtime untuk memantau pergerakan & status
    const channel = supabase.channel(`tracking_order_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const newData = payload.new as any;
          
          // Update koordinat GPS jika ada
          if (newData.driver_lat && newData.driver_lng) {
            setDriverLocation({ lat: newData.driver_lat, lng: newData.driver_lng });
          }

          // Deteksi perubahan status pesanan untuk memunculkan notifikasi
          if (newData.status && newData.status !== orderStatus) {
            setOrderStatus(newData.status);

            if (newData.status === 'DRIVER_ARRIVED') {
              showNotification('Driver Tiba!', 'Driver sudah berada di lokasi penjemputan Anda.', 'info');
            } else if (newData.status === 'IN_TRIP') {
              showNotification('Dalam Perjalanan', 'Perjalanan menuju tujuan telah dimulai.', 'success');
            } else if (newData.status === 'COMPLETED') {
              showNotification('Pesanan Selesai', 'Terima kasih telah menggunakan layanan GASKE!', 'success');
              setTimeout(() => {
                router.push('/customer');
              }, 2000);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, supabase, orderStatus, router]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'Driver sedang menuju tempat jemput...';
      case 'DRIVER_ARRIVED': return 'Driver sudah tiba di lokasi jemput!';
      case 'IN_TRIP': return 'Perjalanan menuju tujuan...';
      case 'COMPLETED': return 'Pesanan telah selesai.';
      default: return 'Melacak posisi driver...';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col relative">
      
      {/* KONTROL NOTIFIKASI MELAYANG */}
      <Notification 
        show={notif.show} 
        title={notif.title} 
        message={notif.message} 
        type={notif.type} 
        onClose={() => setNotif({ ...notif, show: false })} 
      />

      <div className="bg-slate-800 p-5 shadow-lg z-10 border-b border-slate-700">
        <h1 className="text-white font-black text-base">Live Tracking Driver</h1>
        <p className="text-emerald-400 text-xs font-medium mt-0.5">{getStatusText(orderStatus)}</p>
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
            <p className="text-xs font-bold">Menunggu koneksi GPS dari Driver...</p>
          </div>
        )}
      </div>
    </div>
  );
}