// ---- Currency ----
export const formatCurrency = (amount: number, currency = 'IDR'): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(Number(amount || 0));
};

// ---- Date ----
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  if (!date) return "-";
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    return typeof date === 'string' ? date : "-";
  }
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }).format(d);
};

export const formatDateTime = (date: string | Date): string => {
  if (!date) return "-";
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    return typeof date === 'string' ? date : "-";
  }
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export type OrderStatus =
  | 'pending'
  | 'payment_pending'
  | 'waiting_confirmation'
  | 'waiting_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'returned';

export const ORDER_STATUS_MAP: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Menunggu', color: '#f59e0b' },
  payment_pending: { label: 'Menunggu Pembayaran', color: '#f97316' },
  waiting_confirmation: { label: 'Menunggu Konfirmasi', color: '#fbbf24' },
  waiting_payment: { label: 'Menunggu Pembayaran', color: '#f97316' },
  paid: { label: 'Sudah Dibayar', color: '#3b82f6' },
  processing: { label: 'Diproses', color: '#8b5cf6' },
  shipped: { label: 'Dikirim', color: '#06b6d4' },
  delivered: { label: 'Terkirim', color: '#22c55e' },
  completed: { label: 'Selesai', color: '#22c55e' },
  cancelled: { label: 'Dibatalkan', color: '#ef4444' },
  refunded: { label: 'Dikembalikan', color: '#6b7280' },
  returned: { label: 'Retur/Dikembalikan', color: '#6b7280' },
};

export const getOrderStatusLabel = (status: OrderStatus): string =>
  ORDER_STATUS_MAP[status]?.label ?? '-';

export const getOrderStatusColor = (status: OrderStatus): string =>
  ORDER_STATUS_MAP[status]?.color ?? '#6b7280';

// ---- Permissions ----
export type Permission =
  | 'products:read'
  | 'products:write'
  | 'orders:read'
  | 'orders:write'
  | 'customers:read'
  | 'customers:write'
  | 'reports:read'
  | 'roles:read'
  | 'roles:write'
  | 'users:read'
  | 'users:write';

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  superadmin: [
    'products:read', 'products:write',
    'orders:read', 'orders:write',
    'customers:read', 'customers:write',
    'reports:read',
    'roles:read', 'roles:write',
    'users:read', 'users:write',
  ],
  product_manager: ['products:read', 'products:write', 'customers:read'],
  order_manager: ['orders:read', 'orders:write', 'customers:read'],
  customer_service: ['customers:read', 'customers:write', 'orders:read'],
  finance: ['reports:read', 'orders:read'],
};

export const hasPermission = (userRole: string, permission: Permission): boolean => {
  const permissions = ROLE_PERMISSIONS[userRole] ?? [];
  return permissions.includes(permission);
};

// ---- String ----
export const truncate = (str: string, length: number): string =>
  str.length > length ? `${str.slice(0, length)}...` : str;

export const slugify = (str: string): string =>
  str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
