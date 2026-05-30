import { PaginatedResponse } from '../types';
import {
  MOCK_ADDRESS,
  MOCK_ADMIN_USERS,
  MOCK_CATEGORIES,
  MOCK_CUSTOMERS,
  MOCK_DASHBOARD_STATS,
  MOCK_ORDERS,
  MOCK_PRODUCTS,
  MOCK_ROLES,
  MOCK_TRACKING,
  MOCK_WISHLIST
} from './data';

/** Build a paginated envelope from an array */
function paginate<T>(items: T[], page = 1, perPage = 10): PaginatedResponse<T> {
  const start = (page - 1) * perPage;
  return {
    data: items.slice(start, start + perPage),
    meta: { current_page: page, last_page: Math.ceil(items.length / perPage), per_page: perPage, total: items.length },
  };
}

/** Parse ?page and ?per_page from a query string */
function parsePage(search: string) {
  const p = new URLSearchParams(search);
  return { page: parseInt(p.get('page') ?? '1', 10), perPage: parseInt(p.get('per_page') ?? '10', 10), q: p.get('q') ?? '' };
}

/** Try to match URL against a pattern; returns named captures or null */
function match(url: string, pattern: RegExp): RegExpMatchArray | null {
  return url.replace(/\?.*$/, '').match(pattern);
}

type MockResponse = { code: string; message: string; data: unknown };

