'use client';

import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { useCart } from '@/contexts/CartContext';
import { Address, apiClient, apiPost, useGet } from '@ecommerce/api-client';
import { formatCurrency } from '@ecommerce/utils';
import { ArrowForward, ArrowBack, CheckCircle } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography
} from '@mui/material';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

interface LocationItem {
  id: string;
  name: string;
  zip_code?: string;
}

const steps = ['Alamat', 'Review'];

const addressSchema = Yup.object({
  recipient_name: Yup.string().required('Nama penerima wajib diisi'),
  recipient_phone: Yup.string().required('Nomor telepon wajib diisi'),
  address: Yup.string().required('Alamat wajib diisi'),
  city_id: Yup.string().required('Kota wajib diisi'),
  province_id: Yup.string().required('Provinsi wajib diisi'),
  district_id: Yup.string().required('Kecamatan wajib diisi'),
  subdistrict_id: Yup.string().required('Kelurahan/Desa wajib diisi'),
  postal_code: Yup.string().required('Kode pos wajib diisi'),
  notes: Yup.string().optional(),
});

const paymentSchema = Yup.object({
  payment_method: Yup.string().required('Pilih metode pembayaran'),
  card_number: Yup.string().when('payment_method', {
    is: 'credit_card',
    then: (s) => s.required('Nomor kartu wajib diisi').min(19),
  }),
});

