'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Card, Grid, TextField, Button,
  IconButton, Avatar, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, ToggleButtonGroup, ToggleButton, Chip,
  InputAdornment, Tooltip, CircularProgress, Alert
} from '@mui/material';
import {
  ArrowBack, Delete, Save, Add as AddIcon, QrCodeScanner, Info
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@ecommerce/api-client';
import { toast } from 'react-toastify';
import BackofficeLayout from '@/components/layout/BackofficeLayout';
import { playBeep, playErrorBeep } from '@/components/utils/helpers';

interface ScannedSkuItem {
  product_id: string;
  product_name: string;
  sku_id: string;
  sku_code: string;
  picture?: string;
  options_label: string;
  current_stock: number;
  new_stock: number;
}

export default function StockUpdatePage() {
  const router = useRouter();
  const skuInputRef = useRef<HTMLInputElement>(null);

  const [skuCode, setSkuCode] = useState('');
  const [items, setItems] = useState<ScannedSkuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Camera Barcode Scanner State
  const [Html5Qrcode, setHtml5Qrcode] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const html5QrcodeScannerRef = useRef<any>(null);
  const lastScannedCodeRef = useRef<string>('');
  const lastScannedTimeRef = useRef<number>(0);

  // Dynamically load html5-qrcode library
  useEffect(() => {
    import('html5-qrcode').then((module) => {
      setHtml5Qrcode(() => module.Html5Qrcode);
    });
  }, []);

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrcodeScannerRef.current) {
        try {
          if (html5QrcodeScannerRef.current.isScanning) {
            html5QrcodeScannerRef.current.stop();
          }
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Focus input on mount
  useEffect(() => {
    skuInputRef.current?.focus();
  }, []);

  const handleCameraScanSuccess = async (code: string) => {
    const now = Date.now();
    // 2 seconds cooldown for the same barcode scan to avoid double scans
    if (code === lastScannedCodeRef.current && (now - lastScannedTimeRef.current) < 2000) {
      return;
    }
    lastScannedCodeRef.current = code;
    lastScannedTimeRef.current = now;

    setLoading(true);
    try {
      const res = await apiClient.get<ScannedSkuItem>(`/admin/products/sku/${code}`);
      const data = res.data;

      if (!data || !data.sku_code) {
        throw new Error(`SKU "${code}" tidak ditemukan.`);
      }

      playBeep();

      toast.success(`Scan kamera berhasil: ${data.sku_code}`);
      setItems((prevItems) => {
        const existingIdx = prevItems.findIndex((item) => item.sku_code.toLowerCase() === data.sku_code.toLowerCase());
        const targetStock = existingIdx > -1 ? prevItems[existingIdx].new_stock + 1 : data.current_stock + 1;

        if (existingIdx > -1) {
          const updated = [...prevItems];
          updated[existingIdx] = { ...updated[existingIdx], new_stock: targetStock };
          return updated;
        } else {
          return [...prevItems, { ...data, new_stock: targetStock }];
        }
      });
    } catch (error: any) {
      console.error(error);
      playErrorBeep();
      const errMsg = error.response?.data?.message || `SKU "${code}" tidak ditemukan.`;
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    if (!Html5Qrcode) return;
    setIsScanning(true);

    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode('camera-scanner-view');
        html5QrcodeScannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: (width: number, height: number) => {
              return { width: Math.min(width * 0.7, 250), height: Math.min(height * 0.7, 150) };
            }
          },
          (decodedText: string) => {
            handleCameraScanSuccess(decodedText);
          },
          () => {
            // ignore failure frames
          }
        );
      } catch (err) {
        console.error('Failed to start scanner:', err);
        toast.error('Gagal mengakses kamera. Pastikan izin kamera telah diberikan.');
        setIsScanning(false);
      }
    }, 100);
  };

  const stopScanner = async () => {
    if (html5QrcodeScannerRef.current) {
      try {
        if (html5QrcodeScannerRef.current.isScanning) {
          await html5QrcodeScannerRef.current.stop();
        }
      } catch (err) {
        console.error('Failed to stop scanner:', err);
      }
      html5QrcodeScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScanOrAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const querySku = skuCode.trim();
    if (!querySku) return;

    setLoading(true);
    try {
      // Lookup the SKU from mock API / actual API
      const res = await apiClient.get<ScannedSkuItem>(`/admin/products/sku/${querySku}`);
      const data = res.data;

      if (!data || !data.sku_code) {
        throw new Error(`SKU "${querySku}" tidak ditemukan.`);
      }

      playBeep();
      toast.success(`SKU ${data.sku_code} dimuat.`);

      setItems((prevItems) => {
        const existingIdx = prevItems.findIndex((item) => item.sku_code.toLowerCase() === data.sku_code.toLowerCase());
        const targetStock = existingIdx > -1 ? prevItems[existingIdx].new_stock + 1 : data.current_stock + 1;

        if (existingIdx > -1) {
          const updated = [...prevItems];
          updated[existingIdx] = {
            ...updated[existingIdx],
            new_stock: targetStock,
          };
          return updated;
        } else {
          return [
            ...prevItems,
            {
              ...data,
              new_stock: targetStock,
            },
          ];
        }
      });

      // Reset SKU input and refocus
      setSkuCode('');
      setTimeout(() => skuInputRef.current?.focus(), 50);
    } catch (error: any) {
      console.error(error);
      playErrorBeep();
      const errMsg = error.response?.data?.message || `SKU "${querySku}" tidak ditemukan.`;
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (skuCodeToRemove: string) => {
    setItems((prev) => prev.filter((item) => item.sku_code !== skuCodeToRemove));
  };

  const handleQtyChange = (skuCodeToUpdate: string, val: string) => {
    const qty = parseInt(val, 10);
    setItems((prev) =>
      prev.map((item) =>
        item.sku_code === skuCodeToUpdate
          ? { ...item, new_stock: isNaN(qty) ? 0 : qty }
          : item
      )
    );
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.warn('Daftar stok kosong. Silakan scan SKU terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        updates: items.map((item) => ({
          sku_code: item.sku_code,
          stock: item.new_stock,
        })),
      };

      await apiClient.post('/admin/products/stock/bulk-update', payload);
      toast.success('Semua perubahan stok berhasil disimpan!');
      setItems([]);
      router.push('/products');
    } catch (error) {
      console.error(error);
      toast.error('Gagal memperbarui stok secara massal.');
    } finally {
      setSubmitting(false);
    }
  };

  const getDeltaChip = (current: number, next: number) => {
    const diff = next - current;
    if (diff > 0) {
      return <Chip label={`+${diff}`} color="success" size="small" sx={{ fontWeight: 600 }} />;
    } else if (diff < 0) {
      return <Chip label={`${diff}`} color="error" size="small" sx={{ fontWeight: 600 }} />;
    }
    return <Chip label="No Change" variant="outlined" size="small" sx={{ color: 'text.secondary' }} />;
  };

  return (
    <BackofficeLayout>
      {/* Header section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton component={Link} href="/products"><ArrowBack /></IconButton>
        <Box>
          <Typography variant="h5" fontWeight={700}>Update Stok SKU Massal</Typography>
          <Typography variant="body2" color="text.secondary">Scan barcode SKU atau input manual untuk memperbarui stok produk</Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Scan & Control Card */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 3, mb: 3, border: '1px solid #E5E7EB', borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>Konfigurasi Scanner</Typography>


            <form onSubmit={handleScanOrAdd}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  fullWidth
                  inputRef={skuInputRef}
                  label="Scan / Input Kode SKU"
                  value={skuCode}
                  onChange={(e) => setSkuCode(e.target.value)}
                  placeholder="e.g. IPH15P-256-RED"
                  InputProps={{
                    endAdornment: Html5Qrcode && (
                      <InputAdornment position="end">
                        <Tooltip title={isScanning ? "Matikan Kamera" : "Aktifkan Kamera Scan"}>
                          <IconButton
                            color={isScanning ? 'error' : 'primary'}
                            onClick={isScanning ? stopScanner : startScanner}
                            edge="end"
                          >
                            <QrCodeScanner />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    )
                  }}
                  disabled={loading}
                />

                {isScanning && (
                  <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: '2px solid #D26B54', bgcolor: 'black', mb: 1 }}>
                    <Box id="camera-scanner-view" sx={{ width: '100%', minHeight: 220 }} />
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={stopScanner}
                      sx={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}
                    >
                      Matikan Kamera
                    </Button>
                  </Box>
                )}


                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading || !skuCode}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                  sx={{
                    py: 1.2,
                    fontWeight: 600,
                  }}
                >
                  {loading ? 'Mencari SKU...' : 'Tambah ke Daftar'}
                </Button>
              </Box>
            </form>

            <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }} icon={<Info fontSize="small" />}>
              Pintasan: Arahkan kursor ke kolom SKU, scan barcode, dan tekan <strong>Enter</strong> untuk menambahkan.
            </Alert>
          </Card>

          {/* Submission Card */}
          <Card sx={{ p: 3, border: '1px solid #E5E7EB', borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>Ringkasan Batch</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">Total Baris SKU:</Typography>
              <Typography variant="body2" fontWeight={700}>{items.length}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="body2" color="text.secondary">Item Berubah:</Typography>
              <Typography variant="body2" fontWeight={700} color="primary.main">
                {items.filter(item => item.new_stock !== item.current_stock).length}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={submitting || items.length === 0}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Save />}
              sx={{
                py: 1.5,
                fontWeight: 700,
              }}
            >
              {submitting ? 'Menyimpan...' : 'Upload Perubahan Stok'}
            </Button>
          </Card>
        </Grid>

        {/* Scanned Items Table */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 3, border: '1px solid #E5E7EB', borderRadius: 3, minHeight: 400 }}>
            <Typography variant="h6" fontWeight={700} mb={3}>Daftar Batch Update Stok</Typography>

            {items.length === 0 ? (
              <Box sx={{ py: 8, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <QrCodeScanner sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>Belum ada SKU yang ditambahkan</Typography>
                <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 300, mt: 0.5 }}>
                  Scan barcode SKU produk atau masukkan kode SKU secara manual untuk mulai memperbarui stok.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#FDF5F2' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Produk / Varian</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Kode SKU</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Stok Sistem</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center', width: 120 }}>Stok Baru</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Selisih</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center', width: 60 }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow key={item.sku_code} sx={{ '&:hover': { bgcolor: '#F7EDE9' } }}>
                        <TableCell sx={{ py: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar src={item.picture} variant="rounded" sx={{ width: 40, height: 40 }} />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{item.product_name}</Typography>
                              <Typography variant="caption" color="text.secondary">{item.options_label}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>{item.sku_code}</TableCell>
                        <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>{item.current_stock}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <TextField
                            type="number"
                            size="small"
                            value={item.new_stock}
                            onChange={(e) => handleQtyChange(item.sku_code, e.target.value)}
                            inputProps={{ style: { textAlign: 'center', fontWeight: 700 } }}
                            sx={{ width: '100%' }}
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {getDeltaChip(item.current_stock, item.new_stock)}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Tooltip title="Hapus dari Batch">
                            <IconButton color="error" size="small" onClick={() => handleRemove(item.sku_code)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>
      </Grid>
    </BackofficeLayout>
  );
}

function TableContainer({ children, component, variant }: any) {
  const Component = component || Paper;
  return <Component variant={variant}>{children}</Component>;
}
