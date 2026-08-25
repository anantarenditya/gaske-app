'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MessageCircle, Bike, ArrowLeft, Loader2 } from 'lucide-react';

export default function CustomerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id;

  const [order, setOrder] = useState<any>(null);
  const [driverPhone, setDriverPhone] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchOrderDetails() {
      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderData) {
        setOrder(orderData);

        if (orderData.driver_id) {
          const { data: driverProfile } = await supabase
            .from('profiles')
            .select('phone_number, full_name') // Mengambil phone_number
            .eq('id', orderData.driver_id)
            .single();

          if (driverProfile) {
            setDriverPhone(driverProfile.phone_number || '');
            setOrder((prev: any) => ({ ...prev, driver_name: driverProfile.full_name }));
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!order) {
    return <div className="p-8 text-center">Pesanan tidak ditemukan.</div>;
  }

  const waNumber = formatWhatsAppNumber(driverPhone);
  const waText = `Halo ${order.driver_name || 'Driver'}, saya customer GASKE (Order: ${order.order_number}). Apakah sudah dekat?`;
  const waLink = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}` : '#';

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-xl mx-auto space-y-6">
        <Link href="/" className="flex items-center gap-2 text-emerald-600 font-bold hover:underline mb-6">
          <ArrowLeft className="w-5 h-5" /> Kembali
        </Link>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-1">Status Pesanan</h2>
          <p className="text-sm font-medium text-emerald-600 mb-6">Nomor Resi: {order.order_number}</p>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl mb-6">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">{order.driver_name || 'Mencari Driver...'}</h4>
              <p className="text-xs text-slate-500 font-medium">{driverPhone ? driverPhone : 'Belum ada nomor driver'}</p>
            </div>
          </div>

          {waNumber ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-5 h-5" /> Chat Driver via WhatsApp
            </a>
          ) : (
            <button disabled className="w-full bg-slate-200 text-slate-400 font-bold py-3.5 rounded-xl cursor-not-allowed">
              Driver Belum Menerima Pesanan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}