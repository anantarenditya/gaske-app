'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, User, Phone, Mail, Lock, LogOut, Save, Loader2, ShieldCheck, Eye, EyeOff, Bell } from 'lucide-react';

export default function CustomerProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    async function fetchUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      setEmail(user.email || '');
      setNewEmail(user.email || '');

      // Sinkronisasi User ID ke OneSignal
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function(onesignal: any) {
        await onesignal.login(user.id);
      });

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name || '');
        setPhone(profile.phone_number || ''); 
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
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      alert('Gagal memperbarui profil: ' + profileError.message);
      setSaving(false);
      return;
    }

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

  const handleRequestNotification = async () => {
    setNotifLoading(true);

    // Pengaman waktu (timeout) 10 detik untuk mengantisipasi jaringan lambat
    const timeout = setTimeout(() => {
      setNotifLoading(false);
      alert('Permintaan izin memakan waktu terlalu lama. Pastikan URL aplikasi Anda sudah terdaftar di Dashboard OneSignal.');
    }, 10000);

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function(onesignal: any) {
      try {
        clearTimeout(timeout);
        const permission = await onesignal.Notifications.requestPermission();
        setNotifLoading(false);
        
        if (permission) {
          alert('Notifikasi berhasil diaktifkan di perangkat ini!');
        } else {
          alert('Izin notifikasi ditolak oleh perangkat Anda.');
        }
      } catch (error) {
        clearTimeout(timeout);
        setNotifLoading(false);
        console.error('Gagal meminta izin:', error);
        alert('Terjadi kesalahan saat mengaktifkan notifikasi.');
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-emerald-400 gap-2 font-sans">
        <Loader2 className="w-6 h-6 animate-spin" /> Memuat Profil...
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
              <h1 className="text-sm font-black text-white tracking-tight leading-none">Profil Saya</h1>
              <p className="text-[10px] text-emerald-400 font-semibold mt-1">Kelola informasi akun & keamanan</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-5 space-y-4">
        <div className="bg-gradient-to-br from-emerald-900/60 to-slate-800 p-6 rounded-3xl border border-emerald-500/20 shadow-xl space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" /> Akun Terverifikasi
          </div>
          <h2 className="text-lg font-black text-white">{fullName || 'Pengguna GASKE'}</h2>
          <p className="text-xs text-slate-400">{email}</p>
        </div>

        {/* SECTION NOTIFIKASI ONESIGNAL */}
        <div className="bg-slate-800/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/60 shadow-xl space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-700/60 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-emerald-400" /> Notifikasi Pesanan
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Aktifkan izin notifikasi agar Anda mendapatkan info status pesanan secara instan langsung di HP Anda.
          </p>
          <button
            type="button"
            onClick={handleRequestNotification}
            disabled={notifLoading}
            className="w-full py-3.5 bg-slate-700 hover:bg-slate-600 text-emerald-400 font-black rounded-2xl text-xs shadow-md flex items-center justify-center gap-2 transition border border-emerald-500/30"
          >
            {notifLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />} Aktifkan Notifikasi Perangkat
          </button>
        </div>

        <form onSubmit={handleUpdateProfile} className="bg-slate-800/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/60 shadow-xl space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-700/60">
            Informasi Pribadi
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" /> Nama Lengkap
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" /> Nomor Telepon / WhatsApp
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 08123456789"
              className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-400" /> Alamat Email
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Masukkan email baru"
              className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
            />
          </div>

          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pt-2 pb-1 border-b border-slate-700/60">
            Keamanan Akun
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Password Baru (Opsional)
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kosongkan jika tidak ingin mengubah password"
                className="w-full p-3.5 pr-11 bg-slate-900 border border-slate-700 rounded-2xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-emerald-400 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs shadow-lg flex items-center justify-center gap-2 transition mt-4"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan Perubahan
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