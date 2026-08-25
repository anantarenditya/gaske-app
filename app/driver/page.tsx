'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 font-sans relative">
      {/* Navbar Atas */}
      <header className="flex justify-between items-center max-w-md mx-auto w-full py-4 relative z-30">
        <div className="text-2xl font-black text-emerald-600 tracking-tight">GASKE</div>
        <div className="flex gap-3 items-center">
          <button 
            onClick={() => router.push('/login')} 
            className="text-sm font-semibold text-slate-700 hover:text-emerald-600 px-3 py-1.5 cursor-pointer"
          >
            Masuk
          </button>
          <button 
            onClick={() => router.push('/register')} 
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-full shadow-sm hover:bg-emerald-700 transition cursor-pointer"
          >
            Daftar
          </button>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="max-w-md mx-auto w-full text-center space-y-6 my-auto relative z-30">
        <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider">
          Transportasi & Pengiriman Lokal
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Mau ke mana? <span className="text-emerald-600">GASKE.</span>
        </h1>
        
        <p className="text-sm text-slate-600 leading-relaxed">
          Satu aplikasi untuk semua kebutuhan harian Anda. Transportasi cepat, pesan antar makanan, hingga belanja kebutuhan instan.
        </p>

        <div className="space-y-3 pt-4">
          {/* Tombol Pesan Sekarang (Customer) */}
          <button 
            onClick={() => router.push('/register')}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            Pesan Sekarang <ArrowRight className="w-4 h-4" />
          </button>

          {/* Tombol Jadi Mitra Driver (Dijamin 100% Responsif) */}
          <button 
            onClick={() => router.push('/driver/register')}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            Jadi Mitra Driver
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[10px] text-slate-400 py-2 relative z-30">
        &copy; {new Date().getFullYear()} GASKE. All rights reserved.
      </footer>
    </div>
  );
}