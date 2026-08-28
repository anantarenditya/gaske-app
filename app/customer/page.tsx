'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Notification from '@/components/Notification';
import { Bike, Package, Utensils, ShoppingBag, Loader2, MapPin, Clock, MessageCircle, LogOut, Navigation2, ShieldCheck, History, Star, Send, User, MessageSquare } from 'lucide-react';
import { formatRupiah } from '@/lib/utils/format';

interface Order {
  id: string;
  service: string;
  status: string;
  pickup_address: string;
  destination_address: string;
  final_price: number;
  rating?: number;
  driver_id?: string;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [driverPhone, setDriverPhone] = useState<string>('');

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [completedServiceName, setCompletedServiceName] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  // State untuk Toast Notification Kustomer
  const [notif, setNotif] = useState({
    show: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'info' | 'warning',
  });

  const showNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setNotif({ show: true, title, message, type });
    setTimeout(() => {
      setNotif((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  useEffect(() => {
    let isMounted = true;
    let pollInterval: NodeJS.Timeout;

    async function fetchOrderData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (isMounted) router.push('/login');
        return;
      }

      const loadData = async () => {
        const { data: activeData } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', user.id)
          .in('status', ['SEARCHING_DRIVER', 'ACCEPTED', 'DRIVER_ARRIVED', 'IN_TRIP'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (activeData) {
          if (isMounted) {
            // Deteksi perubahan status untuk memunculkan notifikasi
            if (activeOrder && activeOrder.status !== activeData.status) {
              if (activeData.status === 'ACCEPTED') {
                showNotification('Driver Ditemukan!', 'Driver telah menerima pesanan Anda.', 'success');
              } else if (activeData.status === 'DRIVER_ARRIVED') {
                showNotification('Driver Tiba', 'Driver sudah berada di lokasi jemput.', 'info');
              } else if (activeData.status === 'IN_TRIP') {
                showNotification('Dalam Perjalanan', 'Perjalanan menuju tujuan dimulai.', 'success');
              }
            }

            setActiveOrder(activeData as Order);
            setShowRatingModal(false);

            if (activeData.driver_id) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('phone_number')
                .eq('id', activeData.driver_id)
                .single();

              if (profileData?.phone_number) {
                let phoneNum = profileData.phone_number.trim();
                if (phoneNum.startsWith('0')) {
                  phoneNum = '62' + phoneNum.slice(1);
                }
                setDriverPhone(phoneNum);
              } else {
                setDriverPhone('');
              }
            }

            setLoading(false);
          }
          return;
        }

        setActiveOrder(null);
        setDriverPhone('');

        const { data: unratedData } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', user.id)
          .eq('status', 'COMPLETED')
          .is('rating', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (unratedData && isMounted) {
          setCompletedOrderId(unratedData.id);
          setCompletedServiceName(unratedData.service);
          setShowRatingModal(true);
        } else {
          setShowRatingModal(false);
        }

        if (isMounted) setLoading(false);
      };

      await loadData();
      pollInterval = setInterval(loadData, 3000);
    }

    fetchOrderData();
    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [supabase, router, activeOrder]);

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completedOrderId) return;
    setSubmittingRating(true);

    const { error } = await supabase
      .from('orders')
      .update({ rating, review })
      .eq('id', completedOrderId);

    if (error) {
      showNotification('Gagal', 'Gagal mengirim ulasan: ' + error.message, 'warning');
    } else {
      setShowRatingModal(false);
      setCompletedOrderId(null);
      showNotification('Terima Kasih!', 'Ulasan berhasil dikirim.', 'success');
      setTimeout(() => window.location.reload(), 1000);
    }
    setSubmittingRating(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'SEARCHING_DRIVER': return { text: 'Mencari Driver Terdekat...', color: 'bg-amber-500/10 text-amber-600 border-amber-200', icon: <Clock className="w-4 h-4 animate-spin text-amber-500" /> };
      case 'ACCEPTED': return { text: 'Driver Menuju Tempat Jemput', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: <Bike className="w-4 h-4 text-blue-500" /> };
      case 'DRIVER_ARRIVED': return { text: 'Driver Tiba di Lokasi Jemput', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200', icon: <MapPin className="w-4 h-4 animate-bounce text-indigo-500" /> };
      case 'IN_TRIP': return { text: 'Perjalanan Menuju Tujuan', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', icon: <Navigation2 className="w-4 h-4 text-emerald-500" /> };
      default: return { text: status, color: 'bg-slate-100 text-slate-600 border-slate-200', icon: <Clock className="w-4 h-4" /> };
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-28 font-sans text-slate-100 relative">
      
      {/* KONTROL KOMPONEN NOTIFIKASI MELAYANG */}
      <Notification 
        show={notif.show} 
        title={notif.title} 
        message={notif.message} 
        type={notif.type} 
        onClose={() => setNotif({ ...notif, show: false })} 
      />

      {showRatingModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl space-y-5 animate-fade-in text-center">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
              <Star className="w-7 h-7 fill-emerald-400" />
            </div>
            
            <div>
              <h3 className="text-lg font-black text-white">Beri Penilaian Driver</h3>
              <p className="text-xs text-slate-400 mt-1">Bagaimana layanan <strong className="text-emerald-400 uppercase">{completedServiceName}</strong> Anda sebelumnya?</p>
            </div>

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 transition transform hover:scale-110"
                >
                  <Star className={`w-8 h-8 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmitRating} className="space-y-4">
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Tulis ulasan pelayanan driver (opsional)..."
                rows={3}
                className="w-full p-3 bg-slate-900/80 rounded-2xl text-xs text-white border border-slate-700 focus:ring-2 focus:ring-emerald-500 resize-none"
              />

              <button
                type="submit"
                disabled={submittingRating}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs"
              >
                {submittingRating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Kirim Ulasan</>}
              </button>
            </form>
          </div>
        </div>
      )}

      <header className="relative bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 px-5 pt-8 pb-16 rounded-b-[2.5rem] shadow-2xl overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="max-w-md mx-auto flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-950/60 border border-white/30">
              <span className="text-white font-black text-2xl tracking-tighter">G</span>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-[0.18em] text-white font-sans">GASKE</h1>
              <p className="text-[11px] text-emerald-100 font-medium tracking-[0.08em] lowercase mt-0.5 opacity-90">apa aja, tinggal gaske!</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/customer/history" title="Riwayat Pesanan" className="p-2.5 bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/15 rounded-2xl transition shadow-lg text-white">
              <History className="w-5 h-5" />
            </Link>
            <Link href="/customer/profile" title="Profil Saya" className="p-2.5 bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/15 rounded-2xl transition shadow-lg text-white">
              <User className="w-5 h-5" />
            </Link>
            <button onClick={handleLogout} title="Keluar" className="p-2.5 bg-rose-500/20 hover:bg-rose-500/35 backdrop-blur-md border border-rose-500/30 rounded-2xl transition shadow-lg text-rose-300">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 -mt-8 space-y-6 relative z-20">
        {loading ? (
          <div className="bg-slate-800/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-slate-700/50 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          </div>
        ) : activeOrder ? (
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-emerald-500/80 overflow-hidden">
            <div className={`px-5 py-3.5 text-xs font-black flex items-center gap-2.5 border-b ${getStatusDisplay(activeOrder.status).color}`}>
              {getStatusDisplay(activeOrder.status).icon}
              <span className="tracking-wide">{getStatusDisplay(activeOrder.status).text}</span>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-700/60">
                <span className="text-[10px] font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg uppercase">{activeOrder.service}</span>
                <span className="font-black text-white text-base">{formatRupiah(activeOrder.final_price)}</span>
              </div>
              
              <div className="space-y-2 text-xs">
                <p className="text-slate-300 line-clamp-1"><strong className="text-slate-400">Jemput:</strong> {activeOrder.pickup_address}</p>
                <p className="text-slate-300 line-clamp-1"><strong className="text-slate-400">Tujuan:</strong> {activeOrder.destination_address.split('| Rincian:')[0]}</p>
              </div>

              {activeOrder.status !== 'SEARCHING_DRIVER' && (
                driverPhone ? (
                  <a
                    href={`https://wa.me/${driverPhone}?text=Halo%20Driver%20GASKE,%20saya%20pemesan%20layanan%20${activeOrder.service}.`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs"
                  >
                    <MessageCircle className="w-4 h-4" /> Hubungi Driver via WhatsApp
                  </a>
                ) : (
                  <div className="w-full py-3 bg-slate-800 text-slate-400 border border-slate-700 rounded-2xl text-center text-xs font-bold">
                    Nomor HP Driver Belum Terdaftar di Profil
                  </div>
                )
              )}
            </div>
          </div>
        ) : null}

        {/* Menu Utama */}
        <div className="space-y-3">
          <h2 className="text-xs font-black tracking-widest text-slate-400 uppercase px-1">Layanan Utama</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <Link href="/customer/ride" className="group relative bg-slate-800/80 backdrop-blur-xl p-5 rounded-[2rem] border border-slate-700/60 hover:border-emerald-500/50 shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <Bike className="w-7 h-7" />
              </div>
              <h3 className="font-black text-sm text-white">GASKE RIDE</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Antar Jemput Cepat</p>
            </Link>

            <Link href="/customer/send" className="group relative bg-slate-800/80 backdrop-blur-xl p-5 rounded-[2rem] border border-slate-700/60 hover:border-rose-500/50 shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="font-black text-sm text-white">GASKE SEND</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Kirim Paket Aman</p>
            </Link>

            <Link href="/customer/food" className="group relative bg-slate-800/80 backdrop-blur-xl p-5 rounded-[2rem] border border-slate-700/60 hover:border-amber-500/50 shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <Utensils className="w-7 h-7" />
              </div>
              <h3 className="font-black text-sm text-white">GASKE FOOD</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Jastip Kuliner</p>
            </Link>

            <Link href="/customer/mart" className="group relative bg-slate-800/80 backdrop-blur-xl p-5 rounded-[2rem] border border-slate-700/60 hover:border-blue-500/50 shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="font-black text-sm text-white">GASKE MART</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Belanja Minimarket</p>
            </Link>
          </div>
        </div>

        {/* Kotak Kritik & Saran */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 rounded-3xl text-white shadow-xl space-y-3 border border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider">Punya Kritik & Saran?</h3>
              <p className="text-[11px] text-emerald-100 mt-0.5">Bantu kami meningkatkan layanan GASKE agar lebih baik!</p>
            </div>
          </div>
          
          <a
            href="https://wa.me/6285803004649?text=Halo%20Admin%20Gaske,%20saya%20ingin%20memberikan%20kritik%20dan%20saran%20untuk%20aplikasi:%0A%0A[Tulis%20kritik/saran%20Anda%20di%20sini]"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 bg-white hover:bg-emerald-50 text-emerald-800 font-black text-xs rounded-2xl text-center shadow-lg transition"
          >
            Kirim Kritik & Saran via WhatsApp
          </a>
        </div>

        <div className="bg-gradient-to-r from-slate-800 to-slate-800/60 p-4 rounded-2xl border border-slate-700/50 flex items-center gap-3.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-white">Transaksi Aman & Terlindungi</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Semua mitra pengemudi terverifikasi resmi oleh sistem GASKE.</p>
          </div>
        </div>
      </main>
    </div>
  );
}