'use client';

import { use } from 'react';
import Link from 'next/link';
import { MessageCircle, MapPin, Bike, ArrowLeft } from 'lucide-react';

export default function CustomerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Mengambil ID pesanan dari URL (Next.js 15 / React 19 menggunakan use())
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id;

  // TODO: Nanti ganti dengan data asli dari Supabase berdasarkan 'orderId'
  const mockOrderData = {
    status: 'Menuju Lokasi Penjemputan',
    driver_name: 'Budi Santoso',
    driver_phone: '0812-3456-7890', // Nomor asli yang belum rapi
    plate_number: 'N 1234 AB',
  };

  // 1. Fungsi perapih nomor WA
  const formatWhatsAppNumber = (phone: string) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, ''); // Hapus selain angka
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1); // Ubah awalan 0 jadi 62
    }
    return cleaned;
  };

  // 2. Terapkan fungsi ke nomor driver
  const waNumber = formatWhatsAppNumber(mockOrderData.driver_phone);
  const waText = `Halo Bapak/Ibu ${mockOrderData.driver_name}, saya customer GASKE (Order ID: ${orderId}). Apakah sudah dekat?`;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-xl mx-auto space-y-6">
        <Link href="/" className="flex items-center gap-2 text-emerald-600 font-bold hover:underline mb-6">
          <ArrowLeft className="w-5 h-5" /> Kembali
        </Link>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-1">Status Pesanan</h2>
          <p className="text-sm font-medium text-emerald-600 mb-6">{mockOrderData.status}</p>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl mb-6">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">{mockOrderData.driver_name}</h4>
              <p className="text-xs text-slate-500 font-medium">{mockOrderData.plate_number}</p>
            </div>
          </div>

          {/* 3. Tombol WhatsApp yang sudah benar */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <MessageCircle className="w-5 h-5" /> Chat Driver via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}