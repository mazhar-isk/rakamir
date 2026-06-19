'use client';

import BackofficeLayout from '@/components/layout/BackofficeLayout';
import { apiClient, apiPut, Category, Product, useGet, usePaginated } from '@ecommerce/api-client';
import { Add as AddIcon, ArrowBack, ArrowForward, CloudUpload, Delete } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { useFormik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

const schema = Yup.object({
  name: Yup.string().required('Nama produk wajib diisi'),
  description: Yup.string().required('Deskripsi wajib diisi'),
  price: Yup.number().required('Harga wajib diisi').min(0),
  original_price: Yup.number().optional().min(0),
  stock: Yup.number().required('Stok wajib diisi').min(0),
  category_ids: Yup.array().min(1, 'Pilih minimal satu kategori').required('Kategori wajib dipilih'),
});

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: product, isLoading } = useGet<Product>(`/admin/products/${params.id}`);
  const [uploadingProductImages, setUploadingProductImages] = useState(false);
  const [uploadingSkus, setUploadingSkus] = useState<Record<number, boolean>>({});
  const [deletedCombinations, setDeletedCombinations] = useState<Record<string, string>[]>([]);

  const { data: categoriesData } = usePaginated<Category>('/admin/categories?limit=100');
  const categoriesList = categoriesData?.data ?? [];

  const isUploading = uploadingProductImages || Object.values(uploadingSkus).some(Boolean);

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
      is_new: false,
      is_active: false,
      images: [] as string[],
      options: [] as Array<{ option_id: string; name: string; values: Array<{ option_value_id: string; value: string }>; rawInput?: string }>,
      skus: [] as Array<{
        id: string;
        sku_id: string;
        sku: string;
        price: number;
        original_price?: number;
        stock: number;
        image_url?: string;
        option_values_map: Record<string, string>;
      }>,
      remove_skus: [] as string[],
      remove_images: [] as string[],
      add_images: [] as string[],
    },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      const payload = {
        ...values,
        category_id: values.category_ids[0] || 'cat-1',
        tags: typeof values.tags === 'string'
          ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : values.tags,
        price: parseFloat(values.price),
        original_price: values.original_price ? parseFloat(values.original_price) : undefined,
        stock: parseFloat(values.stock)
      }

      try {
        await apiPut(`/admin/products/${params.id}`, payload);
        toast.success('Produk berhasil diperbarui!');
        router.push('/products');
      } catch {
        toast.error('Gagal memperbarui produk.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const hasDuplicateOptions = formik.values.options.some((opt, idx) => {
    const isNameDuplicated = opt.name.trim() !== '' && formik.values.options.some((o, oIdx) => oIdx !== idx && o.name.trim().toLowerCase() === opt.name.trim().toLowerCase());
    const valuesList = opt.rawInput ? opt.rawInput.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [];
    const isValuesDuplicated = valuesList.some((v, vIdx) => valuesList.indexOf(v) !== vIdx);
    return isNameDuplicated || isValuesDuplicated;
  });

  // Populate form when product loads
  useEffect(() => {
    if (product) {
      formik.setValues({
        name: product.name,
        description: product.description,
        price: String(product.price),
        original_price: String(product.original_price ?? ''),
        stock: String(product.stock),
        category_ids: product.categories?.map((c) => c.id) ?? [product.category?.id].filter(Boolean) as string[],
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
        is_featured: product.is_featured,
        is_new: product.is_new,
        is_active: product.is_active,
        images: product.images ?? [],
        options: product.options?.map((o) => ({
          ...o,
          rawInput: o.values?.map((v) => v.value).join(', ') ?? '',
        })) ?? [],
        skus: product.skus ?? [],
        remove_skus: [],
        remove_images: [],
        add_images: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploadingProductImages(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const res = await apiClient.post<{ image_url: string }>('/admin/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.image_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      formik.setFieldValue('images', [...formik.values.images, ...uploadedUrls]);
      formik.setFieldValue('add_images', [...formik.values.add_images, ...uploadedUrls]);
      toast.success(`${files.length} gambar berhasil diunggah.`);
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengunggah beberapa gambar.');
    } finally {
      setUploadingProductImages(false);
    }
  };

  const removeImage = (idx: number) => {
    const targetImage = formik.values.images[idx];
    formik.setFieldValue('images', formik.values.images.filter((_, i) => i !== idx));

    if (formik.values.add_images.includes(targetImage)) {
      formik.setFieldValue('add_images', formik.values.add_images.filter((img) => img !== targetImage));
    } else {
      if (!formik.values.remove_images.includes(targetImage)) {
        formik.setFieldValue('remove_images', [...formik.values.remove_images, targetImage]);
      }
    }
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const nextImages = [...formik.values.images];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < nextImages.length) {
      const temp = nextImages[index];
      nextImages[index] = nextImages[targetIndex];
      nextImages[targetIndex] = temp;
      formik.setFieldValue('images', nextImages);
    }
  };

  const regenerateSkus = (options: typeof formik.values.options) => {
    let nextSkus: typeof formik.values.skus = [];

    const validOptions = options.filter(o => o.values && o.values.length > 0);
    if (options.length > 0 && validOptions.length > 0) {
      const combinations = validOptions.reduce<Array<Array<{ optId: string; valId: string; valVal: string }>>>(
        (acc, opt) => {
          const next: typeof acc = [];
          acc.forEach((comb) => {
            opt.values?.forEach((val) => {
              next.push([...comb, { optId: opt.option_id, valId: val.option_value_id, valVal: val.value }]);
            });
          });
          return next;
        },
        [[]]
      );

      const basePrice = parseFloat(formik.values.price) || 0;

      nextSkus = combinations
        .map((comb, index) => {
          const map: Record<string, string> = {};
          comb.forEach(item => {
            map[item.optId] = item.valId;
          });

          // Check if this combination was deleted by the user
          const isDeleted = deletedCombinations.some(deletedMap => {
            const newEntries = Object.entries(map);
            const deletedEntries = Object.entries(deletedMap);
            if (newEntries.length !== deletedEntries.length) return false;

            return newEntries.every(([oId, vId]) => {
              const newOpt = options.find(o => o.option_id === oId);
              const newVal = newOpt?.values?.find(v => v.option_value_id === vId);
              const newValVal = newVal?.value?.trim().toLowerCase();

              const delOpt = formik.values.options.find(o => o.option_id === oId) || options.find(o => o.option_id === oId);
              const delValId = deletedMap[oId];
              const delVal = delOpt?.values?.find(v => v.option_value_id === delValId);
              const delValVal = delVal?.value?.trim().toLowerCase();

              return newValVal === delValVal;
            });
          });

          if (isDeleted) return null;

          const existing = formik.values.skus.find((sku) => {
            if (!sku.option_values_map) return false;

            const newEntries = Object.entries(map);
            const skuEntries = Object.entries(sku.option_values_map);

            if (newEntries.length !== skuEntries.length) return false;

            return newEntries.every(([oId, vId]) => {
              const newOpt = options.find(o => o.option_id === oId);
              if (!newOpt || !newOpt.name) return false;
              const newOptName = newOpt.name.trim().toLowerCase();

              const newVal = newOpt.values?.find(v => v.option_value_id === vId);
              if (!newVal || !newVal.value) return false;
              const newValVal = newVal.value.trim().toLowerCase();

              return skuEntries.some(([prevOId, prevVId]) => {
                const prevOpt = formik.values.options.find(o => o.option_id === prevOId);
                if (!prevOpt || !prevOpt.name) return false;
                const prevOptName = prevOpt.name.trim().toLowerCase();
                if (prevOptName !== newOptName) return false;

                const prevVal = prevOpt.values?.find(v => v.option_value_id === prevVId);
                if (!prevVal || !prevVal.value) return false;
                const prevValVal = prevVal.value.trim().toLowerCase();

                return prevValVal === newValVal;
              });
            });
          });

          if (existing) {
            return {
              ...existing,
              option_values_map: map
            };
          }

          const combCode = comb.map(c => c.valVal.substring(0, 3).toUpperCase()).join('-');
          const prodNameSlug = formik.values.name
            ? formik.values.name.substring(0, 5).toUpperCase().replace(/\s+/g, '')
            : 'PROD';
          const skuCode = `${prodNameSlug}-${combCode}-${index + 1}`;

          return {
            sku_id: `sku-${Date.now()}-${index}`,
            sku: skuCode,
            price: basePrice,
            stock: 0,
            image_url: undefined,
            option_values_map: map,
          } as any;
        })
        .filter((s): s is NonNullable<typeof s> => s !== null);
    }

    // Identify which existing database SKUs are being removed
    const removedSkus = formik.values.skus.filter(
      (oldSku) => !nextSkus.some((newSku) => newSku.sku_id === oldSku.sku_id)
    );
    const removedSkuIds = removedSkus
      .map((s) => s.id)
      .filter((id): id is string => !!id && !formik.values.remove_skus.includes(id));

    if (removedSkuIds.length > 0) {
      formik.setFieldValue('remove_skus', [...formik.values.remove_skus, ...removedSkuIds]);
    }

    formik.setFieldValue('skus', nextSkus);

    // Sum stock of all generated SKUs and update overall stock field
    const totalStock = nextSkus.reduce((sum, item) => sum + item.stock, 0);
    formik.setFieldValue('stock', String(totalStock));
  };

  const addOption = () => {
    const optId = `opt-${Date.now()}`;
    const newOptions = [
      ...formik.values.options,
      { option_id: optId, name: '', values: [] as Array<{ option_value_id: string; value: string }>, rawInput: '' }
    ];
    formik.setFieldValue('options', newOptions);
  };

  const getOptionValueLabel = (map: Record<string, string>) => {
    if (!map) return '';
    return Object.entries(map).map(([optId, valId]) => {
      const opt = formik.values.options.find(o => o.option_id === optId);
      const val = opt?.values?.find(v => v.option_value_id === valId);
      return `${opt?.name || 'Varian'}: ${val?.value || ''}`;
    }).join(', ');
  };

  if (isLoading) {
    return (
      <BackofficeLayout>
        <Typography color="text.secondary">Memuat produk...</Typography>
      </BackofficeLayout>
    );
  }

  return (
    <BackofficeLayout>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton component={Link} href="/products"><ArrowBack /></IconButton>
        <Box>
          <Typography variant="h5" fontWeight={700}>Edit Produk</Typography>
          <Typography variant="body2" color="text.secondary">{product?.name}</Typography>
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
                      <FormControl fullWidth error={formik.touched.category_ids && Boolean(formik.errors.category_ids)}>
                        <InputLabel id="category-select-label" size='small'>Kategori</InputLabel>
                        <Select
                          labelId="category-select-label"
                          multiple
                          size='small'
                          name="category_ids"
                          value={formik.values.category_ids}
                          onChange={(e) => {
                            formik.setFieldValue('category_ids', e.target.value);
                          }}
                          input={<OutlinedInput label="Kategori" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(selected as string[]).map((value) => {
                                const cat = categoriesList.find((c) => c.id === value);
                                return <Chip key={value} label={cat?.name || value} size="small" />;
                              })}
                            </Box>
                          )}
                        >
                          {categoriesList.map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>
                              <Checkbox checked={formik.values.category_ids.indexOf(cat.id) > -1} />
                              <ListItemText primary={cat.name} />
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.category_ids && formik.errors.category_ids && (
                          <Typography variant="caption" color="error" mt={0.5}>{formik.errors.category_ids as string}</Typography>
                        )}
                      </FormControl>
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
                <Box sx={{ py: 3, textAlign: 'center', border: '1px dashed #E5E7EB', borderRadius: 2, bgcolor: '#F9F6F2' }}>
                  <Typography variant="body2" color="text.secondary">Belum ada varian yang didefinisikan. Produk akan dijual sebagai varian tunggal.</Typography>
                </Box>
              )}

              {formik.values.options.map((opt, optIdx) => {
                const isNameDuplicated = opt.name.trim() !== '' && formik.values.options.some((o, oIdx) => oIdx !== optIdx && o.name.trim().toLowerCase() === opt.name.trim().toLowerCase());
                const valuesList = opt.rawInput ? opt.rawInput.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [];
                const isValuesDuplicated = valuesList.some((v, vIdx) => valuesList.indexOf(v) !== vIdx);

                return (
                  <Box key={opt.option_id} sx={{ p: 2, border: '1px solid #E5E7EB', borderRadius: 2, mb: 2, bgcolor: '#F9F6F2' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                      <TextField
                        label="Nama Opsi (e.g. Ukuran, Warna)"
                        value={opt.name}
                        onChange={(e) => {
                          const updated = [...formik.values.options];
                          updated[optIdx].name = e.target.value;
                          formik.setFieldValue('options', updated);
                        }}
                        error={isNameDuplicated}
                        helperText={isNameDuplicated ? "Nama opsi tidak boleh duplikat" : ""}
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
                        const updatedValues = valStrings.map((v, valIdx) => {
                          const existingVal = opt.values?.find(
                            (val) => val.value.trim().toLowerCase() === v.trim().toLowerCase()
                          );
                          return {
                            option_value_id: existingVal ? existingVal.option_value_id : `val-${opt.option_id}-${Date.now()}-${valIdx}`,
                            value: v
                          };
                        });
                        const updatedOptions = [...formik.values.options];
                        updatedOptions[optIdx].rawInput = rawVal;
                        updatedOptions[optIdx].values = updatedValues;
                        formik.setFieldValue('options', updatedOptions);
                        regenerateSkus(updatedOptions);
                      }}
                      error={isValuesDuplicated}
                      size="small"
                      placeholder="e.g. S, M, L"
                      helperText={isValuesDuplicated ? "Nilai varian tidak boleh duplikat" : "Ketik nilai dan pisahkan dengan tanda koma ( , )"}
                    />
                  </Box>
                );
              })}
              {formik.values.skus.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>Tabel SKU Varian</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#FDF5F2' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Varian</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Foto</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Kode SKU</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Harga Jual (Rp)</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Stok</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">Aksi</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formik.values.skus.map((sku, index) => (
                          <TableRow key={sku.sku_id}>
                            <TableCell sx={{ fontWeight: 600, maxWidth: 200 }}>
                              {getOptionValueLabel(sku.option_values_map)}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    position: 'relative',
                                    width: 40,
                                    height: 40,
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    border: '1px solid #E5E7EB',
                                    cursor: uploadingSkus[index] ? 'default' : 'pointer',
                                    '&:hover .upload-overlay': { opacity: uploadingSkus[index] ? 0 : 1 }
                                  }}
                                  onClick={() => !uploadingSkus[index] && document.getElementById(`sku-file-input-${index}`)?.click()}
                                >
                                  <Avatar
                                    src={sku.image_url}
                                    variant="rounded"
                                    sx={{ width: '100%', height: '100%' }}
                                  />
                                  {uploadingSkus[index] ? (
                                    <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <CircularProgress size={16} sx={{ color: 'white' }} />
                                    </Box>
                                  ) : (
                                    <Box className="upload-overlay" sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
                                      <CloudUpload sx={{ fontSize: 16 }} />
                                    </Box>
                                  )}
                                </Box>
                                <input
                                  id={`sku-file-input-${index}`}
                                  type="file"
                                  accept="image/*"
                                  hidden
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setUploadingSkus((prev) => ({ ...prev, [index]: true }));
                                      try {
                                        const formData = new FormData();
                                        formData.append('image', file);
                                        const res = await apiClient.post<{ image_url: string }>('/admin/images', formData, {
                                          headers: { 'Content-Type': 'multipart/form-data' },
                                        });
                                        const nextSkus = [...formik.values.skus];
                                        nextSkus[index].image_url = res.data.image_url;
                                        formik.setFieldValue('skus', nextSkus);
                                        toast.success('Foto SKU berhasil diunggah.');
                                      } catch (error) {
                                        console.error(error);
                                        toast.error('Gagal mengunggah foto SKU.');
                                      } finally {
                                        setUploadingSkus((prev) => ({ ...prev, [index]: false }));
                                      }
                                    }
                                  }}
                                />
                                {sku.image_url && (
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                      const nextSkus = [...formik.values.skus];
                                      nextSkus[index].image_url = undefined;
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
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  if (sku.id && !formik.values.remove_skus.includes(sku.id)) {
                                    formik.setFieldValue('remove_skus', [...formik.values.remove_skus, sku.id]);
                                  }
                                  setDeletedCombinations(prev => [...prev, sku.option_values_map]);
                                  const nextSkus = formik.values.skus.filter((_, i) => i !== index);
                                  formik.setFieldValue('skus', nextSkus);
                                  const total = nextSkus.reduce((sum, item) => sum + item.stock, 0);
                                  formik.setFieldValue('stock', String(total));
                                }}
                              >
                                <Delete />
                              </IconButton>
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
              <Typography variant="h6" fontWeight={700}>Foto Produk</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                * Gambar pertama akan digunakan sebagai gambar utama (cover) produk. Gunakan tombol panah pada gambar untuk mengatur urutan.
              </Typography>
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{ border: '2px dashed #D1D5DB', borderRadius: 3, p: 4, textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(108,99,255,0.04)' } }}>
                <CloudUpload sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">Klik atau seret foto ke sini</Typography>
                <Typography variant="caption" color="text.disabled">PNG, JPG, WEBP hingga 5MB</Typography>
                <input ref={fileInputRef} type="file" multiple accept="image/*" hidden onChange={handleImageUpload} />
              </Box>
              {(formik.values.images.length > 0 || uploadingProductImages) && (
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 2 }}>
                  {formik.values.images.map((img, i) => (
                    <Box key={i} sx={{ position: 'relative', '&:hover .image-actions': { opacity: 1 } }}>
                      <Avatar src={img} variant="rounded" sx={{ width: 80, height: 80, border: i === 0 ? '2px solid #6c63ff' : '1px solid #E5E7EB' }} />

                      {/* Main Image Badge */}
                      {i === 0 && (
                        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, bgcolor: 'rgba(108,99,255,0.85)', color: 'white', py: 0.25, textAlign: 'center', borderRadius: '0 0 4px 4px', zIndex: 2 }}>
                          <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 700 }}>UTAMA</Typography>
                        </Box>
                      )}

                      {/* Delete Button */}
                      <IconButton size="small" onClick={() => removeImage(i)}
                        sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: 'white', width: 20, height: 20, '&:hover': { bgcolor: 'error.dark' }, zIndex: 3 }}>
                        <Delete sx={{ fontSize: 12 }} />
                      </IconButton>

                      {/* Reorder Overlay */}
                      <Box className="image-actions" sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, opacity: 0, transition: 'opacity 0.2s', zIndex: 1 }}>
                        {i > 0 && (
                          <IconButton size="small" onClick={() => moveImage(i, 'left')} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.4)' }, p: 0.5 }}>
                            <ArrowBack sx={{ fontSize: 14 }} />
                          </IconButton>
                        )}
                        {i < formik.values.images.length - 1 && (
                          <IconButton size="small" onClick={() => moveImage(i, 'right')} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.4)' }, p: 0.5 }}>
                            <ArrowForward sx={{ fontSize: 14 }} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  ))}
                  {uploadingProductImages && (
                    <Box sx={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #D1D5DB', borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                      <CircularProgress size={24} />
                    </Box>
                  )}
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
                <FormControlLabel control={<Switch checked={formik.values.is_active} onChange={(e) => formik.setFieldValue('is_active', e.target.checked)} color="primary" />} label="Aktif" />
              </Box>
            </Card>
            <Button type="submit" variant="contained" fullWidth size="large" disabled={formik.isSubmitting || isUploading || hasDuplicateOptions}
              sx={{ py: 1.5 }}>
              {formik.isSubmitting ? 'Menyimpan...' : isUploading ? 'Mengunggah Gambar...' : hasDuplicateOptions ? 'Varian Duplikat' : 'Simpan Perubahan'}
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