export default function CheckoutPage() {
  const { items, total, clearCart, cartId } = useCart();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: addresses } = useGet<Address[]>('/user/addresses');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [cities, setCities] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [subdistricts, setSubdistricts] = useState<LocationItem[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [selectedSubdistrictId, setSelectedSubdistrictId] = useState<string>('');

  const addressForm = useFormik({
    initialValues: {
      recipient_name: '',
      recipient_phone: '',
      address: '',
      city_id: '',
      city: '',
      province_id: '',
      province: '',
      district_id: '',
      district: '',
      subdistrict_id: '',
      subdistrict: '',
      postal_code: '',
      shipping_method: 'regular',
      notes: '',
      save_address: false
    },
    validationSchema: addressSchema,
    onSubmit: () => setActiveStep(1),
  });

  // Load provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const { data: res } = await apiClient.get<LocationItem[]>('/location/provinces');
        setProvinces(res || []);
      } catch (e) {
        console.error('Failed to load provinces', e);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.is_main || (a as any).is_default) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
      addressForm.setValues({
        recipient_name: defaultAddr.recipient_name,
        recipient_phone: defaultAddr.recipient_phone || (defaultAddr as any).phone || '',
        address: defaultAddr.address,
        city_id: defaultAddr.city_id || (defaultAddr as any).city_id || '',
        city: defaultAddr.city || '',
        province_id: defaultAddr.province_id || (defaultAddr as any).province_id || '',
        province: defaultAddr.province || '',
        district_id: defaultAddr.district_id || (defaultAddr as any).district_id || '',
        district: defaultAddr.district || '',
        subdistrict_id: defaultAddr.subdistrict_id || (defaultAddr as any).subdistrict_id || '',
        subdistrict: defaultAddr.subdistrict || '',
        postal_code: defaultAddr.postal_code,
        shipping_method: addressForm.values.shipping_method || 'regular',
        notes: addressForm.values.notes || '',
        save_address: false,
      });
    } else {
      setSelectedAddressId('new');
    }
  }, [addresses]);

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id);
    if (id === 'new') {
      addressForm.setValues({
        recipient_name: '',
        recipient_phone: '',
        address: '',
        city_id: '',
        city: '',
        province_id: '',
        province: '',
        district_id: '',
        district: '',
        subdistrict_id: '',
        subdistrict: '',
        postal_code: '',
        shipping_method: addressForm.values.shipping_method,
        notes: addressForm.values.notes,
        save_address: false,
      });
      setSelectedProvinceId('');
      setSelectedCityId('');
      setSelectedDistrictId('');
      setSelectedSubdistrictId('');
      setCities([]);
      setDistricts([]);
      setSubdistricts([]);
    } else {
      const addr = addresses?.find((a) => a.id === id);
      if (addr) {
        addressForm.setValues({
          recipient_name: addr.recipient_name,
          recipient_phone: addr.recipient_phone || (addr as any).phone || '',
          address: addr.address,
          city_id: addr.city_id || (addr as any).city_id || '',
          city: addr.city || '',
          province_id: addr.province_id || (addr as any).province_id || '',
          province: addr.province || '',
          district_id: addr.district_id || (addr as any).district_id || '',
          district: addr.district || '',
          subdistrict_id: addr.subdistrict_id || (addr as any).subdistrict_id || '',
          subdistrict: addr.subdistrict || '',
          postal_code: addr.postal_code,
          shipping_method: addressForm.values.shipping_method,
          notes: addressForm.values.notes,
          save_address: false,
        });
      }
    }
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      let courier_code = 'jne';
      let courier_name = 'JNE';
      let service_code = 'REG';
      let service_name = 'Regular Service';
      let shipping_cost = 0;

      if (addressForm.values.shipping_method === 'express') {
        courier_code = 'jne';
        courier_name = 'JNE';
        service_code = 'YES';
        service_name = 'Yakin Esok Sampai';
        shipping_cost = 25000;
      } else if (addressForm.values.shipping_method === 'same_day') {
        courier_code = 'grab';
        courier_name = 'Grab';
        service_code = 'SAMEDAY';
        service_name = 'Same Day';
        shipping_cost = 45000;
      }

      if (selectedAddressId === 'new' && addressForm.values.save_address) {
        try {
          await apiPost('/user/addresses', {
            label: 'Alamat Baru',
            recipient_name: addressForm.values.recipient_name,
            recipient_phone: addressForm.values.recipient_phone,
            address: addressForm.values.address,
            city_id: addressForm.values.city_id,
            province_id: addressForm.values.province_id,
            district_id: addressForm.values.district_id,
            subdistrict_id: addressForm.values.subdistrict_id,
            postal_code: addressForm.values.postal_code,
            is_default: false
          });
        } catch (e) {
          console.error('Gagal menyimpan alamat baru');
        }
      }

      let provinceVal = addressForm.values.province_id;
      let cityVal = addressForm.values.city_id;
      let districtVal = addressForm.values.district_id;
      let subDistrictVal = addressForm.values.subdistrict_id;

      if (selectedAddressId === 'new') {
        const foundProv = provinces.find((p) => p.id === provinceVal);
        if (foundProv) provinceVal = foundProv.name;

        const foundCity = cities.find((c) => c.id === cityVal);
        if (foundCity) cityVal = foundCity.name;

        const foundDist = districts.find((d) => d.id === districtVal);
        if (foundDist) districtVal = foundDist.name;

        const foundSub = subdistricts.find((s) => s.id === subDistrictVal);
        if (foundSub) subDistrictVal = foundSub.name;
      }

      const response = await apiPost<{ redirect_url: string }>('/transactions', {
        cart_id: cartId,
        shipment: {
          courier_code,
          courier_name,
          service_code,
          service_name,
          recipient_name: addressForm.values.recipient_name,
          recipient_phone: addressForm.values.recipient_phone,
          province_id: provinceVal,
          city_id: cityVal,
          district_id: districtVal,
          sub_district_id: subDistrictVal,
          postal_code: addressForm.values.postal_code,
          address: addressForm.values.address,
          shipping_cost,
        },
        notes: addressForm.values.notes || 'Please deliver between 9 AM - 5 PM',
      });

      await clearCart();
      toast.success('Pesanan berhasil dibuat! Mengalihkan ke pembayaran...');

      if (response && response.redirect_url) {
        window.location.href = response.redirect_url;
      } else {
        router.push('/account/orders');
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Gagal membuat pesanan. Silakan coba lagi.';
      toast.error(errMsg);
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
            {activeStep === 0 && (
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={3}>Alamat Pengiriman</Typography>

                {addresses && addresses.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" fontWeight={700} mb={2}>Pilih Alamat Tersimpan</Typography>
                    <Grid container spacing={2}>
                      {addresses.map((addr) => (
                        <Grid item xs={12} sm={6} key={addr.id}>
                          <Card
                            variant="outlined"
                            onClick={() => handleSelectAddress(addr.id)}
                            sx={{
                              p: 2,
                              cursor: 'pointer',
                              border: selectedAddressId === addr.id ? '2px solid #D26B54' : '1px solid #E5E7EB',
                              bgcolor: selectedAddressId === addr.id ? '#FDF8F5' : 'inherit',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              '&:hover': { borderColor: '#D26B54' }
                            }}
                          >
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography fontWeight={700} fontSize="0.9rem">{addr.label}</Typography>
                                {addr.is_main && <Chip label="Utama" color="primary" size="small" sx={{ fontWeight: 700, height: 18, fontSize: '0.65rem' }} />}
                              </Box>
                              <Typography fontWeight={600} variant="body2" mb={0.5}>{addr.recipient_name} ({addr.recipient_phone})</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                {addr.address}, {addr.subdistrict ? `Kel. ${addr.subdistrict}, ` : ''}{addr.district ? `Kec. ${addr.district}, ` : ''}{addr.city}, {addr.province}, {addr.postal_code}
                              </Typography>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                      <Grid item xs={12} sm={6}>
                        <Card
                          variant="outlined"
                          onClick={() => handleSelectAddress('new')}
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            border: selectedAddressId === 'new' ? '2px solid #D26B54' : '1px solid #E5E7EB',
                            bgcolor: selectedAddressId === 'new' ? '#FDF8F5' : 'inherit',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover': { borderColor: '#D26B54' }
                          }}
                        >
                          <Typography fontWeight={700} color="primary" fontSize="0.95rem">+ Gunakan Alamat Baru</Typography>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                <Grid container spacing={2.5}>
                  {(selectedAddressId === 'new' || !addresses || addresses.length === 0) ? (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" fontWeight={700} mb={1}>Isi Alamat Baru</Typography>
                      </Grid>
                      {[
                        { name: 'recipient_name', label: 'Nama Penerima', xs: 12 },
                        { name: 'recipient_phone', label: 'No. Telepon', xs: 12 },
                        { name: 'address', label: 'Alamat Lengkap', xs: 12 },
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

                      {/* province_id Dropdown */}
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={addressForm.touched.province_id && Boolean(addressForm.errors.province_id)}>
                          <InputLabel id="province-select-label">Provinsi</InputLabel>
                          <Select
                            labelId="province-select-label"
                            label="Provinsi"
                            name="province_id"
                            value={selectedProvinceId}
                            onChange={async (e) => {
                              const provId = e.target.value;
                              setSelectedProvinceId(provId);
                              addressForm.setFieldValue('province_id', provId);

                              // Reset values
                              addressForm.setFieldValue('city_id', '');
                              addressForm.setFieldValue('district_id', '');
                              addressForm.setFieldValue('subdistrict_id', '');
                              addressForm.setFieldValue('postal_code', '');
                              setSelectedCityId('');
                              setSelectedDistrictId('');
                              setSelectedSubdistrictId('');
                              setCities([]);
                              setDistricts([]);
                              setSubdistricts([]);

                              if (provId) {
                                try {
                                  const { data: res } = await apiClient.get<LocationItem[]>(`/location/cities?province_id=${provId}`);
                                  setCities(res || []);
                                } catch {
                                  toast.error('Gagal memuat data kota.');
                                }
                              }
                            }}
                          >
                            {provinces.map((p) => (
                              <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                            ))}
                          </Select>
                          {addressForm.touched.province_id && addressForm.errors.province_id && (
                            <Typography variant="caption" color="error" sx={{ mx: 2, mt: 0.5 }}>
                              {addressForm.errors.province_id}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>

                      {/* city_id Dropdown */}
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={addressForm.touched.city_id && Boolean(addressForm.errors.city_id)} disabled={!selectedProvinceId}>
                          <InputLabel id="city_id-select-label">Kota/Kabupaten</InputLabel>
                          <Select
                            labelId="city_id-select-label"
                            label="Kota/Kabupaten"
                            name="city_id"
                            value={selectedCityId}
                            onChange={async (e) => {
                              const cityId = e.target.value;
                              setSelectedCityId(cityId);
                              addressForm.setFieldValue('city_id', cityId);

                              // Reset values
                              addressForm.setFieldValue('district_id', '');
                              addressForm.setFieldValue('subdistrict_id', '');
                              addressForm.setFieldValue('postal_code', '');
                              setSelectedDistrictId('');
                              setSelectedSubdistrictId('');
                              setDistricts([]);
                              setSubdistricts([]);

                              if (cityId) {
                                try {
                                  const { data: res } = await apiClient.get<LocationItem[]>(`/location/districts?city_id=${cityId}`);
                                  setDistricts(res || []);
                                } catch {
                                  toast.error('Gagal memuat data kecamatan.');
                                }
                              }
                            }}
                          >
                            {cities.map((c) => (
                              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                            ))}
                          </Select>
                          {addressForm.touched.city_id && addressForm.errors.city_id && (
                            <Typography variant="caption" color="error" sx={{ mx: 2, mt: 0.5 }}>
                              {addressForm.errors.city_id}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>

                      {/* district_id Dropdown */}
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={addressForm.touched.district_id && Boolean(addressForm.errors.district_id)} disabled={!selectedCityId}>
                          <InputLabel id="district-select-label">Kecamatan</InputLabel>
                          <Select
                            labelId="district-select-label"
                            label="Kecamatan"
                            name="district_id"
                            value={selectedDistrictId}
                            onChange={async (e) => {
                              const distId = e.target.value;
                              setSelectedDistrictId(distId);
                              addressForm.setFieldValue('district_id', distId);

                              // Reset values
                              addressForm.setFieldValue('subdistrict_id', '');
                              addressForm.setFieldValue('postal_code', '');
                              setSelectedSubdistrictId('');
                              setSubdistricts([]);

                              if (distId) {
                                try {
                                  const { data: res } = await apiClient.get<LocationItem[]>(`/location/subdistricts?district_id=${distId}`);
                                  setSubdistricts(res || []);
                                } catch {
                                  toast.error('Gagal memuat data kelurahan.');
                                }
                              }
                            }}
                          >
                            {districts.map((d) => (
                              <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                            ))}
                          </Select>
                          {addressForm.touched.district_id && addressForm.errors.district_id && (
                            <Typography variant="caption" color="error" sx={{ mx: 2, mt: 0.5 }}>
                              {addressForm.errors.district_id}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>

                      {/* Subdistrict Dropdown */}
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={addressForm.touched.subdistrict_id && Boolean(addressForm.errors.subdistrict_id)} disabled={!selectedDistrictId}>
                          <InputLabel id="subdistrict-select-label">Kelurahan/Desa</InputLabel>
                          <Select
                            labelId="subdistrict-select-label"
                            label="Kelurahan/Desa"
                            name="subdistrict_id"
                            value={selectedSubdistrictId}
                            onChange={(e) => {
                              const subId = e.target.value;
                              setSelectedSubdistrictId(subId);
                              const selectedS = subdistricts.find((s) => s.id === subId);
                              addressForm.setFieldValue('subdistrict_id', subId);

                              // Auto pre-fill zip code if available!
                              if (selectedS?.zip_code) {
                                addressForm.setFieldValue('postal_code', selectedS.zip_code);
                              }
                            }}
                          >
                            {subdistricts.map((s) => (
                              <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                            ))}
                          </Select>
                          {addressForm.touched.subdistrict_id && addressForm.errors.subdistrict_id && (
                            <Typography variant="caption" color="error" sx={{ mx: 2, mt: 0.5 }}>
                              {addressForm.errors.subdistrict_id}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Kode Pos"
                          name="postal_code"
                          value={addressForm.values.postal_code}
                          onChange={addressForm.handleChange}
                          onBlur={addressForm.handleBlur}
                          error={addressForm.touched.postal_code && Boolean(addressForm.errors.postal_code)}
                          helperText={addressForm.touched.postal_code && addressForm.errors.postal_code}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={addressForm.values.save_address}
                              onChange={(e) => addressForm.setFieldValue('save_address', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Simpan alamat ini ke akun saya"
                        />
                      </Grid>
                    </>
                  ) : (
                    <Grid item xs={12}>
                      <Box sx={{ p: 2.5, bgcolor: '#FAF8F6', borderRadius: 2, border: '1px solid rgba(210,107,84,0.1)' }}>
                        <Typography variant="subtitle2" fontWeight={700} color="primary" mb={1}>Alamat Pengiriman Terpilih</Typography>
                        <Typography fontWeight={600} variant="body2">{addressForm.values.recipient_name} ({addressForm.values.recipient_phone})</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {addressForm.values.address}, {addressForm.values.subdistrict ? `Kel. ${addressForm.values.subdistrict}, ` : ''}{addressForm.values.district ? `Kec. ${addressForm.values.district}, ` : ''}{addressForm.values.city}, {addressForm.values.province}, {addressForm.values.postal_code}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Catatan Pengiriman (Opsional)"
                      name="notes"
                      value={addressForm.values.notes}
                      onChange={addressForm.handleChange}
                      placeholder="Contoh: Titipkan ke satpam jika tidak ada di rumah"
                    />
                  </Grid>
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
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  endIcon={!isSubmitting && <ArrowForward />}
                  disabled={isSubmitting}
                  onClick={() => {
                    console.log("Form values:", addressForm.values);
                    console.log("Form validation errors:", addressForm.errors);
                    addressForm.submitForm();
                  }}
                  sx={{ mt: 4 }}
                >
                  {isSubmitting ? 'Memproses...' : 'Lanjut ke Review'}
                </Button>
                {Object.keys(addressForm.errors).length > 0 && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#fdf2f2', borderRadius: 2, border: '1px solid #fde8e8' }}>
                    <Typography color="error" fontWeight={600} variant="body2" mb={1}>
                      Lengkapi detail alamat:
                    </Typography>
                    {Object.entries(addressForm.errors).map(([key, value]) => (
                      <Typography key={key} color="error" variant="caption" display="block">
                        • {key}: {String(value)}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Card>
            )}

            {activeStep === 1 && (
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={3}>Review Pesanan</Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1} color="primary">Alamat Pengiriman</Typography>
                  <Typography fontWeight={600} variant="body2">{addressForm.values.recipient_name} ({addressForm.values.recipient_phone})</Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                    {addressForm.values.address}, {addressForm.values.subdistrict ? `Kel. ${addressForm.values.subdistrict}, ` : ''}{addressForm.values.district ? `Kec. ${addressForm.values.district}, ` : ''}{addressForm.values.city}, {addressForm.values.province} {addressForm.values.postal_code}
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1} color="primary">Metode Pengiriman</Typography>
                  <Typography fontWeight={600} variant="body2">
                    {addressForm.values.shipping_method === 'express' ? 'Express (1-2 hari) — Rp 25.000' : 
                     addressForm.values.shipping_method === 'same_day' ? 'Same Day — Rp 45.000' : 
                     'Reguler (3-5 hari) — Gratis'}
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={2} color="primary">Detail Produk</Typography>
                  {items.map((item) => (
                    <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">{item.product.name} × {item.quantity}</Typography>
                      <Typography fontWeight={600} variant="body2">{formatCurrency(item.subtotal)}</Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Subtotal Produk</Typography>
                    <Typography variant="body2" fontWeight={500}>{formatCurrency(total)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Biaya Pengiriman</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(addressForm.values.shipping_method === 'express' ? 25000 : addressForm.values.shipping_method === 'same_day' ? 45000 : 0)}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                  <Typography variant="h6" fontWeight={700}>Total Akhir</Typography>
                  <Typography variant="h6" fontWeight={800} color="primary.main">
                    {formatCurrency(total + (addressForm.values.shipping_method === 'express' ? 25000 : addressForm.values.shipping_method === 'same_day' ? 45000 : 0))}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<ArrowBack />}
                    onClick={() => setActiveStep(0)}
                    disabled={isSubmitting}
                    sx={{ flex: 1 }}
                  >
                    Kembali
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={!isSubmitting && <CheckCircle />}
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    sx={{ flex: 2 }}
                  >
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
