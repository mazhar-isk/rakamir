'use client';

import BackofficeLayout from '@/components/layout/BackofficeLayout';
import { useConfirm } from '@/contexts/ConfirmContext';
import { apiDelete, apiPost, apiPut, Category, usePaginated } from '@ecommerce/api-client';
import { Add, Delete, Edit } from '@mui/icons-material';
import {
  Avatar, Box, Button, Card, Dialog, DialogActions, DialogContent,
  DialogTitle, Grid, IconButton,
  Skeleton,
  TextField, Tooltip, Typography
} from '@mui/material';
import { useFormik } from 'formik';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

const schema = Yup.object({
  name: Yup.string().required('Nama wajib diisi'),
  slug: Yup.string().required('Slug wajib diisi'),
});

function CategoryImage({ src, alt, fallbackLetter }: { src: string; alt: string; fallbackLetter: string }) {
  const [error, setError] = useState(false);
  if (error || !src) {
    return (
      <Avatar variant="rounded" sx={{ width: '100%', height: '100%', borderRadius: 0, fontSize: '2rem', bgcolor: 'primary.light', color: 'primary.main', fontWeight: 700 }}>
        {fallbackLetter}
      </Avatar>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      style={{ objectFit: 'cover' }}
      onError={() => setError(true)}
    />
  );
}

export default function CategoriesPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const queryString = new URLSearchParams({
    page: String(page + 1),
    limit: '20',
    search: search,
    parent_id: '',
    is_active: 'true'
  }).toString();
  const { data, isLoading, mutate: mutateCategories } = usePaginated<Category>(`/admin/categories?${queryString}`);
  const categories = data?.data ?? [];

  const { confirm } = useConfirm();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);

  const formik = useFormik({
    initialValues: { name: '', slug: '', image_url: '' },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const payload = {
          name: values.name,
          slug: values.slug,
          image_url: values.image_url || null,
          is_active: true,
          description: 'Kategori tas'
        };
        if (editTarget) {
          await apiPut(`/admin/categories/${editTarget.id}`, payload);
        } else {
          await apiPost('/admin/categories', payload);
        }
        toast.success(editTarget ? 'Kategori diperbarui.' : 'Kategori ditambahkan.');
        mutateCategories();
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
    formik.setValues({ name: cat.name, slug: cat.slug, image_url: cat.image_url ?? '' });
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
      mutateCategories();
    } catch {
      toast.error('Gagal menghapus kategori.');
    }
  };

  const items: Category[] = categories.length > 0 ? categories : [];

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
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Card sx={{ overflow: 'hidden' }}>
                <Skeleton variant="rectangular" height={140} animation="wave" />
                <Box sx={{ p: 2 }}>
                  <Skeleton variant="text" width="60%" height={24} animation="wave" sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="40%" height={16} animation="wave" />
                </Box>
              </Card>
            </Grid>
          ))
        ) : items.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 3, border: '1px dashed rgba(235,196,184,0.4)' }}>
              <Typography color="text.secondary" fontWeight={500}>Belum ada data kategori.</Typography>
            </Box>
          </Grid>
        ) : (
          items.map((cat) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={cat.id}>
              <Card sx={{ overflow: 'hidden', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <Box sx={{ position: 'relative', width: '100%', height: 140, bgcolor: '#F9F6F2' }}>
                  <CategoryImage src={cat.image_url ?? ''} alt={cat.name} fallbackLetter={cat.name[0]} />
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
          ))
        )}
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
            <TextField fullWidth label="URL Gambar (opsional)" name="image_url"
              value={formik.values.image_url} onChange={formik.handleChange} />
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
