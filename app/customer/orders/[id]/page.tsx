'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MessageCircle, MessageSquare, Bike, ArrowLeft, Loader2, MapPin, CreditCard, Navigation, Star } from 'lucide-react';
import { formatRupiah } from '@/lib/utils/format';

export default function CustomerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id;

  const [order, setOrder] = useState<any>(null);
  const [driverPhone, setDriverPhone] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // State untuk ulasan dan rating
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [reviewInput, setReviewInput] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchOrderDetails() {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderData) {
        setOrder(orderData);
        if (orderData.rating) {
          setRatingInput(orderData.rating);
        }
        if (orderData.review) {
          setReviewInput(orderData.review);
        }

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

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);

    const { error } = await supabase
      .from('orders')
      .update({
        rating: ratingInput,
        review: reviewInput,
      })
      .eq('id', orderId);

    if (!error) {
      setReviewSuccess(true);
      setOrder((prev: any) => ({ ...prev, rating: ratingInput, review: reviewInput }));
    } else {
      alert('Gagal menyimpan ulasan. Silakan coba lagi.');
    }
    setSubmittingReview(false);
  };

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center text-slate-800 space-y-4">
        <p className="font-bold text-lg">Pesanan tidak ditemukan.</p>
        <Link href="/customer/history" className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold">
          Kembali ke Riwayat
        </Link>
      </div>
    );
  }

  const waNumber = formatWhatsAppNumber(driverPhone);
  const waText = `Halo ${order.driver_name || 'Driver'}, saya customer GASKE (Order: ${order.order_number || order.id.slice(0, 8)}). Apakah sudah dekat?`;
  const waLink = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}` : '#';

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-xl mx-auto space-y-6">
        <Link href="/customer/history" className="flex items-center gap-2 text-emerald-600 font-bold hover:underline mb-2">
          <ArrowLeft className="w-5 h-5" /> Kembali ke Riwayat
        </Link>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                {order.service || 'GASKE'}
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-2">Detail Pesanan</h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Resi: {order.order_number || order.id.slice(0, 8)}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {order.status}
            </span>
          </div>

          {/* Info Driver */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <Bike className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 truncate">{order.driver_name || 'Mencari Driver...'}</h4>
              <p className="text-xs text-slate-500 font-medium truncate">
                {driverPhone ? `📞 ${driverPhone}` : 'Belum ada nomor telepon driver'}
              </p>
            </div>
          </div>

          {/* Rincian Alamat (Jemput & Tujuan) */}
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">A</span>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Titik Jemput / Toko</p>
                <p className="font-bold text-slate-900 mt-0.5 break-words">{order.pickup_address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">B</span>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Titik Tujuan / Pengiriman & Detail</p>
                <p className="font-bold text-slate-900 mt-0.5 break-words">{order.destination_address}</p>
              </div>
            </div>
          </div>

          {/* Rincian Biaya & Pembayaran */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Jarak Tempuh</span>
              <span className="font-bold text-slate-800">{order.distance_km || 0} KM</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Metode Pembayaran</span>
              <span className="font-bold text-slate-800">{order.payment_method}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm">
              <span className="font-black text-slate-700">Total Biaya</span>
              <span className="font-black text-emerald-600 text-base">{formatRupiah(order.final_price || order.estimated_price || 0)}</span>
            </div>
          </div>

          {/* Bagian Penilaian & Ulasan (Hanya Muncul Jika Order COMPLETED) */}
          {order.status === 'COMPLETED' && (
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Ulasan & Rating Driver</h3>
              
              {order.rating && !reviewSuccess ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= order.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} 
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">({order.rating}/5)</span>
                  </div>
                  {order.review && <p className="text-xs text-slate-600 italic">"{order.review}"</p>}
                  <p className="text-[10px] text-emerald-600 font-medium">Ulasan telah dikirimkan.</p>
                </div>
              ) : (
                <form onSubmit={handleRatingSubmit} className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRatingInput(star)}
                        className="focus:outline-none"
                      >
                        <Star 
                          className={`w-5 h-5 transition ${star <= ratingInput ? 'text-amber-400 fill-amber-400 scale-110' : 'text-slate-300'}`} 
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">{ratingInput} Bintang</span>
                  </div>

                  <textarea
                    value={reviewInput}
                    onChange={(e) => setReviewInput(e.target.value)}
                    placeholder="Tulis ulasan untuk driver (opsional)..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-800"
                    rows={2}
                  />

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2"
                  >
                    {submittingReview && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {reviewSuccess ? 'Ulasan Berhasil Disimpan!' : 'Kirim Ulasan'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Tombol Aksi Chat / WhatsApp */}
          <div className="space-y-3 pt-2">
            <Link
              href={`/customer/chat/${orderId}`}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-md text-xs"
            >
              <MessageSquare className="w-4 h-4" /> Live Chat di Aplikasi
            </Link>

            {waNumber ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition text-xs shadow-sm"
              >
                <MessageCircle className="w-4 h-4" /> Hubungi via WhatsApp
              </a>
            ) : (
              <button disabled className="w-full bg-slate-100 text-slate-400 font-bold py-3.5 rounded-xl cursor-not-allowed text-xs">
                WhatsApp Driver Belum Tersedia
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}