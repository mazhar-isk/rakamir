'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Close, Phone, Person, VpnKey, ArrowBack } from '@mui/icons-material';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Tabs,
  Tab,
  InputAdornment,
  CircularProgress,
  Stack,
  Fade
} from '@mui/material';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnUrl?: string | null;
}

export default function AuthModal({ isOpen, onClose, returnUrl }: AuthModalProps) {
  const { requestOtp, registerPhone, verifyOtp } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState(0); // 0 = Login, 1 = Register
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  
  const [step, setStep] = useState<1 | 2>(1); // 1 = Input Phone/Name, 2 = Input OTP
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Reset states when modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
      setPhoneNumber('');
      setFullName('');
      setOtp('');
      setStep(1);
      setIsLoading(false);
      setResendTimer(0);
    }
  }, [isOpen]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const validatePhone = (phone: string) => {
    // Indonesian phone format validation
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 9 && cleanPhone.length <= 14;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast.error('Nomor telepon wajib diisi.');
      return;
    }
    if (!validatePhone(phoneNumber)) {
      toast.error('Format nomor telepon tidak valid. Gunakan format seperti 08123456789.');
      return;
    }

    setIsLoading(true);
    try {
      if (tab === 0) {
        // Login flow
        await requestOtp(phoneNumber);
        toast.success('OTP berhasil dikirim ke nomor Anda!');
      } else {
        // Register flow
        if (!fullName.trim()) {
          toast.error('Nama lengkap wajib diisi.');
          setIsLoading(false);
          return;
        }
        await registerPhone(phoneNumber, fullName);
        toast.success('Pendaftaran berhasil! Silakan masukkan OTP.');
      }
      setStep(2);
      setResendTimer(60);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Terjadi kesalahan. Silakan coba lagi.';
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Masukkan 6 digit kode OTP.');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(phoneNumber, otp);
      toast.success('Autentikasi berhasil! Selamat datang.');
      onClose();
      if (returnUrl) {
        router.push(returnUrl);
      } else {
        // Reload page to refresh state or navigate
        window.location.reload();
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Kode OTP tidak valid.';
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      if (tab === 0) {
        await requestOtp(phoneNumber);
      } else {
        await registerPhone(phoneNumber, fullName);
      }
      toast.success('Kode OTP baru telah dikirim!');
      setResendTimer(60);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Gagal mengirim ulang OTP.';
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={(event, reason) => {
        // Disable close on backdrop click while loading
        if (reason === 'backdropClick' && isLoading) return;
        onClose();
      }}
      maxWidth="xs"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={400}
      PaperProps={{
        sx: {
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(46, 42, 39, 0.15)',
          bgcolor: '#FFFFFF',
          border: '1px solid rgba(235, 196, 184, 0.15)',
          p: { xs: 3, sm: 4 }
        }
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={onClose}
        disabled={isLoading}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          bgcolor: 'rgba(249, 246, 242, 0.85)',
          color: '#7B6E66',
          '&:hover': {
            bgcolor: '#F5ECE5',
            color: '#2E2A27'
          },
          transition: 'all 0.2s'
        }}
      >
        <Close sx={{ fontSize: 18 }} />
      </IconButton>

      <DialogContent sx={{ p: 0, mt: 1 }}>
        {step === 1 ? (
          <Box>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  color: '#2E2A27',
                  mb: 0.5
                }}
              >
                Rakamir
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Autentikasi cepat dengan nomor telepon Anda.
              </Typography>
            </Box>

            {/* Login / Register Toggle */}
            <Tabs
              value={tab}
              onChange={(_, val) => setTab(val)}
              variant="fullWidth"
              sx={{
                mb: 4,
                borderBottom: '1px solid rgba(235, 196, 184, 0.3)',
                '& .MuiTabs-indicator': {
                  backgroundColor: '#D26B54'
                },
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: '#7B6E66',
                  '&.Mui-selected': {
                    color: '#D26B54'
                  }
                }
              }}
            >
              <Tab label="Masuk" />
              <Tab label="Daftar" />
            </Tabs>

            {/* Input Form */}
            <form onSubmit={handleSendOtp}>
              <Stack spacing={3}>
                {tab === 1 && (
                  <TextField
                    fullWidth
                    label="Nama Lengkap"
                    variant="outlined"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ujang Davit"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: 'text.disabled', fontSize: 20 }} />
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
                )}

                <TextField
                  fullWidth
                  label="Nomor Telepon"
                  variant="outlined"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="081910654864"
                  required
                  type="tel"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: 'text.disabled', fontSize: 20 }} />
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

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isLoading}
                  sx={{
                    background: 'linear-gradient(135deg, #D26B54 0%, #EBC4B8 100%)',
                    py: 1.6,
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    boxShadow: '0 8px 24px rgba(210,107,84,0.15)',
                    '&:hover': {
                      boxShadow: '0 12px 30px rgba(210,107,84,0.25)',
                      opacity: 0.95
                    }
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} sx={{ color: '#FFFFFF' }} />
                  ) : tab === 0 ? (
                    'Kirim OTP'
                  ) : (
                    'Daftar & Kirim OTP'
                  )}
                </Button>
              </Stack>
            </form>
          </Box>
        ) : (
          <Box>
            {/* Back Button */}
            <Button
              onClick={() => setStep(1)}
              disabled={isLoading}
              startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
              sx={{
                mb: 2,
                color: '#D26B54',
                fontWeight: 600,
                fontSize: '0.8rem',
                p: 0,
                minWidth: 0,
                '&:hover': { background: 'transparent', color: '#B5533E' }
              }}
            >
              Ubah Nomor
            </Button>

            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  color: '#2E2A27',
                  mb: 1
                }}
              >
                Verifikasi OTP
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Masukkan 6 digit kode OTP yang telah dikirim ke nomor{' '}
                <Box component="span" fontWeight={700} sx={{ color: '#2E2A27' }}>
                  {phoneNumber}
                </Box>
              </Typography>
            </Box>

            {/* OTP Verify Form */}
            <form onSubmit={handleVerifyOtp}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Kode OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="923768"
                  required
                  autoFocus
                  inputProps={{
                    style: {
                      textAlign: 'center',
                      letterSpacing: '0.4em',
                      fontSize: '1.4rem',
                      fontWeight: 'bold',
                      fontFamily: 'monospace'
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKey sx={{ color: 'text.disabled', fontSize: 20 }} />
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

                {/* Resend OTP info */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Tidak menerima kode?
                  </Typography>
                  {resendTimer > 0 ? (
                    <Typography variant="caption" sx={{ color: '#7B6E66', fontWeight: 600 }}>
                      Kirim ulang dalam {resendTimer}s
                    </Typography>
                  ) : (
                    <Button
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#D26B54',
                        p: 0,
                        minWidth: 0,
                        '&:hover': { background: 'transparent', color: '#B5533E' }
                      }}
                    >
                      Kirim Ulang
                    </Button>
                  )}
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isLoading}
                  sx={{
                    background: 'linear-gradient(135deg, #D26B54 0%, #EBC4B8 100%)',
                    py: 1.6,
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    boxShadow: '0 8px 24px rgba(210,107,84,0.15)',
                    '&:hover': {
                      boxShadow: '0 12px 30px rgba(210,107,84,0.25)',
                      opacity: 0.95
                    }
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} sx={{ color: '#FFFFFF' }} />
                  ) : (
                    'Verifikasi & Masuk'
                  )}
                </Button>
              </Stack>
            </form>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
