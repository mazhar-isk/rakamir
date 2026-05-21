# 🛍️ Rakamir — Webstore Platform

A full-featured webstore platform with a **storefront** for end users and a **backoffice** for administrators. Built with Next.js 14, TypeScript, Tailwind CSS, MUI, Formik, Recharts, and SWR.

---

## 📁 Project Structure

```
ecommerce-monorepo/
├── apps/
│   ├── storefront/          # Customer-facing app (port 3000)
│   └── backoffice/          # Admin panel (port 3001)
├── packages/
│   ├── api-client/          # Axios client, SWR hooks, shared types
│   ├── ui/                  # MUI theme
│   └── utils/               # Currency, date, RBAC helpers
├── package.json             # Workspace root
└── turbo.json               # Turborepo pipeline
```

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
# Storefront
cp apps/storefront/.env.example apps/storefront/.env.local

# Backoffice
cp apps/backoffice/.env.example apps/backoffice/.env.local
```

Edit both `.env.local` files and set `NEXT_PUBLIC_API_URL` to your backend API URL.

### 3. Run development servers

```bash
# Start both apps simultaneously
npm run dev

# Or run individually
cd apps/storefront && npm run dev   # → http://localhost:3000
cd apps/backoffice && npm run dev   # → http://localhost:3001
```

---

## 🖥️ Storefront Features (http://localhost:3000)

| Route | Description |
|-------|-------------|
| `/` | Home: Hero, Categories, Featured, New Arrivals, Best Sellers, Promo |
| `/products` | Product listing with search, sort, pagination |
| `/products/[slug]` | Product detail, image gallery, add to cart |
| `/cart` | Shopping cart |
| `/checkout` | Multi-step: Address → Payment → Review |
| `/account/profile` | Personal info (Formik form) |
| `/account/orders` | Order history |
| `/account/orders/[id]` | Order detail + shipment tracking |
| `/auth/login` | Login |
| `/auth/register` | Register |

---

## 🔧 Backoffice Features (http://localhost:3001)

| Route | Description |
|-------|-------------|
| `/dashboard` | KPIs, revenue/order charts, top products |
| `/products` | Product list (DataGrid + search/filter) |
| `/products/new` | Add product (image upload, Formik) |
| `/orders` | Order list with inline status update |
| `/orders/[id]` | Order detail + tracking + payment |
| `/customers` | Customer list |
| `/reports` | Revenue/orders area, bar, line charts |
| `/settings/roles` | Role & permission management |
| `/settings/users` | Admin user CRUD |

### RBAC Roles

| Role | Access |
|------|--------|
| `superadmin` | Everything |
| `product_manager` | Products, Categories |
| `order_manager` | Orders, Shipments |
| `customer_service` | Customers, Orders (read) |
| `finance` | Reports |

---

## 🛠️ Tech Stack

| Area | Technology |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + MUI v5 |
| Forms | Formik + Yup |
| Data Fetching | SWR + Axios |
| Charts | Recharts |
| Tables | MUI DataGrid |
| Monorepo | Turborepo |
| Animation | Framer Motion (storefront) |

---

## 🔌 API Configuration

All data is fetched from your external API. Set `NEXT_PUBLIC_API_URL` in each app's `.env.local`.

### Expected API Endpoints (examples)

```
POST /api/auth/login
POST /api/auth/register
GET  /api/products
GET  /api/products/:slug
GET  /api/account/orders
POST /api/orders
GET  /api/admin/dashboard/stats
GET  /api/admin/products
PATCH /api/admin/orders/:id/status
```

---

## 📦 Build for Production

```bash
npm run build
```

---

## 🗂️ Package Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps in development |
| `npm run build` | Build all apps for production |
| `npm run lint` | Lint all packages |
| `npm run type-check` | TypeScript check all packages |
