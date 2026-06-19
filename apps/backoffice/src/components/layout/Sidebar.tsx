'use client';

import { useAdminAuth } from '@/contexts/AdminAuthContext';
import {
  ChevronLeft, ChevronRight,
  Dashboard,
  ExpandLess, ExpandMore,
  Inventory2,
  Logout,
  People,
  Settings,
  ShoppingBag
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List, ListItem, ListItemButton, ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED = 72;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  permission?: string;
  children?: { label: string; href: string; permission?: string }[];
}

const NAV_ITEMS: NavItem[] = [
  // Dashboard — visible to all authenticated admins
  { label: 'Dashboard', icon: <Dashboard />, href: '/dashboard' },

  // Product management
  {
    label: 'Produk', icon: <Inventory2 />, permission: 'products:read',
    children: [
      { label: 'Daftar Produk', href: '/products', permission: 'products:read' },
      { label: 'Tambah Produk', href: '/products/new', permission: 'products:write' },
      { label: 'Kategori', href: '/categories', permission: 'products:read' },
    ],
  },

  // Order management — read shows the list, write unlocks full order actions
  {
    label: 'Pesanan', icon: <ShoppingBag />, permission: 'orders:read',
    children: [
      { label: 'Daftar Pesanan', href: '/orders', permission: 'orders:read' },
      { label: 'Pengiriman', href: '/shipments', permission: 'orders:read' },
    ],
  },

  // Customer management
  {
    label: 'Pelanggan', icon: <People />, permission: 'customers:read',
    children: [
      { label: 'Daftar Pelanggan', href: '/customers', permission: 'customers:read' },
    ],
  },

  // Reports — finance & superadmin only
  // { label: 'Laporan', icon: <BarChart />, href: '/reports', permission: 'reports:read' },

  // Settings — superadmin only
  {
    label: 'Pengaturan', icon: <Settings />, permission: 'roles:read',
    children: [
      { label: 'Role & Izin', href: '/settings/roles', permission: 'roles:read' },
      { label: 'Admin Users', href: '/settings/users', permission: 'users:read' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { admin, role, can, logout } = useAdminAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(['Produk', 'Pengaturan']);

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const drawerWidth = collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
          background: 'linear-gradient(180deg, #EBC4B8 0%, #EBC4B8 100%)',
          color: 'rgba(0,0,0,0.7)',
          border: 'none',
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 70 }}>
        {!collapsed && (
          <Box sx={{ position: 'relative', width: 140, height: 36, flexShrink: 0, ml: 2 }}>
            <Image
              src="/assets/images/text-logo.png"
              alt="Rakamir Webstore"
              fill
              style={{ objectFit: 'contain', objectPosition: 'left center', filter: 'invert(1)' }}
              priority
            />
          </Box>
        )}
        <IconButton size="small" onClick={() => setCollapsed(!collapsed)} sx={{ color: 'rgba(0,0,0,0.6)', ml: collapsed ? 'auto' : 0, mr: collapsed ? 'auto' : 0 }}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>

      {/* Admin info */}
      <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
        <Avatar sx={{ bgcolor: '#D26B54', width: 38, height: 38, fontSize: '0.9rem', flexShrink: 0 }}>
          {admin?.name?.[0]?.toUpperCase() ?? 'A'}
        </Avatar>
        {!collapsed && (
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} noWrap>{admin?.name}</Typography>
            <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{role.replace('_', ' ')}</Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(249, 246, 242,0.5)', mx: 2, mb: 1 }} />

      {/* Nav */}
      <List sx={{ flex: 1, px: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_ITEMS.map((item) => {
          const hasAccess = !item.permission || can(item.permission as any);
          if (!hasAccess) return null;

          if (item.children) {
            const isOpen = openGroups.includes(item.label) && !collapsed;
            return (
              <React.Fragment key={item.label}>
                <Tooltip title={collapsed ? item.label : ''} placement="right">
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton onClick={() => !collapsed && toggleGroup(item.label)}
                      sx={{ borderRadius: 2, '&:hover': { bgcolor: 'rgba(249, 246, 242,0.75)', fontWeight: 700 }, minHeight: 44 }}>
                      <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
                      {!collapsed && <><ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 'unset' }} />{isOpen ? <ExpandLess /> : <ExpandMore />}</>}
                    </ListItemButton>
                  </ListItem>
                </Tooltip>
                {!collapsed && (
                  <Collapse in={isOpen} timeout="auto">
                    <List disablePadding>
                      {item.children.filter((c) => !c.permission || can(c.permission as any)).map((child) => (
                        <ListItem key={child.href} disablePadding>
                          <ListItemButton component={Link} href={child.href}
                            selected={isActive(child.href)}
                            sx={{ pl: 6, borderRadius: 2, mb: 0.5, fontSize: '0.8rem', color: 'rgba(0,0,0,0.6)', '&.Mui-selected': { bgcolor: 'rgba(249, 246, 242,0.75)' }, '&:hover': { bgcolor: 'rgba(249, 246, 242,0.75)', fontWeight: 700 }, minHeight: 38 }}>
                            <ListItemText primary={child.label} primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 'unset' }} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            );
          }

          return (
            <Tooltip key={item.href} title={collapsed ? item.label : ''} placement="right">
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton component={Link} href={item.href!}
                  selected={isActive(item.href!)}
                  sx={{ borderRadius: 2, color: 'rgba(0,0,0,0.7)', minHeight: 44, '&.Mui-selected': { bgcolor: 'rgba(249, 246, 242,0.75)' }, '&:hover': { bgcolor: 'rgba(249, 246, 242,0.75)', fontWeight: 700 } }}>
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
                  {!collapsed && <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 'unset' }} />}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2 }} />
      <List sx={{ px: 1, py: 1 }}>
        <Tooltip title={collapsed ? 'Keluar' : ''} placement="right">
          <ListItem disablePadding>
            <ListItemButton onClick={() => { logout(); router.push('/auth/login'); }}
              sx={{ borderRadius: 2, '&:hover': { bgcolor: 'rgba(249, 246, 242,0.75)', color: '#ef4444', fontWeight: 700 }, minHeight: 44 }}>
              {!collapsed && <ListItemText primary="Keluar" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 'unset' }} />}
              <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}><Logout /></ListItemIcon>
            </ListItemButton>
          </ListItem>
        </Tooltip>
      </List>
    </Drawer>
  );
}
