'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Mail, Lock, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

export default function CustomerLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    // 1. Proses Login Auth Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      setErrorMessage('Email atau kata sandi salah!');
      setLoading(false);
      return;
    }

    // 2. Cek apakah user ini benar-benar 'customer' di tabel profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile || profile.role !== 'customer') {
      await supabase.auth.signOut(); // Keluarkan kembali jika bukan customer
      setErrorMessage('Akun ini bukan akun Pelanggan (Customer)! Silakan login di halaman Driver.');
      setLoading(false);
      return;
    }

    // 3. Jika lolos, arahkan ke beranda customer
    router.push('/customer');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/60 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/25">
            <User className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">Login Pelanggan GASKE</h1>
          <p className="text-xs text-slate-400">Masuk untuk memesan layanan ride, food, atau send</p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs font-semibold text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Email</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-900/90 rounded-2xl text-xs text-white border border-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Kata Sandi</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-900/90 rounded-2xl text-xs text-white border border-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Masuk Sekarang <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-700/60 space-y-2">
          <p className="text-xs text-slate-400">
            Belum punya akun?{' '}
            <Link href="/customer/register" className="text-emerald-400 font-bold hover:underline">
              Daftar di sini
            </Link>
          </p>
          <p className="text-[11px]">
            Masuk sebagai Driver?{' '}
            <Link href="/driver/login" className="text-rose-400 font-bold hover:underline">
              Login Driver ➔
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}