'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MessageCircle, MessageSquare, Bike, ArrowLeft, Loader2 } from 'lucide-react';

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
            .select('phone_number, full_name')
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
  }, [orderId, supabase]);

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
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!order) {
    return <div className="min-h-screen bg-slate-900 p-8 text-center text-slate-100 flex items-center justify-center font-bold">Pesanan tidak ditemukan.</div>;
  }

  const waNumber = formatWhatsAppNumber(driverPhone);
  const waText = `Halo ${order.driver_name || 'Driver'}, saya customer GASKE (Order: ${order.order_number}). Apakah sudah dekat?`;
  const waLink = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}` : '#';

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 font-sans text-slate-100">
      <div className="max-w-xl mx-auto space-y-6">
        <Link href="/" className="flex items-center gap-2 text-blue-400 font-bold hover:underline mb-6">
          <ArrowLeft className="w-5 h-5" /> Kembali
        </Link>

        <div className="bg-slate-800/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/60 shadow-xl">
          <h2 className="text-xl font-black text-white mb-1">Status Pesanan</h2>
          <p className="text-sm font-medium text-blue-400 mb-6">Nomor Resi: {order.order_number}</p>

          <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-2xl mb-6 border border-slate-700/50">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 border border-blue-500/25 rounded-full flex items-center justify-center">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white">{order.driver_name || 'Mencari Driver...'}</h4>
              <p className="text-xs text-slate-400 font-medium">{driverPhone ? driverPhone : 'Belum ada nomor driver'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href={`/customer/chat/${orderId}`}
              className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-md border border-slate-700 text-xs"
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
                WhatsApp Driver Belum Tersedia
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}