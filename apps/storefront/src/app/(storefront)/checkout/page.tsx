'use client';

import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { useCart } from '@/contexts/CartContext';
import { apiPost } from '@ecommerce/api-client';
import { formatCurrency } from '@ecommerce/utils';
import { AccountBalance, ArrowBack, ArrowForward, CheckCircle, CreditCard } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem, Radio, RadioGroup,
  Select,
  Step, StepLabel,
  Stepper,
  TextField,
  Typography
} from '@mui/material';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

const steps = ['Alamat', 'Pembayaran', 'Review'];

const addressSchema = Yup.object({
  recipient_name: Yup.string().required('Nama penerima wajib diisi'),
  phone: Yup.string().required('Nomor telepon wajib diisi'),
  address: Yup.string().required('Alamat wajib diisi'),
  city: Yup.string().required('Kota wajib diisi'),
  province: Yup.string().required('Provinsi wajib diisi'),
  postal_code: Yup.string().required('Kode pos wajib diisi'),
});

const paymentSchema = Yup.object({
  payment_method: Yup.string().required('Pilih metode pembayaran'),
  card_number: Yup.string().when('payment_method', {
    is: 'credit_card',
    then: (s) => s.required('Nomor kartu wajib diisi').min(19),
  }),
});

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addressForm = useFormik({
    initialValues: { recipient_name: '', phone: '', address: '', city: '', province: '', postal_code: '', shipping_method: 'regular' },
    validationSchema: addressSchema,
    onSubmit: () => setActiveStep(1),
  });

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const order = await apiPost('/orders', {
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity, variant_id: i.variant?.id })),
        shipping_address: addressForm.values,
        payment_method: paymentMethod,
      });
      clearCart();
      toast.success('Pesanan berhasil dibuat!');
      router.push(`/account/orders/${(order as any).id}`);
    } catch {
      toast.error('Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StorefrontLayout>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight={700} mb={5}>Checkout</Typography>
        <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
          {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>

        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Left panel */}
          <Box sx={{ flex: 1 }}>
            {/* Step 1: Address */}
            {activeStep === 0 && (
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={3}>Alamat Pengiriman</Typography>
                <Grid container spacing={2.5}>
                  {[
                    { name: 'recipient_name', label: 'Nama Penerima', xs: 12 },
                    { name: 'phone', label: 'No. Telepon', xs: 12 },
                    { name: 'address', label: 'Alamat Lengkap', xs: 12 },
                    { name: 'city', label: 'Kota', xs: 6 },
                    { name: 'province', label: 'Provinsi', xs: 6 },
                    { name: 'postal_code', label: 'Kode Pos', xs: 6 },
                  ].map(({ name, label, xs }) => (
                    <Grid item xs={xs} key={name}>
                      <TextField
                        fullWidth
                        label={label}
                        name={name}
                        value={(addressForm.values as any)[name]}
                        onChange={addressForm.handleChange}
                        onBlur={addressForm.handleBlur}
                        error={(addressForm.touched as any)[name] && Boolean((addressForm.errors as any)[name])}
                        helperText={(addressForm.touched as any)[name] && (addressForm.errors as any)[name]}
                      />
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Metode Pengiriman</InputLabel>
                      <Select name="shipping_method" value={addressForm.values.shipping_method} label="Metode Pengiriman" onChange={addressForm.handleChange}>
                        <MenuItem value="regular">Reguler (3-5 hari) — Gratis</MenuItem>
                        <MenuItem value="express">Express (1-2 hari) — Rp 25.000</MenuItem>
                        <MenuItem value="same_day">Same Day — Rp 45.000</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Button variant="contained" fullWidth size="large" endIcon={<ArrowForward />} onClick={() => addressForm.submitForm()} sx={{ mt: 4, background: 'linear-gradient(135deg, #6C63FF, #FF6584)' }}>
                  Lanjut ke Pembayaran
                </Button>
              </Card>
            )}

            {/* Step 2: Payment */}
            {activeStep === 1 && (
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={3}>Metode Pembayaran</Typography>
                <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  {[
                    { value: 'transfer', label: 'Transfer Bank', icon: <AccountBalance /> },
                    { value: 'credit_card', label: 'Kartu Kredit / Debit', icon: <CreditCard /> },
                    { value: 'ewallet', label: 'E-Wallet (GoPay, OVO, DANA)', icon: <span>💳</span> },
                    { value: 'cod', label: 'Bayar di Tempat (COD)', icon: <span>💵</span> },
                  ].map(({ value, label, icon }) => (
                    <Card key={value} variant="outlined" sx={{ mb: 2, p: 1, border: paymentMethod === value ? '2px solid #6C63FF' : '1px solid #E5E7EB', cursor: 'pointer' }} onClick={() => setPaymentMethod(value)}>
                      <FormControlLabel value={value} control={<Radio color="primary" />}
                        label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{icon}<Typography fontWeight={500}>{label}</Typography></Box>} />
                    </Card>
                  ))}
                </RadioGroup>

                {paymentMethod === 'credit_card' && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#F8F9FC', borderRadius: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}><TextField fullWidth label="Nomor Kartu" placeholder="1234 5678 9012 3456" onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim(); e.target.value = v; }} /></Grid>
                      <Grid item xs={6}><TextField fullWidth label="Berlaku Hingga" placeholder="MM/YY" /></Grid>
                      <Grid item xs={6}><TextField fullWidth label="CVV" placeholder="123" type="password" /></Grid>
                    </Grid>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  <Button variant="outlined" size="large" startIcon={<ArrowBack />} onClick={() => setActiveStep(0)} sx={{ flex: 1 }}>Kembali</Button>
                  <Button variant="contained" size="large" endIcon={<ArrowForward />} onClick={() => setActiveStep(2)} sx={{ flex: 2, background: 'linear-gradient(135deg, #6C63FF, #FF6584)' }}>
                    Review Pesanan
                  </Button>
                </Box>
              </Card>
            )}

            {/* Step 3: Review */}
            {activeStep === 2 && (
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={3}>Review Pesanan</Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1} color="primary">Alamat Pengiriman</Typography>
                  <Typography>{addressForm.values.recipient_name} · {addressForm.values.phone}</Typography>
                  <Typography color="text.secondary">{addressForm.values.address}, {addressForm.values.city}, {addressForm.values.province} {addressForm.values.postal_code}</Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                {items.map((item) => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography>{item.product.name} × {item.quantity}</Typography>
                    <Typography fontWeight={600}>{formatCurrency(item.subtotal)}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight={700}>Total</Typography>
                  <Typography variant="h6" fontWeight={800} color="primary.main">{formatCurrency(total)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" size="large" startIcon={<ArrowBack />} onClick={() => setActiveStep(1)} sx={{ flex: 1 }}>Kembali</Button>
                  <Button variant="contained" size="large" startIcon={!isSubmitting && <CheckCircle />} onClick={handlePlaceOrder} disabled={isSubmitting} sx={{ flex: 2, background: 'linear-gradient(135deg, #6C63FF, #FF6584)' }}>
                    {isSubmitting ? 'Memproses...' : 'Konfirmasi Pesanan'}
                  </Button>
                </Box>
              </Card>
            )}
          </Box>

          {/* Order summary sidebar */}
          <Box sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0 }}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>Pesanan Anda</Typography>
              {items.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.product.name} ×{item.quantity}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>{formatCurrency(item.subtotal)}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography fontWeight={700}>Total</Typography>
                <Typography fontWeight={800} color="primary.main">{formatCurrency(total)}</Typography>
              </Box>
            </Card>
          </Box>
        </Box>
      </Container>
    </StorefrontLayout>
  );
}
