'use client';

import { useState } from 'react';
import Link from 'next/link';
import { registerDriverAction } from '@/app/actions/driver';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function SimpleDriverRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await registerDriverAction(formData);

    if (result?.error) {
      setErrorMessage(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <Link href="/" className="text-3xl font-black text-emerald-600 tracking-tight">
            GASKE
          </Link>
          <h1 className="mt-2 text-xl font-bold text-slate-900">Daftar Mitra Driver</h1>
          <p className="text-xs text-slate-500">Isi data singkat & langsung siap narik.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Lengkap</label>
              <input name="fullName" type="text" required placeholder="Budi Santoso" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nomor HP / WhatsApp</label>
              <input name="phoneNumber" type="tel" required placeholder="081234567890" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
              <input name="email" type="email" required placeholder="driver@gaske.id" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
              <input name="password" type="password" required minLength={6} placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Motor</label>
                <input name="brandModel" type="text" required placeholder="Honda Beat" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Plat Nomor</label>
                <input name="plateNumber" type="text" required placeholder="N 1234 AB" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Gabung Mitra Sekarang <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}