'use client';

import BackofficeLayout from '@/components/layout/BackofficeLayout';
import { ShipmentTracking, usePaginated } from '@ecommerce/api-client';
import { formatDate, formatDateTime, getOrderStatusColor, getOrderStatusLabel, OrderStatus } from '@ecommerce/utils';
import {
  CheckCircle,
  Close,
  ContentCopy,
  Inventory,
  LocalShipping,
  RadioButtonUnchecked,
  Search,
} from '@mui/icons-material';
import {
  Box, Card, Chip, Divider, Drawer, IconButton,
  InputAdornment, TextField,
  Tooltip, Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { toast } from 'react-toastify';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TrackingEvent {
  status: string;
  description: string;
  location: string;
  timestamp: string;
}

interface AdminShipment extends ShipmentTracking {
  id: string;
  order_number: string;
  order_id: string;
  recipient: string;
  courier_service: string;
  created_at: string;
  events: TrackingEvent[];
}

// ─── Fallback mock rows ───────────────────────────────────────────────────────
const MOCK_ROWS: AdminShipment[] = [
  {
    id: 's-1', order_number: 'ORD-20240501-001', order_id: 'ord-1',
    tracking_number: 'JNE-1234567890', courier: 'JNE Express', courier_service: 'YES',
    recipient: 'Muhammad Azhar', status: 'delivered', estimated_delivery: '3 Mei 2024',
    created_at: '2024-05-01T00:00:00Z',
    events: [
      { status: 'picked_up', description: 'Paket diambil oleh kurir', location: 'Jakarta Selatan', timestamp: '2024-05-01T09:00:00Z' },
      { status: 'in_transit', description: 'Paket dalam perjalanan ke hub', location: 'Jakarta Hub', timestamp: '2024-05-01T14:00:00Z' },
      { status: 'out_for_delivery', description: 'Paket sedang diantar', location: 'Depok', timestamp: '2024-05-02T08:30:00Z' },
      { status: 'delivered', description: 'Paket berhasil diterima', location: 'Depok', timestamp: '2024-05-02T11:45:00Z' },
    ],
  },
  {
    id: 's-2', order_number: 'ORD-20240510-002', order_id: 'ord-2',
    tracking_number: 'SICEPAT-9876543210', courier: 'SiCepat Ekspress', courier_service: 'REG',
    recipient: 'Budi Santoso', status: 'shipped', estimated_delivery: '13 Mei 2024',
    created_at: '2024-05-10T00:00:00Z',
    events: [
      { status: 'picked_up', description: 'Paket diambil oleh kurir', location: 'Bandung', timestamp: '2024-05-10T10:00:00Z' },
      { status: 'in_transit', description: 'Paket dalam perjalanan', location: 'Bandung Hub', timestamp: '2024-05-10T16:00:00Z' },
    ],
  },
];

// ─── Tracking event icon ──────────────────────────────────────────────────────
function EventIcon({ status, isLast, color }: { status: string; isLast: boolean; color: string }) {
  const sx = { fontSize: 16, color };
  if (isLast && status === 'delivered') return <CheckCircle sx={sx} />;
  if (isLast) return <LocalShipping sx={sx} />;
  if (status === 'picked_up') return <Inventory sx={sx} />;
  return <RadioButtonUnchecked sx={sx} />;
}

// ─── Shipment Detail Drawer ───────────────────────────────────────────────────
function ShipmentDrawer({ shipment, onClose }: { shipment: AdminShipment | null; onClose: () => void }) {
  if (!shipment) return null;

  const statusColor = getOrderStatusColor(shipment.status as OrderStatus);
  const events: TrackingEvent[] = shipment.events ?? [];

  const copyTracking = () => {
    navigator.clipboard.writeText(shipment.tracking_number ?? '');
    toast.success('Nomor resi disalin!');
  };

  return (
    <Drawer
      anchor="right"
      open={Boolean(shipment)}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 0 } }}
    >
      {/* Header */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(235, 196, 184, 0.2)' }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Detail Pengiriman</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
            #{shipment.order_number}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </Box>

      <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
        {/* Status chip */}
        <Chip
          label={getOrderStatusLabel(shipment.status as OrderStatus)}
          sx={{ bgcolor: `${statusColor}18`, color: statusColor, fontWeight: 700, mb: 3 }}
        />

        {/* Info grid */}
        {[
          { label: 'Penerima', value: shipment.recipient },
          { label: 'Kurir', value: `${shipment.courier} · ${shipment.courier_service}` },
          { label: 'Est. Tiba', value: shipment.estimated_delivery },
          { label: 'Dikirim', value: formatDate(shipment.created_at) },
        ].map(({ label, value }) => (
          <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body2" fontWeight={600}>{value}</Typography>
          </Box>
        ))}

        {/* Tracking number */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#F9F6F2', borderRadius: 2, px: 2, py: 1.5, mt: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">No. Resi</Typography>
            <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
              {shipment.tracking_number}
            </Typography>
          </Box>
          <Tooltip title="Salin nomor resi">
            <IconButton size="small" onClick={copyTracking}><ContentCopy fontSize="small" /></IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Custom Box-based tracking timeline */}
        <Typography variant="subtitle2" fontWeight={700} mb={2}>Riwayat Tracking</Typography>
        {events.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Belum ada data tracking.</Typography>
        ) : (
          <Box>
            {[...events].reverse().map((ev, i) => {
              const isFirst = i === 0;
              const dotBg = isFirst ? statusColor : '#E5E7EB';
              const iconColor = isFirst ? '#fff' : '#9CA3AF';
              return (
                <Box key={i} sx={{ display: 'flex', gap: 1.5 }}>
                  {/* dot + connector */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: dotBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <EventIcon status={ev.status} isLast={isFirst} color={iconColor} />
                    </Box>
                    {i < events.length - 1 && (
                      <Box sx={{ width: 2, flex: 1, minHeight: 16, bgcolor: '#E5E7EB', my: 0.5 }} />
                    )}
                  </Box>
                  {/* content */}
                  <Box sx={{ pb: i < events.length - 1 ? 2 : 0, pt: 0.5 }}>
                    <Typography variant="body2" fontWeight={600} color={isFirst ? statusColor : 'text.primary'}>
                      {ev.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{ev.location}</Typography>
                    <br />
                    <Typography variant="caption" color="text.disabled">{formatDateTime(ev.timestamp)}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Drawer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ShipmentsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedShipment, setSelectedShipment] = useState<AdminShipment | null>(null);

  const qs = new URLSearchParams({ page: String(page + 1), per_page: '10', ...(search && { q: search }) }).toString();
  const { data, isLoading } = usePaginated<AdminShipment>(`/admin/shipments?${qs}`);

  const rows = data?.data ?? MOCK_ROWS;

  const columns: GridColDef[] = [
    {
      field: 'order_number', headerName: 'No. Pesanan', width: 190, display: 'flex',
      renderCell: (p) => <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>#{p.value}</Typography>,
    },
    {
      field: 'tracking_number', headerName: 'No. Resi', width: 200, display: 'flex',
      renderCell: (p) => <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>{p.value}</Typography>,
    },
    { field: 'recipient', headerName: 'Penerima', flex: 1, minWidth: 150 },
    {
      field: 'courier', headerName: 'Kurir', width: 160, display: 'flex',
      renderCell: (p) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LocalShipping sx={{ fontSize: 16, color: 'primary.main' }} />
          <Typography variant="body2">{p.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'status', headerName: 'Status', width: 160, display: 'flex',
      renderCell: (p) => {
        const color = getOrderStatusColor(p.value as OrderStatus);
        return <Chip label={getOrderStatusLabel(p.value as OrderStatus)} size="small" sx={{ bgcolor: `${color}18`, color, fontWeight: 600, fontSize: '0.72rem' }} />;
      },
    },
    { field: 'estimated_delivery', headerName: 'Est. Tiba', width: 130 },
    { field: 'created_at', headerName: 'Dibuat', width: 120, renderCell: (p) => formatDate(p.value) },
  ];

  return (
    <BackofficeLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Manajemen Pengiriman</Typography>
        <Typography variant="body2" color="text.secondary">
          {data?.meta.total ?? rows.length} total pengiriman · Klik baris untuk melihat detail tracking
        </Typography>
      </Box>

      <Card sx={{ p: 2, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Cari no. resi / pesanan..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          sx={{ minWidth: 300 }}
        />
      </Card>

      <Card>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          rowCount={data?.meta.total ?? rows.length}
          paginationMode={data ? 'server' : 'client'}
          paginationModel={{ page, pageSize: 10 }}
          onPaginationModelChange={(m) => setPage(m.page)}
          pageSizeOptions={[10]}
          rowHeight={56}
          disableRowSelectionOnClick
          onRowClick={(params) => setSelectedShipment(params.row as AdminShipment)}
          sx={{
            border: 'none',
            minHeight: 400,
            '& .MuiDataGrid-row': { cursor: 'pointer' },
          }}
        />
      </Card>

      {/* Detail drawer */}
      <ShipmentDrawer shipment={selectedShipment} onClose={() => setSelectedShipment(null)} />
    </BackofficeLayout>
  );
}
