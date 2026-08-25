'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatRupiah } from '@/lib/utils/format';
import { ArrowLeft, Loader2, Search, MapPin, LocateFixed, QrCode, X } from 'lucide-react';
import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('../Map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-800 animate-pulse flex items-center justify-center text-xs text-slate-400">Memuat Peta...</div>,
});

interface LatLng { lat: number; lng: number; }
interface SearchResult { display_name: string; lat: string; lon: string; }

export default function RidePage() {
  const router = useRouter();
  const supabase = createClient();

  const [pickupCoords, setPickupCoords] = useState<LatLng>({ lat: -7.2575, lng: 112.7521 });
  const [destCoords, setDestCoords] = useState<LatLng>({ lat: -7.2892, lng: 112.6787 });
  const [pickupAddress, setPickupAddress] = useState('Mendeteksi lokasi Anda...');
  const [destinationAddress, setDestinationAddress] = useState('Pakuwon Mall Surabaya');

  const [activeMode, setActiveMode] = useState<'A' | 'B'>('A');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [flyTarget, setFlyTarget] = useState<LatLng | null>(null);

  const [distanceKm, setDistanceKm] = useState(0);
  const [price, setPrice] = useState(0);
  
  const [paymentMethod, setPaymentMethod] = useState<'Tunai (Cash)' | 'QRIS'>('Tunai (Cash)');
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- FUNGSI TARIF DINAMIS OTOMATIS BERDASARKAN WAKTU & JARAK ---
  const calculateDynamicPrice = (distKm: number) => {
    const currentHour = new Date().getHours();
    
    let basePrice = 7000;
    let perKmPrice = 2000;

    if (currentHour >= 5 && currentHour < 17) {
      // Jam 05.00 - 17.00
      basePrice = 7000;
      perKmPrice = 2000;
    } else if (currentHour >= 17 && currentHour < 21) {
      // Jam 17.00 - 21.00
      basePrice = 8000;
      perKmPrice = 2500;
    } else {
      // Jam 21.00 - 05.00
      basePrice = 10000;
      perKmPrice = 3000;
    }

    // 4 KM pertama ikut harga dasar, sisanya dikalikan harga per KM
    if (distKm <= 4) {
      return basePrice;
    } else {
      return basePrice + ((distKm - 4) * perKmPrice);
    }
  };
  // -------------------------------------------------------------

  const calculateDistance = (p1: LatLng, p2: LatLng) => {
    const R = 6371;
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((p1.lat * Math.PI) / 180) * Math.cos((p2.lat * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.max(1, Math.round(R * c));
  };

  const fetchAddressName = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      if (data && data.display_name) return data.display_name.split(',').slice(0, 3).join(',').trim();
    } catch {}
    return `Lokasi (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  };

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/login');
    }
    checkAuth();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const coords = { lat, lng };
          setPickupCoords(coords);
          setFlyTarget(coords);

          const addressName = await fetchAddressName(lat, lng);
          setPickupAddress(addressName);

          const dist = calculateDistance(coords, destCoords);
          setDistanceKm(dist);
          setPrice(calculateDynamicPrice(dist)); // Otomatis terupdate
        },
        (error) => {
          console.warn("GPS Otomatis Gagal:", error.message);
          setPickupAddress('Gagal melacak GPS. Geser peta manual.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, [supabase, router, destCoords]);

  const handleManualGPS = () => {
    setPickupAddress('Sedang melacak lokasi...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const coords = { lat, lng };
          setPickupCoords(coords);
          setFlyTarget(coords);

          const addressName = await fetchAddressName(lat, lng);
          setPickupAddress(addressName);

          const dist = calculateDistance(coords, destCoords);
          setDistanceKm(dist);
          setPrice(calculateDynamicPrice(dist)); // Otomatis terupdate
        },
        (error) => {
          alert(`Gagal mengambil lokasi: ${error.message}. Pastikan izin lokasi diizinkan di browser.`);
          setPickupAddress('Lokasi tidak ditemukan');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Browser Anda tidak mendukung fitur GPS.");
    }
  };

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      searchResults.length > 0 && setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=id&limit=5`);
        const data = await res.json();
        setSearchResults(data || []);
      } catch {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const shortName = result.display_name.split(',').slice(0, 3).join(',').trim();
    const newTarget = { lat, lng };
    setFlyTarget(newTarget);

    if (activeMode === 'A') {
      const dist = calculateDistance(newTarget, destCoords);
      setPickupCoords(newTarget);
      setPickupAddress(shortName);
      setDistanceKm(dist);
      setPrice(calculateDynamicPrice(dist)); // Otomatis terupdate
    } else {
      const dist = calculateDistance(pickupCoords, newTarget);
      setDestCoords(newTarget);
      setDestinationAddress(shortName);
      setDistanceKm(dist);
      setPrice(calculateDynamicPrice(dist)); // Otomatis terupdate
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleMapClick = async (lat: number, lng: number) => {
    const addressName = await fetchAddressName(lat, lng);
    const newCoords = { lat, lng };

    if (activeMode === 'A') {
      const dist = calculateDistance(newCoords, destCoords);
      setPickupCoords(newCoords);
      setPickupAddress(addressName);
      setDistanceKm(dist);
      setPrice(calculateDynamicPrice(dist)); // Otomatis terupdate
    } else {
      const dist = calculateDistance(pickupCoords, newCoords);
      setDestCoords(newCoords);
      setDestinationAddress(addressName);
      setDistanceKm(dist);
      setPrice(calculateDynamicPrice(dist)); // Otomatis terupdate
    }
  };

  const executeOrder = async (method: 'Tunai (Cash)' | 'QRIS') => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('orders').insert({
      customer_id: user.id,
      service: 'RIDE',
      status: 'SEARCHING_DRIVER',
      pickup_address: pickupAddress,
      destination_address: destinationAddress,
      distance_km: distanceKm,
      estimated_price: price,
      final_price: price,
      payment_method: method === 'Tunai (Cash)' ? 'CASH' : 'DIGITAL_PAYMENT',
    });

    if (error) {
      alert('Gagal membuat pesanan: ' + error.message);
      setLoading(false);
    } else {
      setShowQrisModal(false);
      router.push('/customer');
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupAddress || !destinationAddress) {
      alert('Mohon tentukan titik penjemputan dan tujuan!');
      return;
    }

    if (paymentMethod === 'QRIS') {
      setShowQrisModal(true);
      return;
    }

    await executeOrder('Tunai (Cash)');
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-28 font-sans text-slate-100 relative">
      
      {/* MODAL QRIS GASKE.ID */}
      {showQrisModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl space-y-5 text-center relative animate-fade-in text-slate-100">
            <button onClick={() => setShowQrisModal(false)} className="absolute top-5 right-5 p-2 bg-slate-700/50 hover:bg-slate-700 rounded-full text-slate-300 transition">
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/25">
              <QrCode className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-black text-white">Scan QRIS untuk Membayar</h3>
              <p className="text-xs text-emerald-400 font-bold mt-1">Total: {formatRupiah(price)}</p>
            </div>

            {/* GAMBAR QRIS ASLI */}
            <div className="p-3 bg-white rounded-2xl flex flex-col items-center justify-center space-y-2 shadow-inner">
              <img 
                src="/images/qris.jpg" 
                alt="QRIS GASKE.ID" 
                className="w-52 h-52 object-contain rounded-xl" 
              />
              <p className="text-[10px] text-slate-600 font-semibold">NMID: ID1026508198631 (GASKE.ID)</p>
            </div>

            <button
              type="button"
              onClick={() => executeOrder('QRIS')}
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Saya Sudah Bayar via QRIS'}
            </button>
          </div>
        </div>
      )}

      {/* Header & Form Utama */}
      <header className="bg-slate-800/90 backdrop-blur-xl border-b border-slate-700/60 sticky top-0 z-30 px-5 py-4 shadow-xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-black text-white tracking-tight leading-none">GASKE RIDE</h1>
              <p className="text-[10px] text-emerald-400 font-semibold mt-1">Pilih titik jemput & tujuan via peta</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleManualGPS}
            className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-xl flex items-center gap-1.5 transition hover:bg-emerald-500/20"
          >
            <LocateFixed className="w-3.5 h-3.5" /> GPS Saya
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-5 space-y-4">
        {/* Bagian Peta & Mode Toggle (A/B) */}
        <div className="bg-slate-800/90 backdrop-blur-xl p-4 rounded-3xl border border-slate-700/60 shadow-xl space-y-2.5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveMode('A')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
                activeMode === 'A' ? 'bg-emerald-600 text-white ring-2 ring-emerald-300' : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Pilih Jemput (A)
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('B')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
                activeMode === 'B' ? 'bg-rose-600 text-white ring-2 ring-rose-300' : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Pilih Tujuan (B)
            </button>
          </div>

          <div className="relative z-20">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="text"
                placeholder={`Cari lokasi ${activeMode === 'A' ? 'Jemput (A)' : 'Tujuan (B)'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
              {isSearching && <Loader2 className="w-4 h-4 animate-spin text-emerald-400 absolute right-3" />}
            </div>

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-700 max-h-52 overflow-y-auto">
                {searchResults.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left p-3 hover:bg-emerald-500/10 transition flex items-start gap-2.5 text-xs text-slate-200 font-medium"
                  >
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{item.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-full h-56 rounded-2xl overflow-hidden border border-slate-700 z-0 relative shadow-inner">
            <DynamicMap 
              pickupCoords={pickupCoords} 
              destCoords={destCoords} 
              flyTarget={flyTarget} 
              onMapClick={handleMapClick} 
            />
          </div>
        </div>

        {/* Form Alamat & Pembayaran */}
        <form onSubmit={handleOrderSubmit} className="bg-slate-800/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/60 shadow-xl space-y-4">
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5 bg-slate-900/60 p-3 rounded-2xl border border-slate-700/50">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">A</span>
              <div className="truncate">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Lokasi Jemput (A)</p>
                <p className="font-bold text-white truncate">{pickupAddress}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-slate-900/60 p-3 rounded-2xl border border-slate-700/50">
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">B</span>
              <div className="truncate">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Lokasi Tujuan (B)</p>
                <p className="font-bold text-white truncate">{destinationAddress}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-700/60">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Pilih Metode Pembayaran</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('Tunai (Cash)')}
                className={`p-3.5 rounded-2xl border text-xs font-black transition flex items-center justify-center gap-2 ${
                  paymentMethod === 'Tunai (Cash)' ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg' : 'bg-slate-900/60 text-slate-300 border-slate-700'
                }`}
              >
                💵 Tunai (Cash)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS')}
                className={`p-3.5 rounded-2xl border text-xs font-black transition flex items-center justify-center gap-2 ${
                  paymentMethod === 'QRIS' ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg' : 'bg-slate-900/60 text-slate-300 border-slate-700'
                }`}
              >
                <QrCode className="w-4 h-4" /> QRIS
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-700/60 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Tarif RIDE ({distanceKm} km)</p>
              <p className="text-lg font-black text-white">{formatRupiah(price)}</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl text-xs shadow-lg flex items-center gap-2 transition"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pesan RIDE'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}