'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatRupiah } from '@/lib/utils/format';
import { ArrowLeft, History, Loader2, Calendar } from 'lucide-react';

interface CustomerOrder {
  id: string;
  service: string;
  status: string;
  pickup_address: string;
  destination_address: string;
  final_price: number;
  created_at: string;
}

export default function CustomerHistoryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [historyList, setHistoryList] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomerHistory() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching history:', error.message);
        } else if (data) {
          setHistoryList(data as CustomerOrder[]);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomerHistory();
  }, [supabase, router]);

  return (
    <div className="min-h-screen bg-slate-900 pb-28 font-sans text-slate-100">
      <header className="bg-slate-800/90 backdrop-blur-xl border-b border-slate-700/60 sticky top-0 z-20 px-5 py-4 shadow-xl">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/customer')} className="p-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-black text-white tracking-tight leading-none">RIWAYAT PESANAN</h1>
            <p className="text-[10px] text-blue-400 font-semibold mt-1">Daftar perjalanan & pengiriman Anda</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-5 space-y-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
          </div>
        ) : historyList.length === 0 ? (
          <div className="bg-slate-800/80 backdrop-blur-xl p-10 rounded-3xl text-center border border-slate-700/60 space-y-3">
            <History className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-xs font-bold text-slate-400">Belum ada riwayat pesanan.</p>
          </div>
        ) : (
          historyList.map((item) => (
            <Link
              key={item.id}
              href={`/customer/orders/${item.id}`}
              className="block bg-slate-800/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-700/60 shadow-xl space-y-3 hover:border-blue-500/50 transition cursor-pointer"
            >
              <div className="flex justify-between items-center border-b border-slate-700/60 pb-3">
                <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-lg uppercase tracking-wider">
                  {item.service}
                </span>
                <span className="text-sm font-black text-white">{formatRupiah(item.final_price)}</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <p className="line-clamp-1"><strong className="text-slate-400">Jemput:</strong> {item.pickup_address}</p>
                <p className="line-clamp-1"><strong className="text-slate-400">Tujuan:</strong> {item.destination_address.split('| Rincian:')[0]}</p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-700/40 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase ${item.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-amber-500/15 text-amber-400'}`}>
                  {item.status}
                </span>
              </div>
            </Link>
          ))
        )}
      </main>
    </div>
  );
}