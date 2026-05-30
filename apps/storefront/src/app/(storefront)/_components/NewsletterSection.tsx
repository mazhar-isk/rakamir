'use client';

import { Box, Button, Container, Stack, TextField, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Terima kasih telah berlangganan jurnal kami!');
    setEmail('');
  };

  return (
    <Box 
      sx={{ 
        py: 12, 
        bgcolor: '#F9F6F2', 
        borderTop: '1px solid rgba(235, 196, 184, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Blob */}
      <Box
        sx={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(235, 196, 184, 0.25)',
          filter: 'blur(80px)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#D26B54', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: '0.15em', 
                fontSize: '0.75rem',
                mb: 2,
                display: 'block'
              }}
            >
              JURNAL BERKALA
            </Typography>

            <Typography 
              variant="h3" 
              fontWeight={700} 
              sx={{ 
                color: '#2E2A27', 
                fontFamily: '"Outfit", "Inter", sans-serif',
                letterSpacing: '-0.02em',
                mb: 2.5 
              }}
            >
              Berlangganan Jurnal
            </Typography>

            <Typography 
              variant="body1" 
              sx={{ 
                color: '#6E625C', 
                lineHeight: 1.8, 
                mb: 5,
                fontSize: '0.95rem' 
              }}
            >
              Dapatkan kurasi mingguan tentang seni penataan ruang, ritual perawatan tubuh organik, serta akses prioritas untuk koleksi terbaru kami.
            </Typography>

            <Box 
              component="form" 
              onSubmit={handleSubscribe} 
              sx={{ 
                width: '100%',
                maxWidth: 480,
                mx: 'auto'
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="stretch">
                <TextField
                  type="email"
                  placeholder="Alamat email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      bgcolor: '#FFFFFF',
                      '& fieldset': {
                        borderColor: 'rgba(210, 107, 84, 0.15)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#D26B54',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#D26B54',
                        borderWidth: '2px'
                      }
                    }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    bgcolor: '#D26B54',
                    color: '#FFFFFF',
                    px: 4,
                    py: { xs: 1.8, sm: 0 },
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 12px rgba(210,107,84,0.15)',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      bgcolor: '#B5533E',
                      boxShadow: '0 6px 16px rgba(210,107,84,0.25)',
                    }
                  }}
                >
                  Berlangganan
                </Button>
              </Stack>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
