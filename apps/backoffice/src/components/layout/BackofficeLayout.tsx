'use client';

import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Notifications, Search } from '@mui/icons-material';
import { AppBar, Avatar, Badge, Box, Divider, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, InputAdornment, TextField, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Inventory2, ShoppingCart, People } from '@mui/icons-material';
import Sidebar from './Sidebar';
import Link from 'next/link';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/notifications': 'Notifikasi',
  '/products': 'Manajemen Produk',
  '/products/new': 'Tambah Produk',
  '/categories': 'Kategori Produk',
  '/orders': 'Manajemen Pesanan',
  '/shipments': 'Manajemen Pengiriman',
  '/customers': 'Pelanggan',
  '/reports': 'Laporan & Analitik',
  '/settings/roles': 'Role & Izin',
  '/settings/users': 'Admin Users',
};

export default function BackofficeLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { admin } = useAdminAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const title = PAGE_TITLES[pathname] ?? 'Admin';

  const mockSearchResults = searchQuery.length > 1 ? [
    { id: 1, title: 'Kemeja Oxford Pria', type: 'Produk', icon: <Inventory2 fontSize="small" />, link: '/products' },
    { id: 2, title: '#ORD-20240501', type: 'Pesanan', icon: <ShoppingCart fontSize="small" />, link: '/orders' },
    { id: 3, title: 'Budi Santoso', type: 'Pelanggan', icon: <People fontSize="small" />, link: '/customers' },
  ] : [];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: "#F9F6F2" }}>
      <Sidebar />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <AppBar position="sticky" elevation={0}
          sx={{ bgcolor: 'white', borderBottom: '1px solid #E5E7EB', color: 'text.primary', zIndex: 1100 }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={700}>{title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="small" onClick={() => setIsSearchOpen(true)}>
                <Search />
              </IconButton>
              <IconButton size="small" onClick={(e) => setNotifAnchorEl(e.currentTarget)}>
                <Badge badgeContent={3} color="error"><Notifications /></Badge>
              </IconButton>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: '#6C63FF', fontSize: '0.875rem' }}>
                  {admin?.name?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem disabled><Typography variant="caption">{admin?.email}</Typography></MenuItem>
                <Divider />
                <MenuItem onClick={() => setAnchorEl(null)}>Profil</MenuItem>
              </Menu>
              <Menu
                anchorEl={notifAnchorEl}
                open={Boolean(notifAnchorEl)}
                onClose={() => setNotifAnchorEl(null)}
                PaperProps={{ sx: { width: 320, maxHeight: 400 } }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ p: 2, pb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>Notifikasi</Typography>
                </Box>
                <Divider />
                <MenuItem component={Link} href="/orders" onClick={() => setNotifAnchorEl(null)} sx={{ py: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant="body2" fontWeight={600}>Pesanan Baru Masuk</Typography>
                  <Typography variant="caption" color="text.secondary">Pesanan #ORD-123 menunggu pembayaran</Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>2 menit yang lalu</Typography>
                </MenuItem>
                <MenuItem component={Link} href="/products" onClick={() => setNotifAnchorEl(null)} sx={{ py: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant="body2" fontWeight={600}>Stok Menipis</Typography>
                  <Typography variant="caption" color="text.secondary">Produk &quot;Kemeja Oxford&quot; sisa 3 unit</Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>1 jam yang lalu</Typography>
                </MenuItem>
                <MenuItem component={Link} href="/customers" onClick={() => setNotifAnchorEl(null)} sx={{ py: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant="body2" fontWeight={600}>Pendaftaran Pelanggan Baru</Typography>
                  <Typography variant="caption" color="text.secondary">Budi Santoso telah mendaftar</Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>Kemarin</Typography>
                </MenuItem>
                <Divider />
                <MenuItem component={Link} href="/notifications" onClick={() => setNotifAnchorEl(null)} sx={{ justifyContent: 'center' }}>
                  <Typography variant="body2" color="primary.main" fontWeight={600}>Lihat Semua</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
        {/* Main content */}
        <Box component="main" sx={{ flex: 1, p: 3, overflowY: 'auto', bgcolor: '#F1F5F9' }}>
          {children}
        </Box>
      </Box>
      {/* Global Search Dialog */}
      <Dialog
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, top: '10%', position: 'absolute', m: 0 }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <TextField
            inputRef={searchInputRef}
            autoFocus
            fullWidth
            placeholder="Cari produk, pesanan, pelanggan... (Cmd/Ctrl + K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
              sx: { '& fieldset': { border: 'none' }, py: 1, fontSize: '1.1rem' }
            }}
          />
          {searchQuery.length > 1 && (
            <>
              <Divider />
              <List sx={{ py: 1 }}>
                {mockSearchResults.length > 0 ? (
                  mockSearchResults.map((result) => (
                    <ListItem key={result.id} disablePadding>
                      <ListItemButton component={Link} href={result.link} onClick={() => setIsSearchOpen(false)}>
                        <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                          {result.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={result.title}
                          secondary={result.type}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">Tidak ada hasil ditemukan.</Typography>
                  </Box>
                )}
              </List>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
