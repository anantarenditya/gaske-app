import { PricingRule } from '@/types';

export interface CalculationResult {
  totalFare: number;
  commissionAmount: number;
  driverIncome: number;
}

/**
 * Menghitung estimasi tarif berdasarkan formula standar GASKE
 * total = base_fare + (distance_km * price_per_km) + additional_fee
 * Jika total < minimum_fare, gunakan minimum_fare.
 */
export function calculateGaskeFare(
  distanceKm: number,
  rule: PricingRule
): CalculationResult {
  const calculatedTotal = rule.base_fare + (distanceKm * rule.price_per_km) + rule.additional_fee;
  const totalFare = Math.max(calculatedTotal, rule.minimum_fare);
  
  const commissionAmount = (totalFare * rule.commission_percentage) / 100;
  const driverIncome = totalFare - commissionAmount;

  return {
    totalFare: Math.round(totalFare),
    commissionAmount: Math.round(commissionAmount),
    driverIncome: Math.round(driverIncome),
  };
}