import { Address, AdminUser, Category, DashboardStats, Order, Product, Role, ShipmentTracking, User } from '../types';

// ─── Categories ────────────────────────────────────────────────────────────────
export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Elektronik', slug: 'elektronik', image: 'https://picsum.photos/seed/elec/200' },
  { id: 'cat-2', name: 'Fashion', slug: 'fashion', image: 'https://picsum.photos/seed/fash/200' },
  { id: 'cat-3', name: 'Rumah', slug: 'rumah', image: 'https://picsum.photos/seed/home/200' },
  { id: 'cat-4', name: 'Olahraga', slug: 'olahraga', image: 'https://picsum.photos/seed/sport/200' },
  { id: 'cat-5', name: 'Kecantikan', slug: 'kecantikan', image: 'https://picsum.photos/seed/beauty/200' },
  { id: 'cat-6', name: 'Makanan', slug: 'makanan', image: 'https://picsum.photos/seed/food/200' },
];

// ─── Products ─────────────────────────────────────────────────────────────────
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p-1', slug: 'iphone-15-pro', name: 'iPhone 15 Pro',
    description: 'Smartphone flagship Apple dengan chip A17 Pro, kamera 48MP, layar ProMotion 120Hz, dan titanium frame yang ringan namun kuat. Performa terbaik di kelasnya dengan daya tahan baterai sepanjang hari.',
    price: 19999000, original_price: 22999000, discount_percentage: 13,
    stock: 45, images: ['https://picsum.photos/seed/iphone15/400/400', 'https://picsum.photos/seed/iphone15b/400/400'],
    category: MOCK_CATEGORIES[0], categories: [MOCK_CATEGORIES[0]], tags: ['smartphone', 'apple', 'flagship'],
    rating: 4.9, review_count: 1240, is_featured: true, is_new: true, sold_count: 342,
    created_at: '2024-09-20T00:00:00.000Z',
    options: [
      {
        id: 'opt-size',
        name: 'Size',
        values: [
          { id: 'val-128gb', value: '128GB' },
          { id: 'val-256gb', value: '256GB' },
          { id: 'val-512gb', value: '512GB' },
          { id: 'val-1tb', value: '1TB' }
        ]
      },
      {
        id: 'opt-color',
        name: 'Color',
        values: [
          { id: 'val-red', value: 'Red' },
          { id: 'val-black', value: 'Black' },
          { id: 'val-blue', value: 'Blue' },
          { id: 'val-silver', value: 'Silver' },
          { id: 'val-orange', value: 'Orange' }
        ]
      }
    ],
    skus: [
      // 256GB SKUs
      { id: 'sku-iphone-256-red', sku: 'IPH15P-256-RED', price: 19999000, stock: 10, picture: 'https://picsum.photos/seed/iphone15red/400/400', option_values_map: { 'opt-size': 'val-256gb', 'opt-color': 'val-red' } },
      { id: 'sku-iphone-256-blk', sku: 'IPH15P-256-BLK', price: 19999000, stock: 15, picture: 'https://picsum.photos/seed/iphone15black/400/400', option_values_map: { 'opt-size': 'val-256gb', 'opt-color': 'val-black' } },
      { id: 'sku-iphone-256-blu', sku: 'IPH15P-256-BLU', price: 20199000, stock: 5, picture: 'https://picsum.photos/seed/iphone15blue/400/400', option_values_map: { 'opt-size': 'val-256gb', 'opt-color': 'val-blue' } },
      // 512GB SKUs
      { id: 'sku-iphone-512-red', sku: 'IPH15P-512-RED', price: 22999000, stock: 8, picture: 'https://picsum.photos/seed/iphone15red/400/400', option_values_map: { 'opt-size': 'val-512gb', 'opt-color': 'val-red' } },
      { id: 'sku-iphone-512-blk', sku: 'IPH15P-512-BLK', price: 22999000, stock: 12, picture: 'https://picsum.photos/seed/iphone15black/400/400', option_values_map: { 'opt-size': 'val-512gb', 'opt-color': 'val-black' } },
      { id: 'sku-iphone-512-blu', sku: 'IPH15P-512-BLU', price: 23199000, stock: 6, picture: 'https://picsum.photos/seed/iphone15blue/400/400', option_values_map: { 'opt-size': 'val-512gb', 'opt-color': 'val-blue' } },
      // 1TB SKUs
      { id: 'sku-iphone-1tb-blu', sku: 'IPH15P-1TB-BLU', price: 26999000, original_price: 28999000, stock: 0, picture: 'https://picsum.photos/seed/iphone15blue/400/400', option_values_map: { 'opt-size': 'val-1tb', 'opt-color': 'val-blue' } },
      { id: 'sku-iphone-1tb-slv', sku: 'IPH15P-1TB-SLV', price: 26999000, original_price: 28999000, stock: 4, picture: 'https://picsum.photos/seed/iphone15silver/400/400', option_values_map: { 'opt-size': 'val-1tb', 'opt-color': 'val-silver' } },
      { id: 'sku-iphone-1tb-org', sku: 'IPH15P-1TB-ORG', price: 27499000, original_price: 29499000, stock: 3, picture: 'https://picsum.photos/seed/iphone15orange/400/400', option_values_map: { 'opt-size': 'val-1tb', 'opt-color': 'val-orange' } }
    ]
  },
  {
    id: 'p-2', slug: 'samsung-galaxy-s24-ultra', name: 'Samsung Galaxy S24 Ultra',
    description: 'Ponsel Android terkuat dengan S Pen built-in, kamera 200MP, layar 6.8" QHD+ Dynamic AMOLED, dan AI features terdepan.',
    price: 18500000, original_price: 20000000, discount_percentage: 8,
    stock: 32, images: ['https://picsum.photos/seed/s24/400/400'],
    category: MOCK_CATEGORIES[0], categories: [MOCK_CATEGORIES[0]], tags: ['smartphone', 'samsung', 'android'],
    rating: 4.8, review_count: 892, is_featured: true, is_new: true, sold_count: 289,
    created_at: '2024-01-17T00:00:00.000Z',
  },
  {
    id: 'p-3', slug: 'macbook-air-m3', name: 'MacBook Air M3 13"',
    description: 'Laptop ultra-tipis dengan chip M3, layar Liquid Retina 13.6", 8GB RAM, 256GB SSD. Performa luar biasa dengan baterai hingga 18 jam.',
    price: 16999000, original_price: undefined, discount_percentage: undefined,
    stock: 18, images: ['https://picsum.photos/seed/macbook/400/400'],
    category: MOCK_CATEGORIES[0], categories: [MOCK_CATEGORIES[0]], tags: ['laptop', 'apple', 'macbook'],
    rating: 4.9, review_count: 567, is_featured: true, is_new: false, sold_count: 124,
    created_at: '2024-03-08T00:00:00.000Z',
  },
  {
    id: 'p-4', slug: 'nike-air-max-270', name: 'Nike Air Max 270 Running',
    description: 'Sepatu lari dengan bantalan Air Max terbesar, desain modern, tersedia dalam berbagai pilihan warna cerah.',
    price: 1899000, original_price: 2199000, discount_percentage: 14,
    stock: 120, images: ['https://picsum.photos/seed/nike270/400/400'],
    category: MOCK_CATEGORIES[3], categories: [MOCK_CATEGORIES[3]], tags: ['sepatu', 'nike', 'olahraga'],
    rating: 4.7, review_count: 3210, is_featured: true, is_new: false, sold_count: 890,
    created_at: '2023-06-15T00:00:00.000Z',
  },
  {
    id: 'p-5', slug: 'dyson-v15-detect', name: 'Dyson V15 Detect Cordless',
    description: 'Vacuum cleaner nirkabel dengan laser dust detection, HEPA filtration, dan daya hisap 230AW. Bersihkan lantai dengan lebih efisien.',
    price: 8999000, original_price: 10500000, discount_percentage: 14,
    stock: 24, images: ['https://picsum.photos/seed/dyson/400/400'],
    category: MOCK_CATEGORIES[2], categories: [MOCK_CATEGORIES[2]], tags: ['vacuum', 'dyson', 'rumah'],
    rating: 4.8, review_count: 428, is_featured: false, is_new: true, sold_count: 76,
    created_at: '2024-04-10T00:00:00.000Z',
  },
  {
    id: 'p-6', slug: 'samsung-qled-55', name: 'Samsung 55" QLED 4K TV',
    description: 'Smart TV 55 inci dengan panel QLED, resolusi 4K, HDR10+, dan smart features lengkap. Warna lebih hidup dengan Quantum Dot.',
    price: 9999000, original_price: 12999000, discount_percentage: 23,
    stock: 15, images: ['https://picsum.photos/seed/samsungtv/400/400'],
    category: MOCK_CATEGORIES[2], categories: [MOCK_CATEGORIES[2]], tags: ['tv', 'samsung', 'smart-tv'],
    rating: 4.6, review_count: 312, is_featured: false, is_new: false, sold_count: 98,
    created_at: '2023-11-01T00:00:00.000Z',
  },
  {
    id: 'p-7', slug: 'adidas-ultraboost-22', name: 'Adidas Ultraboost 22',
    description: 'Sepatu running dengan teknologi Boost cushioning terbaik Adidas. Memberikan energi balik di setiap langkah untuk performa maksimal.',
    price: 2299000, original_price: 2799000, discount_percentage: 18,
    stock: 65, images: ['https://picsum.photos/seed/adidas/400/400'],
    category: MOCK_CATEGORIES[3], categories: [MOCK_CATEGORIES[3]], tags: ['sepatu', 'adidas', 'running'],
    rating: 4.6, review_count: 1870, is_featured: false, is_new: true, sold_count: 445,
    created_at: '2024-02-14T00:00:00.000Z',
  },
  {
    id: 'p-8', slug: 'loreal-serum-vitamin-c', name: "L'Oreal Revitalift 12% Pure Vitamin C Serum",
    description: 'Serum vitamin C konsentrasi tinggi untuk mencerahkan kulit, meratakan warna, dan mempercepat regenerasi sel kulit wajah.',
    price: 349000, original_price: 429000, discount_percentage: 19,
    stock: 200, images: ['https://picsum.photos/seed/loreal/400/400'],
    category: MOCK_CATEGORIES[4], categories: [MOCK_CATEGORIES[4]], tags: ['skincare', 'serum', 'vitamin-c'],
    rating: 4.5, review_count: 5620, is_featured: false, is_new: true, sold_count: 2100,
    created_at: '2024-05-01T00:00:00.000Z',
  },
  {
    id: 'p-9', slug: 'sony-wh1000xm5', name: 'Sony WH-1000XM5 Headphones',
    description: 'Headphone over-ear dengan Active Noise Cancellation terbaik di industri, baterai 30 jam, dan kualitas suara Hi-Res Audio.',
    price: 5499000, original_price: 6500000, discount_percentage: 15,
    stock: 38, images: ['https://picsum.photos/seed/sony/400/400'],
    category: MOCK_CATEGORIES[0], categories: [MOCK_CATEGORIES[0]], tags: ['headphone', 'sony', 'audio'],
    rating: 4.9, review_count: 2100, is_featured: true, is_new: false, sold_count: 318,
    created_at: '2023-09-05T00:00:00.000Z',
  },
  {
    id: 'p-10', slug: 'ipad-pro-m4', name: 'iPad Pro M4 11"',
    description: 'Tablet terkuat Apple dengan chip M4, layar Ultra Retina XDR OLED, Apple Pencil Pro support, dan bobot hanya 444 gram.',
    price: 17499000, original_price: undefined, discount_percentage: undefined,
    stock: 22, images: ['https://picsum.photos/seed/ipadpro/400/400'],
    category: MOCK_CATEGORIES[0], categories: [MOCK_CATEGORIES[0]], tags: ['tablet', 'apple', 'ipad'],
    rating: 4.8, review_count: 340, is_featured: true, is_new: true, sold_count: 89,
    created_at: '2024-05-15T00:00:00.000Z',
  },
  {
    id: 'p-11', slug: 'bose-quietcomfort-45', name: 'Bose QuietComfort 45',
    description: 'Headphone wireless Bose dengan ANC terdepan, desain foldable, baterai 24 jam, dan kenyamanan sepanjang hari.',
    price: 4299000, original_price: 5000000, discount_percentage: 14,
    stock: 50, images: ['https://picsum.photos/seed/bose/400/400'],
    category: MOCK_CATEGORIES[0], categories: [MOCK_CATEGORIES[0]], tags: ['headphone', 'bose', 'anc'],
    rating: 4.7, review_count: 980, is_featured: false, is_new: false, sold_count: 210,
    created_at: '2023-07-20T00:00:00.000Z',
  },
  {
    id: 'p-12', slug: 'instant-pot-duo-7-in-1', name: 'Instant Pot Duo 7-in-1',
    description: 'Pressure cooker multifungsi 7-in-1: pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, dan food warmer.',
    price: 1299000, original_price: 1599000, discount_percentage: 19,
    stock: 80, images: ['https://picsum.photos/seed/instantpot/400/400'],
    category: MOCK_CATEGORIES[2], categories: [MOCK_CATEGORIES[2]], tags: ['dapur', 'cooker', 'rumah'],
    rating: 4.6, review_count: 1540, is_featured: false, is_new: false, sold_count: 320,
    created_at: '2023-05-10T00:00:00.000Z',
  },
  {
    id: 'p-13', slug: 'sweater-running-aeroglow', name: 'Sweater Running AeroGlow',
    description: 'Sweater lari premium dengan teknologi sirkulasi udara AeroGlow. Nyaman digunakan untuk aktivitas olahraga outdoor maupun gaya hidup kasual sehari-hari. Dibuat dari bahan knit stretchable ultra-ringan.',
    price: 349000, original_price: 399000, discount_percentage: 12,
    stock: 50, images: ['https://picsum.photos/seed/sweater1/400/400', 'https://picsum.photos/seed/sweater2/400/400'],
    category: MOCK_CATEGORIES[1], categories: [MOCK_CATEGORIES[1], MOCK_CATEGORIES[3]], tags: ['sweater', 'running', 'fashion', 'sport'],
    rating: 4.8, review_count: 86, is_featured: true, is_new: true, sold_count: 24,
    created_at: '2024-05-01T00:00:00.000Z',
    options: [
      {
        id: 'opt-color',
        name: 'Color',
        values: [
          { id: 'val-black', value: 'Black' },
          { id: 'val-blue', value: 'Blue' }
        ]
      },
      {
        id: 'opt-size',
        name: 'Size',
        values: [
          { id: 'val-s', value: 'S' },
          { id: 'val-m', value: 'M' },
          { id: 'val-l', value: 'L' }
        ]
      }
    ],
    skus: [
      { id: 'sku-blk-s', sku: 'SWTR-BLK-S', price: 349000, stock: 10, picture: 'https://picsum.photos/seed/sweaterblack/400/400', option_values_map: { 'opt-color': 'val-black', 'opt-size': 'val-s' } },
      { id: 'sku-blk-m', sku: 'SWTR-BLK-M', price: 349000, stock: 15, picture: 'https://picsum.photos/seed/sweaterblack/400/400', option_values_map: { 'opt-color': 'val-black', 'opt-size': 'val-m' } },
      { id: 'sku-blk-l', sku: 'SWTR-BLK-L', price: 369000, stock: 5, picture: 'https://picsum.photos/seed/sweaterblack/400/400', option_values_map: { 'opt-color': 'val-black', 'opt-size': 'val-l' } },
      { id: 'sku-blu-s', sku: 'SWTR-BLU-S', price: 359000, stock: 8, picture: 'https://picsum.photos/seed/sweaterblue/400/400', option_values_map: { 'opt-color': 'val-blue', 'opt-size': 'val-s' } },
      { id: 'sku-blu-m', sku: 'SWTR-BLU-M', price: 359000, stock: 7, picture: 'https://picsum.photos/seed/sweaterblue/400/400', option_values_map: { 'opt-color': 'val-blue', 'opt-size': 'val-m' } },
      { id: 'sku-blu-l', sku: 'SWTR-BLU-L', price: 379000, stock: 5, picture: 'https://picsum.photos/seed/sweaterblue/400/400', option_values_map: { 'opt-color': 'val-blue', 'opt-size': 'val-l' } }
    ]
  }
];

