'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Email atau password salah. Silakan periksa kembali.' };
  }

  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    const role = profile?.role;

    if (role === 'admin') redirect('/admin');
    if (role === 'driver') redirect('/driver');
    redirect('/customer');
  }

  return { error: 'Terjadi kesalahan tidak terduga.' };
}

export async function registerAction(formData: FormData) {
  const fullName = formData.get('fullName') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phoneNumber,
        role: 'customer',
      },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  if (authData.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      role: 'customer',
      full_name: fullName,
      phone_number: phoneNumber,
      email,
    });

    if (profileError) return { error: profileError.message };

    const { error: customerError } = await supabase.from('customer_profiles').insert({
      id: authData.user.id,
    });

    if (customerError) return { error: customerError.message };

    redirect('/customer');
  }

  return { error: 'Gagal memproses pendaftaran.' };
}