'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { createOrderAction, calculateFareAction } from '@/app/actions/order';
import { formatRupiah } from '@/lib/utils/format';
import { ArrowLeft, Loader2, Package, Search, LocateFixed, Edit3, CreditCard, QrCode, X, MapPin, User, Phone } from 'lucide-react';
import type { LatLng } from '@/app/components/DualPinMap';

const DualPinMap = dynamic(
  () => import('@/app/components/DualPinMap'),
  { ssr: false }
);

interface PlaceItem {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export default function GaskeSendPage() {
  const router = useRouter();
  const supabase = createClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [activePinMode, setActivePinMode] = useState<'STORE' | 'HOUSE'>('STORE');
  const [pickupCoords, setPickupCoords] = useState<LatLng>({ lat: -7.2575, lng: 112.7521 });
  const [destinationCoords, setDestinationCoords] = useState<LatLng>({ lat: -7.2650, lng: 112.7600 });
  const [flyTarget, setFlyTarget] = useState<LatLng | null>(null);

  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [packageDetail, setPackageDetail] = useState('');
  const [distanceKm, setDistanceKm] = useState(3.0);
  const [fare, setFare] = useState(8000);

  const [paymentMethod, setPaymentMethod] = useState<'Tunai (Cash)' | 'QRIS'>('Tunai (Cash)');
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const parseOsmAddress = (data: any) => {
    if (!data || !data.address) return data?.display_name || '';
    const addr = data.address;
    const specific = addr.hamlet || addr.suburb || addr.neighbourhood || addr.village || addr.road || '';
    const general = addr.town || addr.city_district || addr.city || addr.state || '';
    if (specific && general && specific !== general) {
      return `${specific}, ${general}`;
    }
    return data.display_name.split(',').slice(0, 3).join(',').trim();
  };

  const searchPlacesReal = async (keyword: string) => {
    if (!keyword.trim()) return;
    setLoadingSearch(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${keyword}, Jawa Timur`)}&countrycodes=id&addressdetails=1&limit=10`, {
        headers: { 'Accept-Language': 'id' }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        setPlaces(data.map((item: any) => ({
          id: String(item.place_id),
          name: item.name || item.display_name.split(',')[0],
          address: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        })));
      } else {
        setPlaces([]);
      }
    } catch (error) {
      console.error('Pencarian gagal', error);
    }
    setLoadingSearch(false);
  };

  const handleSelectPlace = (place: PlaceItem) => {
    const newCoords = { lat: place.lat, lng: place.lng };
    if (activePinMode === 'STORE') {
      setPickupCoords(newCoords);
      setPickupAddress(place.address);
    } else {
      setDestinationCoords(newCoords);
      setDestinationAddress(place.address);
    }
    setFlyTarget(newCoords);
    setPlaces([]);
  };

