'use client';

import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Address, apiClient, apiDelete, apiPatch, apiPost, apiPut, useGet } from '@ecommerce/api-client';
import { Add, Delete, Edit, LocationOn, Logout, Person, ShoppingBag } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Skeleton,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

interface LocationItem {
  id: string;
  name: string;
  zip_code?: string;
}

const menuItems = [
  { label: 'Profil Saya', icon: <Person />, href: '/account/profile' },
  { label: 'Pesanan Saya', icon: <ShoppingBag />, href: '/account/orders' },
  { label: 'Alamat', icon: <LocationOn />, href: '/account/addresses', active: true },
];

const addressSchema = Yup.object({
  label: Yup.string().required('Label alamat wajib diisi (contoh: Rumah, Kantor)'),
  recipient_name: Yup.string().required('Nama penerima wajib diisi'),
  recipient_phone: Yup.string().required('Nomor telepon wajib diisi'),
  address: Yup.string().required('Alamat lengkap wajib diisi'),
  city_id: Yup.string().required('Kota/Kabupaten wajib diisi'),
  province_id: Yup.string().required('Provinsi wajib diisi'),
  district_id: Yup.string().required('Kecamatan wajib diisi'),
  subdistrict_id: Yup.string().required('Kelurahan/Desa wajib diisi'),
  postal_code: Yup.string().required('Kode pos wajib diisi'),
});