// ─── Addresses ────────────────────────────────────────────────────────────────
export const MOCK_ADDRESS: Address = {
  id: 'addr-1', label: 'Rumah', recipient_name: 'Muhammad Azhar',
  phone: '081234567890', address: 'Jl. Merdeka No. 10 RT 01/RW 02',
  city: 'Jakarta Selatan', province: 'DKI Jakarta', postal_code: '12110', is_default: true,
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1', order_number: 'ORD-20240501-001',
    status: 'delivered',
    items: [
      { id: 'oi-1', product: MOCK_PRODUCTS[0], quantity: 1, price: 19999000, subtotal: 19999000 },
      { id: 'oi-2', product: MOCK_PRODUCTS[8], quantity: 1, price: 5499000, subtotal: 5499000 },
    ],
    shipping_address: MOCK_ADDRESS,
    shipping_method: 'express', shipping_cost: 25000,
    subtotal: 25498000, discount: 0, total: 25523000,
    payment_method: 'transfer', payment_status: 'paid',
    tracking_number: 'JNE-1234567890',
    created_at: '2024-05-01T08:00:00.000Z', updated_at: '2024-05-03T16:00:00.000Z',
  },
  {
    id: 'ord-2', order_number: 'ORD-20240510-002',
    status: 'shipped',
    items: [{ id: 'oi-3', product: MOCK_PRODUCTS[3], quantity: 2, price: 1899000, subtotal: 3798000 }],
    shipping_address: MOCK_ADDRESS,
    shipping_method: 'regular', shipping_cost: 0,
    subtotal: 3798000, discount: 0, total: 3798000,
    payment_method: 'ewallet', payment_status: 'paid',
    tracking_number: 'SICEPAT-9876543210',
    created_at: '2024-05-10T10:00:00.000Z', updated_at: '2024-05-11T09:00:00.000Z',
  },
  {
    id: 'ord-3', order_number: 'ORD-20240515-003',
    status: 'processing',
    items: [{ id: 'oi-4', product: MOCK_PRODUCTS[7], quantity: 3, price: 349000, subtotal: 1047000 }],
    shipping_address: MOCK_ADDRESS,
    shipping_method: 'regular', shipping_cost: 0,
    subtotal: 1047000, discount: 50000, total: 997000,
    payment_method: 'credit_card', payment_status: 'paid',
    tracking_number: undefined,
    created_at: '2024-05-15T14:00:00.000Z', updated_at: '2024-05-15T15:00:00.000Z',
  },
  {
    id: 'ord-4', order_number: 'ORD-20240520-004',
    status: 'payment_pending',
    items: [{ id: 'oi-5', product: MOCK_PRODUCTS[2], quantity: 1, price: 16999000, subtotal: 16999000 }],
    shipping_address: MOCK_ADDRESS,
    shipping_method: 'express', shipping_cost: 25000,
    subtotal: 16999000, discount: 0, total: 17024000,
    payment_method: 'transfer', payment_status: 'unpaid',
    tracking_number: undefined,
    created_at: '2024-05-20T09:00:00.000Z', updated_at: '2024-05-20T09:00:00.000Z',
  },
];

