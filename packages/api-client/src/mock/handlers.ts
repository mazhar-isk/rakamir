import { PaginatedResponse, User, Address } from '../types';

import {
  MOCK_ADDRESS,
  MOCK_ADDRESSES,
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

const pendingRegistrations = new Map<string, string>();


/** Build a paginated envelope from an array */
function paginate<T>(items: T[], page = 1, perPage = 10): PaginatedResponse<T> {
  const start = (page - 1) * perPage;
  return {
    data: items.slice(start, start + perPage),
    limit: perPage,
    page: page,
    total: items.length,
    total_pages: Math.ceil(items.length / perPage),
    meta: { current_page: page, last_page: Math.ceil(items.length / perPage), per_page: perPage, total: items.length },
  };
}

/** Parse ?page and ?per_page from a query string */
function parsePage(search: string) {
  const p = new URLSearchParams(search);
  return {
    page: parseInt(p.get('page') ?? '1', 10),
    perPage: parseInt(p.get('per_page') ?? '10', 10),
    q: p.get('search') ?? p.get('q') ?? ''
  };
}

/** Try to match URL against a pattern; returns named captures or null */
function match(url: string, pattern: RegExp): RegExpMatchArray | null {
  return url.replace(/\?.*$/, '').match(pattern);
}

type MockResponse = { code: string; message: string; data: unknown };

/** Main dispatcher — returns a mock response for a given method + url, or null if unhandled */
export function resolveMock(method: string, rawUrl: string, body?: any): MockResponse | null {
  const [path, qs = ''] = rawUrl.split('?');

  // Check if we should only mock selected paths
  const mockedApisEnv = process.env.NEXT_PUBLIC_MOCKED_APIS || '';
  if (mockedApisEnv) {
    const mockedPaths = mockedApisEnv.split(',').map((p) => p.trim()).filter(Boolean);
    if (!mockedPaths.some((mockedPath) => path.includes(mockedPath))) {
      return null;
    }
  }

  const { page, perPage, q } = parsePage(qs);
  const m = method.toUpperCase();

  // ── AUTH ───────────────────────────────────────────────────────────────────
  if (m === 'POST' && path.endsWith('/auth/login/request-otp')) {
    const { phone_number } = body || {};
    if (!phone_number) {
      return { code: '400', message: 'bad_request', data: { message: 'Nomor telepon wajib diisi' } };
    }
    const userExists = MOCK_CUSTOMERS.some((c) => c.phone === phone_number);
    if (!userExists) {
      return { code: '400', message: 'not_found', data: { message: 'Nomor telepon belum terdaftar. Silakan mendaftar terlebih dahulu.' } };
    }
    return {
      code: '200',
      message: 'success',
      data: {
        message: 'OTP berhasil dikirim',
        otp: '123456'
      }
    };
  }

  if (m === 'POST' && path.endsWith('/auth/register')) {
    const { phone_number, full_name } = body || {};
    if (phone_number && full_name) {
      // Storefront Phone registration
      const userExists = MOCK_CUSTOMERS.some((c) => c.phone === phone_number);
      if (userExists) {
        return { code: '400', message: 'bad_request', data: { message: 'Nomor telepon sudah terdaftar. Silakan masuk.' } };
      }
      pendingRegistrations.set(phone_number, full_name);
      return {
        code: '200',
        message: 'success',
        data: {
          message: 'OTP berhasil dikirim',
          otp: '123456'
        }
      };
    }
    // Fallback/original email-based registration
    return { code: '201', message: 'success', data: { message: 'Registered successfully' } };
  }

  if (m === 'POST' && path.endsWith('/auth/verify-otp')) {
    const { phone_number, otp } = body || {};
    if (!phone_number || !otp) {
      return { code: '400', message: 'bad_request', data: { message: 'Nomor telepon dan OTP wajib diisi' } };
    }
    if (otp !== '123456') {
      return { code: '400', message: 'unauthorized', data: { message: 'Kode OTP yang Anda masukkan salah' } };
    }

    let user = MOCK_CUSTOMERS.find((c) => c.phone === phone_number || c.phone_number === phone_number);
    if (!user) {
      const pendingName = pendingRegistrations.get(phone_number);
      const newUser: User = {
        id: `u-mock-${Date.now()}`,
        full_name: pendingName || `User ${phone_number}`,
        email: `${phone_number}@mock.com`,
        phone: phone_number,
        phone_number: phone_number,
        created_at: new Date().toISOString()
      };
      MOCK_CUSTOMERS.push(newUser);
      user = newUser;
      pendingRegistrations.delete(phone_number);
    }

    const activeUser = user!;

    return {
      code: '00',
      message: 'success',
      data: {
        success: true,
        access_token: process.env.NEXT_PUBLIC_MOCK_TOKEN || 'mock-access-token'
      }
    };
  }

  if (m === 'POST' && (path.endsWith('/auth/login') || path.endsWith('/admin/login'))) {
    return {
      code: '200',
      message: "success",
      data: {
        access_token: process.env.NEXT_PUBLIC_MOCK_TOKEN || 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'a-1', name: 'Muhammad Azhar Iskandar', email: 'azhar@rakamir.id',
          role: { id: 'r-1', slug: 'superadmin', name: 'Super Admin', permissions: [] },
          is_active: true, created_at: '2024-01-01T00:00:00.000Z',
        },
      },
    };
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
    if (q) items = items.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
    if (path.includes('/admin/')) {
      return { code: '200', message: 'success', data: paginate(items, page, perPage) };
    }
    return { code: '200', message: 'success', data: items };
  }

  // ── ORDERS ─────────────────────────────────────────────────────────────────
  if (m === 'GET' && match(path, /\/(admin\/)?(orders|transactions)\/([^/]+)$/) && !path.endsWith('/status')) {
    const id = path.split('/').pop()!;
    const order = MOCK_ORDERS.find((o) => o.id === id || o.order_number === id);
    if (order) {
      const tracking = order.tracking_number ? MOCK_TRACKING[order.tracking_number] : undefined;
      const shippingHistories = tracking?.events.map((ev, idx) => ({
        id: `ev-${order.id}-${idx}`,
        status: ev.status,
        description: ev.description,
        location: ev.location,
        created_at: ev.timestamp,
      })) || [];

      const enrichedOrder = {
        ...order,
        shipping_histories: shippingHistories,
        shipment: order.tracking_number ? {
          id: `ship-${order.id}`,
          tracking_number: order.tracking_number,
          courier_name: tracking?.courier_name || 'Standard',
          service_name: order.shipping_method === 'express' ? 'YES' : 'REG',
          recipient_name: order.shipping_address.recipient_name,
          recipient_phone: order.shipping_address.recipient_phone,
          address: order.shipping_address.address,
          city: order.shipping_address.city,
          province: order.shipping_address.province,
          postal_code: order.shipping_address.postal_code,
          shipping_histories: shippingHistories,
        } : undefined,
      };
      return { code: '200', message: 'success', data: enrichedOrder };
    }
    return { code: '404', message: 'not_found', data: { message: 'Not found' } };
  }

  if (m === 'GET' && path.match(/\/(admin\/)?(orders|transactions)$/)) {
    const params = new URLSearchParams(qs);
    let items = [...MOCK_ORDERS];
    const status = params.get('status');
    if (status) items = items.filter((o) => o.status.toLowerCase() === status.toLowerCase());
    if (q) items = items.filter((o) => o.order_number.includes(q) || o.shipping_address?.recipient_name?.toLowerCase().includes(q.toLowerCase()));
    return { code: '200', message: 'success', data: paginate(items, page, perPage) };
  }

  if (m === 'POST' && path.endsWith('/orders')) {
    const newOrder = { ...MOCK_ORDERS[0], id: `ord-mock-${Date.now()}`, order_number: `ORD-MOCK-${Date.now()}`, status: 'payment_pending', created_at: new Date().toISOString() };
    return { code: '201', message: 'success', data: newOrder };
  }

  if (m === 'PATCH' && match(path, /\/(orders|transactions)\/([^/]+)\/status$/)) {
    const id = path.split('/').slice(-2, -1)[0];
    const { status } = body || {};
    const order = MOCK_ORDERS.find((o) => o.id === id || o.order_number === id);
    if (order) {
      const normalizedStatus = status?.toLowerCase() || '';
      order.status = normalizedStatus as any;
      if (normalizedStatus === 'refunded' || normalizedStatus === 'cancelled') {
        order.payment_status = 'refunded';
      }
      return { code: '200', message: 'success', data: order };
    }
    return { code: '404', message: 'not_found', data: { message: 'Order not found' } };
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
    const defaultUser: User = { 
      id: 'u-1', 
      full_name: 'Muhammad Azhar Iskandar', 
      email: 'azhar@example.com', 
      phone: '081234567890',
      phone_number: '081234567890',
      created_at: '2024-01-15T00:00:00.000Z'
    };
    const user = MOCK_CUSTOMERS.length > 0 ? MOCK_CUSTOMERS[MOCK_CUSTOMERS.length - 1] : defaultUser;
    return { 
      code: '200', 
      message: 'success', 
      data: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || user.phone_number || '081234567890',
        phone_number: user.phone_number || user.phone || '081234567890',
        created_at: user.created_at
      } 
    };
  }

  if (m === 'PUT' && path.endsWith('/account/profile')) {
    return { code: '200', message: 'success', data: { message: 'Profile updated' } };
  }

  if (m === 'GET' && path.endsWith('/user/addresses')) {
    return { code: '200', message: 'success', data: MOCK_ADDRESSES };
  }

