'use client';

import React, { useRef } from 'react';
import {
  Box, Typography, Card, Grid, TextField, Button,
  FormControlLabel, Switch, Divider, IconButton, Avatar,
} from '@mui/material';
import { ArrowBack, CloudUpload, Delete } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiPost } from '@ecommerce/api-client';
import { toast } from 'react-toastify';
import BackofficeLayout from '@/components/layout/BackofficeLayout';

const schema = Yup.object({
  name: Yup.string().required('Nama produk wajib diisi'),
  description: Yup.string().required('Deskripsi wajib diisi'),
  price: Yup.number().required('Harga wajib diisi').min(0),
  original_price: Yup.number().optional().min(0),
  stock: Yup.number().required('Stok wajib diisi').min(0),
  category_id: Yup.string().required('Kategori wajib dipilih'),
});

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formik = useFormik({
    initialValues: {
      name: '', description: '', price: '', original_price: '',
      stock: '', category_id: '', tags: '',
      is_featured: false, is_new: true,
      images: [] as string[],
    },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await apiPost('/admin/products', { ...values, tags: values.tags.split(',').map((t) => t.trim()).filter(Boolean) });
        toast.success('Produk berhasil ditambahkan!');
        router.push('/products');
      } catch {
        toast.error('Gagal menambahkan produk.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        formik.setFieldValue('images', [...formik.values.images, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    formik.setFieldValue('images', formik.values.images.filter((_, i) => i !== idx));
  };

  return (
    <BackofficeLayout>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton component={Link} href="/products"><ArrowBack /></IconButton>
        <Box>
          <Typography variant="h5" fontWeight={700}>Tambah Produk Baru</Typography>
          <Typography variant="body2" color="text.secondary">Isi detail produk yang akan dijual</Typography>
        </Box>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Left - main info */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>Informasi Produk</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField fullWidth label="Nama Produk" name="name"
                  value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name} />
                <TextField fullWidth multiline rows={5} label="Deskripsi" name="description"
                  value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Harga Jual (Rp)" name="price" type="number"
                      value={formik.values.price} onChange={formik.handleChange} onBlur={formik.handleBlur}
                      error={formik.touched.price && Boolean(formik.errors.price)}
                      helperText={formik.touched.price && formik.errors.price} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Harga Asli / Coret (Rp)" name="original_price" type="number"
                      value={formik.values.original_price} onChange={formik.handleChange} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Stok" name="stock" type="number"
                      value={formik.values.stock} onChange={formik.handleChange} onBlur={formik.handleBlur}
                      error={formik.touched.stock && Boolean(formik.errors.stock)}
                      helperText={formik.touched.stock && formik.errors.stock} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Kategori ID" name="category_id"
                      value={formik.values.category_id} onChange={formik.handleChange} onBlur={formik.handleBlur}
                      error={formik.touched.category_id && Boolean(formik.errors.category_id)}
                      helperText={formik.touched.category_id && formik.errors.category_id} />
                  </Grid>
                </Grid>
                <TextField fullWidth label="Tags (pisahkan dengan koma)" name="tags"
                  value={formik.values.tags} onChange={formik.handleChange}
                  placeholder="elektronik, gadget, smartphone" />
              </Box>
            </Card>

            {/* Images */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>Foto Produk</Typography>
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{ border: '2px dashed #D1D5DB', borderRadius: 3, p: 4, textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(108,99,255,0.04)' } }}>
                <CloudUpload sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">Klik atau seret foto ke sini</Typography>
                <Typography variant="caption" color="text.disabled">PNG, JPG, WEBP hingga 5MB</Typography>
                <input ref={fileInputRef} type="file" multiple accept="image/*" hidden onChange={handleImageUpload} />
              </Box>
              {formik.values.images.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 2 }}>
                  {formik.values.images.map((img, i) => (
                    <Box key={i} sx={{ position: 'relative' }}>
                      <Avatar src={img} variant="rounded" sx={{ width: 80, height: 80 }} />
                      <IconButton size="small" onClick={() => removeImage(i)}
                        sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: 'white', width: 20, height: 20, '&:hover': { bgcolor: 'error.dark' } }}>
                        <Delete sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Card>
          </Grid>

          {/* Right - settings */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>Pengaturan</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel control={<Switch checked={formik.values.is_featured} onChange={(e) => formik.setFieldValue('is_featured', e.target.checked)} color="primary" />} label="Produk Unggulan (Featured)" />
                <FormControlLabel control={<Switch checked={formik.values.is_new} onChange={(e) => formik.setFieldValue('is_new', e.target.checked)} color="primary" />} label="Tandai sebagai Produk Baru" />
              </Box>
            </Card>
            <Button type="submit" variant="contained" fullWidth size="large" disabled={formik.isSubmitting}
              sx={{ background: 'linear-gradient(135deg, #6C63FF, #FF6584)', py: 1.5 }}>
              {formik.isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
            </Button>
            <Button component={Link} href="/products" variant="outlined" fullWidth size="large" sx={{ mt: 1.5 }}>
              Batal
            </Button>
          </Grid>
        </Grid>
      </form>
    </BackofficeLayout>
  );
}