// ─── Tracking ─────────────────────────────────────────────────────────────────
export const MOCK_TRACKING: Record<string, ShipmentTracking> = {
  'JNE-1234567890': {
    tracking_number: 'JNE-1234567890', courier: 'JNE Express', status: 'delivered',
    estimated_delivery: '3 Mei 2024',
    events: [
      { timestamp: '2024-05-03T16:00:00.000Z', location: 'Jakarta Selatan', description: 'Paket telah diterima oleh penerima', status: 'delivered' },
      { timestamp: '2024-05-03T09:30:00.000Z', location: 'Jakarta Selatan', description: 'Paket dalam perjalanan ke tujuan', status: 'in_transit' },
      { timestamp: '2024-05-02T18:00:00.000Z', location: 'Hub Jakarta Timur', description: 'Paket tiba di hub pengiriman', status: 'in_transit' },
      { timestamp: '2024-05-01T20:00:00.000Z', location: 'Gudang JNE Bekasi', description: 'Paket dikirim oleh penjual', status: 'picked_up' },
    ],
  },
  'SICEPAT-9876543210': {
    tracking_number: 'SICEPAT-9876543210', courier: 'SiCepat Ekspress', status: 'shipped',
    estimated_delivery: '13 Mei 2024',
    events: [
      { timestamp: '2024-05-11T09:00:00.000Z', location: 'Cabang SiCepat Jakarta Selatan', description: 'Kurir sedang mengantar paket', status: 'in_transit' },
      { timestamp: '2024-05-11T06:00:00.000Z', location: 'Hub SiCepat Cilincing', description: 'Paket tiba di Jakarta', status: 'in_transit' },
      { timestamp: '2024-05-10T22:00:00.000Z', location: 'Hub SiCepat Bandung', description: 'Paket berangkat dari kota asal', status: 'in_transit' },
      { timestamp: '2024-05-10T14:00:00.000Z', location: 'Drop Point Bandung', description: 'Paket dijemput kurir', status: 'picked_up' },
    ],
  },
};

