'use client';

import Link from 'next/link';
import { ArrowRight, Bike, Package, Utensils, ShoppingBag, ShieldCheck, Tag, Smartphone, Star, MapPin, Search, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* NAVBAR */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Bike className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-emerald-700">GASKE</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition">
                Masuk
              </Link>
              <Link href="/register" className="text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full shadow-md shadow-emerald-200 transition">
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* HERO SECTION */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-4 max-w-7xl mx-auto text-center flex flex-col items-center">
          <span className="bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black tracking-widest uppercase mb-6 shadow-sm border border-emerald-200">
            Transportasi & Pengiriman Lokal
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl">
            Mau ke mana? <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">GASKE.</span>
          </h1>
          <p className="mt-6 text-base md:text-xl text-slate-500 max-w-2xl font-medium">
            Satu aplikasi untuk semua kebutuhan harian Anda. Transportasi cepat, pesan antar makanan, hingga belanja kebutuhan instan.
          </p>
          
          {/* Tombol diarahkan ke Login */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto px-4">
            <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-200 transition group">
              Pesan Sekarang <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>
            <Link href="/driver/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 transition">
              Jadi Mitra Driver
            </Link>
          </div>
        </section>

        {/* LAYANAN KAMI (SERVICES) - Semuanya diarahkan ke Login */}
        <section className="py-16 md:py-24 bg-white px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Layanan Kami</h2>
              <p className="text-slate-500 mt-3 font-medium">Solusi lengkap untuk segala aktivitas Anda.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* RIDE */}
              <Link href="/login" className="group p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-100 transition duration-300">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                  <Bike className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">GASKE RIDE</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6">
                  Layanan antar jemput menggunakan sepeda motor. Cepat, anti macet, dan pasti sampai tujuan.
                </p>
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Pesan Ride <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              {/* SEND */}
              <Link href="/login" className="group p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-rose-500 hover:shadow-2xl hover:shadow-rose-100 transition duration-300">
                <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                  <Package className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">GASKE SEND</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6">
                  Kirim paket, dokumen, atau barang dengan aman dan kilat langsung ke tangan penerima.
                </p>
                <span className="text-sm font-bold text-rose-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Kirim Barang <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              {/* FOOD */}
              <Link href="/login" className="group p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-100 transition duration-300">
                <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                  <Utensils className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">GASKE FOOD</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6">
                  Jastip beli makanan favorit Anda dari warung atau restoran terdekat tanpa harus antri.
                </p>
                <span className="text-sm font-bold text-amber-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Pesan Makanan <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              {/* MART */}
              <Link href="/login" className="group p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 transition duration-300">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">GASKE MART</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6">
                  Titip belanja kebutuhan minimarket instan. Driver kami akan membelikan pesanan Anda.
                </p>
                <span className="text-sm font-bold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Mulai Belanja <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* CARA KERJA (HOW IT WORKS) */}
        <section className="py-16 md:py-24 bg-slate-50 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Cara Kerja</h2>
              <p className="text-slate-500 mt-3 font-medium">Langkah mudah menggunakan aplikasi GASKE.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { step: '01', title: 'Pilih Layanan', icon: <Search className="w-5 h-5" /> },
                { step: '02', title: 'Atur Lokasi GPS', icon: <MapPin className="w-5 h-5" /> },
                { step: '03', title: 'Pesan & Bayar', icon: <Smartphone className="w-5 h-5" /> },
                { step: '04', title: 'Driver Menerima', icon: <CheckCircle2 className="w-5 h-5" /> },
                { step: '05', title: 'Live Tracking', icon: <Bike className="w-5 h-5" /> },
                { step: '06', title: 'Selesai', icon: <Star className="w-5 h-5" /> },
              ].map((item, index) => (
                <div key={index} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
                  <div className="text-emerald-500 mb-3">{item.icon}</div>
                  <span className="text-xs font-black text-emerald-600 mb-1">{item.step}</span>
                  <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KEUNTUNGAN (BENEFITS) */}
        <section className="py-16 md:py-24 bg-white px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Keuntungan GASKE</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: <ShieldCheck />, title: 'Driver Terverifikasi', desc: 'Identitas driver terjamin aman dan perjalanan terpantau sistem.' },
                { icon: <Tag />, title: 'Harga Transparan', desc: 'Tarif pasti di awal, tanpa ada biaya tersembunyi yang mengagetkan.' },
                { icon: <Smartphone />, title: 'Mudah Digunakan', desc: 'UI simpel, pesan layanan hanya dalam beberapa kali klik.' },
                { icon: <MapPin />, title: 'Live Tracking GPS', desc: 'Pantau posisi driver secara realtime tepat di atas peta.' },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center p-6">
                  <div className="w-16 h-16 bg-slate-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    {item.icon}
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA MITRA DRIVER */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto bg-emerald-900 rounded-[2.5rem] p-8 md:p-16 text-center shadow-2xl relative overflow-hidden">
            {/* Ornamen Latar Belakang */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute w-96 h-96 bg-emerald-400 rounded-full blur-3xl -top-20 -left-20"></div>
              <div className="absolute w-96 h-96 bg-teal-400 rounded-full blur-3xl -bottom-20 -right-20"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">Jadi Mitra Driver</h2>
              <p className="text-emerald-100 text-sm md:text-lg max-w-xl font-medium mb-8">
                Gunakan motor Anda untuk mendapatkan penghasilan tambahan secara fleksibel. Jadilah bos untuk diri Anda sendiri.
              </p>
              <Link href="/driver/register" className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-10 py-4 rounded-full shadow-xl transition-all hover:scale-105 hover:shadow-emerald-500/30">
                Daftar Jadi Mitra Sekarang
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-300 py-12 md:py-16 px-4 border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Bike className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-white">GASKE</span>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              Platform transportasi dan pengiriman lokal terpercaya dan tercepat di kota Anda.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Layanan</h4>
            <ul className="space-y-3 text-sm font-medium text-slate-400">
              <li><Link href="/login" className="hover:text-emerald-400 transition">GASKE RIDE</Link></li>
              <li><Link href="/login" className="hover:text-emerald-400 transition">GASKE SEND</Link></li>
              <li><Link href="/login" className="hover:text-emerald-400 transition">GASKE FOOD</Link></li>
              <li><Link href="/login" className="hover:text-emerald-400 transition">GASKE MART</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Bantuan & Legal</h4>
            <ul className="space-y-3 text-sm font-medium text-slate-400">
              <li><Link href="#" className="hover:text-emerald-400 transition">Pusat Bantuan</Link></li>
              <li><Link href="#" className="hover:text-emerald-400 transition">Syarat & Ketentuan</Link></li>
              <li><Link href="#" className="hover:text-emerald-400 transition">Kebijakan Privasi</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Kontak</h4>
            <ul className="space-y-3 text-sm font-medium text-slate-400">
              <li>support@gaske.id</li>
              <li>0812-3456-7890</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-xs font-medium text-slate-600">
          © {new Date().getFullYear()} GASKE. All rights reserved.
        </div>
      </footer>
    </div>
  );
}