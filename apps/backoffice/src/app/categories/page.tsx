'use client';

import BackofficeLayout from '@/components/layout/BackofficeLayout';
import { apiDelete, apiPost, Category, usePaginated } from '@ecommerce/api-client';
import { Add, Delete, Edit } from '@mui/icons-material';
import {
  Avatar, Box, Button, Card, Dialog, DialogActions, DialogContent,
  DialogTitle, Grid, IconButton, TextField, Tooltip, Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useSWRConfig } from 'swr';
import * as Yup from 'yup';
import { useConfirm } from '@/contexts/ConfirmContext';

const schema = Yup.object({
  name: Yup.string().required('Nama wajib diisi'),
  slug: Yup.string().required('Slug wajib diisi'),
});

export default function CategoriesPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const queryString = new URLSearchParams({ page: String(page + 1), per_page: '10', ...(search && { q: search }) }).toString();
  const { data, isLoading } = usePaginated<Category>('/admin/categories');
  const categories = data?.data ?? [];

  const { mutate } = useSWRConfig();
  const { confirm } = useConfirm();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);

  const formik = useFormik({
    initialValues: { name: '', slug: '', image: '' },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (editTarget) {
          await apiPost(`/admin/categories/${editTarget.id}`, values); // PUT via mock
        } else {
          await apiPost('/admin/categories', values);
        }
        toast.success(editTarget ? 'Kategori diperbarui.' : 'Kategori ditambahkan.');
        mutate('/admin/categories');
        setDialogOpen(false);
        setEditTarget(null);
        resetForm();
      } catch {
        toast.error('Gagal menyimpan kategori.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const openCreate = () => {
    formik.resetForm();
    setEditTarget(null);
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    formik.setValues({ name: cat.name, slug: cat.slug, image: cat.image ?? '' });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Hapus Kategori',
      message: 'Yakin ingin menghapus kategori ini?',
      confirmLabel: 'Ya, Hapus',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await apiDelete(`/admin/categories/${id}`);
      toast.success('Kategori dihapus.');
      mutate('/admin/categories');
    } catch {
      toast.error('Gagal menghapus kategori.');
    }
  };

  const items: Category[] = categories.length > 0 ? categories : [
    { id: 'cat-1', name: 'Elektronik', slug: 'elektronik', image: 'https://picsum.photos/seed/elec/200' },
    { id: 'cat-2', name: 'Fashion', slug: 'fashion', image: 'https://picsum.photos/seed/fash/200' },
    { id: 'cat-3', name: 'Rumah', slug: 'rumah', image: 'https://picsum.photos/seed/home/200' },
    { id: 'cat-4', name: 'Olahraga', slug: 'olahraga', image: 'https://picsum.photos/seed/sport/200' },
    { id: 'cat-5', name: 'Kecantikan', slug: 'kecantikan', image: 'https://picsum.photos/seed/beauty/200' },
  ];

  return (
    <BackofficeLayout>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Kategori Produk</Typography>
          <Typography variant="body2" color="text.secondary">{items.length} kategori aktif</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
          Tambah Kategori
        </Button>
      </Box>

      <Grid container spacing={3}>
        {(items || []).map((cat) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={cat.id}>
            <Card sx={{ overflow: 'hidden', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <Box sx={{ position: 'relative', width: '100%', height: 140, bgcolor: '#F9F6F2' }}>
                {cat.image ? (
                  <Image src={cat.image} alt={cat.name} fill style={{ objectFit: 'cover' }} />
                ) : (
                  <Avatar variant="rounded" sx={{ width: '100%', height: '100%', borderRadius: 0, fontSize: '2rem', bgcolor: 'primary.light' }}>
                    {cat.name[0]}
                  </Avatar>
                )}
              </Box>
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography fontWeight={700}>{cat.name}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{cat.slug}</Typography>
                </Box>
                <Box>
                  <Tooltip title="Edit">
                    <IconButton size="small" color="primary" onClick={() => openEdit(cat)}><Edit fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title="Hapus">
                    <IconButton size="small" color="error" onClick={() => handleDelete(cat.id)}><Delete fontSize="small" /></IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); formik.resetForm(); }} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>{editTarget ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField fullWidth label="Nama Kategori" name="name"
              value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name} />
            <TextField fullWidth label="Slug" name="slug"
              value={formik.values.slug} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.slug && Boolean(formik.errors.slug)}
              helperText={formik.touched.slug && formik.errors.slug} />
            <TextField fullWidth label="URL Gambar (opsional)" name="image"
              value={formik.values.image} onChange={formik.handleChange} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => { setDialogOpen(false); formik.resetForm(); }}>Batal</Button>
          <Button variant="contained" onClick={() => formik.submitForm()} disabled={formik.isSubmitting}>
            {formik.isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogActions>
      </Dialog>
    </BackofficeLayout>
  );
}
