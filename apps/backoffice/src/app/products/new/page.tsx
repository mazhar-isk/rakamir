'use client';

import React, { useRef } from 'react';
import {
  Box, Typography, Card, Grid, TextField, Button,
  FormControlLabel, Switch, Divider, IconButton, Avatar,
  Chip, Table, TableHead, TableRow, TableCell, TableBody, Paper
} from '@mui/material';
import { ArrowBack, CloudUpload, Delete, Add as AddIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiPost } from '@ecommerce/api-client';
import { toast } from 'react-toastify';
import BackofficeLayout from '@/components/layout/BackofficeLayout';

const MOCK_CATEGORIES_LIST = [
  { id: 'cat-1', name: 'Elektronik' },
  { id: 'cat-2', name: 'Fashion' },
  { id: 'cat-3', name: 'Rumah' },
  { id: 'cat-4', name: 'Olahraga' },
  { id: 'cat-5', name: 'Kecantikan' },
  { id: 'cat-6', name: 'Makanan' }
];

const schema = Yup.object({
  name: Yup.string().required('Nama produk wajib diisi'),
  description: Yup.string().required('Deskripsi wajib diisi'),
  price: Yup.number().required('Harga wajib diisi').min(0),
  original_price: Yup.number().optional().min(0),
  stock: Yup.number().required('Stok wajib diisi').min(0),
  category_ids: Yup.array().min(1, 'Pilih minimal satu kategori').required('Kategori wajib dipilih'),
});

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      price: '',
      original_price: '',
      stock: '',
      category_ids: [] as string[],
      tags: '',
      is_featured: false,
      is_new: true,
      images: [] as string[],
      options: [] as Array<{ id: string; name: string; values: Array<{ id: string; value: string }>; rawInput?: string }>,
      skus: [] as Array<{
        id: string;
        sku: string;
        price: number;
        original_price?: number;
        stock: number;
        picture?: string;
        option_values_map: Record<string, string>;
      }>,
    },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await apiPost('/admin/products', {
          ...values,
          category_id: values.category_ids[0] || 'cat-1',
          tags: values.tags.split(',').map((t) => t.trim()).filter(Boolean),
          price: parseFloat(values.price),
          original_price: values.original_price ? parseFloat(values.original_price) : undefined,
          stock: parseFloat(values.stock),
        });
        toast.success('Produk berhasil ditambahkan!');
        router.push('/products');
      } catch {
        toast.error('Gagal menambahkan produk.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        formik.setFieldValue('images', [...formik.values.images, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    formik.setFieldValue('images', formik.values.images.filter((_, i) => i !== idx));
  };

  const regenerateSkus = (options: typeof formik.values.options) => {
    if (options.length === 0 || options.every(o => !o.values || o.values.length === 0)) {
      formik.setFieldValue('skus', []);
      return;
    }

    const validOptions = options.filter(o => o.values && o.values.length > 0);
    if (validOptions.length === 0) {
      formik.setFieldValue('skus', []);
      return;
    }

    const combinations = validOptions.reduce<Array<Array<{ optId: string; valId: string; valVal: string }>>>(
      (acc, opt) => {
        const next: typeof acc = [];
        acc.forEach((comb) => {
          opt.values?.forEach((val) => {
            next.push([...comb, { optId: opt.id, valId: val.id, valVal: val.value }]);
          });
        });
        return next;
      },
      [[]]
    );

    const basePrice = parseFloat(formik.values.price) || 0;

    const nextSkus = combinations.map((comb, index) => {
      const map: Record<string, string> = {};
      comb.forEach(item => {
        map[item.optId] = item.valId;
      });

      const existing = formik.values.skus.find((sku) => {
        if (!sku.option_values_map) return false;
        return Object.entries(map).every(([oId, vId]) => sku.option_values_map[oId] === vId);
      });

      if (existing) return existing;

      const combCode = comb.map(c => c.valVal.substring(0, 3).toUpperCase()).join('-');
      const prodNameSlug = formik.values.name
        ? formik.values.name.substring(0, 5).toUpperCase().replace(/\s+/g, '')
        : 'PROD';
      const skuCode = `${prodNameSlug}-${combCode}-${index + 1}`;

      return {
        id: `sku-${Date.now()}-${index}`,
        sku: skuCode,
        price: basePrice,
        stock: 10,
        picture: undefined,
        option_values_map: map,
      };
    });

    formik.setFieldValue('skus', nextSkus);

    // Sum stock of all generated SKUs and update overall stock field
    const totalStock = nextSkus.reduce((sum, item) => sum + item.stock, 0);
    formik.setFieldValue('stock', String(totalStock));
  };

  const addOption = () => {
    const optId = `opt-${Date.now()}`;
    const newOptions = [
      ...formik.values.options,
      { id: optId, name: '', values: [] as Array<{ id: string; value: string }>, rawInput: '' }
    ];
    formik.setFieldValue('options', newOptions);
  };

  const getOptionValueLabel = (map: Record<string, string>) => {
    if (!map) return '';
    return Object.entries(map).map(([optId, valId]) => {
      const opt = formik.values.options.find(o => o.id === optId);
      const val = opt?.values?.find(v => v.id === valId);
      return `${opt?.name || 'Varian'}: ${val?.value || ''}`;
    }).join(', ');
  };

  return (
    <BackofficeLayout>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton component={Link} href="/products"><ArrowBack /></IconButton>
        <Box>
          <Typography variant="h5" fontWeight={700}>Tambah Produk Baru</Typography>
          <Typography variant="body2" color="text.secondary">Isi detail produk yang akan dijual</Typography>
        </Box>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Left - main info */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>Informasi Produk</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField fullWidth label="Nama Produk" name="name"
                  value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name} />
                <TextField fullWidth multiline rows={5} label="Deskripsi" name="description"
                  value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Harga Jual Base (Rp)" name="price" type="number"
                      value={formik.values.price} onChange={(e) => {
                        formik.handleChange(e);
                        const basePrice = parseFloat(e.target.value) || 0;
                        const updatedSkus = formik.values.skus.map(s => ({
                          ...s,
                          price: basePrice
                        }));
                        formik.setFieldValue('skus', updatedSkus);
                      }} onBlur={formik.handleBlur}
                      error={formik.touched.price && Boolean(formik.errors.price)}
                      helperText={formik.touched.price && formik.errors.price} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Harga Asli / Coret (Rp)" name="original_price" type="number"
                      value={formik.values.original_price} onChange={formik.handleChange} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Total Stok" name="stock" type="number"
                      disabled={formik.values.skus.length > 0}
                      value={formik.values.stock} onChange={formik.handleChange} onBlur={formik.handleBlur}
                      error={formik.touched.stock && Boolean(formik.errors.stock)}
                      helperText={formik.touched.stock ? formik.errors.stock : (formik.values.skus.length > 0 ? 'Dihitung otomatis dari stok varian' : '')} />
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                      <Typography variant="caption" color="text.secondary" mb={0.5} fontWeight={600}>Kategori (Multi-Category)</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {MOCK_CATEGORIES_LIST.map((cat) => {
                          const isSelected = formik.values.category_ids.includes(cat.id);
                          return (
                            <Chip
                              key={cat.id}
                              label={cat.name}
                              size="small"
                              onClick={() => {
                                const next = isSelected
                                  ? formik.values.category_ids.filter(id => id !== cat.id)
                                  : [...formik.values.category_ids, cat.id];
                                formik.setFieldValue('category_ids', next);
                              }}
                              color={isSelected ? 'primary' : 'default'}
                              variant={isSelected ? 'filled' : 'outlined'}
                              sx={{ cursor: 'pointer', fontWeight: isSelected ? 600 : 400 }}
                            />
                          );
                        })}
                      </Box>
                      {formik.touched.category_ids && formik.errors.category_ids && (
                        <Typography variant="caption" color="error" mt={0.5}>{formik.errors.category_ids as string}</Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
                <TextField fullWidth label="Tags (pisahkan dengan koma)" name="tags"
                  value={formik.values.tags} onChange={formik.handleChange}
                  placeholder="elektronik, gadget, smartphone" />
              </Box>
            </Card>

            {/* Premium Variant/SKU Manager */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Konfigurasi Varian (Multi-Variant)</Typography>
                  <Typography variant="body2" color="text.secondary">Tentukan opsi varian seperti Warna dan Ukuran</Typography>
                </Box>
                <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={addOption}>
                  Tambah Opsi
                </Button>
              </Box>

              {formik.values.options.length === 0 && (
                <Box sx={{ py: 3, textAlign: 'center', border: '1px dashed #E5E7EB', borderRadius: 2, bgcolor: '#F8F9FC' }}>
                  <Typography variant="body2" color="text.secondary">Belum ada varian yang didefinisikan. Produk akan dijual sebagai varian tunggal.</Typography>
                </Box>
              )}

              {formik.values.options.map((opt, optIdx) => (
                <Box key={opt.id} sx={{ p: 2, border: '1px solid #E5E7EB', borderRadius: 2, mb: 2, bgcolor: '#F9FAFB' }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                    <TextField
                      label="Nama Opsi (e.g. Ukuran, Warna)"
                      value={opt.name}
                      onChange={(e) => {
                        const updated = [...formik.values.options];
                        updated[optIdx].name = e.target.value;
                        formik.setFieldValue('options', updated);
                      }}
                      size="small"
                      sx={{ width: '40%' }}
                    />
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton color="error" onClick={() => {
                      const updated = formik.values.options.filter((_, idx) => idx !== optIdx);
                      formik.setFieldValue('options', updated);
                      regenerateSkus(updated);
                    }}>
                      <Delete />
                    </IconButton>
                  </Box>
                  <TextField
                    fullWidth
                    label="Nilai Varian (pisahkan dengan koma, e.g. Merah, Biru, Hijau)"
                    value={opt.rawInput ?? ''}
                    onChange={(e) => {
                      const rawVal = e.target.value;
                      const valStrings = rawVal.split(',').map(s => s.trim()).filter(Boolean);
                      const updatedValues = valStrings.map((v, valIdx) => ({
                        id: `val-${opt.id}-${valIdx}`,
                        value: v
                      }));
                      const updatedOptions = [...formik.values.options];
                      updatedOptions[optIdx].rawInput = rawVal;
                      updatedOptions[optIdx].values = updatedValues;
                      formik.setFieldValue('options', updatedOptions);
                      regenerateSkus(updatedOptions);
                    }}
                    size="small"
                    placeholder="e.g. S, M, L"
                    helperText="Ketik nilai dan pisahkan dengan tanda koma ( , )"
                  />
                </Box>
              ))}

              {formik.values.skus.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>Tabel SKU Varian</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#F3F4F6' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Varian</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Foto</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Kode SKU</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Harga Jual (Rp)</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Stok</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formik.values.skus.map((sku, index) => (
                          <TableRow key={sku.id}>
                            <TableCell sx={{ fontWeight: 600, maxWidth: 200 }}>
                              {getOptionValueLabel(sku.option_values_map)}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ position: 'relative', width: 40, height: 40, borderRadius: 1, overflow: 'hidden', border: '1px solid #E5E7EB', cursor: 'pointer', '&:hover .upload-overlay': { opacity: 1 } }} onClick={() => document.getElementById(`sku-file-input-${index}`)?.click()}>
                                  <Avatar 
                                    src={sku.picture} 
                                    variant="rounded" 
                                    sx={{ width: '100%', height: '100%' }}
                                  />
                                  <Box className="upload-overlay" sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
                                    <CloudUpload sx={{ fontSize: 16 }} />
                                  </Box>
                                </Box>
                                <input
                                  id={`sku-file-input-${index}`}
                                  type="file"
                                  accept="image/*"
                                  hidden
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        const nextSkus = [...formik.values.skus];
                                        nextSkus[index].picture = ev.target?.result as string;
                                        formik.setFieldValue('skus', nextSkus);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                                {sku.picture && (
                                  <IconButton 
                                    size="small" 
                                    color="error" 
                                    onClick={() => {
                                      const nextSkus = [...formik.values.skus];
                                      nextSkus[index].picture = undefined;
                                      formik.setFieldValue('skus', nextSkus);
                                    }}
                                    sx={{ p: 0.5 }}
                                  >
                                    <Delete sx={{ fontSize: 16 }} />
                                  </IconButton>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                name={`skus[${index}].sku`}
                                value={sku.sku}
                                onChange={formik.handleChange}
                                variant="standard"
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                name={`skus[${index}].price`}
                                type="number"
                                value={sku.price}
                                onChange={formik.handleChange}
                                variant="standard"
                                sx={{ width: 100 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                name={`skus[${index}].stock`}
                                type="number"
                                value={sku.stock}
                                onChange={(e) => {
                                  formik.handleChange(e);
                                  const nextSkus = [...formik.values.skus];
                                  nextSkus[index].stock = parseInt(e.target.value, 10) || 0;
                                  const total = nextSkus.reduce((sum, item) => sum + item.stock, 0);
                                  formik.setFieldValue('stock', String(total));
                                }}
                                variant="standard"
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Card>

            {/* Images */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>Foto Produk</Typography>
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{ border: '2px dashed #D1D5DB', borderRadius: 3, p: 4, textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(108,99,255,0.04)' } }}>
                <CloudUpload sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">Klik atau seret foto ke sini</Typography>
                <Typography variant="caption" color="text.disabled">PNG, JPG, WEBP hingga 5MB</Typography>
                <input ref={fileInputRef} type="file" multiple accept="image/*" hidden onChange={handleImageUpload} />
              </Box>
              {formik.values.images.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 2 }}>
                  {formik.values.images.map((img, i) => (
                    <Box key={i} sx={{ position: 'relative' }}>
                      <Avatar src={img} variant="rounded" sx={{ width: 80, height: 80 }} />
                      <IconButton size="small" onClick={() => removeImage(i)}
                        sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: 'white', width: 20, height: 20, '&:hover': { bgcolor: 'error.dark' } }}>
                        <Delete sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Card>
          </Grid>

          {/* Right - settings */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>Pengaturan</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel control={<Switch checked={formik.values.is_featured} onChange={(e) => formik.setFieldValue('is_featured', e.target.checked)} color="primary" />} label="Produk Unggulan (Featured)" />
                <FormControlLabel control={<Switch checked={formik.values.is_new} onChange={(e) => formik.setFieldValue('is_new', e.target.checked)} color="primary" />} label="Tandai sebagai Produk Baru" />
              </Box>
            </Card>
            <Button type="submit" variant="contained" fullWidth size="large" disabled={formik.isSubmitting}
              sx={{ background: 'linear-gradient(135deg, #6C63FF, #FF6584)', py: 1.5 }}>
              {formik.isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
            </Button>
            <Button component={Link} href="/products" variant="outlined" fullWidth size="large" sx={{ mt: 1.5 }}>
              Batal
            </Button>
          </Grid>
        </Grid>
      </form>
    </BackofficeLayout>
  );
}

function TableContainer({ children, component, variant }: any) {
  const Component = component || Paper;
  return <Component variant={variant}>{children}</Component>;
}
