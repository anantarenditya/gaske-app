'use client';

import { useState } from 'react';
import Link from 'next/link';
import { registerDriverAction } from '@/app/actions/driver';
import { ArrowRight, Loader2, User, Phone, Mail, Lock, Bike, FileText } from 'lucide-react';

export default function DriverRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await registerDriverAction(formData);

      if (result?.error) {
        setErrorMessage(result.error);
        setLoading(false);
      }
    } catch {
      setErrorMessage('Terjadi kesalahan jaringan atau server.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="text-3xl font-black text-blue-400 tracking-tight">
          GASKE
        </Link>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
          Daftar Mitra Driver
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Isi data singkat & langsung siap bergabung jadi mitra pengemudi.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 shadow-2xl border border-slate-700/60 rounded-3xl">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-semibold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nama Lengkap</label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input name="fullName" type="text" required placeholder="Budi Santoso" className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-bold" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nomor HP / WhatsApp</label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input name="phoneNumber" type="tel" required placeholder="08xxxxxxxxxx" className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-bold" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input name="email" type="email" required placeholder="driver@gaske.id" className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-bold" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input name="password" type="password" required minLength={6} placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Motor</label>
                <div className="relative">
                  <Bike className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                  <input name="brandModel" type="text" required placeholder="Honda Beat" className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Plat Nomor</label>
                <div className="relative">
                  <FileText className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                  <input name="plateNumber" type="text" required placeholder="N 1234 AB" className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-bold" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer text-xs"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Gabung Mitra Sekarang <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Sudah punya akun driver?{' '}
            <Link href="/driver/login" className="font-bold text-blue-400 hover:underline">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}