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
            Buat akun baru Rakamir Anda
          </Typography>
        </Box>

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
            Daftar Sekarang
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>
            Bergabunglah dengan pelanggan Rakamir lainnya.
          </Typography>

          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[
                { name: 'name', label: 'Nama Lengkap', type: 'text', icon: <Person sx={{ color: 'text.disabled', fontSize: 20 }} /> },
                { name: 'email', label: 'Email', type: 'email', icon: <Email sx={{ color: 'text.disabled', fontSize: 20 }} /> },
              ].map(({ name, label, type, icon }) => (
                <TextField
                  key={name} 
                  fullWidth 
                  label={label} 
                  name={name} 
                  type={type}
                  value={(formik.values as any)[name]} 
                  onChange={formik.handleChange} 
                  onBlur={formik.handleBlur}
                  error={(formik.touched as any)[name] && Boolean((formik.errors as any)[name])}
                  helperText={(formik.touched as any)[name] && (formik.errors as any)[name]}
                  InputProps={{ startAdornment: <InputAdornment position="start">{icon}</InputAdornment> }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': { borderColor: 'rgba(210, 107, 84, 0.15)' },
                      '&:hover fieldset': { borderColor: '#D26B54' },
                      '&.Mui-focused fieldset': { borderColor: '#D26B54', borderWidth: '2px' }
                    }
                  }}
                />
              ))}
              
              {['password', 'password_confirmation'].map((field) => (
                <TextField
                  key={field} 
                  fullWidth
                  label={field === 'password' ? 'Password' : 'Konfirmasi Password'}
                  name={field} 
                  type={showPassword ? 'text' : 'password'}
                  value={(formik.values as any)[field]} 
                  onChange={formik.handleChange} 
                  onBlur={formik.handleBlur}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': { borderColor: 'rgba(210, 107, 84, 0.15)' },
                      '&:hover fieldset': { borderColor: '#D26B54' },
                      '&.Mui-focused fieldset': { borderColor: '#D26B54', borderWidth: '2px' }
                    }
                  }}
                />
              ))}

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
                {formik.isSubmitting ? 'Mendaftar...' : 'Daftar'}
              </Button>
            </Box>
          </form>

          <Divider sx={{ my: 4 }}>
            <Typography variant="caption" color="text.secondary">atau</Typography>
          </Divider>
          
          <Typography variant="body2" textAlign="center" color="text.secondary">
            Sudah punya akun?{' '}
            <Link href="/auth/login" style={{ color: '#D26B54', fontWeight: 600, textDecoration: 'none' }}>
              Masuk
            </Link>
          </Typography>
        </Card>
      </Container>
    </Box>
  );
}
