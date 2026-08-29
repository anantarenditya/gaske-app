'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { createOrderAction } from '@/app/actions/order';
import { formatRupiah } from '@/lib/utils/format';
import { ArrowLeft, Loader2, Navigation, ShoppingCart, Store, Search, LocateFixed, Edit3, CreditCard, QrCode, X } from 'lucide-react';
import type { LatLng } from '@/app/components/DualPinMap';

const DualPinMap = dynamic(
  () => import('@/app/components/DualPinMap'),
  { ssr: false }
);

interface MerchantPlace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export default function GaskeMartPage() {
  const router = useRouter();
  const supabase = createClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [merchants, setMerchants] = useState<MerchantPlace[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [activePinMode, setActivePinMode] = useState<'STORE' | 'HOUSE'>('STORE');
  const [storeCoords, setStoreCoords] = useState<LatLng>({ lat: -7.2575, lng: 112.7521 });
  const [customerCoords, setCustomerCoords] = useState<LatLng>({ lat: -7.2650, lng: 112.7600 });
  const [flyTarget, setFlyTarget] = useState<LatLng | null>(null);

  const [manualStoreName, setManualStoreName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customOrder, setCustomOrder] = useState('');
  const [distanceKm, setDistanceKm] = useState(3.0);

  const [paymentMethod, setPaymentMethod] = useState<'Tunai (Cash)' | 'QRIS'>('Tunai (Cash)');
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const searchPlacesReal = async (keyword: string) => {
    if (!keyword.trim()) return;
    setLoadingSearch(true);

    try {
      const finalQuery = `${keyword}, Jawa Timur`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(finalQuery)}&countrycodes=id&addressdetails=1&limit=10`;
      
      const res = await fetch(url);
      const data = await res.json();

      if (data && data.length > 0) {
        const parsed: MerchantPlace[] = data.map((item: any) => ({
          id: String(item.place_id),
          name: item.name || item.display_name.split(',')[0],
          address: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }));
        setMerchants(parsed);
      } else {
        setMerchants([]);
      }
    } catch (error) {
      console.error('Pencarian gagal', error);
    }
    setLoadingSearch(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchPlacesReal(searchQuery);
  };

  const handleSelectMerchant = (place: MerchantPlace) => {
    const newCoords = { lat: place.lat, lng: place.lng };
    setStoreCoords(newCoords);
    setFlyTarget(newCoords);
    setMerchants([]);
  };

  const calculateDynamicPrice = (distKm: number) => {
    const currentHour = new Date().getHours();
    let basePrice = 7000;
    let perKmPrice = 2000;

    if (currentHour >= 5 && currentHour < 17) {
      basePrice = 7000;
      perKmPrice = 2000;
    } else if (currentHour >= 17 && currentHour < 21) {
      basePrice = 8000;
      perKmPrice = 2500;
    } else {
      basePrice = 10000;
      perKmPrice = 3000;
    }

    if (distKm <= 4) {
      return basePrice;
    } else {
      return basePrice + ((distKm - 4) * perKmPrice);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return parseFloat(distance.toFixed(1));
  };

  useEffect(() => {
    const dist = calculateDistance(storeCoords.lat, storeCoords.lng, customerCoords.lat, customerCoords.lng);
    setDistanceKm(Math.max(1, dist));
  }, [storeCoords, customerCoords]);

  useEffect(() => {
    const fetchNewAddress = async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${customerCoords.lat}&lon=${customerCoords.lng}&zoom=18&addressdetails=1`);
        const data = await res.json();
        if (data && data.display_name) {
          setCustomerAddress(data.display_name);
        }
      } catch {
        setCustomerAddress(`Lokasi (${customerCoords.lat.toFixed(4)}, ${customerCoords.lng.toFixed(4)})`);
      }
    };
    fetchNewAddress();
  }, [customerCoords]);

  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
    }
    getUserData();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCustomerCoords(coords);
        setStoreCoords({ lat: coords.lat + 0.01, lng: coords.lng + 0.01 });
      });
    }
  }, [supabase, router]);

  const handleMapClick = (lat: number, lng: number) => {
    const newCoords = { lat, lng };
    setFlyTarget(newCoords);
    if (activePinMode === 'STORE') {
      setStoreCoords(newCoords);
    } else {
      setCustomerCoords(newCoords);
    }
  };

  const handleCustomerGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCustomerCoords(coords);
        setFlyTarget(coords);
      });
    }
  };

  const deliveryFee = calculateDynamicPrice(distanceKm); 
  const displayDistance = distanceKm.toFixed(1).replace('.', ',');

  const executeCheckout = async (method: 'Tunai (Cash)' | 'QRIS') => {
    if (!manualStoreName.trim() || !customOrder.trim()) return;

    setLoadingCheckout(true);

    const res = await createOrderAction({
      service: 'MART',
      pickupAddress: `${manualStoreName} (Titik A di Peta)`,
      destinationAddress: `${customerAddress} | Rincian: [${customOrder}] | Bayar: ${method}`,
      distanceKm,
      paymentMethod: method === 'Tunai (Cash)' ? 'CASH' : 'DIGITAL_PAYMENT',
      pickupLat: storeCoords.lat,
      pickupLng: storeCoords.lng,
      destinationLat: customerCoords.lat,
      destinationLng: customerCoords.lng,
      customFare: deliveryFee, // <-- Mengirimkan harga ongkir pasti dari frontend
    });

    setLoadingCheckout(false);
    setShowQrisModal(false);
    if (res.error) alert(res.error); else router.push('/customer');
  };

  const handleCheckout = () => {
    if (!manualStoreName.trim()) {
      alert('Mohon ketik nama spesifik toko/minimarket!');
      return;
    }
    if (!customOrder.trim()) {
      alert('Mohon isi daftar belanjaan!');
      return;
    }

    if (paymentMethod === 'QRIS') {
      setShowQrisModal(true);
      return;
    }

    executeCheckout('Tunai (Cash)');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-44 font-sans text-slate-800 relative">
      
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
              <p className="text-xs text-emerald-400 font-bold mt-1">Estimasi Total Ongkir: {formatRupiah(deliveryFee)}</p>
            </div>

            <div className="p-3 bg-white rounded-2xl flex flex-col items-center justify-center space-y-2 shadow-inner">
              <img src="/images/qris.jpg" alt="QRIS GASKE.ID" className="w-52 h-52 object-contain rounded-xl" />
              <p className="text-[10px] text-slate-600 font-semibold">NMID: ID1026508198631 (GASKE.ID)</p>
            </div>

            <button
              type="button"
              onClick={() => executeCheckout('QRIS')}
              disabled={loadingCheckout}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs"
            >
              {loadingCheckout ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Saya Sudah Bayar via QRIS'}
            </button>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-slate-100 sticky top-0 z-10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-slate-900">GASKE MART</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari area, desa, atau jalan (Cth: Pasirian)..."
            className="w-full p-3.5 pl-10 pr-20 bg-white rounded-2xl text-xs font-bold border border-slate-100 shadow-sm focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
          <button type="submit" className="absolute right-2 top-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3.5 py-2 rounded-xl transition">
            Cari
          </button>
        </form>

        {loadingSearch && (
          <div className="flex items-center gap-2 py-2 justify-center text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> Mencari lokasi...
          </div>
        )}

        {merchants.length > 0 && (
          <div className="bg-white p-3 rounded-3xl border border-slate-100 shadow-sm space-y-2 max-h-60 overflow-y-auto">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider px-1 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-emerald-600" /> Hasil Pencarian ({merchants.length}) - Pilih Lokasi:
            </h3>
            <div className="space-y-1.5">
              {merchants.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => handleSelectMerchant(place)}
                  className="w-full p-3 rounded-2xl border text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition flex flex-col gap-0.5 shadow-sm"
                >
                  <p className="font-bold text-xs text-slate-900">{place.name}</p>
                  <p className="text-[11px] text-slate-500 leading-tight">{place.address}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Store className="w-3.5 h-3.5 text-emerald-600" /> Ketik Nama Toko / Minimarket (Wajib):
          </label>
          <input
            type="text"
            value={manualStoreName}
            onChange={(e) => setManualStoreName(e.target.value)}
            placeholder="Cth: Indomaret Pasirian / Toko Kelontong..."
            className="w-full p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-800 border-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActivePinMode('STORE')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
                activePinMode === 'STORE' ? 'bg-emerald-600 text-white ring-2 ring-emerald-300' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Atur Titik Toko (A)
            </button>
            <button
              type="button"
              onClick={() => setActivePinMode('HOUSE')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
                activePinMode === 'HOUSE' ? 'bg-rose-600 text-white ring-2 ring-rose-300' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Atur Titik Rumah (B)
            </button>
          </div>

          <p className="text-[11px] text-center font-semibold text-slate-500">
            {activePinMode === 'STORE' ? '📍 Ketuk peta untuk memindahkan Pin Hijau (Toko)' : '📍 Ketuk peta untuk memindahkan Pin Merah (Rumah Anda)'}
          </p>

          <DualPinMap
            storeCoords={storeCoords}
            customerCoords={customerCoords}
            storeLabel={manualStoreName || "Titik Toko (A)"}
            customerLabel={customerAddress}
            activePinMode={activePinMode}
            flyTarget={flyTarget}
            onSelectCoords={handleMapClick}
          />

          <div className="flex justify-between items-center pt-1">
            <span className="text-xs font-bold text-slate-600">Jarak Pengiriman: <strong className="text-emerald-600">{displayDistance} KM</strong></span>
            <button
              type="button"
              onClick={handleCustomerGPS}
              className="text-[10px] font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
            >
              <LocateFixed className="w-3 h-3" /> GPS Rumah Saya
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-rose-500" /> Detail Alamat Rumah (Otomatis dari Peta/GPS):
          </label>
          <input
            type="text"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            placeholder="Contoh: Jl. Pemuda No. 10, Pagar Hitam"
            className="w-full p-2.5 bg-slate-50 rounded-xl text-xs font-bold text-slate-800 border-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Edit3 className="w-4 h-4 text-emerald-600" /> Daftar Belanjaan:
          </label>
          <textarea
            value={customOrder}
            onChange={(e) => setCustomOrder(e.target.value)}
            placeholder="Cth: Air Mineral Aqua 1.5L (2 botol), Indomie Goreng (5 bungkus)"
            rows={4}
            className="w-full p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-800 border-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-2.5">
          <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Pilih Metode Pembayaran</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Tunai (Cash)', icon: <CreditCard className="w-4 h-4" /> },
              { label: 'QRIS', icon: <QrCode className="w-4 h-4" /> },
            ].map((m) => (
              <button
                type="button"
                key={m.label}
                onClick={() => setPaymentMethod(m.label as any)}
                className={`p-3 rounded-2xl border text-xs font-black transition flex items-center justify-center gap-2 ${
                  paymentMethod === m.label ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100'
                }`}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>
        </div>
      </main>

      {manualStoreName.trim() && customOrder.trim() && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 shadow-2xl">
          <div className="max-w-md mx-auto space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Estimasi Ongkir ({displayDistance} KM):</span>
              <span className="font-black text-slate-900 text-base">{formatRupiah(deliveryFee)}</span>
            </div>

            <button onClick={handleCheckout} disabled={loadingCheckout} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-200 transition flex items-center justify-center gap-2 text-xs">
              {loadingCheckout ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShoppingCart className="w-4 h-4" /> Pesan Driver Sekarang ({paymentMethod})</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}