  const calculateDistance = (p1: LatLng, p2: LatLng) => {
    const R = 6371;
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((p1.lat * Math.PI) / 180) * Math.cos((p2.lat * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  useEffect(() => {
    const dist = calculateDistance(pickupCoords, destinationCoords);
    setDistanceKm(Math.max(1, dist));
  }, [pickupCoords, destinationCoords]);

  useEffect(() => {
    async function updateFareAndAddress() {
      const dist = Math.max(1, calculateDistance(pickupCoords, destinationCoords));
      const res = await calculateFareAction('SEND', dist);
      setFare(res.fare);

      try {
        const resPickup = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pickupCoords.lat}&lon=${pickupCoords.lng}&zoom=18&addressdetails=1`, {
          headers: { 'Accept-Language': 'id' }
        });
        const dataPickup = await resPickup.json();
        if (dataPickup) setPickupAddress(parseOsmAddress(dataPickup));
      } catch {
        setPickupAddress(`Lokasi Jemput (${pickupCoords.lat.toFixed(4)}, ${pickupCoords.lng.toFixed(4)})`);
      }

      try {
        const resDest = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${destinationCoords.lat}&lon=${destinationCoords.lng}&zoom=18&addressdetails=1`, {
          headers: { 'Accept-Language': 'id' }
        });
        const dataDest = await resDest.json();
        if (dataDest) setDestinationAddress(parseOsmAddress(dataDest));
      } catch {
        setDestinationAddress(`Lokasi Tujuan (${destinationCoords.lat.toFixed(4)}, ${destinationCoords.lng.toFixed(4)})`);
      }
    }
    updateFareAndAddress();
  }, [pickupCoords, destinationCoords]);

  useEffect(() => {
    async function initUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/login');
    }
    initUser();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPickupCoords(coords);
        setDestinationCoords({ lat: coords.lat + 0.01, lng: coords.lng + 0.01 });
      });
    }
  }, [supabase, router]);

  const handleMapClick = (lat: number, lng: number) => {
    const newCoords = { lat, lng };
    setFlyTarget(newCoords);
    if (activePinMode === 'STORE') {
      setPickupCoords(newCoords);
    } else {
      setDestinationCoords(newCoords);
    }
  };

  const handleCurrentGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (activePinMode === 'STORE') {
          setPickupCoords(coords);
        } else {
          setDestinationCoords(coords);
        }
        setFlyTarget(coords);
      });
    }
  };

  const executeCheckout = async (method: 'Tunai (Cash)' | 'QRIS') => {
    if (!packageDetail.trim() || !receiverName.trim()) {
      alert('Mohon isi nama penerima dan detail paket!');
      return;
    }
    setLoadingCheckout(true);

    const detailPenerima = `Penerima: ${receiverName} (${receiverPhone}) | Barang: ${packageDetail}`;

    const res = await createOrderAction({
      service: 'SEND',
      pickupAddress: pickupAddress || 'Lokasi Jemput',
      destinationAddress: `${destinationAddress} | ${detailPenerima}`,
      distanceKm,
      paymentMethod: method === 'Tunai (Cash)' ? 'CASH' : 'DIGITAL_PAYMENT',
      pickupLat: pickupCoords.lat,
      pickupLng: pickupCoords.lng,
      destinationLat: destinationCoords.lat,
      destinationLng: destinationCoords.lng,
      customFare: fare,
    });
    setLoadingCheckout(false);
    setShowQrisModal(false);
    if (res.error) alert(res.error); else router.push('/customer');
  };

  const handleCheckout = () => {
    if (!packageDetail.trim() || !receiverName.trim()) {
      alert('Mohon isi nama penerima dan detail paket!');
      return;
    }
    if (paymentMethod === 'QRIS') {
      setShowQrisModal(true);
      return;
    }
    executeCheckout('Tunai (Cash)');
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-32 font-sans text-slate-100 relative">
      {showQrisModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl space-y-5 text-center relative text-slate-100">
            <button onClick={() => setShowQrisModal(false)} className="absolute top-5 right-5 p-2 bg-slate-700/50 hover:bg-slate-700 rounded-full text-slate-300">
              <X className="w-4 h-4" />
            </button>
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/25">
              <QrCode className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Scan QRIS untuk Membayar</h3>
              <p className="text-xs text-emerald-400 font-bold mt-1">Total Ongkir: {formatRupiah(fare)}</p>
            </div>
            <div className="p-3 bg-white rounded-2xl flex flex-col items-center justify-center space-y-2 shadow-inner">
              <img src="/images/qris.jpg" alt="QRIS GASKE.ID" className="w-52 h-52 object-contain rounded-xl" />
              <p className="text-[10px] text-slate-600 font-semibold">NMID: ID1026508198631 (GASKE.ID)</p>
            </div>
            <button type="button" onClick={() => executeCheckout('QRIS')} disabled={loadingCheckout} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs">
              {loadingCheckout ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Saya Sudah Bayar via QRIS'}
            </button>
          </div>
        </div>
      )}

      <header className="bg-slate-800/90 backdrop-blur-xl border-b border-slate-700/60 sticky top-0 z-30 px-5 py-4 shadow-xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-black text-white tracking-tight leading-none">GASKE SEND</h1>
              <p className="text-[10px] text-rose-400 font-semibold mt-1">Kirim Paket Cepat & Aman</p>
            </div>
          </div>
          <button type="button" onClick={handleCurrentGPS} className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-xl flex items-center gap-1.5">
            <LocateFixed className="w-3.5 h-3.5" /> GPS Saya
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-5 space-y-4">
        <form onSubmit={(e) => { e.preventDefault(); searchPlacesReal(searchQuery); }} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari lokasi jemput / tujuan..."
            className="w-full p-3.5 pl-10 pr-20 bg-slate-800/90 border border-slate-700 rounded-2xl text-xs font-bold text-white shadow-sm focus:ring-2 focus:ring-rose-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
          <button type="submit" className="absolute right-2 top-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-3.5 py-2 rounded-xl transition">
            Cari
          </button>
        </form>

        {loadingSearch && (
          <div className="flex items-center gap-2 py-2 justify-center text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-rose-400" /> Mencari lokasi...
          </div>
        )}

        {places.length > 0 && (
          <div className="bg-slate-800 p-3 rounded-3xl border border-slate-700 shadow-xl space-y-2 max-h-60 overflow-y-auto">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">Pilih Lokasi Hasil Pencarian:</h3>
            <div className="space-y-1.5">
              {places.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => handleSelectPlace(place)}
                  className="w-full p-3 rounded-2xl border border-slate-700 text-left bg-slate-900/60 hover:bg-rose-500/10 hover:border-rose-500/50 transition flex flex-col gap-0.5 shadow-sm"
                >
                  <p className="font-bold text-xs text-white">{place.name}</p>
                  <p className="text-[11px] text-slate-400 leading-tight">{place.address}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-slate-800/90 backdrop-blur-xl p-4 rounded-3xl border border-slate-700/60 shadow-xl space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActivePinMode('STORE')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
                activePinMode === 'STORE' ? 'bg-emerald-600 text-white ring-2 ring-emerald-300' : 'bg-slate-700/60 text-slate-300'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Atur Titik Jemput (A)
            </button>
            <button
              type="button"
              onClick={() => setActivePinMode('HOUSE')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
                activePinMode === 'HOUSE' ? 'bg-rose-600 text-white ring-2 ring-rose-300' : 'bg-slate-700/60 text-slate-300'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Atur Titik Tujuan (B)
            </button>
          </div>

          <p className="text-[11px] text-center font-semibold text-slate-400">
            {activePinMode === 'STORE' ? '📍 Ketuk peta untuk memindahkan Pin Hijau (Jemput)' : '📍 Ketuk peta untuk memindahkan Pin Merah (Tujuan)'}
          </p>

          <DualPinMap
            storeCoords={pickupCoords}
            customerCoords={destinationCoords}
            storeLabel={pickupAddress || "Titik Jemput (A)"}
            customerLabel={destinationAddress || "Titik Tujuan (B)"}
            activePinMode={activePinMode}
            flyTarget={flyTarget}
            onSelectCoords={handleMapClick}
          />

          <div className="flex justify-between items-center pt-1">
            <span className="text-xs font-bold text-slate-300">Jarak: <strong className="text-rose-400">{distanceKm.toFixed(1).replace('.', ',')} KM</strong></span>
            <button
              type="button"
              onClick={handleCurrentGPS}
              className="text-[10px] font-bold text-rose-300 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
            >
              <LocateFixed className="w-3 h-3" /> Gunakan GPS Saya
            </button>
          </div>
        </div>

        <div className="bg-slate-800/90 backdrop-blur-xl p-4 rounded-3xl border border-slate-700/60 shadow-xl space-y-3">
          <div className="space-y-1 bg-slate-900/60 p-3 rounded-2xl border border-slate-700/50">
            <label className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Lokasi Jemput Paket (A):
            </label>
            <p className="text-xs font-bold text-white truncate">{pickupAddress || 'Memuat alamat...'}</p>
          </div>
          <div className="space-y-1 bg-slate-900/60 p-3 rounded-2xl border border-slate-700/50">
            <label className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Lokasi Tujuan Paket (B):
            </label>
            <p className="text-xs font-bold text-white truncate">{destinationAddress || 'Memuat alamat...'}</p>
          </div>
        </div>

        <div className="bg-slate-800/90 backdrop-blur-xl p-4 rounded-3xl border border-slate-700/60 shadow-xl space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><User className="w-3 h-3 text-rose-400" /> Nama Penerima</label>
              <input type="text" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder="Nama" required
                className="w-full p-3 bg-slate-900/90 rounded-2xl text-xs text-white border border-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Phone className="w-3 h-3 text-rose-400" /> No. HP Penerima</label>
              <input type="text" value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} placeholder="08xxx" required
                className="w-full p-3 bg-slate-900/90 rounded-2xl text-xs text-white border border-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Edit3 className="w-3.5 h-3.5 text-rose-400" /> Detail / Jenis Paket (Wajib)</label>
            <textarea value={packageDetail} onChange={(e) => setPackageDetail(e.target.value)} placeholder="Cth: Dokumen penting, Kotak kecil berisi pakaian..." rows={3} required
              className="w-full p-3.5 bg-slate-900/90 rounded-2xl text-xs text-white border border-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" />
          </div>
        </div>

        <div className="bg-slate-800/90 backdrop-blur-xl p-4 rounded-3xl border border-slate-700/60 shadow-xl space-y-2.5">
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
                  paymentMethod === m.label ? 'bg-rose-600 text-white border-rose-500 shadow-md' : 'bg-slate-900/60 text-slate-300 border-slate-700'
                }`}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-30 shadow-2xl">
        <div className="max-w-md mx-auto space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Tarif Pengiriman:</span>
            <span className="font-black text-white text-base">{formatRupiah(fare)}</span>
          </div>
          <button onClick={handleCheckout} disabled={loadingCheckout} className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs">
            {loadingCheckout ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Package className="w-4 h-4" /> Pesan Gaske Send ({paymentMethod})</>}
          </button>
        </div>
      </div>
    </div>
  );
}