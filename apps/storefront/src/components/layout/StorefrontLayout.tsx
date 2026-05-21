import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { Box } from '@mui/material';
import { ReactNode } from 'react';

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1, backgroundColor: 'rgba(249, 246, 242,1)' }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
