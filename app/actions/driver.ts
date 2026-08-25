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
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: fullName,
      phone_number: phoneNumber, // Diperbarui dari phone ke phone_number
      role: 'driver',
      vehicle_type: brandModel,
      plate_number: plateNumber,
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      return { error: profileError.message };
    }
  }

  redirect('/driver/dashboard');
}