/** Main dispatcher — returns a mock response for a given method + url, or null if unhandled */
export function resolveMock(method: string, rawUrl: string, body?: any): MockResponse | null {
  const [path, qs = ''] = rawUrl.split('?');
  const { page, perPage, q } = parsePage(qs);
  const m = method.toUpperCase();

  // ── AUTH ───────────────────────────────────────────────────────────────────
  if (m === 'POST' && (path.endsWith('/auth/login') || path.endsWith('/v1/admin/login'))) {
    return {
      code: '200',
      message: "success",
      data: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'a-1', name: 'Muhammad Azhar Iskandar', email: 'azhar@rakamir.id',
          role: { id: 'r-1', slug: 'superadmin', name: 'Super Admin', permissions: [] },
          is_active: true, created_at: '2024-01-01T00:00:00.000Z',
        },
      },
    };
  }

  if (m === 'POST' && path.endsWith('/auth/register')) {
    return { code: '201', message: 'success', data: { message: 'Registered successfully' } };
  }

  // ── PRODUCTS ───────────────────────────────────────────────────────────────
  if (m === 'GET' && match(path, /\/products\/([^/]+)$/)) {
    const slug = path.split('/').pop()!;
    const product = MOCK_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
    return product ? { code: '200', message: 'success', data: product } : { code: '404', message: 'not_found', data: { message: 'Not found' } };
  }

  if (m === 'GET' && path.match(/\/(admin\/)?products$/)) {
    const params = new URLSearchParams(qs);
    let items = [...MOCK_PRODUCTS];
    if (params.get('is_featured') === 'true') items = items.filter((p) => p.is_featured);
    const filter = params.get('filter');
    if (filter === 'new' || params.get('is_new') === 'true') items = items.filter((p) => p.is_new);
    if (filter === 'promo') items = items.filter((p) => p.discount_percentage !== undefined && p.discount_percentage > 0);
    
    const categoryParam = params.get('category');
    if (categoryParam) {
      items = items.filter((p) => 
        p.category?.slug === categoryParam || 
        p.category?.id === categoryParam ||
        p.categories?.some((c) => c.slug === categoryParam || c.id === categoryParam)
      );
    }

    const sort = params.get('sort');
    if (sort === 'sold_count') items.sort((a, b) => b.sold_count - a.sold_count);
    if (sort === 'price_asc') items.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') items.sort((a, b) => b.price - a.price);
    if (sort === 'rating') items.sort((a, b) => b.rating - a.rating);
    if (sort === 'newest') items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    if (q) items = items.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    return { code: '200', message: 'success', data: paginate(items, page, perPage) };
  }

  if (m === 'POST' && path.match(/\/admin\/products$/)) {
    return { code: '201', message: 'success', data: { id: `p-mock-${Date.now()}` } };
  }

  if (m === 'PUT' && match(path, /\/admin\/products\/([^/]+)$/)) {
    return { code: '200', message: 'success', data: { message: 'Updated' } };
  }

  if (m === 'DELETE' && match(path, /\/admin\/products\/([^/]+)$/)) {
    return { code: '200', message: 'success', data: { message: 'Deleted' } };
  }

  // ── CATEGORIES ─────────────────────────────────────────────────────────────
  if (m === 'GET' && path.match(/\/(admin\/)?categories$/)) {
    const params = new URLSearchParams(qs);
    let items = [...MOCK_CATEGORIES];
    // if (params.get('is_featured') === 'true') items = items.filter((c) => c.is_featured);
    // if (params.get('is_new') === 'true') items = items.filter((c) => c.is_new);
    // if (params.get('sort') === 'sold_count') items.sort((a, b) => b.sold_count - a.sold_count);
    // if (params.get('sort') === 'price_asc') items.sort((a, b) => a.price - b.price);
    // if (params.get('sort') === 'price_desc') items.sort((a, b) => b.price - a.price);
    if (q) items = items.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
    return { code: '200', message: 'success', data: paginate(items, page, perPage) };
  }

  // ── ORDERS ─────────────────────────────────────────────────────────────────
  if (m === 'GET' && match(path, /\/(admin\/)?orders\/([^/]+)$/) && !path.endsWith('/status')) {
    const id = path.split('/').pop()!;
    const order = MOCK_ORDERS.find((o) => o.id === id || o.order_number === id);
    return order ? { code: '200', message: 'success', data: order } : { code: '404', message: 'not_found', data: { message: 'Not found' } };
  }

  if (m === 'GET' && path.match(/\/(admin\/)?orders$/)) {
    const params = new URLSearchParams(qs);
    let items = [...MOCK_ORDERS];
    const status = params.get('status');
    if (status) items = items.filter((o) => o.status === status);
    if (q) items = items.filter((o) => o.order_number.includes(q) || o.shipping_address.recipient_name.toLowerCase().includes(q.toLowerCase()));
    return { code: '200', message: 'success', data: paginate(items, page, perPage) };
  }

  if (m === 'POST' && path.endsWith('/orders')) {
    const newOrder = { ...MOCK_ORDERS[0], id: `ord-mock-${Date.now()}`, order_number: `ORD-MOCK-${Date.now()}`, status: 'payment_pending', created_at: new Date().toISOString() };
    return { code: '201', message: 'success', data: newOrder };
  }

  if (m === 'PATCH' && match(path, /\/orders\/([^/]+)\/status$/)) {
    return { code: '200', message: 'success', data: { message: 'Status updated' } };
  }

  // ── ACCOUNT ────────────────────────────────────────────────────────────────
  if (m === 'GET' && path.endsWith('/account/orders')) {
    return { code: '200', message: 'success', data: paginate(MOCK_ORDERS, page, perPage) };
  }

  if (m === 'GET' && match(path, /\/account\/orders\/([^/]+)$/)) {
    const id = path.split('/').pop()!;
    const order = MOCK_ORDERS.find((o) => o.id === id) ?? MOCK_ORDERS[0];
    return { code: '200', message: 'success', data: order };
  }

  if (m === 'GET' && path.endsWith('/account/profile')) {
    return { code: '200', message: 'success', data: { id: 'u-1', name: 'Muhammad Azhar Iskandar', email: 'azhar@example.com', phone: '081234567890' } };
  }

  if (m === 'PUT' && path.endsWith('/account/profile')) {
    return { code: '200', message: 'success', data: { message: 'Profile updated' } };
  }

  if (m === 'GET' && path.endsWith('/account/addresses')) {
    return { code: '200', message: 'success', data: [MOCK_ADDRESS] };
  }

  // ── SHIPMENTS ──────────────────────────────────────────────────────────────
  if (m === 'GET' && match(path, /\/shipments\/([^/]+)$/)) {
    const trackingNumber = path.split('/').pop()!;
    const tracking = MOCK_TRACKING[trackingNumber] ?? Object.values(MOCK_TRACKING)[0];
    return { code: '200', message: 'success', data: tracking };
  }

  // ── ADMIN DASHBOARD ───────────────────────────────────────────────────────
  if (m === 'GET' && path.endsWith('/admin/dashboard/stats')) {
    return { code: '200', message: 'success', data: MOCK_DASHBOARD_STATS };
  }

  // ── CUSTOMERS ─────────────────────────────────────────────────────────────
  if (m === 'GET' && path.match(/\/admin\/customers$/)) {
    let items = [...MOCK_CUSTOMERS];
    if (q) items = items.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase()));
    return { code: '200', message: 'success', data: paginate(items, page, perPage) };
  }

  if (m === 'GET' && match(path, /\/admin\/customers\/([^/]+)$/)) {
    const id = path.split('/').pop()!;
    const customer = MOCK_CUSTOMERS.find((c) => c.id === id) ?? MOCK_CUSTOMERS[0];
    const customerOrders = MOCK_ORDERS.slice(0, 2);
    return {
      code: '200',
      message: 'success',
      data: {
        ...customer,
        orders: customerOrders,
        total_spent: customerOrders.reduce((s, o) => s + o.total, 0),
        order_count: customerOrders.length,
      },
    };
  }

  // ── ROLES ─────────────────────────────────────────────────────────────────
  if (m === 'GET' && path.endsWith('/admin/roles')) {
    return { code: '200', message: 'success', data: MOCK_ROLES };
  }

  if (m === 'POST' && path.endsWith('/admin/roles')) {
    return { code: '201', message: 'success', data: { id: `r-mock-${Date.now()}`, message: 'Role created' } };
  }

  if (m === 'DELETE' && match(path, /\/admin\/roles\/([^/]+)$/)) {
    return { code: '200', message: 'success', data: { message: 'Role deleted' } };
  }

  // ── ADMIN USERS ───────────────────────────────────────────────────────────
  if (m === 'GET' && path.match(/\/admin\/users$/)) {
    return { code: '200', message: 'success', data: paginate(MOCK_ADMIN_USERS, page, perPage) };
  }

  if (m === 'POST' && path.endsWith('/admin/users')) {
    return { code: '201', message: 'success', data: { id: `a-mock-${Date.now()}`, message: 'Admin user created' } };
  }

  if (m === 'PATCH' && match(path, /\/admin\/users\/([^/]+)$/)) {
    return { code: '200', message: 'success', data: { message: 'User updated' } };
  }

  if (m === 'DELETE' && match(path, /\/admin\/users\/([^/]+)$/)) {
    return { code: '200', message: 'success', data: { message: 'User deleted' } };
  }

  // ── ADMIN SHIPMENTS ───────────────────────────────────────────────────────
  if (m === 'GET' && path.match(/\/admin\/shipments$/)) {
    const shipments = MOCK_ORDERS
      .filter((o) => o.tracking_number)
      .map((o, i) => ({
        id: `s-${i + 1}`,
        order_number: o.order_number,
        order_id: o.id,
        tracking_number: o.tracking_number,
        courier: i === 0 ? 'JNE Express' : 'SiCepat Ekspress',
        courier_service: i === 0 ? 'YES' : 'REG',
        recipient: o.shipping_address.recipient_name,
        status: o.status,
        estimated_delivery: '3 Mei 2024',
        events: [],
        created_at: o.created_at,
      }));
    if (q) {
      const filtered = shipments.filter((s) =>
        s.tracking_number?.includes(q) || s.order_number.includes(q)
      );
      return { code: '200', message: 'success', data: paginate(filtered, page, perPage) };
    }
    return { code: '200', message: 'success', data: paginate(shipments, page, perPage) };
  }

  // ── UPLOADS ───────────────────────────────────────────────────────────────
  if (m === 'POST' && path.match(/\/(admin\/)?upload$/)) {
    const randomId = Math.floor(Math.random() * 1000);
    return {
      code: '200',
      message: 'success',
      data: {
        url: `https://picsum.photos/500/500?random=${randomId}`
      }
    };
  }

  // ── STOCK MANAGEMENT ──────────────────────────────────────────────────────
  if (m === 'GET' && match(path, /\/admin\/products\/sku\/([^/]+)$/)) {
    const skuCode = path.split('/').pop()!;
    // Search for a matching SKU in all products
    for (const p of MOCK_PRODUCTS) {
      if (p.skus) {
        const foundSku = p.skus.find((s) => s.sku.toLowerCase() === skuCode.toLowerCase());
        if (foundSku) {
          return {
            code: '200',
            message: 'success',
            data: {
              product_id: p.id,
              product_name: p.name,
              sku_id: foundSku.id,
              sku_code: foundSku.sku,
              picture: foundSku.picture || p.images?.[0],
              options_label: Object.entries(foundSku.option_values_map).map(([optId, valId]) => {
                const opt = p.options?.find(o => o.id === optId);
                const val = opt?.values?.find(v => v.id === valId);
                return `${opt?.name || 'Varian'}: ${val?.value || ''}`;
              }).join(', '),
              current_stock: foundSku.stock
            }
          };
        }
      }
      // If it doesn't have SKUs, check if product ID or slug matches
      if (p.id.toLowerCase() === skuCode.toLowerCase() || p.slug.toLowerCase() === skuCode.toLowerCase()) {
        return {
          code: '200',
          message: 'success',
          data: {
            product_id: p.id,
            product_name: p.name,
            sku_id: p.id,
            sku_code: p.id, // Fallback SKU code to product ID
            picture: p.images?.[0],
            options_label: 'Single Product (Tanpa Varian)',
            current_stock: p.stock
          }
        };
      }
    }
    return { code: '404', message: 'not_found', data: { message: `SKU atau Produk "${skuCode}" tidak ditemukan.` } };
  }

  if (m === 'POST' && path.endsWith('/admin/products/stock/bulk-update')) {
    const updates = body?.updates ?? [];
    // Update the local mock data
    for (const update of updates) {
      for (const p of MOCK_PRODUCTS) {
        if (p.skus) {
          const foundSku = p.skus.find((s) => s.sku.toLowerCase() === update.sku_code.toLowerCase());
          if (foundSku) {
            foundSku.stock = update.stock;
            // Also update total product stock
            p.stock = p.skus.reduce((acc, curr) => acc + curr.stock, 0);
            break;
          }
        }
        if (p.id.toLowerCase() === update.sku_code.toLowerCase()) {
          p.stock = update.stock;
          break;
        }
      }
    }
    return { code: '200', message: 'success', data: { message: 'Stok berhasil diperbarui secara massal!' } };
  }

  // ── FAVORITES ─────────────────────────────────────────────────────────────
  if (m === 'GET' && path === '/favorites') {
    return { code: '200', message: 'success', data: MOCK_WISHLIST };
  }
  if (m === 'GET' && path === '/favorites/products') {
    const favoriteProducts = MOCK_PRODUCTS.filter(p => MOCK_WISHLIST.includes(p.id));
    return { code: '200', message: 'success', data: paginate(favoriteProducts, page, perPage) };
  }
  if (m === 'POST' && path === '/favorites') {
    const productId = body?.productId;
    if (!productId) return { code: '400', message: 'bad_request', data: { message: 'Product ID required' } };
    const index = MOCK_WISHLIST.indexOf(productId);
    if (index > -1) {
      MOCK_WISHLIST.splice(index, 1);
    } else {
      MOCK_WISHLIST.push(productId);
    }
    return { code: '200', message: 'success', data: MOCK_WISHLIST };
  }

  return null; // unhandled → fall through to real API
}
