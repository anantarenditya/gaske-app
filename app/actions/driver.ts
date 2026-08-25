'use server';

import { createClient } from '@/lib/supabase/server';

// Fungsi Pendaftaran Driver
export async function registerDriverAction(formData: {
  fullName: string;
  email: string;
  phone: string;
  vehicleType: string;
  plateNumber: string;
}) {
  try {
    const supabase = await createClient();

    // Contoh penyimpanan ke tabel profiles atau driver_profiles
    const { error } = await supabase.from('profiles').insert({
      full_name: formData.fullName,
      role: 'driver',
      phone: formData.phone,
      // Jika ada kolom tambahan di tabel profiles, bisa disesuaikan di sini
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: 'Gagal melakukan pendaftaran driver.' };
  }
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