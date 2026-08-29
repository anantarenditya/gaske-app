'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MessageCircle, MessageSquare, MapPin, ArrowLeft, CheckCircle, Loader2, Navigation, Map } from 'lucide-react';
import { formatRupiah } from '@/lib/utils/format';

export default function DriverOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!orderId) return;

      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        console.error("Gagal mengambil data pesanan:", error);
      }

      if (orderData) {
        setOrder(orderData);

        if (orderData.customer_id) {
          const { data: customerProfile } = await supabase
            .from('profiles')
            .select('phone_number, full_name')
            .eq('id', orderData.customer_id)
            .single();

          if (customerProfile) {
            setCustomerPhone(customerProfile.phone_number || '');
            setOrder((prev: any) => ({ ...prev, customer_name: customerProfile.full_name }));
          }
        }
      }
      setLoading(false);
    }

    fetchOrderDetails();
  }, [orderId, supabase]);

  const handleCompleteOrder = async () => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'COMPLETED' })
      .eq('id', orderId);

    if (error) {
      alert('Gagal menyelesaikan pesanan: ' + error.message);
    } else {
      alert('Pesanan berhasil diselesaikan!');
      window.location.reload();
    }
  };

  const formatWhatsAppNumber = (phone: string) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    return cleaned;
  };

  const openGoogleMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4 p-8 text-center text-white">
        <p className="text-lg font-bold text-slate-300">Pesanan tidak ditemukan atau ID salah.</p>
        <Link href="/driver/orders/history" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">
          Kembali ke Riwayat
        </Link>
      </div>
    );
  }

  const isActive = order.status && order.status !== 'COMPLETED' && order.status !== 'CANCELLED';

  const waNumber = formatWhatsAppNumber(customerPhone);
  const waText = `Halo ${order.customer_name || 'Customer'}, saya Driver GASKE untuk pesanan ${order.service}.`;
  const waLink = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}` : '#';

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 font-sans text-slate-100">
      <div className="max-w-xl mx-auto space-y-6">
        <Link href="/driver/orders/history" className="flex items-center gap-2 text-blue-400 font-bold hover:underline mb-6">
          <ArrowLeft className="w-5 h-5" /> Kembali
        </Link>

        <div className="bg-slate-800/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/60 shadow-xl space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black text-white">{order.service || 'GASKE'}</h2>
              <p className="text-sm text-slate-400 font-medium">Resi: {order.order_number || order.id.slice(0, 8)}</p>
            </div>
            <span className={`font-bold text-xs px-3 py-1 rounded-full uppercase ${order.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-amber-500/15 text-amber-400'}`}>
              {order.status || 'Aktif'}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Informasi Customer</p>
                <p className="text-sm font-bold text-white mt-0.5">{order.customer_name || 'Customer'}</p>
                <p className="text-xs text-slate-300 font-semibold mt-1">📞 {customerPhone || 'Nomor tidak tersedia'}</p>
              </div>
            </div>

            {/* --- ALAMAT JEMPUT --- */}
            <div className="flex gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50 relative">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-sm">A</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Lokasi Jemput (A)</p>
                <p className="text-xs font-bold text-slate-200 mt-1">{order.pickup_address}</p>
                
                {isActive && order.pickup_lat && order.pickup_lng && (
                  <button 
                    onClick={() => openGoogleMaps(order.pickup_lat, order.pickup_lng)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 py-2 rounded-xl font-bold text-[11px] transition"
                  >
                    <Map className="w-3.5 h-3.5" /> Arahkan ke Titik A via Google Maps
                  </button>
                )}
              </div>
            </div>

            {/* --- ALAMAT TUJUAN --- */}
            <div className="flex gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50 relative">
              <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-sm">B</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Lokasi Tujuan (B)</p>
                <p className="text-xs font-bold text-slate-200 mt-1">{order.destination_address}</p>
                
                {isActive && order.destination_lat && order.destination_lng && (
                  <button 
                    onClick={() => openGoogleMaps(order.destination_lat, order.destination_lng)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 py-2 rounded-xl font-bold text-[11px] transition"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Arahkan ke Titik B via Google Maps
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50 space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Metode Pembayaran</span>
              <span className="font-bold text-slate-200">{order.payment_method}</span>
            </div>
            <div className="flex justify-between items-center pt-1 text-sm">
              <span className="font-black text-slate-300">Pendapatan</span>
              <span className="font-black text-blue-400 text-base">{formatRupiah(order.final_price || order.estimated_price || 0)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href={`/driver/chat/${orderId}`}
              className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-md text-xs border border-slate-700"
            >
              <MessageSquare className="w-4 h-4" /> Live Chat di Aplikasi
            </Link>

            {waNumber ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition text-xs shadow-sm"
              >
                <MessageCircle className="w-4 h-4" /> Hubungi via WhatsApp
              </a>
            ) : (
              <button disabled className="w-full bg-slate-800 text-slate-500 font-bold py-3.5 rounded-xl cursor-not-allowed text-xs border border-slate-700">
                WhatsApp Customer Tidak Tersedia
              </button>
            )}
          </div>

          {isActive && (
            <button 
              onClick={handleCompleteOrder}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg text-xs"
            >
              <CheckCircle className="w-5 h-5" /> Selesaikan Pesanan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}