function getLocationName(id: string, type: 'province' | 'city' | 'district' | 'subdistrict'): string {
  if (!id) return '';
  if (!id.includes('-')) return id; // If it's already a name, keep it
  
  if (type === 'province') {
    if (id === 'prov-10') return 'DKI JAKARTA';
    if (id === 'prov-5') return 'JAWA BARAT';
    return 'DKI JAKARTA'; // fallback
  }
  if (type === 'city') {
    if (id === 'city-136') return 'JAKARTA SELATAN';
    if (id === 'city-137') return 'JAKARTA PUSAT';
    if (id === 'city-21') return 'BANDUNG';
    if (id === 'city-22') return 'BOGOR';
    return 'JAKARTA SELATAN'; // fallback
  }
  if (type === 'district') {
    if (id === 'dist-1339') return 'CILANDAK';
    if (id === 'dist-1331') return 'KEBAYORAN BARU';
    if (id === 'dist-1') return 'COBLONG';
    if (id === 'dist-2') return 'KATAPANG';
    return 'CILANDAK'; // fallback
  }
  if (type === 'subdistrict') {
    if (id === 'sub-17590') return 'CILANDAK BARAT';
    if (id === 'sub-17591') return 'CIPETE SELATAN';
    return 'CILANDAK BARAT'; // fallback
  }
  return id;
}

  if (m === 'POST' && path.endsWith('/user/addresses')) {
    const { label, recipient_name, phone, recipient_phone, address, city, city_id, province, province_id, district, district_id, sub_district, subdistrict_id, postal_code, is_default, is_main } = body || {};
    
    const inputProvince = province_id || province || '';
    const inputCity = city_id || city || '';
    const inputDistrict = district_id || district || '';
    const inputSubDistrict = subdistrict_id || sub_district || '';
    const inputPhone = recipient_phone || phone || '';
    const inputIsMain = is_main !== undefined ? is_main : !!is_default;

    const newAddress: Address = {
      id: `addr-mock-${Date.now()}`,
      label: label || 'Lainnya',
      recipient_name: recipient_name || '',
      recipient_phone: inputPhone,
      address: address || '',
      city: getLocationName(inputCity, 'city'),
      city_id: inputCity,
      province: getLocationName(inputProvince, 'province'),
      province_id: inputProvince,
      district: getLocationName(inputDistrict, 'district'),
      district_id: inputDistrict,
      subdistrict: getLocationName(inputSubDistrict, 'subdistrict'),
      subdistrict_id: inputSubDistrict,
      postal_code: postal_code || '',
      is_main: !!inputIsMain
    };
    if (newAddress.is_main) {
      MOCK_ADDRESSES.forEach((a) => a.is_main = false);
    }
    MOCK_ADDRESSES.push(newAddress);
    return { code: '201', message: 'success', data: newAddress };
  }

  if (m === 'PUT' && match(path, /\/user\/addresses\/([^/]+)$/)) {
    const id = path.split('/').pop()!;
    const addr = MOCK_ADDRESSES.find((a) => a.id === id);
    if (!addr) {
      return { code: '404', message: 'not_found', data: { message: 'Address not found' } };
    }
    const { label, recipient_name, phone, recipient_phone, address, city, city_id, province, province_id, district, district_id, sub_district, subdistrict_id, postal_code, is_default, is_main } = body || {};
    
    const inputProvince = province_id !== undefined ? province_id : province;
    const inputCity = city_id !== undefined ? city_id : city;
    const inputDistrict = district_id !== undefined ? district_id : district;
    const inputSubDistrict = subdistrict_id !== undefined ? subdistrict_id : sub_district;
    const inputPhone = recipient_phone !== undefined ? recipient_phone : phone;
    const inputIsMain = is_main !== undefined ? is_main : is_default;

    addr.label = label !== undefined ? label : addr.label;
    addr.recipient_name = recipient_name !== undefined ? recipient_name : addr.recipient_name;
    if (inputPhone !== undefined) {
      addr.recipient_phone = inputPhone;
    }
    addr.address = address !== undefined ? address : addr.address;
    
    if (inputCity !== undefined) {
      addr.city = getLocationName(inputCity, 'city');
      addr.city_id = inputCity;
    }
    if (inputProvince !== undefined) {
      addr.province = getLocationName(inputProvince, 'province');
      addr.province_id = inputProvince;
    }
    if (inputDistrict !== undefined) {
      addr.district = getLocationName(inputDistrict, 'district');
      addr.district_id = inputDistrict;
    }
    if (inputSubDistrict !== undefined) {
      addr.subdistrict = getLocationName(inputSubDistrict, 'subdistrict');
      addr.subdistrict_id = inputSubDistrict;
    }
    
    addr.postal_code = postal_code !== undefined ? postal_code : addr.postal_code;
    
    if (inputIsMain !== undefined) {
      const makeMain = !!inputIsMain;
      if (makeMain && !addr.is_main) {
        MOCK_ADDRESSES.forEach((a) => a.is_main = false);
        addr.is_main = true;
      } else {
        addr.is_main = makeMain;
      }
    }
    return { code: '200', message: 'success', data: addr };
  }

  if (m === 'DELETE' && match(path, /\/user\/addresses\/([^/]+)$/)) {
    const id = path.split('/').pop()!;
    const index = MOCK_ADDRESSES.findIndex((a) => a.id === id);
    if (index !== -1) {
      const wasMain = MOCK_ADDRESSES[index].is_main;
      MOCK_ADDRESSES.splice(index, 1);
      if (wasMain && MOCK_ADDRESSES.length > 0) {
        MOCK_ADDRESSES[0].is_main = true;
      }
      return { code: '200', message: 'success', data: { message: 'Address deleted' } };
    }
    return { code: '404', message: 'not_found', data: { message: 'Address not found' } };
  }

  if (m === 'PATCH' && match(path, /\/user\/addresses\/([^/]+)\/default$/)) {
    const id = path.split('/').slice(-2, -1)[0];
    const addr = MOCK_ADDRESSES.find((a) => a.id === id);
    if (!addr) {
      return { code: '404', message: 'not_found', data: { message: 'Address not found' } };
    }
    MOCK_ADDRESSES.forEach((a) => a.is_main = false);
    addr.is_main = true;
    return { code: '200', message: 'success', data: addr };
  }

  // ── LOCATIONS ──────────────────────────────────────────────────────────────
  if (m === 'GET' && path.endsWith('/location/provinces')) {
    return {
      code: '200',
      message: 'success',
      data: [
        { id: 'prov-10', name: 'DKI JAKARTA' },
        { id: 'prov-5', name: 'JAWA BARAT' }
      ]
    };
  }

  if (m === 'GET' && path.endsWith('/location/cities')) {
    const params = new URLSearchParams(qs);
    const provId = params.get('province_id');
    let cities = [];
    if (provId === 'prov-10') {
      cities = [
        { id: 'city-136', province_id: 'prov-10', name: 'JAKARTA SELATAN' },
        { id: 'city-137', province_id: 'prov-10', name: 'JAKARTA PUSAT' }
      ];
    } else if (provId === 'prov-5') {
      cities = [
        { id: 'city-21', province_id: 'prov-5', name: 'BANDUNG' },
        { id: 'city-22', province_id: 'prov-5', name: 'BOGOR' }
      ];
    } else {
      cities = [
        { id: 'city-136', province_id: provId || '', name: 'JAKARTA SELATAN' }
      ];
    }
    return { code: '200', message: 'success', data: cities };
  }

  if (m === 'GET' && path.endsWith('/location/districts')) {
    const params = new URLSearchParams(qs);
    const cityId = params.get('city_id');
    let districts = [];
    if (cityId === 'city-136') {
      districts = [
        { id: 'dist-1339', city_id: 'city-136', name: 'CILANDAK' },
        { id: 'dist-1331', city_id: 'city-136', name: 'KEBAYORAN BARU' }
      ];
    } else if (cityId === 'city-21') {
      districts = [
        { id: 'dist-1', city_id: 'city-21', name: 'COBLONG' },
        { id: 'dist-2', city_id: 'city-21', name: 'KATAPANG' }
      ];
    } else {
      districts = [
        { id: 'dist-1339', city_id: cityId || '', name: 'CILANDAK' }
      ];
    }
    return { code: '200', message: 'success', data: districts };
  }

  if (m === 'GET' && path.endsWith('/location/subdistricts')) {
    const params = new URLSearchParams(qs);
    const distId = params.get('district_id');
    let subs = [];
    if (distId === 'dist-1339') {
      subs = [
        { id: 'sub-17590', district_id: 'dist-1339', name: 'CILANDAK BARAT', zip_code: '12430' },
        { id: 'sub-17591', district_id: 'dist-1339', name: 'CIPETE SELATAN', zip_code: '12410' }
      ];
    } else {
      subs = [
        { id: 'sub-17590', district_id: distId || '', name: 'CILANDAK BARAT', zip_code: '12430' }
      ];
    }
    return { code: '200', message: 'success', data: subs };
  }

  if (m === 'POST' && path.endsWith('/location/cost')) {
    return {
      code: '200',
      message: 'success',
      data: [
        {
          shipping_name: "SICEPAT",
          service_name: "REG",
          shipping_cost: 8000,
          etd: "2-3 day"
        },
        {
          shipping_name: "NINJA",
          service_name: "Standard",
          shipping_cost: 8800,
          etd: "-"
        },
        {
          shipping_name: "JNE",
          service_name: "JNEFlat",
          shipping_cost: 10500,
          etd: "1-2 day"
        },
        {
          shipping_name: "SAP",
          service_name: "UDRREG",
          shipping_cost: 12000,
          etd: "1-3 day"
        },
        {
          shipping_name: "IDEXPRESS",
          service_name: "STD",
          shipping_cost: 7600,
          etd: "-"
        },
        {
          shipping_name: "JNT",
          service_name: "EZ",
          shipping_cost: 8000,
          etd: "-"
        },
        {
          shipping_name: "LION",
          service_name: "REGPACK",
          shipping_cost: 13100,
          etd: "3-6 day"
        }
      ]
    };
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
    if (q) items = items.filter((c) => c.full_name.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase()));
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
  if (m === 'POST' && (path.match(/\/(admin\/)?upload$/) || path.match(/\/(admin\/)?images$/))) {
    const randomId = Math.floor(Math.random() * 1000);
    const imageUrl = `https://picsum.photos/500/500?random=${randomId}`;
    return {
      code: '200',
      message: 'success',
      data: {
        url: imageUrl,
        image_url: imageUrl
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
              sku_id: foundSku.sku_id,
              sku_code: foundSku.sku,
              picture: foundSku.image_url || p.images?.[0],
              options_label: Object.entries(foundSku.option_values_map).map(([optId, valId]) => {
                const opt = p.options?.find(o => o.option_id === optId);
                const val = opt?.values?.find(v => v.option_value_id === valId);
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
