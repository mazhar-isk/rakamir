export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
}

// ---- Auth ----
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// ---- User ----
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
  created_at: string;
}

// ---- Address ----
export interface Address {
  id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
}

// ---- Product ----
export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  stock: number;
  images: string[];
  category: Category;
  tags: string[];
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_new: boolean;
  sold_count: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  parent_id?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price_modifier: number;
  stock: number;
}

// ---- Cart ----
export interface CartItem {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  item_count: number;
}

// ---- Order ----
export type OrderStatus =
  | 'pending'
  | 'payment_pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  items: OrderItem[];
  shipping_address: Address;
  shipping_method: string;
  shipping_cost: number;
  subtotal: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
  subtotal: number;
}

// ---- Shipment Tracking ----
export interface TrackingEvent {
  timestamp: string;
  location: string;
  description: string;
  status: string;
}

export interface ShipmentTracking {
  tracking_number: string;
  courier: string;
  status: string;
  estimated_delivery: string;
  events: TrackingEvent[];
}

// ---- Pagination ----
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ---- Dashboard (Backoffice) ----
export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  revenue_growth: number;
  order_growth: number;
}

export interface RevenueChart {
  labels: string[];
  datasets: { label: string; data: number[] }[];
}

// ---- Role ----
export interface Role {
  id: string;
  name: string;
  slug: string;
  permissions: string[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}
