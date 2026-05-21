'use client';

import BackofficeLayout from '@/components/layout/BackofficeLayout';
import { usePaginated, User } from '@ecommerce/api-client';
import { formatDate } from '@ecommerce/utils';
import { Search, Visibility } from '@mui/icons-material';
import { Avatar, Box, Card, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import Link from 'next/link';
import { useState } from 'react';

export default function CustomersPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const queryString = new URLSearchParams({ page: String(page + 1), per_page: '10', ...(search && { q: search }) }).toString();
  const { data, isLoading } = usePaginated<User>(`/admin/customers?${queryString}`);
  const customers = data?.data ?? [];

  const columns: GridColDef[] = [
    {
      field: 'name', headerName: 'Pelanggan', flex: 1, minWidth: 220, display: 'flex',
      renderCell: (p: GridRenderCellParams<User>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.85rem' }}>{p.row.name?.[0]?.toUpperCase()}</Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>{p.row.name}</Typography>
            <Typography variant="caption" color="text.secondary">{p.row.email}</Typography>
          </Box>
        </Box>
      ),
    },
    { field: 'phone', headerName: 'Telepon', width: 150, renderCell: (p) => p.value || '-' },
    { field: 'created_at', headerName: 'Bergabung', width: 150, renderCell: (p) => formatDate(p.value) },
    {
      field: 'actions', headerName: 'Aksi', width: 80, sortable: false,
      renderCell: (p) => <IconButton size="small" component={Link} href={`/customers/${p.row.id}`} color="primary"><Visibility fontSize="small" /></IconButton>,
    },
  ];

  return (
    <BackofficeLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Pelanggan</Typography>
        <Typography variant="body2" color="text.secondary">{data?.meta.total ?? 0} total pelanggan terdaftar</Typography>
      </Box>
      <Card sx={{ p: 2, mb: 2 }}>
        <TextField size="small" placeholder="Cari nama / email..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          sx={{ minWidth: 280 }} />
      </Card>
      <Card>
        <DataGrid rows={customers} columns={columns} loading={isLoading}
          rowCount={data?.meta.total ?? 0} paginationMode="server"
          paginationModel={{ page, pageSize: 10 }} onPaginationModelChange={(m) => setPage(m.page)}
          pageSizeOptions={[10]} rowHeight={60} disableRowSelectionOnClick sx={{ border: 'none', minHeight: 400 }} />
      </Card>
    </BackofficeLayout>
  );
}
