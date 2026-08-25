'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function registerDriverAction(formData: FormData) {
  try {
    const supabase = await createClient();

    // Ambil data sesuai dengan attribute 'name' di form frontend
    const fullName = formData.get('fullName') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const brandModel = formData.get('brandModel') as string;
    const plateNumber = formData.get('plateNumber') as string;

    // 1. Daftarkan akun ke Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'driver',
        },
      },
    });

    if (authError) {
      return { error: authError.message };
    }

    const userId = authData.user?.id;

    if (userId) {
      // 2. Simpan detail tambahan ke tabel profiles
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        full_name: fullName,
        phone: phoneNumber,
        role: 'driver',
        vehicle_type: brandModel,
        plate_number: plateNumber,
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        return { error: profileError.message };
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: 'Terjadi kesalahan saat pendaftaran driver.' };
  }

  redirect('/driver/dashboard');
}

// Fungsi untuk Status Online/Offline Driver
export async function toggleDriverOnlineAction(isOnline: boolean) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'Sesi habis, silakan login kembali.' };
    }

    const { error } = await supabase
      .from('driver_profiles')
      .update({ is_online: isOnline })
      .eq('id', user.id);

    if (error) {
      return { error: error.message };
    }

    return { success: true, isOnline };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: 'Gagal memperbarui status driver.' };
  }
}

// Fungsi untuk Memperbarui Posisi Driver
export async function updateDriverLocationAction(lat: number, lng: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Tidak terautentikasi.' };

  const { error } = await supabase
    .from('driver_profiles')
    .update({
      current_lat: lat,
      current_lng: lng,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}