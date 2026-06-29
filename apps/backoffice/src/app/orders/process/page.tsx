'use client';

import { TableNoRowsOverlay } from '@/components/common/DataGridOverlays';
import BackofficeLayout from '@/components/layout/BackofficeLayout';
import { apiClient, apiPatch, usePaginated } from '@ecommerce/api-client';
import { formatCurrency, formatDate, getOrderStatusColor, getOrderStatusLabel, OrderStatus } from '@ecommerce/utils';
import {
  Cancel,
  Done,
  Download,
  LocalMall,
  Payments,
  Print,
  Search,
  ShoppingCart,
  Visibility
} from '@mui/icons-material';
import {
  Badge,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';

export default function OrderProcessPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
  const [printOrders, setPrintOrders] = useState<any[]>([]);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

  const [isPreviewLabelOpen, setIsPreviewLabelOpen] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState('');
  const [previewOrderNo, setPreviewOrderNo] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleClosePreview = () => {
    setIsPreviewLabelOpen(false);
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl);
      setPreviewPdfUrl('');
    }
  };

  const handlePrintPDF = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.focus();
        iframeRef.current.contentWindow?.print();
      } catch (e) {
        console.error(e);
        window.open(previewPdfUrl, '_blank');
      }
    }
  };

  const handleDownloadPDF = () => {
    if (!previewPdfUrl) return;
    const a = document.createElement('a');
    a.href = previewPdfUrl;
    a.download = `label-${previewOrderNo || 'shipping'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Label pengiriman diunduh.');
  };

  // Fetch pending confirmation orders (Tab 0)
  const queryPending = new URLSearchParams({
    page: '1',
    limit: '100',
    status: 'PAID',
    sort_by: 'created_at',
    sort_dir: 'desc',
  }).toString();
  const { data: pendingData, isLoading: isPendingLoading, mutate: mutatePending } =
    usePaginated<any>(activeTab === 0 ? `/admin/transactions?${queryPending}` : null);

  // Fetch processing/accepted orders (Tab 1)
  const queryProcessing = new URLSearchParams({
    page: '1',
    limit: '100',
    status: 'PROCESSING',
    sort_by: 'created_at',
    sort_dir: 'desc',
  }).toString();
  const { data: processingData, isLoading: isProcessingLoading, mutate: mutateProcessing } =
    usePaginated<any>(activeTab === 1 ? `/admin/transactions?${queryProcessing}` : null);

  // Handle Tab Switch
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSelectedRowIds([]);
  };

  // Mutate all lists to sync updates
  const syncData = () => {
    if (activeTab === 0) mutatePending();
    if (activeTab === 1) mutateProcessing();
    setSelectedRowIds([]);
  };

  // Filter orders based on search query
  const pendingOrders = useMemo(() => {
    const items = (pendingData?.data ?? []).map((o: any) => ({
      ...o,
      status: o.status?.toLowerCase(),
    }));
    if (!searchQuery) return items;
    return items.filter((o: any) =>
      o.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shipping_address?.recipient_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pendingData?.data, searchQuery]);

  const processingOrders = useMemo(() => {
    const items = (processingData?.data ?? []).map((o: any) => ({
      ...o,
      status: o.status?.toLowerCase(),
    }));
    if (!searchQuery) return items;
    return items.filter((o: any) =>
      o.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shipping_address?.recipient_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [processingData?.data, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalPendingCount = pendingData?.data?.length ?? 0;
    const totalPendingValue = (pendingData?.data ?? []).reduce((acc: number, curr: any) => acc + (curr.total ?? curr.grand_total ?? 0), 0);
    const totalProcessingCount = processingData?.data?.length ?? 0;

    return {
      pendingCount: totalPendingCount,
      pendingValue: totalPendingValue,
      processingCount: totalProcessingCount
    };
  }, [pendingData?.data, processingData?.data]);

  // Helper to calculate pickup date (created_at + 1 day if >= 16:00, else created_at)
  const getPickupDate = (createdAtStr?: string): string => {
    // const d = createdAtStr ? new Date(createdAtStr) : new Date();
    // const hour = d.getHours();
    // if (hour >= 16) {
    //   d.setDate(d.getDate() + 1);
    // }
    const now = new Date();
    let d: Date;
    if (createdAtStr && new Date(createdAtStr) < now && now.getHours() < 16) {
      d = new Date();
      d.setHours(17, 0, 0, 0);
    } else {
      d = createdAtStr ? new Date(createdAtStr) : new Date();
      const hour = d.getHours();
      if (hour >= 16) {
        d.setDate(d.getDate() + 1);
      }
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${date}`;
  };

  // Aksi Setujui Order Tunggal
  const handleAcceptOrder = async (order: any) => {
    try {
      const pickupDate = getPickupDate(order.created_at);
      await apiClient.post('/admin/shipments/pickup-order', {
        pickup_date: pickupDate,
        pickup_time: '17:00',
        pickup_vehicle: 'Mobil',
        order_numbers: [order.shipping_order_no]
      });

      toast.success(`Pesanan #${order.order_number} berhasil disetujui.`);

      // Auto open print receipt layout
      // setPrintOrders([order]);
      // setIsPrintDialogOpen(true);

      syncData();
    } catch {
      toast.error(`Gagal menyetujui pesanan #${order.order_number}.`);
    }
  };

  // Aksi Setujui Order Massal (Bulk Accept)
  const handleBulkAccept = async () => {
    if (selectedRowIds.length === 0) return;

    const selectedOrders = pendingOrders.filter((o: any) => selectedRowIds.includes(o.id));
    const orderNumbers = selectedOrders.map((o: any) => o.shipping_order_no).filter(Boolean);

    if (orderNumbers.length === 0) return;

    toast.info(`Memproses ${selectedOrders.length} pesanan...`);

    try {
      const pickupDate = getPickupDate(selectedOrders[0]?.created_at);
      await apiClient.post('/admin/shipments/pickup-order', {
        pickup_date: pickupDate,
        pickup_time: '17:00',
        pickup_vehicle: 'Mobil',
        order_numbers: orderNumbers
      });

      toast.success(`${selectedOrders.length} pesanan berhasil disetujui.`);

      // Trigger bulk print for the successfully accepted orders
      setPrintOrders(selectedOrders);
      setIsPrintDialogOpen(true);
      syncData();
    } catch {
      toast.error(`Gagal menyetujui pesanan.`);
    }
  };

  // Aksi Tolak Order Tunggal (Reject & Refund)
  const handleRejectOrder = async (order: any) => {
    try {
      await apiPatch(`/admin/orders/${order.id}/status`, { status: 'CANCELLED' });
      toast.warn(`Pesanan #${order.order_number} ditolak. Status dibatalkan & dana dikembalikan.`);
      syncData();
    } catch {
      toast.error(`Gagal menolak pesanan #${order.order_number}.`);
    }
  };

  // Aksi Tolak Order Massal (Bulk Reject & Refund)
  const handleBulkReject = async () => {
    if (selectedRowIds.length === 0) return;

    const selectedOrders = pendingOrders.filter((o: any) => selectedRowIds.includes(o.id));
    let successCount = 0;

    for (const order of selectedOrders) {
      try {
        await apiPatch(`/admin/orders/${order.id}/status`, { status: 'CANCELLED' });
        successCount++;
      } catch {
        toast.error(`Gagal menolak pesanan #${order.order_number}`);
      }
    }

    if (successCount > 0) {
      toast.warn(`${successCount} pesanan berhasil ditolak & direfund.`);
    }
    syncData();
  };

  // Aksi Ambil Order Tunggal (Update to Picked Up)
  const handlePickUpOrder = async (order: any) => {
    try {
      // Pick up means order status transitions to 'SHIPPED' (already picked up by courier/customer)
      await apiPatch(`/admin/orders/${order.id}/status`, { status: 'SHIPPED' });
      toast.success(`Pesanan #${order.order_number} berhasil diambil (Pick Up).`);
      syncData();
    } catch {
      toast.error(`Gagal memproses ambil pesanan #${order.order_number}.`);
    }
  };

  // Aksi Ambil Order Massal (Bulk Pick Up)
  const handleBulkPickUp = async () => {
    if (selectedRowIds.length === 0) return;

    const selectedOrders = processingOrders.filter((o: any) => selectedRowIds.includes(o.id));
    let successCount = 0;

    for (const order of selectedOrders) {
      try {
        await apiPatch(`/admin/orders/${order.id}/status`, { status: 'SHIPPED' });
        successCount++;
      } catch {
        toast.error(`Gagal memproses ambil pesanan #${order.order_number}`);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} pesanan berhasil ditandai sebagai Sudah Diambil.`);
    }
    syncData();
  };

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  // Hit API print label for shipping_order_no
  const handlePrintLabel = async (orderNumbers: string[]) => {
    try {
      toast.info('Menyiapkan label pengiriman...');
      const response = await apiClient.post(
        '/admin/shipments/print-label',
        {
          page: 'page_5',
          order_numbers: orderNumbers
        }
      );

      const resData = response.data;
      const base64Str = resData?.base64 || resData?.data?.base64;

      if (base64Str) {
        const binaryString = window.atob(base64Str);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const file = new Blob([bytes], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        setPreviewPdfUrl(fileURL);
        setPreviewOrderNo(orderNumbers.join('_'));
        setIsPreviewLabelOpen(true);
        toast.success('Label pengiriman berhasil disiapkan.');
      } else {
        toast.error('Gagal mencetak: Respons tidak mengandung data label.');
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Gagal mencetak label pengiriman.';
      toast.error(errMsg);
    }
  };

  // Columns definition for Pending grid
  const pendingColumns: GridColDef[] = [
    {
      field: 'order_number',
      headerName: 'No. Pesanan',
      width: 200,
      display: "flex",
      renderCell: (p) => (
        <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
          #{p.row.order_number ?? p.row.id?.slice(0, 8).toUpperCase()}
        </Typography>
      )
    },
    {
      field: 'created_at',
      headerName: 'Tanggal Masuk',
      width: 120,
      renderCell: (p) => formatDate(p.value)
    },
    {
      field: 'customer',
      headerName: 'Pelanggan',
      flex: 1,
      display: "flex",
      renderCell: (p) => (
        <Box display='flex' flexDirection='column'>
          <Typography variant="body2" fontWeight={600}>
            {p.row.customer_name ?? p.row.shipping_address?.recipient_name ?? p.row.customer?.name ?? '-'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {p.row.customer_phone_number ?? p.row.shipping_address?.recipient_phone ?? p.row.customer?.phone ?? '-'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'payment',
      headerName: 'Metode Pembayaran',
      width: 160,
      display: 'flex',
      renderCell: (p) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<Payments sx={{ fontSize: '0.9rem' }} />}
            label={(p.row.payment_method ?? 'transfer').toUpperCase()}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.675rem' }}
          />
        </Box>
      ),
    },
    {
      field: 'total',
      headerName: 'Total Belanja',
      flex: 1,
      display: "flex",
      renderCell: (p) => (
        <Typography fontWeight={700} color="primary.main">
          {formatCurrency(p.row.grand_total ?? p.row.total ?? p.row.total_price ?? 0)}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Tindakan',
      flex: 1,
      sortable: false,
      renderCell: (p) => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<Done />}
            onClick={() => handleAcceptOrder(p.row)}
            sx={{ textTransform: 'none', borderRadius: 2, py: 0.5 }}
          >
            Setujui
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<Cancel />}
            onClick={() => handleRejectOrder(p.row)}
            sx={{ textTransform: 'none', borderRadius: 2, py: 0.5 }}
          >
            Tolak
          </Button>
          <IconButton
            size="small"
            component={Link}
            href={`/orders/${p.row.id}`}
            color="primary"
            title="Lihat Detail"
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Columns definition for Processing/Accepted grid
  const processingColumns: GridColDef[] = [
    {
      field: 'order_number',
      headerName: 'No. Pesanan',
      width: 200,
      display: 'flex',
      renderCell: (p) => (
        <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
          #{p.row.order_number ?? p.row.id?.slice(0, 8).toUpperCase()}
        </Typography>
      )
    },
    {
      field: 'tracking_number',
      headerName: 'No. Resi Pengiriman',
      width: 200,
      display: 'flex',
      renderCell: (p) => (
        <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
          #{p.row.tracking_number}
        </Typography>
      )
    },
    {
      field: 'created_at',
      headerName: 'Disetujui Tanggal',
      width: 140,
      renderCell: (p) => formatDate(p.value)
    },
    {
      field: 'customer',
      headerName: 'Pelanggan',
      flex: 1,
      display: 'flex',
      renderCell: (p) => (
        <Box display="flex" flexDirection="column">
          <Typography variant="body2" fontWeight={600}>
            {p.row.customer_name ?? p.row.shipping_address?.recipient_name ?? p.row.customer?.name ?? '-'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {p.row.customer_phone_number ?? p.row.shipping_address?.recipient_phone ?? p.row.customer?.phone ?? '-'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'total',
      headerName: 'Total Belanja',
      flex: 1,
      display: 'flex',
      renderCell: (p) => (
        <Typography fontWeight={700} color="primary.main">
          {formatCurrency(p.row.grand_total ?? p.row.total ?? p.row.total_price ?? 0)}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (p) => {
        const color = getOrderStatusColor(p.value as OrderStatus);
        return <Chip label={getOrderStatusLabel(p.value as OrderStatus)} size="small" sx={{ bgcolor: `${color}18`, color, fontWeight: 700 }} />;
      }
    },
    {
      field: 'actions',
      headerName: 'Tindakan',
      flex: 1,
      sortable: false,
      renderCell: (p) => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
          {/* <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<CheckCircle />}
            onClick={() => handlePickUpOrder(p.row)}
            sx={{ textTransform: 'none', borderRadius: 2, py: 0.5, bgcolor: '#D26B54', '&:hover': { bgcolor: '#b85a44' } }}
          >
            Sudah Diambil
          </Button> */}
          <Button
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<Print />}
            onClick={() => {
              if (p.row.shipping_order_no) {
                handlePrintLabel([p.row.shipping_order_no]);
              } else {
                toast.error('No. Resi Pengiriman (shipping_order_no) tidak ditemukan.');
              }
            }}
            sx={{ textTransform: 'none', borderRadius: 2, py: 0.5 }}
          >
            Cetak Resi
          </Button>
          <IconButton
            size="small"
            component={Link}
            href={`/orders/${p.row.id}`}
            color="primary"
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <BackofficeLayout>
      {/* Printable Area - Hidden on screen, visible only when printing */}
      <style jsx global>{`
        #thermal-receipt-container {
          display: none;
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          #thermal-receipt-container, #thermal-receipt-container * {
            visibility: visible !important;
          }
          #thermal-receipt-container {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0;
            padding: 0;
            background: white !important;
            color: black !important;
          }
          .receipt-page {
            page-break-after: always;
            padding: 20px;
            max-width: 320px;
            margin: 0 auto;
            font-family: 'Courier New', Courier, monospace !important;
          }
          .receipt-page:last-child {
            page-break-after: avoid;
          }
        }
      `}</style>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, borderLeft: '4px solid #fbbf24', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
            <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: '#fbbf2418', color: '#fbbf24' }}>
              <ShoppingCart />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>Konfirmasi Baru</Typography>
              <Typography variant="h5" fontWeight={700}>{stats.pendingCount} Pesanan</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, borderLeft: '4px solid #8b5cf6', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
            <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: '#8b5cf618', color: '#8b5cf6' }}>
              <LocalMall />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>Sedang Diproses (Siap Ambil)</Typography>
              <Typography variant="h5" fontWeight={700}>{stats.processingCount} Pesanan</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, borderLeft: '4px solid #22c55e', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
            <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: '#22c55e18', color: '#22c55e' }}>
              <Payments />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>Nilai Pesanan Baru</Typography>
              <Typography variant="h5" fontWeight={700}>{formatCurrency(stats.pendingValue)}</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Control Panel */}
      <Card sx={{ p: 2, mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'space-between', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{
          borderBottom: 'none',
          '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', px: 3, minHeight: 48, borderRadius: '1rem 1rem 0 0', transition: 'all 0.2s' },
          '& .Mui-selected': { color: '#D26B54 !important', bgcolor: 'rgba(210, 107, 84, 0.08)' },
          '& .MuiTabs-indicator': { backgroundColor: '#D26B54' }
        }}>
          <Tab label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>Konfirmasi Pesanan</Typography>
              <Badge badgeContent={stats.pendingCount} color="warning" sx={{ '& .MuiBadge-badge': { fontWeight: 700 } }} />
            </Box>
          } />
          <Tab label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>Siap Diambil</Typography>
              <Badge badgeContent={stats.processingCount} color="secondary" sx={{ '& .MuiBadge-badge': { fontWeight: 700 } }} />
            </Box>
          } />
        </Tabs>

        <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' }, justifyContent: 'flex-end' }}>
          <TextField
            size="small"
            placeholder="Cari no. pesanan / pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', md: 280 } }}
          />
        </Box>
      </Card>

      {/* Bulk Action Indicator Bar */}
      {selectedRowIds.length > 0 && (
        <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#FDF5F2', border: '1px solid rgba(210, 107, 84, 0.2)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'fadeIn 0.3s ease' }}>
          <Typography variant="subtitle2" fontWeight={700} color="#D26B54">
            {selectedRowIds.length} Pesanan Terpilih
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {activeTab === 0 ? (
              <>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<Done />}
                  onClick={handleBulkAccept}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  Setujui Terpilih
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={handleBulkReject}
                  sx={{ textTransform: 'none', borderRadius: 2, bgcolor: 'white' }}
                >
                  Tolak Terpilih
                </Button>
              </>
            ) : (
              // <Button
              //   size="small"
              //   variant="contained"
              //   onClick={handleBulkPickUp}
              //   startIcon={<CheckCircle />}
              //   sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#D26B54', '&:hover': { bgcolor: '#b85a44' } }}
              // >
              //   Cetak Resi
              // </Button>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={<Print />}
                onClick={() => {
                  const selectedOrders = processingOrders.filter((o: any) => selectedRowIds.includes(o.id));
                  const orderNumbers = selectedOrders.map((o: any) => o.shipping_order_no).filter(Boolean);
                  if (orderNumbers.length > 0) {
                    handlePrintLabel(orderNumbers);
                  } else {
                    toast.error('No. Resi Pengiriman (shipping_order_no) tidak ditemukan pada pesanan terpilih.');
                  }
                }}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Cetak Resi
              </Button>
            )}
          </Box>
        </Paper>
      )}

      {/* Table Container */}
      <Card sx={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', borderRadius: 3, overflow: 'hidden' }}>
        {activeTab === 0 ? (
          <DataGrid
            rows={pendingOrders}
            columns={pendingColumns}
            loading={isPendingLoading}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={(ids) => setSelectedRowIds(ids)}
            rowSelectionModel={selectedRowIds}
            rowHeight={64}
            autoHeight
            slots={{
              noRowsOverlay: () => (
                <TableNoRowsOverlay
                  message="Tidak Ada Pesanan Konfirmasi"
                  description="Semua pesanan baru sudah dikonfirmasi."
                />
              )
            }}
            sx={{
              border: 'none', minHeight: 350, '& .MuiDataGrid-columnHeader': {
                '&:focus, &:focus-within': {
                  outline: 'none',
                },
              },
            }}
          />
        ) : (
          <DataGrid
            rows={processingOrders}
            columns={processingColumns}
            loading={isProcessingLoading}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={(ids) => setSelectedRowIds(ids)}
            rowSelectionModel={selectedRowIds}
            rowHeight={64}
            autoHeight
            slots={{
              noRowsOverlay: () => (
                <TableNoRowsOverlay
                  message="Tidak Ada Pesanan Siap Diambil"
                  description="Belum ada pesanan yang disetujui dan menunggu pengambilan oleh pembeli."
                />
              )
            }}
            sx={{
              border: 'none', minHeight: 350, '& .MuiDataGrid-columnHeader': {
                '&:focus, &:focus-within': {
                  outline: 'none',
                },
              },
            }}
          />
        )}
      </Card>

      {/* Receipt Print Preview Dialog */}
      <Dialog
        open={isPrintDialogOpen}
        onClose={() => setIsPrintDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
          <Typography variant="h6" fontWeight={700}>Cetak Resi Belanja</Typography>
          <Chip label={`${printOrders.length} Resi`} size="small" color="primary" />
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ bgcolor: '#f7f5f2', p: 3, maxHeight: '60vh', overflowY: 'auto' }}>
          {printOrders.map((order, idx) => (
            <Paper
              key={order.id}
              elevation={1}
              sx={{
                p: 3,
                mb: idx < printOrders.length - 1 ? 3 : 0,
                fontFamily: 'monospace',
                maxWidth: 320,
                mx: 'auto',
                bgcolor: 'white',
                border: '1px dashed #ccc'
              }}
            >
              {/* Thermal Receipt Visual Mock (Screen preview) */}
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ letterSpacing: 2 }}>RAKAMIR WEBSTORE</Typography>
                <Typography variant="caption" color="text.secondary" display="block">Kemang Raya No. 12, Jakarta</Typography>
                <Typography variant="caption" color="text.secondary" display="block">Telp: 021-7788990</Typography>
                <Box sx={{ my: 1 }}>================================</Box>
              </Box>

              <Box sx={{ mb: 2, fontSize: '0.8rem' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>No. Order:</span>
                  <span style={{ fontWeight: 'bold' }}>#{order.order_number}</span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tanggal:</span>
                  <span>{formatDate(order.created_at)}</span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Penerima:</span>
                  <span>{order.shipping_address?.recipient_name ?? order.customer?.name}</span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Telepon:</span>
                  <span>{order.shipping_address?.recipient_phone ?? order.customer?.phone}</span>
                </Box>
              </Box>

              <Box sx={{ my: 1 }}>--------------------------------</Box>
              <Typography variant="caption" fontWeight={800} display="block" sx={{ mb: 1 }}>Rincian Barang:</Typography>

              {order.items?.map((item: any) => (
                <Box key={item.id} sx={{ mb: 1, fontSize: '0.8rem' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.product?.name ?? item.product_name}
                    </span>
                    <span>x{item.quantity}</span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
                    <span style={{ fontSize: '0.75rem' }}>@{formatCurrency(item.price ?? item.unit_price ?? 0)}</span>
                    <span>{formatCurrency(item.subtotal ?? item.total_price ?? 0)}</span>
                  </Box>
                </Box>
              ))}

              <Box sx={{ my: 1 }}>--------------------------------</Box>

              <Box sx={{ fontSize: '0.8rem', mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subtotal ?? order.summary?.subtotal ?? 0)}</span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ongkir:</span>
                  <span>{formatCurrency(order.shipping_cost ?? order.summary?.shipping_cost ?? 0)}</span>
                </Box>
                {((order.discount ?? order.summary?.discount_amount ?? 0) > 0) && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'error.main' }}>
                    <span>Diskon:</span>
                    <span>-{formatCurrency(order.discount ?? order.summary?.discount_amount ?? 0)}</span>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.9rem', mt: 1 }}>
                  <span>TOTAL:</span>
                  <span>{formatCurrency(order.total ?? order.summary?.grand_total ?? 0)}</span>
                </Box>
              </Box>

              <Box sx={{ my: 1 }}>================================</Box>
              <Box sx={{ textAlign: 'center', fontSize: '0.75rem', color: 'text.secondary' }}>
                <Typography variant="caption" display="block">METODE: {(order.payment_method ?? 'TRANSFER').toUpperCase()}</Typography>
                <Typography variant="caption" display="block" fontWeight={700} color="success.main">STATUS: LUNAS</Typography>
                <Box sx={{ my: 1.5, display: 'inline-block', p: 1, border: '1px solid black', fontFamily: 'monospace', letterSpacing: 3 }}>
                  * {order.order_number} *
                </Box>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>Terima kasih atas kunjungan Anda!</Typography>
              </Box>
            </Paper>
          ))}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsPrintDialogOpen(false)} variant="text" color="inherit">Batal</Button>
          <Button onClick={handlePrint} variant="contained" startIcon={<Print />} sx={{ bgcolor: '#D26B54', '&:hover': { bgcolor: '#b85a44' } }}>Cetak Sekarang</Button>
        </DialogActions>
      </Dialog>

      {/* Shipping Label PDF Preview Dialog */}
      <Dialog
        open={isPreviewLabelOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, height: '80vh' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
          <Typography variant="h6" fontWeight={700}>Pratinjau Label Pengiriman</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={handlePrintPDF}
              variant="outlined"
              color="primary"
              startIcon={<Print />}
              size="small"
            >
              Cetak
            </Button>
            <Button
              onClick={handleDownloadPDF}
              variant="contained"
              color="primary"
              startIcon={<Download />}
              size="small"
              sx={{ bgcolor: '#D26B54', '&:hover': { bgcolor: '#b85a44' } }}
            >
              Unduh
            </Button>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0, height: '100%', overflow: 'hidden' }}>
          {previewPdfUrl ? (
            <iframe
              ref={iframeRef}
              src={previewPdfUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Shipping Label PDF Preview"
            />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography>Memuat label...</Typography>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClosePreview} variant="text" color="inherit">Tutup</Button>
        </DialogActions>
      </Dialog>

      {/* Hidden Print Section containing clean printable styles */}
      <div id="thermal-receipt-container">
        {printOrders.map((order) => (
          <div key={order.id} className="receipt-page">
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 'bold', fontSize: 16 }}>RAKAMIR WEBSTORE</div>
              <div style={{ fontSize: 10 }}>Kemang Raya No. 12, Jakarta</div>
              <div style={{ fontSize: 10 }}>Telp: 021-7788990</div>
              <div>================================</div>
            </div>

            <div style={{ marginBottom: 12, fontSize: 11 }}>
              <table style={{ width: '100%' }}>
                <tbody>
                  <tr><td>No. Order:</td><td style={{ textAlign: 'right', fontWeight: 'bold' }}>#{order.order_number}</td></tr>
                  <tr><td>Tanggal:</td><td style={{ textAlign: 'right' }}>{formatDate(order.created_at)}</td></tr>
                  <tr><td>Penerima:</td><td style={{ textAlign: 'right' }}>{order.customer_name ?? order.shipping_address?.recipient_name ?? order.customer?.name}</td></tr>
                  <tr><td>Telepon:</td><td style={{ textAlign: 'right' }}>{order.customer_phone_number ?? order.shipping_address?.recipient_phone ?? order.customer?.phone}</td></tr>
                </tbody>
              </table>
            </div>

            <div>--------------------------------</div>
            <div style={{ fontWeight: 'bold', fontSize: 11, margin: '4px 0' }}>Rincian Barang:</div>

            {order.items?.map((item: any) => (
              <div key={item.id} style={{ fontSize: 11, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.product?.name ?? item.product_name}</span>
                  <span>x{item.quantity}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                  <span>@{formatCurrency(item.price ?? item.unit_price ?? 0)}</span>
                  <span>{formatCurrency(item.subtotal ?? item.total_price ?? 0)}</span>
                </div>
              </div>
            ))}

            <div>--------------------------------</div>

            <div style={{ fontSize: 11, marginBottom: 12 }}>
              <table style={{ width: '100%' }}>
                <tbody>
                  <tr><td>Subtotal:</td><td style={{ textAlign: 'right' }}>{formatCurrency(order.subtotal ?? order.summary?.subtotal ?? 0)}</td></tr>
                  <tr><td>Ongkir:</td><td style={{ textAlign: 'right' }}>{formatCurrency(order.shipping_cost ?? order.summary?.shipping_cost ?? 0)}</td></tr>
                  {((order.discount ?? order.summary?.discount_amount ?? 0) > 0) && (
                    <tr><td>Diskon:</td><td style={{ textAlign: 'right', color: 'red' }}>-{formatCurrency(order.discount ?? order.summary?.discount_amount ?? 0)}</td></tr>
                  )}
                  <tr style={{ fontWeight: 'bold', fontSize: 12 }}>
                    <td>TOTAL:</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(order.grand_total ?? order.total ?? order.summary?.grand_total ?? 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>================================</div>
            <div style={{ textAlign: 'center', fontSize: 10 }}>
              <div>METODE: {(order.payment_method ?? 'TRANSFER').toUpperCase()}</div>
              <div style={{ fontWeight: 'bold', margin: '2px 0' }}>STATUS: LUNAS</div>
              <div style={{ marginTop: 8, display: 'inline-block', padding: '2px 6px', border: '1px solid black', letterSpacing: 2 }}>
                * {order.order_number} *
              </div>
              <div style={{ marginTop: 8 }}>Terima kasih atas kunjungan Anda!</div>
            </div>
          </div>
        ))}
      </div>
    </BackofficeLayout>
  );
}
