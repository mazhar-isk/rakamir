'use client';

import BackofficeLayout from '@/components/layout/BackofficeLayout';
import { Box, Card, Typography, Avatar, Divider, Button } from '@mui/material';
import { CheckCircle, LocalShipping, PersonAdd, Inventory } from '@mui/icons-material';
import Link from 'next/link';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Pesanan Baru Masuk',
    description: 'Pesanan #ORD-123 menunggu pembayaran dari Budi Santoso',
    time: '2 menit yang lalu',
    icon: <CheckCircle sx={{ color: '#22C55E' }} />,
    color: '#22C55E',
    read: false,
    link: '/orders',
  },
  {
    id: 2,
    title: 'Stok Menipis',
    description: 'Produk "Kemeja Oxford" sisa 3 unit',
    time: '1 jam yang lalu',
    icon: <Inventory sx={{ color: '#F59E0B' }} />,
    color: '#F59E0B',
    read: false,
    link: '/products',
  },
  {
    id: 3,
    title: 'Pendaftaran Pelanggan Baru',
    description: 'Budi Santoso telah mendaftar sebagai pelanggan baru',
    time: 'Kemarin, 14:30',
    icon: <PersonAdd sx={{ color: '#3B82F6' }} />,
    color: '#3B82F6',
    read: true,
    link: '/customers',
  },
  {
    id: 4,
    title: 'Pengiriman Selesai',
    description: 'Pesanan #ORD-099 telah berhasil dikirim ke tujuan',
    time: '2 hari yang lalu',
    icon: <LocalShipping sx={{ color: '#D26B54' }} />,
    color: '#D26B54',
    read: true,
    link: '/shipments',
  },
];

export default function NotificationsPage() {
  return (
    <BackofficeLayout>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Semua Notifikasi</Typography>
          <Typography variant="body2" color="text.secondary">Pusat pemberitahuan dan aktivitas toko</Typography>
        </Box>
        <Button variant="outlined" size="small">
          Tandai Semua Dibaca
        </Button>
      </Box>

      <Card sx={{ borderRadius: 3 }}>
        {MOCK_NOTIFICATIONS.map((notif, index) => (
          <Box key={notif.id}>
            <Box
              component={Link}
              href={notif.link}
              sx={{
                p: 3,
                display: 'flex',
                gap: 2,
                bgcolor: notif.read ? 'transparent' : 'rgba(210, 107, 84, 0.03)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'background-color 0.2s',
                '&:hover': { bgcolor: 'rgba(210, 107, 84, 0.08)' },
              }}
            >
              <Avatar sx={{ bgcolor: `${notif.color}15`, width: 48, height: 48 }}>
                {notif.icon}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="subtitle1" fontWeight={notif.read ? 600 : 700} color={notif.read ? 'text.secondary' : 'text.primary'}>
                    {notif.title}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" fontWeight={500}>
                    {notif.time}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {notif.description}
                </Typography>
              </Box>
              {!notif.read && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />
                </Box>
              )}
            </Box>
            {index < MOCK_NOTIFICATIONS.length - 1 && <Divider />}
          </Box>
        ))}
      </Card>
    </BackofficeLayout>
  );
}
