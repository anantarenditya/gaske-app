'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MessageCircle, MessageSquare, MapPin, ArrowLeft, CheckCircle, Loader2, Navigation, Map } from 'lucide-react';

export default function DriverOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id;

  const [order, setOrder] = useState<any>(null);
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchOrderDetails() {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

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
  }, [orderId]);

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
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!order) {
    return <div className="p-8 text-center text-white">Pesanan tidak ditemukan.</div>;
  }

  const waNumber = formatWhatsAppNumber(customerPhone);
  const waText = `Halo ${order.customer_name || 'Customer'}, saya Driver GASKE untuk pesanan ${order.service}. Segera meluncur!`;
  const waLink = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}` : '#';

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-xl mx-auto space-y-6">
        <Link href="/driver/dashboard" className="flex items-center gap-2 text-emerald-400 font-bold hover:underline mb-6">
          <ArrowLeft className="w-5 h-5" /> Kembali ke Dashboard
        </Link>

        <div className="bg-white p-6 rounded-3xl shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">{order.service || 'GASKE RIDE'}</h2>
              <p className="text-sm text-slate-500 font-medium">Resi: {order.order_number || order.id.slice(0, 8)}</p>
            </div>
            <span className="bg-emerald-100 text-emerald-700 font-bold text-xs px-3 py-1 rounded-full uppercase">
              {order.status || 'Aktif'}
            </span>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <UserIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Informasi Customer</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {order.customer_name || 'Customer'}
                </p>
                <p className="text-xs text-slate-600 font-semibold mt-1">
                  📞 {customerPhone || 'Nomor tidak tersedia'}
                </p>
              </div>
            </div>

            {/* --- ALAMAT JEMPUT & TOMBOL MAPS --- */}
            <div className="flex gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 relative">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-sm">A</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Lokasi Jemput (A)</p>
                <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-3">{order.pickup_address}</p>
                
                {order.pickup_lat && order.pickup_lng && (
                  <button 
                    onClick={() => openGoogleMaps(order.pickup_lat, order.pickup_lng)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200 py-2 rounded-xl font-bold text-[11px] transition"
                  >
                    <Map className="w-3.5 h-3.5" /> Arahkan ke Titik A via Google Maps
                  </button>
                )}
              </div>
            </div>

            {/* --- ALAMAT TUJUAN & TOMBOL MAPS --- */}
            <div className="flex gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 relative">
              <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-sm">B</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Lokasi Tujuan (B)</p>
                <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-3">{order.destination_address}</p>
                
                {order.destination_lat && order.destination_lng && (
                  <button 
                    onClick={() => openGoogleMaps(order.destination_lat, order.destination_lng)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-200 py-2 rounded-xl font-bold text-[11px] transition"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Arahkan ke Titik B via Google Maps
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <Link
              href={`/driver/chat/${orderId}`}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-md"
            >
              <MessageSquare className="w-5 h-5" /> Live Chat di Aplikasi
            </Link>

            {waNumber ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-md"
              >
                <MessageCircle className="w-5 h-5" /> Hubungi via WhatsApp
              </a>
            ) : (
              <button disabled className="w-full bg-slate-200 text-slate-400 font-bold py-3.5 rounded-xl cursor-not-allowed">
                WhatsApp Customer Tidak Tersedia
              </button>
            )}
          </div>

          <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg">
            <CheckCircle className="w-5 h-5" /> Selesaikan Pesanan
          </button>
        </div>
      </div>
    </div>
  );
}

function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}