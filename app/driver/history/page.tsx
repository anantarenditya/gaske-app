'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatRupiah } from '@/lib/utils/format';
import { ArrowLeft, History, Loader2, CheckCircle2, Wallet, Calendar, Star } from 'lucide-react';

interface DriverHistoryItem {
  id: string;
  service: string;
  pickup_address: string;
  destination_address: string;
  final_price: number;
  created_at: string;
  rating?: number;
  review?: string;
}

export default function DriverHistoryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [historyList, setHistoryList] = useState<DriverHistoryItem[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDriverHistory() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('driver_id', user.id)
        .eq('status', 'COMPLETED')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setHistoryList(data as DriverHistoryItem[]);
        const sum = data.reduce((acc, curr) => acc + (curr.final_price || 0), 0);
        setTotalEarnings(sum);

        // Hitung rata-rata rating
        const ratedOrders = data.filter((o) => o.rating);
        if (ratedOrders.length > 0) {
          const totalRating = ratedOrders.reduce((acc, curr) => acc + (curr.rating || 0), 0);
          setAverageRating(parseFloat((totalRating / ratedOrders.length).toFixed(1)));
        }
      }
      setLoading(false);
    }

    fetchDriverHistory();
  }, [supabase, router]);

  return (
    <div className="min-h-screen bg-slate-900 pb-28 font-sans text-slate-100">
      <header className="bg-slate-800/90 backdrop-blur-xl border-b border-slate-700/60 sticky top-0 z-20 px-5 py-4 shadow-xl">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-black text-white tracking-tight leading-none">RIWAYAT PENGERJAAN</h1>
            <p className="text-[10px] text-emerald-400 font-semibold mt-1">Rekapitulasi tugas driver selesai</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-5 space-y-4">
        {/* Ringkasan Pendapatan & Rating Rata-Rata */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-4 rounded-3xl shadow-xl border border-emerald-500/30 text-white">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Total Pendapatan</p>
            <h2 className="text-lg font-black mt-1">{formatRupiah(totalEarnings)}</h2>
            <p className="text-[10px] text-emerald-100/80 mt-0.5">{historyList.length} Orderan selesai</p>
          </div>

          <div className="bg-slate-800/90 backdrop-blur-xl p-4 rounded-3xl shadow-xl border border-slate-700/60 text-white flex flex-col justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rating Performa</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-xl font-black">{averageRating > 0 ? averageRating : '5.0'}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Berdasarkan ulasan</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          </div>
        ) : historyList.length === 0 ? (
          <div className="bg-slate-800/80 backdrop-blur-xl p-10 rounded-3xl text-center border border-slate-700/60 space-y-3">
            <History className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-xs font-bold text-slate-400">Belum ada riwayat orderan yang diselesaikan.</p>
          </div>
        ) : (
          historyList.map((item) => (
            <div key={item.id} className="bg-slate-800/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-700/60 shadow-xl space-y-3">
              <div className="flex justify-between items-center border-b border-slate-700/60 pb-3">
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg uppercase tracking-wider">
                  {item.service}
                </span>
                <span className="text-sm font-black text-emerald-400">+{formatRupiah(item.final_price)}</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <p className="line-clamp-1"><strong className="text-slate-400">Ambil:</strong> {item.pickup_address}</p>
                <p className="line-clamp-1"><strong className="text-slate-400">Tujuan:</strong> {item.destination_address.split('| Rincian:')[0]}</p>
              </div>

              {/* TAMPILAN RATING & ULASAN DI DRIVER */}
              {item.rating ? (
                <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-700/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-3.5 h-3.5 ${star <= (item.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">Ulasan Pelanggan</span>
                  </div>
                  {item.review && (
                    <p className="text-[11px] text-slate-300 italic">"{item.review}"</p>
                  )}
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 italic">Belum ada ulasan dari pelanggan untuk pesanan ini.</div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-slate-700/40 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                </span>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}