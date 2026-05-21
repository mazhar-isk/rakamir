'use client';

import BackofficeLayout from '@/components/layout/BackofficeLayout';
import { apiPut, Product, useGet } from '@ecommerce/api-client';
import { ArrowBack, CloudUpload, Delete } from '@mui/icons-material';
import {
  Avatar, Box, Button, Card, FormControlLabel, Grid,
  IconButton, Switch, TextField, Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

const schema = Yup.object({
  name: Yup.string().required('Nama produk wajib diisi'),
  description: Yup.string().required('Deskripsi wajib diisi'),
  price: Yup.number().required('Harga wajib diisi').min(0),
  stock: Yup.number().required('Stok wajib diisi').min(0),
});

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: product, isLoading } = useGet<Product>(`/admin/products/${params.id}`);

  const formik = useFormik({
    initialValues: {
      name: '', description: '', price: '', original_price: '',
      stock: '', tags: '', is_featured: false, is_new: false,
      images: [] as string[],
    },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await apiPut(`/admin/products/${params.id}`, {
          ...values,
          tags: typeof values.tags === 'string'
            ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
            : values.tags,
        });
        toast.success('Produk berhasil diperbarui!');
        router.push('/products');
      } catch {
        toast.error('Gagal memperbarui produk.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Populate form when product loads
  useEffect(() => {
    if (product) {
      formik.setValues({
        name: product.name,
        description: product.description,
        price: String(product.price),
        original_price: String(product.original_price ?? ''),
        stock: String(product.stock),
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
        is_featured: product.is_featured,
        is_new: product.is_new,
        images: product.images ?? [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        formik.setFieldValue('images', [...formik.values.images, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) =>
    formik.setFieldValue('images', formik.values.images.filter((_, i) => i !== idx));

  if (isLoading) {
    return (
      <BackofficeLayout>
        <Typography color="text.secondary">Memuat produk...</Typography>
      </BackofficeLayout>
    );
  }

  return (
    <BackofficeLayout>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton component={Link} href="/products"><ArrowBack /></IconButton>
        <Box>
          <Typography variant="h5" fontWeight={700}>Edit Produk</Typography>
          <Typography variant="body2" color="text.secondary">{product?.name}</Typography>
        </Box>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Left */}
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
                <Typography variant="body2" color="text.secondary">Klik untuk tambah foto baru</Typography>
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

          {/* Right */}
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
              {formik.isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
            <Button component={Link} href="/products" variant="outlined" fullWidth size="large" sx={{ mt: 1.5 }}>Batal</Button>
          </Grid>
        </Grid>
      </form>
    </BackofficeLayout>
  );
}