// ─── Customers ────────────────────────────────────────────────────────────────
export const MOCK_CUSTOMERS: User[] = [
  { id: 'u-1', name: 'Muhammad Azhar Iskandar', email: 'azhar@example.com', phone: '081234567890', created_at: '2024-01-15T00:00:00.000Z' },
  { id: 'u-2', name: 'Budi Santoso', email: 'budi@example.com', phone: '082345678901', created_at: '2024-02-20T00:00:00.000Z' },
  { id: 'u-3', name: 'Siti Rahayu', email: 'siti@example.com', phone: '083456789012', created_at: '2024-03-05T00:00:00.000Z' },
  { id: 'u-4', name: 'Dewi Kusuma', email: 'dewi@example.com', phone: '084567890123', created_at: '2024-03-22T00:00:00.000Z' },
  { id: 'u-5', name: 'Rudi Hartono', email: 'rudi@example.com', phone: '085678901234', created_at: '2024-04-01T00:00:00.000Z' },
  { id: 'u-6', name: 'Anita Wijaya', email: 'anita@example.com', phone: '086789012345', created_at: '2024-04-15T00:00:00.000Z' },
];

// ─── Roles ────────────────────────────────────────────────────────────────────
export const MOCK_ROLES: Role[] = [
  { id: 'r-1', name: 'Super Admin', slug: 'superadmin', permissions: ['products:read', 'products:write', 'orders:read', 'orders:write', 'customers:read', 'customers:write', 'reports:read', 'roles:read', 'roles:write', 'users:read', 'users:write'] },
  { id: 'r-2', name: 'Product Manager', slug: 'product_manager', permissions: ['products:read', 'products:write', 'customers:read'] },
  { id: 'r-3', name: 'Order Manager', slug: 'order_manager', permissions: ['orders:read', 'orders:write', 'customers:read'] },
  { id: 'r-4', name: 'Customer Service', slug: 'customer_service', permissions: ['customers:read', 'customers:write', 'orders:read'] },
  { id: 'r-5', name: 'Finance', slug: 'finance', permissions: ['reports:read', 'orders:read'] },
];

