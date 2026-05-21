'use client';

import React, { useState } from 'react';
import {
  Box, Container, Typography, Card, Grid, TextField,
  Button, Avatar, Divider, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Chip,
} from '@mui/material';
import { Person, LocationOn, ShoppingBag, Logout, Edit, Save } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import { apiPut } from '@ecommerce/api-client';
import { toast } from 'react-toastify';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const menuItems = [
  { label: 'Profil Saya', icon: <Person />, href: '/account/profile', active: true },
  { label: 'Pesanan Saya', icon: <ShoppingBag />, href: '/account/orders' },
  { label: 'Alamat', icon: <LocationOn />, href: '/account/addresses' },
];

const profileSchema = Yup.object({
  name: Yup.string().required('Nama wajib diisi'),
  email: Yup.string().email('Email tidak valid').required('Email wajib diisi'),
  phone: Yup.string().optional(),
});

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '' },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      try {
        await apiPut('/account/profile', values);
        toast.success('Profil berhasil diperbarui!');
        setEditMode(false);
      } catch {
        toast.error('Gagal memperbarui profil.');
      }
    },
  });

  return (
    <StorefrontLayout>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight={700} mb={5}>Akun Saya</Typography>
        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <Card sx={{ p: 3, textAlign: 'center', mb: 2 }}>
              <Avatar sx={{ width: 72, height: 72, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '1.8rem' }}>
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </Avatar>
              <Typography fontWeight={700}>{user?.name}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
            </Card>
            <Card>
              <List dense>
                {menuItems.map((item) => (
                  <ListItem key={item.href} disablePadding>
                    <ListItemButton component={Link} href={item.href} selected={item.active}>
                      <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
                <Divider />
                <ListItem disablePadding>
                  <ListItemButton onClick={() => { logout(); router.push('/'); }} sx={{ color: 'error.main' }}>
                    <ListItemIcon sx={{ minWidth: 36, color: 'error.main' }}><Logout /></ListItemIcon>
                    <ListItemText primary="Keluar" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Card>
          </Grid>

          {/* Content */}
          <Grid item xs={12} md={9}>
            <Card sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant="h6" fontWeight={700}>Informasi Pribadi</Typography>
                {!editMode ? (
                  <Button startIcon={<Edit />} onClick={() => setEditMode(true)} variant="outlined" size="small">Edit</Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" onClick={() => { setEditMode(false); formik.resetForm(); }}>Batal</Button>
                    <Button startIcon={<Save />} onClick={() => formik.submitForm()} variant="contained" size="small">Simpan</Button>
                  </Box>
                )}
              </Box>
              <Grid container spacing={3}>
                {[
                  { name: 'name', label: 'Nama Lengkap' },
                  { name: 'email', label: 'Email' },
                  { name: 'phone', label: 'Nomor Telepon' },
                ].map(({ name, label }) => (
                  <Grid item xs={12} sm={6} key={name}>
                    <TextField
                      fullWidth label={label} name={name}
                      value={(formik.values as any)[name]}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={(formik.touched as any)[name] && Boolean((formik.errors as any)[name])}
                      helperText={(formik.touched as any)[name] && (formik.errors as any)[name]}
                      disabled={!editMode}
                      variant={editMode ? 'outlined' : 'filled'}
                      InputProps={{ disableUnderline: !editMode }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </StorefrontLayout>
  );
}
