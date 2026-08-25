export type UserRole = 'customer' | 'driver' | 'admin';

export type ServiceType = 'RIDE' | 'SEND' | 'FOOD' | 'MART';

export type OrderStatus =
  | 'SEARCHING_DRIVER'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ARRIVING'
  | 'DRIVER_ARRIVED'
  | 'TRIP_STARTED'
  | 'TRIP_COMPLETED'
  | 'PICKUP_ARRIVING'
  | 'ITEM_PICKED_UP'
  | 'DELIVERY_IN_PROGRESS'
  | 'DELIVERED'
  | 'CANCELLED';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  phone_number: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

export interface PricingRule {
  id: string;
  service: ServiceType;
  base_fare: number;
  price_per_km: number;
  minimum_fare: number;
  additional_fee: number;
  commission_percentage: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  driver_id?: string;
  service: ServiceType;
  status: OrderStatus;
  pickup_address: string;
  destination_address: string;
  distance_km: number;
  estimated_price: number;
  final_price?: number;
  payment_method: 'CASH' | 'DIGITAL_PAYMENT'| 'FOOD' | 'MART';
  created_at: string;
}