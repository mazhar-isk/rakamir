'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ArrowForward, Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, Card, Container, Divider, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

const loginSchema = Yup.object({
  email: Yup.string().email('Email tidak valid').required('Email wajib diisi'),
  password: Yup.string().required('Password wajib diisi'),
});

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await login(values);
        toast.success('Selamat datang kembali!');
        router.push(returnUrl);
      } catch {
        toast.error('Email atau password salah.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Card 
      sx={{ 
        p: { xs: 4, sm: 5 }, 
        borderRadius: '24px', 
        border: '1px solid rgba(235, 196, 184, 0.2)',
        boxShadow: '0 20px 50px rgba(110, 98, 92, 0.05)',
        bgcolor: '#FFFFFF'
      }}
    >
      <Typography variant="h5" fontWeight={700} sx={{ color: '#2E2A27', fontFamily: '"Outfit", sans-serif', mb: 1 }}>
        Selamat Datang!
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Masukkan email dan password Anda untuk masuk.
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth 
            label="Email" 
            name="email" 
            type="email"
            value={formik.values.email} 
            onChange={formik.handleChange} 
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            InputProps={{ 
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: 'text.disabled', fontSize: 20 }} />
                </InputAdornment>
              ) 
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '& fieldset': { borderColor: 'rgba(210, 107, 84, 0.15)' },
                '&:hover fieldset': { borderColor: '#D26B54' },
                '&.Mui-focused fieldset': { borderColor: '#D26B54', borderWidth: '2px' }
              }
            }}
          />
          
          <TextField
            fullWidth 
            label="Password" 
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formik.values.password} 
            onChange={formik.handleChange} 
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: 'text.disabled', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '& fieldset': { borderColor: 'rgba(210, 107, 84, 0.15)' },
                '&:hover fieldset': { borderColor: '#D26B54' },
                '&.Mui-focused fieldset': { borderColor: '#D26B54', borderWidth: '2px' }
              }
            }}
          />

          <Box sx={{ textAlign: 'right' }}>
            <Typography 
              variant="caption" 
              component={Link} 
              href="#" 
              sx={{ color: '#D26B54', textDecoration: 'none', fontWeight: 600, '&:hover': { color: '#B5533E' } }}
            >
              Lupa Password?
            </Typography>
          </Box>

          <Button
            type="submit" 
            variant="contained" 
            fullWidth 
            size="large"
            disabled={formik.isSubmitting} 
            endIcon={<ArrowForward />}
            sx={{
              background: 'linear-gradient(135deg, #D26B54 0%, #EBC4B8 100%)',
              py: 1.8,
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: 700,
              boxShadow: '0 8px 24px rgba(210,107,84,0.2)',
              '&:hover': {
                boxShadow: '0 12px 30px rgba(210,107,84,0.3)',
                opacity: 0.95
              }
            }}
          >
            {formik.isSubmitting ? 'Masuk...' : 'Masuk'}
          </Button>
        </Box>
      </form>

      <Divider sx={{ my: 4 }}>
        <Typography variant="caption" color="text.secondary">atau</Typography>
      </Divider>

      <Typography variant="body2" textAlign="center" color="text.secondary">
        Belum punya akun?{' '}
        <Link href="/auth/register" style={{ color: '#D26B54', fontWeight: 600, textDecoration: 'none' }}>
          Daftar Sekarang
        </Link>
      </Typography>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #F9F6F2 0%, #F5ECE5 60%, #EBC4B8 100%)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        py: 8, 
        px: 2 
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography 
            variant="h4" 
            fontWeight={800} 
            sx={{ 
              background: 'linear-gradient(135deg, #D26B54, #EBC4B8)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              fontFamily: '"Outfit", sans-serif',
              letterSpacing: '-0.02em',
              mb: 1
            }}
          >
            Rakamir
          </Typography>
          <Typography variant="body2" sx={{ color: '#7B6E66' }}>
            Masuk ke akun Rakamir Anda
          </Typography>
        </Box>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </Container>
    </Box>
  );
}
