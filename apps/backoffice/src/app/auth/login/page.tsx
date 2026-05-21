'use client';

import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { ArrowForward, Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, Card, Container, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

const schema = Yup.object({
  email: Yup.string().email('Email tidak valid').required('Email wajib diisi'),
  password: Yup.string().required('Password wajib diisi'),
});

export default function AdminLoginPage() {
  const { login, isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);

  // Redirect already-authenticated users away from login
  // useEffect(() => {
  //   if (!isLoading && isAuthenticated) {
  //     router.replace('/dashboard');
  //   }
  // }, [isAuthenticated, isLoading, router]);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await login(values);
        // Use replace so the login page is not kept in browser history
        router.replace('/dashboard');
      } catch (error: any) {
        console.error('API Error Response:', error.response?.data || error.message || error);
        const message = error.response?.data?.message || error.message || 'Kredensial tidak valid.';
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#F1F5F9' }}>
      {/* Left panel */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flex: 1,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #F9F6F2 0%, #f5ebe5 60%, #EBC4B8 100%)',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        p: 6,
      }}>
        {/* Plain img — bypasses Next.js image optimizer entirely */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/images/bg-webstore.png"
          alt="Rakamir Webstore"
          style={{ width: '72%', maxWidth: 360, height: 'auto' }}
        />
      </Box>

      {/* Right panel */}
      <Box sx={{ width: { xs: '100%', md: 480 }, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Container maxWidth="xs">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h5" fontWeight={800} color="primary.main" mb={1}>Masuk ke Admin Panel</Typography>
            <Typography variant="body2" color="text.secondary">Gunakan kredensial admin Anda</Typography>
          </Box>
          <Card sx={{ p: 4, borderRadius: 3, boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>
            <form onSubmit={formik.handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField fullWidth label="Email" name="email" type="email"
                  value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment> }}
                />
                <TextField fullWidth label="Password" name="password" type={showPass ? 'text' : 'password'}
                  value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment>,
                    endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowPass(!showPass)}>{showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment>,
                  }}
                />
                <Button type="submit" variant="contained" fullWidth size="large" disabled={formik.isSubmitting} endIcon={<ArrowForward />}
                  sx={{ background: 'linear-gradient(135deg, #6C63FF, #FF6584)', py: 1.5 }}>
                  {formik.isSubmitting ? 'Masuk...' : 'Masuk'}
                </Button>
              </Box>
            </form>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}
