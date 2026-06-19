'use client';

import React, { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useGet } from '@ecommerce/api-client';
import { formatCurrency } from '@ecommerce/utils';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import {
  Container,
  Box,
  Typography,
  Card,
  Button,
  Divider,
  CircularProgress,
  Skeleton,
  Stack
} from '@mui/material';
import { CheckCircleOutline, ErrorOutline, CancelOutlined, AccessTimeOutlined, HelpOutline } from '@mui/icons-material';
import { motion } from 'framer-motion';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const order_id = searchParams.get('order_id');
  const status_code = searchParams.get('status_code');
  const transaction_status = searchParams.get('transaction_status') || '';

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(order_id || '');

  // 1. Fetch search list if not UUID
  const { data: searchResults } = useGet<any>(
    order_id && !isUuid ? `/transactions?page=1&limit=5&search=${order_id}` : null
  );

  // Determine target UUID
  const transactionUuid = useMemo(() => {
    if (!order_id) return null;
    if (isUuid) return order_id;

    const found = (searchResults?.data || []).find(
      (tx: any) => tx.order_number === order_id || tx.id === order_id
    ) || searchResults?.data?.[0];

    return found?.id || null;
  }, [order_id, isUuid, searchResults]);

  // 2. Fetch full details
  const { data: transaction, isLoading } = useGet<any>(
    transactionUuid ? `/transactions/${transactionUuid}` : null
  );

  // Status mapping configuration
  const statusConfig = useMemo(() => {
    const status = transaction_status.toLowerCase();
    
    const isSuccess = ['settlement', 'capture', 'success'].includes(status);
    const isPending = ['pending'].includes(status);
    const isDenied = ['deny'].includes(status);
    const isCancelled = ['cancel'].includes(status);
    const isExpired = ['expired'].includes(status);
    const isFailure = ['failure'].includes(status);

    if (isSuccess) {
      return {
        type: 'success',
        title: 'Pembayaran Berhasil',
        message: 'Terima kasih! Pembayaran Anda telah kami terima dan pesanan Anda sedang diproses.',
        color: '#10B981', // Emerald
        bgColor: '#ECFDF5',
        icon: <CheckCircleOutline sx={{ fontSize: 64, color: '#10B981' }} />
      };
    }

    if (isPending) {
      return {
        type: 'pending',
        title: 'Menunggu Pembayaran',
        message: 'Pembayaran Anda sedang kami tunggu. Silakan selesaikan pembayaran Anda.',
        color: '#F59E0B', // Amber
        bgColor: '#FEF3C7',
        icon: <AccessTimeOutlined sx={{ fontSize: 64, color: '#F59E0B' }} />
      };
    }

    if (isCancelled) {
      return {
        type: 'cancelled',
        title: 'Pembayaran Dibatalkan',
        message: 'Transaksi telah dibatalkan. Anda dapat mengulangi proses pembayaran dari menu pesanan.',
        color: '#EF4444', // Red
        bgColor: '#FEF2F2',
        icon: <CancelOutlined sx={{ fontSize: 64, color: '#EF4444' }} />
      };
    }

    if (isDenied) {
      return {
        type: 'denied',
        title: 'Pembayaran Ditolak',
        message: 'Transaksi ditolak oleh sistem keamanan. Silakan coba kartu atau metode pembayaran lain.',
        color: '#EF4444',
        bgColor: '#FEF2F2',
        icon: <ErrorOutline sx={{ fontSize: 64, color: '#EF4444' }} />
      };
    }

    if (isExpired) {
      return {
        type: 'expired',
        title: 'Pembayaran Kedaluwarsa',
        message: 'Batas waktu pembayaran telah habis. Silakan lakukan pemesanan ulang produk Anda.',
        color: '#6B7280', // Gray
        bgColor: '#F3F4F6',
        icon: <AccessTimeOutlined sx={{ fontSize: 64, color: '#6B7280' }} />
      };
    }

    if (isFailure) {
      return {
        type: 'failed',
        title: 'Pembayaran Gagal',
        message: 'Proses pembayaran Anda gagal diproses. Silakan coba beberapa saat lagi.',
        color: '#EF4444',
        bgColor: '#FEF2F2',
        icon: <ErrorOutline sx={{ fontSize: 64, color: '#EF4444' }} />
      };
    }

    // Default fallback (e.g. status code check or unknown status)
    const isCodeSuccess = status_code === '200' || status_code === '201';
    return {
      type: isCodeSuccess ? 'success' : 'failed',
      title: isCodeSuccess ? 'Status Pembayaran' : 'Terjadi Kesalahan',
      message: isCodeSuccess 
        ? 'Status transaksi Anda sedang diverifikasi.' 
        : 'Status pembayaran tidak dikenal atau terjadi kegagalan pemrosesan.',
      color: isCodeSuccess ? '#3B82F6' : '#EF4444',
      bgColor: isCodeSuccess ? '#EFF6FF' : '#FEF2F2',
      icon: isCodeSuccess 
        ? <HelpOutline sx={{ fontSize: 64, color: '#3B82F6' }} />
        : <ErrorOutline sx={{ fontSize: 64, color: '#EF4444' }} />
    };
  }, [transaction_status, status_code]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ p: 4, textAlign: 'center', boxShadow: '0 8px 30px rgb(0 0 0 / 0.06)', borderRadius: 3, border: '1px solid rgba(0,0,0,0.03)' }}>
          {/* Status Logo Circle with Pop-in Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 100,
              height: 100,
              borderRadius: '50%',
              backgroundColor: statusConfig.bgColor,
              marginBottom: 24
            }}
          >
            {statusConfig.icon}
          </motion.div>

          <Typography variant="h5" fontWeight={800} gutterBottom sx={{ color: 'text.primary' }}>
            {statusConfig.title}
          </Typography>
          
          <Typography color="text.secondary" variant="body2" sx={{ px: 2, mb: 4, lineHeight: 1.6 }}>
            {statusConfig.message}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Details Section */}
          <Box sx={{ textAlign: 'left', mb: 4 }}>
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={2}>
              Detail Transaksi
            </Typography>
            
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Nomor Pesanan</Typography>
                <Typography variant="body2" fontWeight={700}>{order_id || '-'}</Typography>
              </Box>
              
              {transaction && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Total Pembayaran</Typography>
                    <Typography variant="body2" fontWeight={700} color="primary.main">
                      {formatCurrency(transaction.summary?.grand_total || transaction.total || 0)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Status Verifikasi</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: statusConfig.color }}>
                      {transaction.is_paid ? 'Paid' : 'Pending Verification'}
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>

            {/* Items display */}
            {isLoading ? (
              <Box sx={{ mt: 3 }}>
                <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="rounded" height={60} />
              </Box>
            ) : transaction?.items?.length > 0 ? (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1.5}>
                  Produk yang Dibeli
                </Typography>
                
                <Stack spacing={1.5} sx={{ maxHeight: 200, overflowY: 'auto', pr: 0.5 }}>
                  {transaction.items.map((item: any) => (
                    <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, borderRadius: 2, bgcolor: '#FAF8F6', border: '1px solid rgba(0,0,0,0.02)' }}>
                      <Box sx={{ position: 'relative', width: 40, height: 40, borderRadius: 1.5, overflow: 'hidden', bgcolor: '#FDFBF9', flexShrink: 0 }}>
                        {/* Fallback image */}
                        <img 
                          src={item.image_url || 'https://picsum.photos/seed/food/200'} 
                          alt={item.product_name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>{item.product_name}</Typography>
                        <Typography variant="caption" color="text.secondary">× {item.quantity}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={700}>
                        {formatCurrency(item.total_price || 0)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            ) : null}
          </Box>

          {/* Action CTAs */}
          <Stack spacing={1.5}>
            {transactionUuid ? (
              <Button
                component={Link}
                href={`/account/orders/${transactionUuid}`}
                variant="contained"
                size="large"
                fullWidth
              >
                Lihat Detail Pesanan
              </Button>
            ) : (
              <Button
                component={Link}
                href="/account/orders"
                variant="contained"
                size="large"
                fullWidth
              >
                Lihat Semua Pesanan
              </Button>
            )}
            
            <Button
              component={Link}
              href="/"
              variant="outlined"
              size="large"
              fullWidth
            >
              Kembali ke Beranda
            </Button>
          </Stack>
        </Card>
      </motion.div>
    </Container>
  );
}

export default function PaymentStatusPage() {
  return (
    <StorefrontLayout>
      <Suspense fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      }>
        <PaymentStatusContent />
      </Suspense>
    </StorefrontLayout>
  );
}
