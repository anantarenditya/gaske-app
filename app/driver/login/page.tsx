'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Mail, Lock, ArrowRight, Car, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function DriverLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      setErrorMessage('Email atau kata sandi salah!');
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile || profile.role !== 'driver') {
      await supabase.auth.signOut();
      setErrorMessage('Akun ini bukan akun Driver! Silakan login di halaman Pelanggan.');
      setLoading(false);
      return;
    }

    router.push('/driver');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/60 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/25">
            <Car className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">Login Driver GASKE</h1>
          <p className="text-xs text-slate-400">Masuk untuk menerima pesanan dari pelanggan</p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs font-semibold text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Email Driver</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@gaske.id"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-900 rounded-2xl text-xs text-white placeholder-slate-500 border border-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Kata Sandi</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-12 py-3 bg-slate-900 rounded-2xl text-xs text-white placeholder-slate-500 border border-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Masuk Sebagai Driver <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-700/60 space-y-2">
          <p className="text-[11px]">
            Masuk sebagai Pelanggan?{' '}
            <Link href="/login" className="text-blue-400 font-bold hover:underline">
              Login Pelanggan ➔
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}