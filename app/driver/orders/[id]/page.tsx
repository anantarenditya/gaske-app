'use client';

import { use } from 'react';
import Link from 'next/link';
import { MessageCircle, MapPin, User, ArrowLeft, CheckCircle } from 'lucide-react';

export default function DriverOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id;

  // TODO: Nanti ganti dengan data asli dari Supabase
  const mockOrderData = {
    service: 'GASKE FOOD',
    customer_name: 'Andi Pratama',
    customer_phone: '085799998888', // Nomor dari customer
    pickup_address: 'Warteg Bahari, Jl. Merdeka No 1',
    dropoff_address: 'Kos Mahasiswa, Jl. Sudirman No 10',
  };

  // 1. Fungsi perapih nomor WA
  const formatWhatsAppNumber = (phone: string) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, ''); 
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1); 
    }
    return cleaned;
  };

  // 2. Terapkan fungsi ke nomor customer
  const waNumber = formatWhatsAppNumber(mockOrderData.customer_phone);
  const waText = `Halo Bapak/Ibu ${mockOrderData.customer_name}, saya Driver GASKE pesanan Anda. Saya segera meluncur ke lokasi!`;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-xl mx-auto space-y-6">
        <Link href="/driver/dashboard" className="flex items-center gap-2 text-emerald-400 font-bold hover:underline mb-6">
          <ArrowLeft className="w-5 h-5" /> Kembali ke Dashboard
        </Link>

        <div className="bg-white p-6 rounded-3xl shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">{mockOrderData.service}</h2>
              <p className="text-sm text-slate-500 font-medium">Order ID: #{orderId.substring(0,6)}</p>
            </div>
            <span className="bg-emerald-100 text-emerald-700 font-bold text-xs px-3 py-1 rounded-full">Aktif</span>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Ambil di (Pickup)</p>
                <p className="text-sm font-medium text-slate-900">{mockOrderData.pickup_address}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Antar ke (Dropoff)</p>
                <p className="text-sm font-medium text-slate-900">{mockOrderData.dropoff_address}</p>
              </div>
            </div>
          </div>

          {/* 3. Tombol WhatsApp ke Customer */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mb-3 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <MessageCircle className="w-5 h-5" /> Chat Customer 
          </a>

          <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer">
            <CheckCircle className="w-5 h-5" /> Selesaikan Pesanan
          </button>
        </div>
      </div>
    </div>
  );
}