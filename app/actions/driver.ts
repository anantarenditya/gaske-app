'use server';

import { createClient } from '@/lib/supabase/server';

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

// Fungsi dari Langkah 3 (Update Posisi Driver)
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