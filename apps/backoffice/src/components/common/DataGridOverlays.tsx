'use client';

import React from 'react';
import { Box, Skeleton, Typography } from '@mui/material';

export function TableSkeletonLoadingOverlay() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', p: 2, gap: 1.5, bgcolor: 'background.paper' }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 3, py: 1.5, borderBottom: '1px solid rgba(235, 196, 184, 0.1)' }}>
          <Skeleton variant="rectangular" width={40} height={40} animation="wave" sx={{ borderRadius: 1.5, flexShrink: 0 }} />
          <Skeleton variant="text" width="30%" height={24} animation="wave" />
          <Skeleton variant="text" width="15%" height={24} animation="wave" />
          <Skeleton variant="text" width="15%" height={24} animation="wave" />
          <Skeleton variant="text" width="10%" height={24} animation="wave" />
          <Skeleton variant="text" width="20%" height={24} animation="wave" sx={{ ml: 'auto' }} />
        </Box>
      ))}
    </Box>
  );
}

interface TableNoRowsOverlayProps {
  message?: string;
  description?: string;
}

export function TableNoRowsOverlay({
  message = 'Belum Ada Data',
  description = 'Data yang Anda cari tidak ditemukan atau belum ditambahkan ke sistem.'
}: TableNoRowsOverlayProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300, px: 3 }}>
      <Box sx={{
        py: 6,
        px: 8,
        textAlign: 'center',
        border: '2px dashed rgba(210, 107, 84, 0.15)',
        borderRadius: 4,
        bgcolor: '#FDFBF9',
        maxWidth: 440,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(210,107,84,0.02)'
      }}>
        <Box sx={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          bgcolor: 'rgba(210, 107, 84, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2.5,
          color: 'primary.main',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="2" ry="2"/>
            <path d="M14.5 2 12 5 9.5 2"/>
            <path d="M12 22v-9"/>
            <path d="M16 12H8"/>
          </svg>
        </Box>
        <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 1, fontFamily: '"Playfair Display", serif' }}>
          {message}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, lineHeight: 1.5 }}>
          {description}
        </Typography>
      </Box>
    </Box>
  );
}
