'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ArrowForward, Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, Card, Container, Divider, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

const loginSchema = Yup.object({
  email: Yup.string().email('Email tidak valid').required('Email wajib diisi'),
  password: Yup.string().required('Password wajib diisi'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await login(values);
        toast.success('Selamat datang kembali!');
        router.push('/');
      } catch {
        toast.error('Email atau password salah.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F0C29 0%, #302B63 60%, #24243E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight={800} sx={{ background: 'linear-gradient(135deg, #6C63FF, #FF6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Rakamir Webstore
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 1 }}>Masuk ke akun Anda</Typography>
        </Box>

        <Card sx={{ p: 4, borderRadius: 3, boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
          <Typography variant="h5" fontWeight={700} mb={1}>Selamat Datang!</Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>Masukkan email dan password Anda</Typography>

          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth label="Email" name="email" type="email"
                value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment> }}
              />
              <TextField
                fullWidth label="Password" name="password"
                type={showPassword ? 'text' : 'password'}
                value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" component={Link} href="#" sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 600 }}>
                  Lupa Password?
                </Typography>
              </Box>
              <Button
                type="submit" variant="contained" fullWidth size="large"
                disabled={formik.isSubmitting} endIcon={<ArrowForward />}
                sx={{ background: 'linear-gradient(135deg, #6C63FF, #FF6584)', py: 1.5, fontSize: '1rem' }}
              >
                {formik.isSubmitting ? 'Masuk...' : 'Masuk'}
              </Button>
            </Box>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">atau</Typography>
          </Divider>
          <Typography variant="body2" textAlign="center" color="text.secondary">
            Belum punya akun?{' '}
            <Link href="/auth/register" style={{ color: '#6C63FF', fontWeight: 600, textDecoration: 'none' }}>
              Daftar Sekarang
            </Link>
          </Typography>
        </Card>
      </Container>
    </Box>
  );
}
