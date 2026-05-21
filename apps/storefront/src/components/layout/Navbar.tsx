'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import {
  Close,
  KeyboardArrowDown, Logout,
  Menu as MenuIcon,
  PersonOutline,
  Search,
  ShoppingCartOutlined,
  FavoriteBorder
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Badge, Box,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  List, ListItem, ListItemText,
  Menu,
  MenuItem,
  Slide,
  Toolbar,
  Typography,
  useScrollTrigger
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Produk', href: '/products' },
  { label: 'Promo', href: '/products?filter=promo' },
  { label: 'Kategori', href: '/categories' },
];

function HideOnScroll({ children }: { children: React.ReactElement }) {
  const trigger = useScrollTrigger();
  return <Slide appear={false} direction="down" in={!trigger}>{children}</Slide>;
}

export default function Navbar() {
  const { itemCount } = useCart();
  const { favoriteIds } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <>
      <HideOnScroll>
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            backgroundColor: 'rgba(249, 246, 242,0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 }, py: 1 }}>
            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ position: 'relative', width: 130, height: 32 }}>
                <Image
                  src="/assets/images/text-logo.png"
                  alt="Rakamir Webstore"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'contain', objectPosition: 'left center', filter: 'invert(1)' }}
                  priority
                />
              </Box>
            </Link>

            {/* Nav Links — desktop */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 500, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                    {link.label}
                  </Typography>
                </Link>
              ))}
            </Box>

            {/* Search bar */}
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                backgroundColor: '#F3F4F6',
                borderRadius: '50px',
                px: 2,
                py: 0.5,
                gap: 1,
                width: 280,
              }}
            >
              <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
              <InputBase
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1, fontSize: '0.875rem' }}
              />
            </Box>

            {/* Right icons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton component={Link} href="/account/wishlist" sx={{ color: 'text.primary' }}>
                <Badge badgeContent={favoriteIds.length} color="primary">
                  <FavoriteBorder />
                </Badge>
              </IconButton>
              
              <IconButton component={Link} href="/cart" sx={{ color: 'text.primary' }}>
                <Badge badgeContent={itemCount} color="primary">
                  <ShoppingCartOutlined />
                </Badge>
              </IconButton>

              {isAuthenticated ? (
                <>
                  <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                      {user?.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <KeyboardArrowDown sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </IconButton>
                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                    <MenuItem component={Link} href="/account/profile" onClick={() => setAnchorEl(null)}>Profil Saya</MenuItem>
                    <MenuItem component={Link} href="/account/orders" onClick={() => setAnchorEl(null)}>Pesanan Saya</MenuItem>
                    <Divider />
                    <MenuItem onClick={() => { logout(); setAnchorEl(null); router.push('/'); }} sx={{ color: 'error.main' }}>
                      <Logout sx={{ fontSize: 18, mr: 1 }} /> Keluar
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <IconButton component={Link} href="/auth/login" sx={{ color: 'text.primary' }}>
                  <PersonOutline />
                </IconButton>
              )}

              {/* Mobile menu icon */}
              <IconButton sx={{ display: { md: 'none' } }} onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      {/* Mobile drawer */}
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 280, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>Menu</Typography>
            <IconButton onClick={() => setMobileOpen(false)}><Close /></IconButton>
          </Box>
          <List>
            {navLinks.map((link) => (
              <ListItem key={link.href} component={Link} href={link.href} onClick={() => setMobileOpen(false)}>
                <ListItemText primary={link.label} />
              </ListItem>
            ))}
            <Divider sx={{ my: 1 }} />
            <ListItem component={Link} href="/account/orders" onClick={() => setMobileOpen(false)}>
              <ListItemText primary="Pesanan Saya" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Spacer */}
      <Toolbar sx={{ mb: 1 }} />
    </>
  );
}
