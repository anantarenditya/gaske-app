'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function registerDriverAction(formData: FormData) {
  const supabase = await createClient();

  const fullName = formData.get('fullName') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const brandModel = formData.get('brandModel') as string;
  const plateNumber = formData.get('plateNumber') as string;

  // 1. Daftarkan akun ke Auth Supabase
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phoneNumber,
        role: 'driver',
        vehicle_type: brandModel,
        plate_number: plateNumber,
      },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  const userId = authData.user?.id;

  if (userId) {
    // 2. Simpan ke tabel profiles
    await supabase.from('profiles').upsert({
      id: userId,
      full_name: fullName,
      phone_number: phoneNumber,
      role: 'driver',
      vehicle_type: brandModel,
      plate_number: plateNumber,
      updated_at: new Date().toISOString(),
    });

    // 3. Simpan juga ke tabel driver_profiles (Agar dashboard driver mendeteksinya)
    const { error: driverProfileError } = await supabase.from('driver_profiles').upsert({
      id: userId,
      vehicle_type: brandModel,
      plate_number: plateNumber,
    });

    if (driverProfileError) {
      return { error: driverProfileError.message };
    }
  }

  redirect('/driver/dashboard');
}