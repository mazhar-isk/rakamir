'use client';

import { useAuth } from '@/contexts/AuthContext';
import { apiPost } from '@ecommerce/api-client';
import { ArrowForward, Email, Lock, Person, Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, Card, Container, Divider, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

const registerSchema = Yup.object({
  name: Yup.string().required('Nama wajib diisi').min(3, 'Minimal 3 karakter'),
  email: Yup.string().email('Email tidak valid').required('Email wajib diisi'),
  password: Yup.string().required('Password wajib diisi').min(8, 'Minimal 8 karakter'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password')], 'Password tidak cocok')
    .required('Konfirmasi password wajib diisi'),
});

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '', password_confirmation: '' },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await apiPost('/auth/register', values);
        await login({ email: values.email, password: values.password });
        toast.success('Akun berhasil dibuat!');
        router.push('/');
      } catch {
        toast.error('Registrasi gagal. Email mungkin sudah digunakan.');
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
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 1 }}>Buat akun baru Anda</Typography>
        </Box>

        <Card sx={{ p: 4, borderRadius: 3, boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
          <Typography variant="h5" fontWeight={700} mb={1}>Daftar Sekarang</Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>Bergabunglah dengan jutaan pembeli di Rakamir Webstore</Typography>

          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[
                { name: 'name', label: 'Nama Lengkap', type: 'text', icon: <Person sx={{ color: 'text.disabled', fontSize: 20 }} /> },
                { name: 'email', label: 'Email', type: 'email', icon: <Email sx={{ color: 'text.disabled', fontSize: 20 }} /> },
              ].map(({ name, label, type, icon }) => (
                <TextField
                  key={name} fullWidth label={label} name={name} type={type}
                  value={(formik.values as any)[name]} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={(formik.touched as any)[name] && Boolean((formik.errors as any)[name])}
                  helperText={(formik.touched as any)[name] && (formik.errors as any)[name]}
                  InputProps={{ startAdornment: <InputAdornment position="start">{icon}</InputAdornment> }}
                />
              ))}
              {['password', 'password_confirmation'].map((field) => (
                <TextField
                  key={field} fullWidth
                  label={field === 'password' ? 'Password' : 'Konfirmasi Password'}
                  name={field} type={showPassword ? 'text' : 'password'}
                  value={(formik.values as any)[field]} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={(formik.touched as any)[field] && Boolean((formik.errors as any)[field])}
                  helperText={(formik.touched as any)[field] && (formik.errors as any)[field]}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment>,
                    endAdornment: field === 'password' ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ) : undefined,
                  }}
                />
              ))}
              <Button
                type="submit" variant="contained" fullWidth size="large"
                disabled={formik.isSubmitting} endIcon={<ArrowForward />}
                sx={{ background: 'linear-gradient(135deg, #6C63FF, #FF6584)', py: 1.5, fontSize: '1rem' }}
              >
                {formik.isSubmitting ? 'Mendaftar...' : 'Daftar'}
              </Button>
            </Box>
          </form>
          <Divider sx={{ my: 3 }}><Typography variant="caption" color="text.secondary">atau</Typography></Divider>
          <Typography variant="body2" textAlign="center" color="text.secondary">
            Sudah punya akun?{' '}
            <Link href="/auth/login" style={{ color: '#6C63FF', fontWeight: 600, textDecoration: 'none' }}>Masuk</Link>
          </Typography>
        </Card>
      </Container>
    </Box>
  );
}
