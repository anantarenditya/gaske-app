'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatRupiah } from '@/lib/utils/format';
import { playNotificationSound } from '@/lib/utils/sound'; 
import ToastNotification from '@/components/Notification';
import { Power, CheckCircle2, MapPin, Navigation, BellRing, Loader2, UserCheck, RefreshCw, Navigation2, History, LogOut, MessageCircle, Wallet, ArrowUpRight, User, Map } from 'lucide-react';

interface Order {
  id: string;
  service: string;
  status: string;
  pickup_address: string;
  destination_address: string;
  final_price: number;
  payment_method?: string;
  created_at: string;
  customer_id?: string;
  customer_phone?: string;
  pickup_lat?: number;
  pickup_lng?: number;
  destination_lat?: number;
  destination_lng?: number;
}

export default function DriverDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [isOnline, setIsOnline] = useState(true);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State untuk dompet
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  const [customerPhone, setCustomerPhone] = useState<string>('');

  // State untuk Toast Notification Dalam Aplikasi
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

    // 1. Minta Izin Notifikasi Sistem (Browser)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (window.Notification.permission === 'default') {
        window.Notification.requestPermission();
      }
    }

    async function loadDriverState() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (isMounted) router.push('/login');
        return;
      }

      const fetchDriverData = async () => {
        const { data: activeData } = await supabase
          .from('orders')
          .select('*')
          .eq('driver_id', user.id)
          .in('status', ['ACCEPTED', 'DRIVER_ARRIVED', 'IN_TRIP'])
          .maybeSingle();

        const { data: completedData } = await supabase
          .from('orders')
          .select('final_price, created_at')
          .eq('driver_id', user.id)
          .eq('status', 'COMPLETED');

        if (completedData && isMounted) {
          const total = completedData.reduce((acc, curr) => acc + (curr.final_price || 0), 0);
          setTotalEarnings(total);
          setCompletedCount(completedData.length);

          const todayDateStr = new Date().toLocaleDateString('id-ID');
          const todaySum = completedData
            .filter((o) => new Date(o.created_at).toLocaleDateString('id-ID') === todayDateStr)
            .reduce((acc, curr) => acc + (curr.final_price || 0), 0);
            
          setTodayEarnings(todaySum);
          setIsLoadingStats(false);
        }

        if (isMounted) {
          if (activeData) {
            setActiveOrder(activeData as Order);

            if (activeData.customer_phone) {
              let phoneNum = activeData.customer_phone.trim();
              if (phoneNum.startsWith('0')) {
                phoneNum = '62' + phoneNum.slice(1);
              }
              setCustomerPhone(phoneNum);
            } else {
              setCustomerPhone('');
            }
          } else {
            setActiveOrder(null);
            setCustomerPhone('');
            
            if (isOnline) {
              const { data: searchData } = await supabase
                .from('orders')
                .select('*')
                .eq('status', 'SEARCHING_DRIVER')
                .order('created_at', { ascending: false });

              setAvailableOrders((searchData as Order[]) || []);
            } else {
              setAvailableOrders([]);
            }
          }
        }
      };

      await fetchDriverData();
      pollInterval = setInterval(fetchDriverData, 3000);
    }

    loadDriverState();

    const channel = supabase
      .channel('driver_audio_notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as Order;
          if (newOrder.status === 'SEARCHING_DRIVER' && isOnline) {
            
            playNotificationSound();
            showNotification('Orderan Baru Masuk!', `Ada pesanan ${newOrder.service} di sekitar Anda.`, 'info');

            if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
              const systemNotif = new window.Notification('🚨 GASKE: ORDERAN BARU!', {
                body: `Layanan: ${newOrder.service}\nJemput: ${newOrder.pickup_address}`,
              });

              systemNotif.onclick = function() {
                window.focus();
                this.close();
              };
            }
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [supabase, router, isOnline]);

  const handleToggleOnline = (status: boolean) => {
    setIsOnline(status);
    
    if (status && typeof window !== 'undefined' && 'Notification' in window) {
      if (window.Notification.permission === 'default') {
        window.Notification.requestPermission();
      }
    }

    if (!status) {
      setAvailableOrders([]);
      showNotification('Status Offline', 'Anda berhenti menerima orderan.', 'warning');
    } else {
      showNotification('Status Online', 'Sistem pelacakan dan notifikasi aktif.', 'success');
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('orders')
      .update({ driver_id: user.id, status: 'ACCEPTED' })
      .eq('id', orderId)
      .eq('status', 'SEARCHING_DRIVER');

    if (error) {
      showNotification('Gagal', 'Orderan mungkin sudah diambil driver lain.', 'warning');
    } else {
      showNotification('Berhasil!', 'Orderan berhasil diambil.', 'success');
      setTimeout(() => window.location.reload(), 1000);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (nextStatus: string) => {
    if (!activeOrder) return;
    setLoading(true);

    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', activeOrder.id);

    if (error) {
      showNotification('Gagal', 'Gagal memperbarui status: ' + error.message, 'warning');
    } else {
      showNotification('Status Diperbarui', `Status pesanan berhasil diubah.`, 'success');
      if (nextStatus === 'COMPLETED') {
        setActiveOrder(null);
      } else {
        setActiveOrder({ ...activeOrder, status: nextStatus });
      }
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getWhatsAppLink = () => {
    if (!activeOrder || !customerPhone) return '#';
    let text = '';
    
    if (activeOrder.service === 'FOOD' || activeOrder.service === 'MART') {
      const rincian = activeOrder.destination_address.includes('| Rincian:') 
        ? activeOrder.destination_address.split('| Rincian:')[1].replace('[', '').replace(']', '').trim()
        : 'Pesanan Manual';
      
      text = `Halo, saya Driver GASKE. Untuk pesanan di *${activeOrder.pickup_address.split('(')[0].trim()}*, rinciannya:\n\n👉 *${rincian}*\n\nApakah sudah sesuai? Saya belikan sekarang ya, Kak. Nanti saya fotokan struknya.`;
    } else if (activeOrder.service === 'SEND') {
      text = `Halo, saya kurir GASKE SEND. Saya segera menuju lokasi ambil paket di *${activeOrder.pickup_address}*.`;
    } else {
      text = `Halo, saya Driver GASKE RIDE. Saya sedang meluncur ke lokasi jemput di *${activeOrder.pickup_address}*.`;
    }
    
    return `https://wa.me/${customerPhone}?text=${encodeURIComponent(text)}`;
  };

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-28 font-sans text-slate-100 relative">
      
      <ToastNotification 
        show={notif.show} 
        title={notif.title} 
        message={notif.message} 
        type={notif.type} 
        onClose={() => setNotif({ ...notif, show: false })} 
      />

      <header className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 px-5 pt-8 pb-16 rounded-b-[2.5rem] shadow-2xl overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="max-w-md mx-auto relative z-10 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-950/60 border border-white/30">
                <span className="text-white font-black text-2xl tracking-tighter">G</span>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-[0.18em] text-white font-sans">GASKE</h1>
                <p className="text-[11px] text-blue-100 font-medium tracking-[0.08em] lowercase mt-0.5 opacity-90">apa aja, tinggal gaske!</p>
              </div>
            </div>

            <button 
              onClick={() => window.location.reload()} 
              title="Refresh" 
              className="p-2.5 bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/15 rounded-2xl transition shadow-lg text-white flex items-center gap-1.5 text-xs font-bold"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-white/15">
            <Link href="/driver/orders/history" className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 rounded-xl transition shadow-md text-white flex items-center justify-center gap-2 text-xs font-bold">
              <History className="w-4 h-4" /> Riwayat
            </Link>
            <Link href="/driver/profile" className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 rounded-xl transition shadow-md text-white flex items-center justify-center gap-2 text-xs font-bold">
              <User className="w-4 h-4" /> Profil
            </Link>
            <button onClick={handleLogout} className="py-2 px-3 bg-rose-500/20 hover:bg-rose-500/35 backdrop-blur-md border border-rose-500/30 rounded-xl transition shadow-md text-rose-200 flex items-center justify-center gap-1 text-xs font-bold">
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 -mt-8 space-y-4 relative z-20">
        
        {/* WIDGET DOMPET */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-800/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-700/80 shadow-2xl space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Dompet Driver</h3>
                {isLoadingStats ? (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                    <span className="text-xs font-semibold text-slate-500">Memuat...</span>
                  </div>
                ) : (
                  <p className="text-sm font-black text-white">{formatRupiah(totalEarnings)}</p>
                )}
              </div>
            </div>
            <Link href="/driver/orders/history" className="text-xs text-blue-400 font-bold hover:underline flex items-center gap-1">
              Detail <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/60">
            <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-700/40">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Pendapatan Hari Ini</p>
              {isLoadingStats ? (
                 <Loader2 className="w-4 h-4 animate-spin text-blue-500/50 mt-1" />
              ) : (
                 <p className="text-sm font-black text-blue-400 mt-1">{formatRupiah(todayEarnings)}</p>
              )}
            </div>
            <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-700/40">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Order Selesai</p>
              {isLoadingStats ? (
                 <Loader2 className="w-4 h-4 animate-spin text-slate-500 mt-1" />
              ) : (
                 <p className="text-sm font-black text-white mt-1">{completedCount} Tugas</p>
              )}
            </div>
          </div>
        </div>

        {/* Profil Driver */}
        <div className="bg-slate-800/90 backdrop-blur-xl p-4 rounded-3xl border border-slate-700/60 shadow-xl flex items-center gap-3.5">
          <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner">
            D
          </div>
          <div>
            <h3 className="font-black text-sm text-white tracking-wide">DRIVER GASKE</h3>
            <p className="text-[11px] text-blue-400 font-semibold mt-0.5">Mitra Pengemudi Resmi</p>
          </div>
        </div>

        {/* Status Toggle Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl p-4.5 rounded-3xl border border-slate-700/60 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className={`w-3.5 h-3.5 rounded-full ${isOnline ? 'bg-blue-500 shadow-lg shadow-blue-500/50 animate-pulse' : 'bg-slate-500'}`}></div>
            <div>
              <h3 className="font-black text-xs text-white tracking-wide">{isOnline ? 'SIAP NARIK (ONLINE)' : 'STATUS: OFFLINE'}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">{isOnline ? 'Siap menerima orderan masuk' : 'Anda sedang istirahat'}</p>
            </div>
          </div>

          <button
            onClick={() => handleToggleOnline(!isOnline)}
            className={`px-4.5 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-1.5 shadow-lg ${
              isOnline ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40'
            }`}
          >
            <Power className="w-3.5 h-3.5" /> {isOnline ? 'Matikan' : 'Mulai Narik'}
          </button>
        </div>

        {/* Card Orderan Aktif */}
        {activeOrder ? (
          <div className="bg-slate-800/95 backdrop-blur-xl p-6 rounded-3xl border-2 border-blue-500 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3.5 border-b border-slate-700/60">
              <span className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3.5 py-1 rounded-full tracking-wider">
                {activeOrder.service} Berjalan
              </span>
              <span className="font-black text-white text-lg">{formatRupiah(activeOrder.final_price)}</span>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* ALAMAT JEMPUT (TITIK A) */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="w-full min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LOKASI AMBIL / JEMPUT (A)</p>
                  <p className="font-bold text-white mt-0.5 mb-2">{activeOrder.pickup_address}</p>
                  
                  {/* TOMBOL GOOGLE MAPS TITIK A */}
                  {activeOrder.pickup_lat && activeOrder.pickup_lng && (
                    <button 
                      onClick={() => openGoogleMaps(activeOrder.pickup_lat as number, activeOrder.pickup_lng as number)}
                      className="w-full flex items-center justify-center gap-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 py-2.5 rounded-xl font-bold text-[11px] transition"
                    >
                      <Map className="w-3.5 h-3.5" /> Arahkan ke Titik Jemput (A)
                    </button>
                  )}
                </div>
              </div>

              {/* ALAMAT TUJUAN (TITIK B) */}
              <div className="flex items-start gap-3 pt-4 border-t border-slate-700/60">
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl shrink-0 mt-0.5">
                  <Navigation className="w-4 h-4" />
                </div>
                <div className="w-full min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TUJUAN PENGANTARAN (B)</p>
                  <p className="font-bold text-white mt-0.5 mb-2">
                    {activeOrder.destination_address.includes('| Rincian:') 
                      ? activeOrder.destination_address.split('| Rincian:')[0]
                      : activeOrder.destination_address
                    }
                  </p>
                  
                  {/* TOMBOL GOOGLE MAPS TITIK B */}
                  {activeOrder.destination_lat && activeOrder.destination_lng && (
                    <button 
                      onClick={() => openGoogleMaps(activeOrder.destination_lat as number, activeOrder.destination_lng as number)}
                      className="w-full flex items-center justify-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 py-2.5 rounded-xl font-bold text-[11px] transition"
                    >
                      <Navigation2 className="w-3.5 h-3.5" /> Arahkan ke Tujuan (B)
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-2xl border border-slate-700/40">
                <span className="text-[11px] font-bold text-slate-400">Metode Pembayaran:</span>
                <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                  activeOrder.payment_method === 'Tunai (Cash)' 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                }`}>
                  {activeOrder.payment_method || 'Tunai (Cash)'} 
                </span>
              </div>
            </div>
            
            {customerPhone ? (
              <a 
                href={getWhatsAppLink()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs tracking-wide"
              >
                <MessageCircle className="w-4 h-4" /> Hubungi Pelanggan (WhatsApp)
              </a>
            ) : (
              <div className="w-full py-3 bg-slate-800 text-slate-400 border border-slate-700 rounded-2xl text-center text-xs font-bold">
                Nomor HP Pelanggan Belum Terdaftar
              </div>
            )}

            <div className="pt-2">
              {activeOrder.status === 'ACCEPTED' && (
                <button
                  onClick={() => handleUpdateStatus('DRIVER_ARRIVED')}
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserCheck className="w-4 h-4" /> Saya Sudah Tiba di Lokasi Jemput</>}
                </button>
              )}

              {activeOrder.status === 'DRIVER_ARRIVED' && (
                <button
                  onClick={() => handleUpdateStatus('IN_TRIP')}
                  disabled={loading}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Navigation2 className="w-4 h-4" /> Mulai Perjalanan ke Tujuan</>}
                </button>
              )}

              {activeOrder.status === 'IN_TRIP' && (
                <button
                  onClick={() => handleUpdateStatus('COMPLETED')}
                  disabled={loading}
                  className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Selesaikan Orderan & Terima Pendapatan</>}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
              Orderan Masuk ({availableOrders.length})
            </h3>
            {availableOrders.length === 0 ? (
              <div className="bg-slate-800/80 backdrop-blur-xl p-10 rounded-3xl text-center border border-slate-700/60 space-y-3 shadow-xl">
                <BellRing className="w-7 h-7 text-slate-400 mx-auto animate-bounce" />
                <p className="text-xs font-bold text-white">Belum ada orderan di sekitar Anda</p>
              </div>
            ) : (
              availableOrders.map((order) => (
                <div key={order.id} className="bg-slate-800/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-700/60 shadow-xl space-y-3.5">
                  <div className="flex justify-between items-center border-b border-slate-700/60 pb-3">
                    <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg uppercase">{order.service}</span>
                    <span className="text-base font-black text-white">{formatRupiah(order.final_price)}</span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300">
                    <p className="truncate"><strong>Jemput:</strong> {order.pickup_address}</p>
                    <p className="truncate"><strong>Tujuan:</strong> {order.destination_address.split('| Rincian:')[0]}</p>
                    <p className="text-[11px] text-blue-400 font-bold pt-1">Metode: {order.payment_method || 'Tunai (Cash)'}</p>
                  </div>

                  <button
                    onClick={() => handleAcceptOrder(order.id)}
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-xs transition shadow-lg flex items-center justify-center gap-2"
                  >
                    Terima Orderan Ini Sekarang
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}