// ─── Admin Users ──────────────────────────────────────────────────────────────
export const MOCK_ADMIN_USERS: AdminUser[] = [
  { id: 'a-1', name: 'Muhammad Azhar Iskandar', email: 'azhar@rakamir.id', role: MOCK_ROLES[0], is_active: true, created_at: '2024-01-01T00:00:00.000Z' },
  { id: 'a-2', name: 'Rina Produk', email: 'rina@rakamir.id', role: MOCK_ROLES[1], is_active: true, created_at: '2024-02-01T00:00:00.000Z' },
  { id: 'a-3', name: 'Doni Order', email: 'doni@rakamir.id', role: MOCK_ROLES[2], is_active: true, created_at: '2024-03-01T00:00:00.000Z' },
  { id: 'a-4', name: 'Lisa CS', email: 'lisa@rakamir.id', role: MOCK_ROLES[3], is_active: false, created_at: '2024-04-01T00:00:00.000Z' },
];

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const MOCK_DASHBOARD_STATS: DashboardStats = {
  total_revenue: 1_250_000_000,
  total_orders: 4_820,
  total_customers: 12_340,
  total_products: MOCK_PRODUCTS.length,
  revenue_growth: 12.5,
  order_growth: 8.3,
};

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const MOCK_WISHLIST: string[] = [];
