'use client';

import { useRouter } from 'next/navigation';
import { Bike, Package, Utensils, ShoppingBag, ShieldCheck, Tag, Smartphone, Star, MapPin, Search, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* NAVBAR */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* LOGO KOTAK HURUF G */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md border border-blue-300/30">
                <span className="text-white font-black text-xl tracking-tighter">G</span>
              </div>
              <span className="font-black text-2xl tracking-[0.1em] text-blue-700">GASKE</span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <button onClick={() => router.push('/login')} className="text-sm font-bold text-slate-600 hover:text-blue-600 transition cursor-pointer">
                Masuk
              </button>
              <button onClick={() => router.push('/register')} className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full shadow-md shadow-blue-200 transition cursor-pointer">
                Daftar
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* HERO SECTION */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-4 max-w-7xl mx-auto text-center flex flex-col items-center">
          <span className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black tracking-widest uppercase mb-6 shadow-sm border border-blue-200">
            Transportasi & Pengiriman Lokal
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl">
            Mau ke mana? <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">GASKE.</span>
          </h1>
          <p className="mt-6 text-base md:text-xl text-slate-500 max-w-2xl font-medium">
            Satu aplikasi untuk semua kebutuhan harian Anda. Transportasi cepat, pesan antar makanan, hingga belanja kebutuhan instan.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto px-4">
            <button onClick={() => router.push('/register')} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 transition group cursor-pointer">
              Pesan Sekarang <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </section>

        {/* LAYANAN KAMI (SERVICES) */}
        <section className="py-16 md:py-24 bg-white px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Layanan Kami</h2>
              <p className="text-slate-500 mt-3 font-medium">Solusi lengkap untuk segala aktivitas Anda.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div onClick={() => router.push('/register')} className="group p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 transition duration-300 cursor-pointer">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                  <Bike className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">GASKE RIDE</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6">
                  Layanan antar jemput menggunakan sepeda motor. Cepat, anti macet, dan pasti sampai tujuan.
                </p>
                <span className="text-sm font-bold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Pesan Ride <ArrowRight className="w-4 h-4" />
                </span>
              </div>

              <div onClick={() => router.push('/register')} className="group p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-rose-500 hover:shadow-2xl hover:shadow-rose-100 transition duration-300 cursor-pointer">
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
              </div>

              <div onClick={() => router.push('/register')} className="group p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-100 transition duration-300 cursor-pointer">
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
              </div>

              <div onClick={() => router.push('/register')} className="group p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100 transition duration-300 cursor-pointer">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">GASKE MART</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6">
                  Titip belanja kebutuhan minimarket instan. Driver kami akan membelikan pesanan Anda.
                </p>
                <span className="text-sm font-bold text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Mulai Belanja <ArrowRight className="w-4 h-4" />
                </span>
              </div>
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
                  <div className="text-blue-500 mb-3">{item.icon}</div>
                  <span className="text-xs font-black text-blue-600 mb-1">{item.step}</span>
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
                  <div className="w-16 h-16 bg-slate-50 text-blue-600 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    {item.icon}
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-300 py-12 md:py-16 px-4 border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            
            {/* LOGO KOTAK HURUF G (FOOTER) */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                <span className="text-white font-black text-xl tracking-tighter">G</span>
              </div>
              <span className="font-black text-2xl tracking-[0.1em] text-white">GASKE</span>
            </div>

            <p className="text-sm text-slate-500 font-medium">
              Platform transportasi dan pengiriman lokal terpercaya dan tercepat di kota Anda.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Layanan</h4>
            <ul className="space-y-3 text-sm font-medium text-slate-400">
              <li><span onClick={() => router.push('/login')} className="hover:text-blue-400 transition cursor-pointer">GASKE RIDE</span></li>
              <li><span onClick={() => router.push('/login')} className="hover:text-blue-400 transition cursor-pointer">GASKE SEND</span></li>
              <li><span onClick={() => router.push('/login')} className="hover:text-blue-400 transition cursor-pointer">GASKE FOOD</span></li>
              <li><span onClick={() => router.push('/login')} className="hover:text-blue-400 transition cursor-pointer">GASKE MART</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Bantuan & Legal</h4>
            <ul className="space-y-3 text-sm font-medium text-slate-400">
              <li><span className="hover:text-blue-400 transition cursor-pointer">Pusat Bantuan</span></li>
              <li><span className="hover:text-blue-400 transition cursor-pointer">Syarat & Ketentuan</span></li>
              <li><span className="hover:text-blue-400 transition cursor-pointer">Kebijakan Privasi</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Kontak</h4>
            <ul className="space-y-3 text-sm font-medium text-slate-400">
              <li>support@gaske.id</li>
              <li>Layanan Resmi GASKE Indonesia</li>
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