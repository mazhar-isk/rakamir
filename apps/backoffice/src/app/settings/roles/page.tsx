'use client';

import BackofficeLayout from '@/components/layout/BackofficeLayout';
import { apiDelete, apiPost, apiPut, Role, useGet } from '@ecommerce/api-client';
import { Permission, ROLE_PERMISSIONS } from '@ecommerce/utils';
import { Add, CheckCircle, Delete, Edit } from '@mui/icons-material';
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
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useSWRConfig } from 'swr';
import { useConfirm } from '@/contexts/ConfirmContext';

const ALL_PERMISSIONS: { key: Permission; label: string; group: string }[] = [
  { key: 'products:read', label: 'Lihat Produk', group: 'Produk' },
  { key: 'products:write', label: 'Kelola Produk', group: 'Produk' },
  { key: 'orders:read', label: 'Lihat Pesanan', group: 'Pesanan' },
  { key: 'orders:write', label: 'Kelola Pesanan', group: 'Pesanan' },
  { key: 'customers:read', label: 'Lihat Pelanggan', group: 'Pelanggan' },
  { key: 'customers:write', label: 'Kelola Pelanggan', group: 'Pelanggan' },
  { key: 'reports:read', label: 'Lihat Laporan', group: 'Laporan' },
  { key: 'roles:read', label: 'Lihat Role', group: 'Pengaturan' },
  { key: 'roles:write', label: 'Kelola Role', group: 'Pengaturan' },
  { key: 'users:read', label: 'Lihat Admin Users', group: 'Pengaturan' },
  { key: 'users:write', label: 'Kelola Admin Users', group: 'Pengaturan' },
];

const ROLE_COLORS: Record<string, string> = {
  superadmin: '#D26B54', product_manager: '#22C55E', order_manager: '#06B6D4',
  customer_service: '#F59E0B', finance: '#EC4899',
};

export default function RolesPage() {
  const { data: roles, isLoading } = useGet<Role[]>('/admin/roles');
  const { mutate } = useSWRConfig();
  const { confirm } = useConfirm();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<Permission[]>([]);

  const openCreate = () => {
    setEditTarget(null);
    setNewRoleName('');
    setSelectedPerms([]);
    setDialogOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditTarget(role);
    setNewRoleName(role.name);
    setSelectedPerms(role.permissions as Permission[]);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditTarget(null);
    setNewRoleName('');
    setSelectedPerms([]);
  };

  const togglePerm = (p: Permission) =>
    setSelectedPerms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const handleSave = async () => {
    try {
      if (editTarget) {
        await apiPut(`/admin/roles/${editTarget.id}`, { name: newRoleName, permissions: selectedPerms });
        toast.success('Role berhasil diperbarui.');
      } else {
        await apiPost('/admin/roles', { name: newRoleName, permissions: selectedPerms });
        toast.success('Role berhasil dibuat.');
      }
      mutate('/admin/roles');
      closeDialog();
    } catch {
      toast.error(editTarget ? 'Gagal memperbarui role.' : 'Gagal membuat role.');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Hapus Role',
      message: 'Yakin ingin menghapus role ini? Tindakan ini tidak bisa dibatalkan.',
      confirmLabel: 'Ya, Hapus',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await apiDelete(`/admin/roles/${id}`);
      toast.success('Role dihapus.');
      mutate('/admin/roles');
    } catch {
      toast.error('Gagal menghapus role.');
    }
  };

  // Use mock roles if API not available
  const displayRoles = roles ?? Object.entries(ROLE_PERMISSIONS).map(([slug, perms], i) => ({
    id: String(i), name: slug.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()), slug, permissions: perms,
  }));

  const groups = Array.from(new Set(ALL_PERMISSIONS.map((p) => p.group)));

  return (
    <BackofficeLayout>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Role & Izin Akses</Typography>
          <Typography variant="body2" color="text.secondary">Kelola role dan hak akses admin</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
          Tambah Role
        </Button>
      </Box>

      <Grid container spacing={3}>
        {displayRoles.map((role) => {
          const color = ROLE_COLORS[role.slug] ?? '#6B7280';
          return (
            <Grid item xs={12} md={6} key={role.id}>
              <Card sx={{ p: 3, borderTop: `4px solid ${color}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: `${color}20`, color, width: 40, height: 40, fontSize: '1.1rem' }}>
                      {role.name[0]}
                    </Avatar>
                    <Box>
                      <Typography fontWeight={700}>{role.name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{role.slug}</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => openEdit(role as Role)}><Edit fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Hapus"><IconButton size="small" color="error" onClick={() => handleDelete(role.id)} disabled={role.slug === 'superadmin'}><Delete fontSize="small" /></IconButton></Tooltip>
                  </Box>
                </Box>
                <Box>
                  {groups.map((group) => {
                    const groupPerms = ALL_PERMISSIONS.filter((p) => p.group === group);
                    const hasAny = groupPerms.some((p) => role.permissions.includes(p.key));
                    if (!hasAny) return null;
                    return (
                      <Box key={group} sx={{ mb: 1.5 }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.5}>{group}</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {groupPerms.map((p) => role.permissions.includes(p.key) && (
                            <Chip key={p.key} label={p.label} size="small"
                              icon={<CheckCircle sx={{ fontSize: '14px !important', color: `${color} !important` }} />}
                              sx={{ bgcolor: `${color}10`, color, fontSize: '0.7rem', height: 22 }} />
                          ))}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Create / Edit role dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editTarget ? `Edit Role: ${editTarget.name}` : 'Tambah Role Baru'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nama Role" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} sx={{ mb: 3, mt: 1 }} />
          <Typography variant="subtitle2" fontWeight={700} mb={2}>Pilih Izin Akses</Typography>
          {groups.map((group) => (
            <Box key={group} sx={{ mb: 2 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" mb={1} display="block">{group}</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {ALL_PERMISSIONS.filter((p) => p.group === group).map((p) => (
                  <Chip key={p.key} label={p.label} clickable size="small"
                    onClick={() => togglePerm(p.key)}
                    color={selectedPerms.includes(p.key) ? 'primary' : 'default'}
                    variant={selectedPerms.includes(p.key) ? 'filled' : 'outlined'} />
                ))}
              </Box>
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeDialog}>Batal</Button>
          <Button variant="contained" onClick={handleSave} disabled={!newRoleName}>
            {editTarget ? 'Simpan Perubahan' : 'Buat Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </BackofficeLayout>
  );
}
