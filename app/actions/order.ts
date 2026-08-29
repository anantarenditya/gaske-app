'use server';

import { createClient } from '@/lib/supabase/server';
import { ServiceType } from '@/types';

export interface CreateOrderInput {
  service: ServiceType; 
  pickupAddress: string;
  destinationAddress: string;
  distanceKm: number;
  paymentMethod: 'CASH' | 'DIGITAL_PAYMENT';
  pickupLat?: number;
  pickupLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  customFare?: number; // <-- Parameter baru untuk menerima harga pasti dari frontend
}

export async function calculateFareAction(service: ServiceType, distanceKm: number) {
  const supabase = await createClient();

  const { data: rule, error } = await supabase
    .from('pricing_rules')
    .select('*')
    .eq('service', service)
    .maybeSingle();

  if (error || !rule) {
    const baseFare = 5000;
    const pricePerKm = 2500;
    const calculated = baseFare + distanceKm * pricePerKm;
    return { fare: Math.max(calculated, 8000) };
  }

  const baseFare = Number(rule.base_fare);
  const pricePerKm = Number(rule.price_per_km);
  const minimumFare = Number(rule.minimum_fare);

  const calculatedFare = baseFare + distanceKm * pricePerKm;
  const finalFare = Math.max(calculatedFare, minimumFare);

  return { fare: finalFare };
}

export async function createOrderAction(input: CreateOrderInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Anda harus login terlebih dahulu.' };

  await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || 'Pelanggan',
    phone_number: user.user_metadata?.phone_number || '',
    role: 'customer',
  }, { onConflict: 'id' });

  await supabase.from('customer_profiles').upsert({
    id: user.id,
  }, { onConflict: 'id' });

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('phone_number')
    .eq('id', user.id)
    .maybeSingle();

  // JIKA CUSTOMFARE DISEDIAKAN, GUNAKAN ITU. JIKA TIDAK, HITUNG DARI DATABASE.
  const fare = input.customFare !== undefined 
    ? input.customFare 
    : (await calculateFareAction(input.service, input.distanceKm)).fare;

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      customer_id: user.id,
      customer_phone: userProfile?.phone_number || user.user_metadata?.phone_number || '', 
      service: input.service,
      status: 'SEARCHING_DRIVER',
      pickup_address: input.pickupAddress,
      destination_address: input.destinationAddress,
      distance_km: input.distanceKm,
      estimated_price: fare,
      final_price: fare,
      payment_method: input.paymentMethod,
      pickup_lat: input.pickupLat || -7.2575,
      pickup_lng: input.pickupLng || 112.7521,
      destination_lat: input.destinationLat || -7.2891,
      destination_lng: input.destinationLng || 112.7344,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, orderId: order.id };
}

export async function acceptOrderAction(orderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Tidak terautentikasi.' };

  const { data, error } = await supabase
    .from('orders')
    .update({
      driver_id: user.id,
      status: 'ACCEPTED',
    })
    .eq('id', orderId)
    .eq('status', 'SEARCHING_DRIVER')
    .select();

  if (error) {
    return { error: error.message };
  }

  if (!data || data.length === 0) {
    return { error: 'Pesanan sudah diambil driver lain atau dibatalkan.' };
  }

  return { success: true };
}

export async function updateOrderStatusAction(
  orderId: string, 
  newStatus: 'DRIVER_ARRIVED' | 'IN_TRIP' | 'COMPLETED' | 'CANCELLED'
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Tidak terautentikasi.' };

  const updateData: Record<string, unknown> = {
    status: newStatus,
  };

  if (newStatus === 'COMPLETED') {
    updateData.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .eq('driver_id', user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}