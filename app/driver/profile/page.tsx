'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, User, Phone, Mail, Lock, Save, Loader2, Eye, EyeOff } from 'lucide-react';

export default function DriverProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State untuk toggle lihat password

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      setEmail(user.email || '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || '');
        setPhone(profile.phone || '');
      }
      setLoading(false);
    }
    loadProfile();
  }, [supabase, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Simpan pembaruan nama & telepon ke tabel profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone,
      })
      .eq('id', user.id);

    if (profileError) {
      alert('Gagal menyimpan profil: ' + profileError.message);
      setSaving(false);
      return;
    }

    // 2. Ubah email jika ada perubahan
    if (email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: email
      });

      if (emailError) {
        alert('Gagal mengubah email: ' + emailError.message);
        setSaving(false);
        return;
      } else {
        alert('Email berhasil diubah. Periksa kotak masuk email baru Anda untuk verifikasi jika diperlukan.');
      }
    }

    // 3. Ubah password jika form password diisi
    if (password.trim() !== '') {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: password
      });

      if (passwordError) {
        alert('Gagal mengubah password: ' + passwordError.message);
        setSaving(false);
        return;
      }
    }

    alert('Profil berhasil diperbarui!');
    setPassword(''); // Kosongkan password setelah berhasil
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-28 font-sans text-slate-100">
      <header className="bg-slate-800/90 backdrop-blur-xl border-b border-slate-700/60 sticky top-0 z-30 px-5 py-4 shadow-xl">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-black text-white tracking-tight">Profil Saya</h1>
            <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">Kelola informasi akun & keamanan</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6">
        <form onSubmit={handleSave} className="bg-slate-800/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/60 shadow-xl space-y-6">
          
          <div className="space-y-4">
            <h2 className="text-xs font-black tracking-widest text-slate-400 uppercase border-b border-slate-700 pb-2">Informasi Pribadi</h2>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" /> Nama Lengkap
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                required
                className="w-full p-3 bg-slate-900 rounded-xl text-sm text-white border border-slate-700 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" /> Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 08123456789"
                required
                className="w-full p-3 bg-slate-900 rounded-xl text-sm text-white border border-slate-700 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" /> Alamat Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email baru"
                required
                className="w-full p-3 bg-slate-900 rounded-xl text-sm text-white border border-slate-700 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h2 className="text-xs font-black tracking-widest text-slate-400 uppercase border-b border-slate-700 pb-2">Keamanan Akun</h2>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" /> Password Baru (Opsional)
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                  className="w-full p-3 pr-10 bg-slate-900 rounded-xl text-sm text-white border border-slate-700 focus:outline-none focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Simpan Perubahan</>}
          </button>

        </form>
      </main>
    </div>
  );
}