'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MessageCircle, MessageSquare, MapPin, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'; // Tambah MessageSquare

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
  const waText = `Halo ${order.customer_name || 'Customer'}, saya Driver GASKE untuk pesanan ${order.order_number}. Saya segera meluncur!`;
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
              <p className="text-sm text-slate-500 font-medium">Resi: {order.order_number}</p>
            </div>
            <span className="bg-emerald-100 text-emerald-700 font-bold text-xs px-3 py-1 rounded-full">Aktif</span>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Customer</p>
                <p className="text-sm font-medium text-slate-900">{order.customer_name || 'Tanpa Nama'} ({customerPhone || 'Tidak ada nomor'})</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {/* Tombol In-App Chat Baru */}
            <Link
              href={`/driver/chat/${orderId}`}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-md"
            >
              <MessageSquare className="w-5 h-5" /> Live Chat di Aplikasi
            </Link>

            {/* Tombol WhatsApp (Cadangan) */}
            {waNumber ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <MessageCircle className="w-5 h-5" /> Hubungi via WhatsApp
              </a>
            ) : (
              <button disabled className="w-full bg-slate-200 text-slate-400 font-bold py-3.5 rounded-xl cursor-not-allowed">
                WhatsApp Customer Tidak Tersedia
              </button>
            )}
          </div>

          <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer">
            <CheckCircle className="w-5 h-5" /> Selesaikan Pesanan
          </button>
        </div>
      </div>
    </div>
  );
}