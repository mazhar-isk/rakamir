'use client';

import BackofficeLayout from '@/components/layout/BackofficeLayout';
import { AdminUser, apiDelete, apiPatch, apiPost, usePaginated } from '@ecommerce/api-client';
import { formatDate } from '@ecommerce/utils';
import { Add, Block, CheckCircle, Delete } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useFormik } from 'formik';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useSWRConfig } from 'swr';
import * as Yup from 'yup';

const ROLE_OPTIONS = ['superadmin', 'product_manager', 'order_manager', 'customer_service', 'finance'];
const ROLE_COLORS: Record<string, string> = {
  superadmin: '#D26B54', product_manager: '#22C55E', order_manager: '#06B6D4',
  customer_service: '#F59E0B', finance: '#EC4899',
};

const schema = Yup.object({
  name: Yup.string().required('Nama wajib diisi'),
  email: Yup.string().email('Email tidak valid').required('Email wajib diisi'),
  password: Yup.string().required('Password wajib diisi').min(8, 'Minimal 8 karakter'),
  role: Yup.string().required('Role wajib dipilih'),
});

export default function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading, mutate } = usePaginated<AdminUser>(`/admin/users?page=${page + 1}&per_page=10`);
  const { mutate: globalMutate } = useSWRConfig();
  const users = data?.data ?? [];

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '', role: '' },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await apiPost('/admin/users', values);
        toast.success('Admin user berhasil dibuat.');
        mutate();
        setDialogOpen(false);
        resetForm();
      } catch {
        toast.error('Gagal membuat user.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleToggleActive = async (user: AdminUser) => {
    try {
      await apiPatch(`/admin/users/${user.id}`, { is_active: !user.is_active });
      toast.success(`User ${user.is_active ? 'dinonaktifkan' : 'diaktifkan'}.`);
      mutate();
    } catch {
      toast.error('Gagal mengubah status user.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus user ini?')) return;
    try {
      await apiDelete(`/admin/users/${id}`);
      toast.success('User dihapus.');
      mutate();
    } catch {
      toast.error('Gagal menghapus user.');
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name', headerName: 'Admin User', flex: 1, minWidth: 220, display: 'flex',
      renderCell: (p: GridRenderCellParams<AdminUser>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: ROLE_COLORS[p.row.role?.slug] ?? '#6B7280', fontSize: '0.85rem' }}>
            {p.row.name?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>{p.row.name}</Typography>
            <Typography variant="caption" color="text.secondary">{p.row.email}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'role', headerName: 'Role', width: 170,
      renderCell: (p: GridRenderCellParams<AdminUser>) => {
        const slug = p.row.role?.slug ?? '';
        const color = ROLE_COLORS[slug] ?? '#6B7280';
        return <Chip label={p.row.role?.name ?? slug} size="small" sx={{ bgcolor: `${color}18`, color, fontWeight: 600, fontSize: '0.72rem' }} />;
      },
    },
    {
      field: 'is_active', headerName: 'Status', width: 110,
      renderCell: (p) => <Chip label={p.value ? 'Aktif' : 'Nonaktif'} size="small" color={p.value ? 'success' : 'default'} />,
    },
    { field: 'created_at', headerName: 'Dibuat', width: 140, renderCell: (p) => formatDate(p.value) },
    {
      field: 'actions', headerName: 'Aksi', width: 110, sortable: false,
      renderCell: (p: GridRenderCellParams<AdminUser>) => (
        <Box>
          <Tooltip title={p.row.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
            <IconButton size="small" onClick={() => handleToggleActive(p.row)} color={p.row.is_active ? 'warning' : 'success'}>
              {p.row.is_active ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Hapus">
            <IconButton size="small" color="error" onClick={() => handleDelete(p.row.id)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <BackofficeLayout>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Admin Users</Typography>
          <Typography variant="body2" color="text.secondary">{data?.meta.total ?? 0} total admin terdaftar</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
          Tambah Admin
        </Button>
      </Box>

      <Card>
        <DataGrid rows={users} columns={columns} loading={isLoading}
          rowCount={data?.meta.total ?? 0} paginationMode="server"
          paginationModel={{ page, pageSize: 10 }} onPaginationModelChange={(m) => setPage(m.page)}
          pageSizeOptions={[10]} rowHeight={60} disableRowSelectionOnClick
          sx={{ border: 'none', minHeight: 400 }} />
      </Card>

      {/* Create dialog */}
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); formik.resetForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Tambah Admin User</DialogTitle>
        <DialogContent>
          <form>
            <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
              {[{ name: 'name', label: 'Nama Lengkap', type: 'text' }, { name: 'email', label: 'Email', type: 'email' }, { name: 'password', label: 'Password', type: 'password' }].map(({ name, label, type }) => (
                <Grid item xs={12} key={name}>
                  <TextField fullWidth label={label} name={name} type={type}
                    value={(formik.values as any)[name]} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    error={(formik.touched as any)[name] && Boolean((formik.errors as any)[name])}
                    helperText={(formik.touched as any)[name] && (formik.errors as any)[name]} />
                </Grid>
              ))}
              <Grid item xs={12}>
                <FormControl fullWidth error={formik.touched.role && Boolean(formik.errors.role)}>
                  <InputLabel>Role</InputLabel>
                  <Select name="role" value={formik.values.role} label="Role" onChange={formik.handleChange}>
                    {ROLE_OPTIONS.map((r) => (
                      <MenuItem key={r} value={r}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: ROLE_COLORS[r] }} />
                          {r.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </form>
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