export default function AddressesPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { data: addresses, isLoading, mutate } = useGet<Address[]>('/user/addresses');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Address | null>(null);

  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [cities, setCities] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [subdistricts, setSubdistricts] = useState<LocationItem[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [selectedSubdistrictId, setSelectedSubdistrictId] = useState<string>('');

  const [loadingLocations, setLoadingLocations] = useState(false);

  const formik = useFormik({
    initialValues: {
      label: '',
      recipient_name: '',
      recipient_phone: '',
      address: '',
      city_id: '',
      province_id: '',
      district_id: '',
      subdistrict_id: '',
      postal_code: '',
      is_main: false,
    },
    validationSchema: addressSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (editTarget) {
          await apiPut(`/user/addresses/${editTarget.id}`, values);
          toast.success('Alamat berhasil diperbarui!');
        } else {
          await apiPost('/user/addresses', values);
          toast.success('Alamat baru berhasil ditambahkan!');
        }
        mutate();
        setDialogOpen(false);
        setEditTarget(null);
        resetForm();
      } catch (err: any) {
        toast.error('Gagal menyimpan alamat.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const loadAddressLocations = async (addr: Address) => {
    setLoadingLocations(true);
    try {
      // 1. Fetch provinces
      const { data: provList } = await apiClient.get<LocationItem[]>('/location/provinces');
      setProvinces(provList || []);

      const foundProv = (provList || []).find((p) => p.id === addr.province || p.name.toUpperCase() === addr.province.toUpperCase());
      if (foundProv) {
        setSelectedProvinceId(foundProv.id);
        formik.setFieldValue('province_id', foundProv.id);

        // 2. Fetch cities
        const { data: cityList } = await apiClient.get<LocationItem[]>(`/location/cities?province_id=${foundProv.id}`);
        setCities(cityList || []);

        const foundCity = (cityList || []).find((c) => c.id === addr.city || c.name.toUpperCase() === addr.city.toUpperCase());
        if (foundCity) {
          setSelectedCityId(foundCity.id);
          formik.setFieldValue('city', foundCity.id);

          // 3. Fetch districts
          const { data: distList } = await apiClient.get<LocationItem[]>(`/location/districts?city_id=${foundCity.id}`);
          setDistricts(distList || []);

          const foundDist = (distList || []).find((d) => d.id === addr.district || d.name.toUpperCase() === (addr.district || '').toUpperCase());
          if (foundDist) {
            setSelectedDistrictId(foundDist.id);
            formik.setFieldValue('district', foundDist.id);

            // 4. Fetch subdistricts
            const { data: subList } = await apiClient.get<LocationItem[]>(`/location/subdistricts?district_id=${foundDist.id}`);
            setSubdistricts(subList || []);

            const foundSub = (subList || []).find((s) => s.id === addr.subdistrict || s.name.toUpperCase() === (addr.subdistrict || '').toUpperCase());
            if (foundSub) {
              setSelectedSubdistrictId(foundSub.id);
              formik.setFieldValue('subdistrict_id', foundSub.id);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load address locations reference data', err);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleOpenAdd = async () => {
    formik.resetForm();
    setEditTarget(null);
    setSelectedProvinceId('');
    setSelectedCityId('');
    setSelectedDistrictId('');
    setSelectedSubdistrictId('');
    setCities([]);
    setDistricts([]);
    setSubdistricts([]);
    setDialogOpen(true);

    setLoadingLocations(true);
    try {
      const { data: provRes } = await apiClient.get<LocationItem[]>('/location/provinces');
      setProvinces(provRes || []);
    } catch {
      toast.error('Gagal memuat data provinsi.');
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleOpenEdit = async (addr: Address) => {
    setEditTarget(addr);
    formik.setValues({
      label: addr.label,
      recipient_name: addr.recipient_name,
      recipient_phone: addr.recipient_phone,
      address: addr.address,
      province_id: addr.province,
      city_id: addr.city,
      district_id: addr.district || '',
      subdistrict_id: addr.subdistrict || '',
      postal_code: addr.postal_code,
      is_main: addr.is_main,
    });

    setProvinces([]);
    setCities([]);
    setDistricts([]);
    setSubdistricts([]);
    setSelectedProvinceId('');
    setSelectedCityId('');
    setSelectedDistrictId('');
    setSelectedSubdistrictId('');

    setDialogOpen(true);
    await loadAddressLocations(addr);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus alamat ini?')) {
      try {
        await apiDelete(`/user/addresses/${id}`);
        toast.success('Alamat berhasil dihapus.');
        mutate();
      } catch {
        toast.error('Gagal menghapus alamat.');
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await apiPatch(`/user/addresses/${id}/default`);
      toast.success('Alamat utama berhasil diubah.');
      mutate();
    } catch {
      toast.error('Gagal mengubah alamat utama.');
    }
  };

  const sortedAddresses = [...(addresses || [])].sort((a, b) => (b.is_main ? 1 : 0) - (a.is_main ? 1 : 0));

  return (
    <StorefrontLayout>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight={700} mb={5}>Akun Saya</Typography>
        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <Card sx={{ p: 3, textAlign: 'center', mb: 2 }}>
              <Avatar sx={{ width: 72, height: 72, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '1.8rem' }}>
                {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
              </Avatar>
              <Typography fontWeight={700}>{user?.full_name}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
            </Card>
            <Card>
              <List dense>
                {menuItems.map((item) => (
                  <ListItem key={item.href} disablePadding>
                    <ListItemButton component={Link} href={item.href} selected={item.active}>
                      <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
                <Divider />
                <ListItem disablePadding>
                  <ListItemButton onClick={() => { logout(); router.push('/'); }} sx={{ color: 'error.main' }}>
                    <ListItemIcon sx={{ minWidth: 36, color: 'error.main' }}><Logout /></ListItemIcon>
                    <ListItemText primary="Keluar" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Card>
          </Grid>

          {/* Content */}
          <Grid item xs={12} md={9}>
            <Card sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Daftar Alamat</Typography>
                  <Typography variant="body2" color="text.secondary">Kelola alamat pengiriman pesanan Anda</Typography>
                </Box>
                <Button startIcon={<Add />} onClick={handleOpenAdd} variant="contained" size="small">
                  Tambah Alamat
                </Button>
              </Box>

              {isLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Skeleton variant="rounded" height={120} />
                  <Skeleton variant="rounded" height={120} />
                </Box>
              ) : sortedAddresses.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#FAF8F6', borderRadius: 3, border: '1px dashed rgba(235,196,184,0.4)' }}>
                  <Typography fontSize={40} mb={1.5}>📍</Typography>
                  <Typography fontWeight={700} mb={0.5}>Belum Ada Alamat</Typography>
                  <Typography color="text.secondary" variant="body2" mb={2}>Anda belum menambahkan alamat pengiriman.</Typography>
                  <Button variant="outlined" size="small" onClick={handleOpenAdd}>Tambah Alamat Baru</Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {sortedAddresses.map((addr) => (
                    <Card key={addr.id} variant="outlined" sx={{ p: 3, borderColor: addr.is_main ? 'primary.main' : 'rgba(0,0,0,0.12)', bgcolor: addr.is_main ? '#FDF8F5' : 'inherit', position: 'relative' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography fontWeight={700} variant="subtitle1">{addr.label}</Typography>
                          {addr.is_main && <Chip label="Utama" color="primary" size="small" sx={{ fontWeight: 700, height: 20 }} />}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => handleOpenEdit(addr)} title="Edit"><Edit fontSize="small" /></IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(addr.id)} title="Hapus"><Delete fontSize="small" /></IconButton>
                        </Box>
                      </Box>
                      <Typography fontWeight={600} variant="body2" mb={0.5}>{addr.recipient_name} ({addr.recipient_phone})</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '85%' }}>
                        {addr.address}, {addr.subdistrict ? `Kel. ${addr.subdistrict}, ` : ''}{addr.district ? `Kec. ${addr.district}, ` : ''}{addr.city}, {addr.province}, {addr.postal_code}
                      </Typography>
                      {!addr.is_main && (
                        <Button variant="text" size="small" onClick={() => handleSetDefault(addr.id)} sx={{ mt: 1.5, p: 0, fontWeight: 700, textTransform: 'none' }}>
                          Atur Sebagai Alamat Utama
                        </Button>
                      )}
                    </Card>
                  ))}
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Address Form Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editTarget ? 'Ubah Alamat' : 'Tambah Alamat Baru'}</DialogTitle>
        <DialogContent dividers>
          {loadingLocations && provinces.length === 0 ? (
            <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="rectangular" height={40} width="100%" />
              <Skeleton variant="rectangular" height={40} width="100%" />
            </Box>
          ) : (
            <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth label="Label Alamat" placeholder="Rumah, Kantor, dll." name="label"
                  value={formik.values.label} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.label && Boolean(formik.errors.label)}
                  helperText={formik.touched.label && formik.errors.label}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Nama Penerima" name="recipient_name"
                  value={formik.values.recipient_name} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.recipient_name && Boolean(formik.errors.recipient_name)}
                  helperText={formik.touched.recipient_name && formik.errors.recipient_name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Nomor Telepon" placeholder="0812xxxxxxxx" name="recipient_phone"
                  value={formik.values.recipient_phone} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.recipient_phone && Boolean(formik.errors.recipient_phone)}
                  helperText={formik.touched.recipient_phone && formik.errors.recipient_phone}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth label="Alamat Lengkap" placeholder="Jalan, RT/RW, Blok, No. Rumah" name="address"
                  value={formik.values.address} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                  multiline rows={2}
                />
              </Grid>

              {/* Province Dropdown */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={formik.touched.province_id && Boolean(formik.errors.province_id)}>
                  <InputLabel id="province-select-label">Provinsi</InputLabel>
                  <Select
                    labelId="province-select-label"
                    label="Provinsi"
                    name="province_id"
                    value={selectedProvinceId}
                    onChange={async (e) => {
                      const provId = e.target.value;
                      setSelectedProvinceId(provId);
                      formik.setFieldValue('province_id', provId);

                      // Reset values
                      formik.setFieldValue('city_id', '');
                      formik.setFieldValue('district_id', '');
                      formik.setFieldValue('subdistrict_id', '');
                      formik.setFieldValue('postal_code', '');
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
                    {(provinces || []).map((p) => (
                      <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                    ))}
                  </Select>
                  {formik.touched.province_id && formik.errors.province_id && (
                    <Typography variant="caption" color="error" sx={{ mx: 2, mt: 0.5 }}>
                      {formik.errors.province_id}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* City Dropdown */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={formik.touched.city_id && Boolean(formik.errors.city_id)} disabled={!selectedProvinceId}>
                  <InputLabel id="city-select-label">Kota/Kabupaten</InputLabel>
                  <Select
                    labelId="city-select-label"
                    label="Kota/Kabupaten"
                    name="city_id"
                    value={selectedCityId}
                    onChange={async (e) => {
                      const cityId = e.target.value;
                      setSelectedCityId(cityId);
                      formik.setFieldValue('city_id', cityId);

                      // Reset values
                      formik.setFieldValue('district_id', '');
                      formik.setFieldValue('subdistrict_id', '');
                      formik.setFieldValue('postal_code', '');
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
                  {formik.touched.city_id && formik.errors.city_id && (
                    <Typography variant="caption" color="error" sx={{ mx: 2, mt: 0.5 }}>
                      {formik.errors.city_id}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* District Dropdown */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={formik.touched.district_id && Boolean(formik.errors.district_id)} disabled={!selectedCityId}>
                  <InputLabel id="district-select-label">Kecamatan</InputLabel>
                  <Select
                    labelId="district-select-label"
                    label="Kecamatan"
                    name="district_id"
                    value={selectedDistrictId}
                    onChange={async (e) => {
                      const distId = e.target.value;
                      setSelectedDistrictId(distId);
                      formik.setFieldValue('district_id', distId);

                      // Reset values
                      formik.setFieldValue('subdistrict_id', '');
                      formik.setFieldValue('postal_code', '');
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
                  {formik.touched.district_id && formik.errors.district_id && (
                    <Typography variant="caption" color="error" sx={{ mx: 2, mt: 0.5 }}>
                      {formik.errors.district_id}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Subdistrict Dropdown */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={formik.touched.subdistrict_id && Boolean(formik.errors.subdistrict_id)} disabled={!selectedDistrictId}>
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
                      formik.setFieldValue('subdistrict_id', subId);

                      // Auto pre-fill zip code if available!
                      if (selectedS?.zip_code) {
                        formik.setFieldValue('postal_code', selectedS.zip_code);
                      }
                    }}
                  >
                    {subdistricts.map((s) => (
                      <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                    ))}
                  </Select>
                  {formik.touched.subdistrict_id && formik.errors.subdistrict_id && (
                    <Typography variant="caption" color="error" sx={{ mx: 2, mt: 0.5 }}>
                      {formik.errors.subdistrict_id}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth disabled label="Kode Pos" name="postal_code"
                  value={formik.values.postal_code} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.postal_code && Boolean(formik.errors.postal_code)}
                  helperText={formik.touched.postal_code && formik.errors.postal_code}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={formik.values.is_main} onChange={(e) => formik.setFieldValue('is_main', e.target.checked)} color="primary" />}
                  label="Jadikan Alamat Utama"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Batal</Button>
          <Button variant="contained" disabled={formik.isSubmitting || loadingLocations} onClick={() => formik.submitForm()}>
            {formik.isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogActions>
      </Dialog>
    </StorefrontLayout>
  );
}
