'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, User, Phone, Mail, Lock, LogOut, Save, Loader2, ShieldCheck, Eye, EyeOff, Bike, FileText } from 'lucide-react';

export default function DriverProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      setEmail(user.email || '');
      setNewEmail(user.email || '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name || '');
        setPhone(profile.phone_number || '');
        setVehicleType(profile.vehicle_type || '');
        setPlateNumber(profile.plate_number || '');
      }

      const { data: driverProfile } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (driverProfile) {
        if (!vehicleType && driverProfile.vehicle_type) setVehicleType(driverProfile.vehicle_type);
        if (!plateNumber && driverProfile.plate_number) setPlateNumber(driverProfile.plate_number);
      }

      setLoading(false);
    }

    fetchUserData();
  }, [supabase, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: fullName,
        phone_number: phone,
        vehicle_type: vehicleType,
        plate_number: plateNumber,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      alert('Gagal memperbarui profil: ' + profileError.message);
      setSaving(false);
      return;
    }

    await supabase
      .from('driver_profiles')
      .upsert({
        id: user.id,
        vehicle_type: vehicleType,
        plate_number: plateNumber,
      });

    if (newEmail && newEmail !== email) {
      const { error: emailError } = await supabase.auth.updateUser({ email: newEmail });
      if (emailError) {
        alert('Gagal mengubah email: ' + emailError.message);
        setSaving(false);
        return;
      } else {
        alert('Email berhasil diubah. Silakan cek email baru Anda untuk verifikasi.');
      }
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        alert('Password baru minimal harus 6 karakter!');
        setSaving(false);
        return;
      }
      const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
      if (passwordError) {
        alert('Gagal mengubah password: ' + passwordError.message);
        setSaving(false);
        return;
      }
    }

    alert('Perubahan profil berhasil disimpan!');
    setNewPassword('');
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-blue-400 gap-2 font-sans">
        <Loader2 className="w-6 h-6 animate-spin" /> Memuat Profil Driver...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-28 font-sans text-slate-100">
      <header className="bg-slate-800/90 backdrop-blur-xl border-b border-slate-700/60 sticky top-0 z-30 px-5 py-4 shadow-xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-black text-white tracking-tight leading-none">Profil Mitra Driver</h1>
              <p className="text-[10px] text-blue-400 font-semibold mt-1">Kelola informasi akun & kendaraan</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-5 space-y-4">
        <div className="bg-gradient-to-br from-blue-900/60 to-slate-800 p-6 rounded-3xl border border-blue-500/20 shadow-xl space-y-1">
          <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" /> Mitra Driver Resmi
          </div>
          <h2 className="text-lg font-black text-white">{fullName || 'Driver GASKE'}</h2>
          <p className="text-xs text-slate-400">{email}</p>
        </div>

        <form onSubmit={handleUpdateProfile} className="bg-slate-800/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/60 shadow-xl space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-700/60">
            Informasi Pribadi & Kendaraan
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" /> Nama Lengkap
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-400" /> Nomor Telepon / WhatsApp
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 08123456789"
              className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5 text-blue-400" /> Motor / Kendaraan
              </label>
              <input
                type="text"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                placeholder="Contoh: Honda Beat"
                className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" /> Plat Nomor
              </label>
              <input
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="Contoh: N 1234 AB"
                className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" /> Alamat Email
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Masukkan email baru"
              className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
            />
          </div>

          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pt-2 pb-1 border-b border-slate-700/60">
            Keamanan Akun
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" /> Password Baru (Opsional)
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kosongkan jika tidak ingin mengubah password"
                className="w-full p-3.5 pr-11 bg-slate-900 border border-slate-700 rounded-2xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-blue-400 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-xs shadow-lg flex items-center justify-center gap-2 transition mt-4"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan Perubahan Profil
          </button>
        </form>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-black rounded-2xl text-xs shadow-lg flex items-center justify-center gap-2 transition"
        >
          <LogOut className="w-4 h-4" /> Keluar Akun (Logout)
        </button>
      </main>
    </div>
  );
}