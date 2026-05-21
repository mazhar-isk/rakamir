'use client';

import { ArrowForward, LocalShipping, Shield, Support } from '@mui/icons-material';
import { Box, Button, Chip, Container, Paper, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';

const features = [
  { icon: LocalShipping, label: 'Gratis Ongkir' },
  { icon: Shield, label: 'Belanja Aman' },
  { icon: Support, label: '24/7 Support' },
];

export default function HeroSection() {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #F9F6F2 0%, #f5ebe5 45%, #EBC4B8 100%)",
      }}
    >
      {/* Blur Background */}
      <Box
        sx={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "#EBC4B8",
          filter: "blur(140px)",
          opacity: 0.35,
          top: -120,
          left: -100,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "#d6a79a",
          filter: "blur(120px)",
          opacity: 0.25,
          bottom: -100,
          right: -80,
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2 }}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={{ xs: 8, lg: 6 }}
          alignItems="center"
          justifyContent="space-between"
        >
          {/* LEFT CONTENT */}
          <Box maxWidth={620}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Chip
                label="✨ Produk Terbaru Sudah Hadir"
                sx={{
                  mb: 4,
                  px: 1,
                  py: 2.5,
                  fontSize: 14,
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.55)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.5)",
                  color: "#7B5E57",
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: {
                    xs: "3rem",
                    md: "4.5rem",
                    lg: "5.5rem",
                  },
                  lineHeight: 1.05,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: "#2E2A27",
                }}
              >
                Belanja Online{" "}
                <Box
                  component="span"
                  sx={{
                    background:
                      "linear-gradient(90deg, #c78f7d 0%, #EBC4B8 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Lebih Mudah
                </Box>{" "}
                & Modern
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <Typography
                sx={{
                  mt: 4,
                  fontSize: { xs: 16, md: 18 },
                  lineHeight: 1.8,
                  color: "#6E625C",
                  maxWidth: 540,
                }}
              >
                Temukan ribuan produk pilihan dengan pengalaman
                belanja yang cepat, aman, dan nyaman untuk seluruh
                kebutuhan Anda.
              </Typography>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                mt={5}
              >
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.8,
                    borderRadius: "18px",
                    textTransform: "none",
                    fontSize: 16,
                    fontWeight: 700,
                    background:
                      "linear-gradient(90deg, #d9a89a 0%, #EBC4B8 100%)",
                    boxShadow: "0 12px 30px rgba(235, 196, 184, 0.35)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 18px 40px rgba(235, 196, 184, 0.45)",
                    },
                  }}
                >
                  Belanja Sekarang →
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.8,
                    borderRadius: "18px",
                    textTransform: "none",
                    fontSize: 16,
                    fontWeight: 700,
                    borderColor: "rgba(0,0,0,0.08)",
                    background: "rgba(255,255,255,0.45)",
                    backdropFilter: "blur(10px)",
                    color: "#4E403B",
                    "&:hover": {
                      background: "rgba(255,255,255,0.7)",
                      borderColor: "transparent",
                    },
                  }}
                >
                  Lihat Promo
                </Button>
              </Stack>
            </motion.div>

            {/* FEATURES */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={4}
                mt={6}
              >
                {[
                  "🚚 Gratis Ongkir",
                  "🛡️ Pembayaran Aman",
                  "💬 24/7 Support",
                ].map((item) => (
                  <Typography
                    key={item}
                    sx={{
                      color: "#6E625C",
                      fontSize: 15,
                      fontWeight: 500,
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Stack>
            </motion.div>
          </Box>

          {/* RIGHT VISUAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Box
              sx={{
                position: "relative",
                width: { xs: 340, md: 520 },
                height: { xs: 340, md: 520 },
              }}
            >
              {/* Main Glass Card */}
              <Paper
                elevation={0}
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "40px",
                  position: "relative",
                  overflow: "hidden",
                  backdropFilter: "blur(24px)",
                  background: "rgba(255,255,255,0.35)",
                  border: "1px solid rgba(255,255,255,0.45)",
                }}
              >
                {/* Glow */}
                <Box
                  sx={{
                    position: "absolute",
                    width: 220,
                    height: 220,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #EBC4B8 0%, #f8e8e2 100%)",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    filter: "blur(10px)",
                    opacity: 0.9,
                  }}
                />

                {/* Product Card */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 4,
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      position: "absolute",
                      top: 40,
                      left: 40,
                      width: 220,
                      p: 2,
                      borderRadius: "28px",
                      background: "#fff",
                    }}
                  >
                    <Box
                      sx={{
                        height: 140,
                        borderRadius: "20px",
                        background:
                          "linear-gradient(135deg, #f5dfd7 0%, #EBC4B8 100%)",
                      }}
                    />

                    <Box
                      sx={{
                        mt: 2,
                        height: 14,
                        width: "70%",
                        borderRadius: 20,
                        bgcolor: "#ececec",
                      }}
                    />

                    <Box
                      sx={{
                        mt: 1,
                        height: 14,
                        width: "45%",
                        borderRadius: 20,
                        bgcolor: "#f3f3f3",
                      }}
                    />
                  </Paper>
                </motion.div>

                {/* Floating Mini Card */}
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 5,
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      position: "absolute",
                      bottom: 40,
                      right: 40,
                      width: 190,
                      p: 2,
                      borderRadius: "24px",
                      background: "#fff",
                    }}
                  >
                    <Stack direction="row" spacing={2}>
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: "16px",
                          background:
                            "linear-gradient(135deg, #EBC4B8 0%, #f5dfd7 100%)",
                        }}
                      />

                      <Box flex={1}>
                        <Box
                          sx={{
                            height: 12,
                            borderRadius: 20,
                            bgcolor: "#ececec",
                            mb: 1,
                          }}
                        />

                        <Box
                          sx={{
                            height: 12,
                            width: "65%",
                            borderRadius: 20,
                            bgcolor: "#f3f3f3",
                          }}
                        />
                      </Box>
                    </Stack>
                  </Paper>
                </motion.div>
              </Paper>
            </Box>
          </motion.div>
        </Stack>
      </Container>
    </Box>
  );

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating blobs */}
      {[{ top: '20%', left: '10%', size: 300, color: 'rgba(108,99,255,0.3)' },
      { top: '60%', right: '10%', size: 250, color: 'rgba(255,101,132,0.2)' }].map((blob, i) => (
        <Box key={i} sx={{ position: 'absolute', ...blob, width: blob.size, height: blob.size, borderRadius: '50%', background: blob.color, filter: 'blur(80px)', animation: 'bounceSoft 3s ease-in-out infinite' }} />
      ))}

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Chip label="✨ Produk Terbaru Sudah Hadir" sx={{ mb: 3, background: 'rgba(108,99,255,0.2)', color: '#9D97FF', border: '1px solid rgba(108,99,255,0.4)', backdropFilter: 'blur(10px)' }} />
          <Typography variant="h1" sx={{ color: 'white', fontWeight: 800, fontSize: { xs: '2.5rem', md: '3.8rem' }, lineHeight: 1.15, mb: 3 }}>
            Belanja Online{' '}
            <Box component="span" sx={{ background: 'linear-gradient(135deg, #6C63FF, #FF6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Lebih Mudah
            </Box>{' '}
            & Terpercaya
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 400, mb: 5, maxWidth: 560, lineHeight: 1.7 }}>
            Temukan ribuan produk pilihan dengan harga terbaik. Pengiriman cepat ke seluruh Indonesia dengan jaminan kepuasan.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 6 }}>
            <Button component={Link} href="/products" variant="contained" size="large"
              endIcon={<ArrowForward />}
              sx={{ background: 'linear-gradient(135deg, #6C63FF, #FF6584)', px: 4, py: 1.5, fontSize: '1rem', boxShadow: '0 8px 32px rgba(108,99,255,0.4)' }}>
              Belanja Sekarang
            </Button>
            <Button component={Link} href="/products?filter=promo" variant="outlined" size="large"
              sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', px: 4, py: 1.5, fontSize: '1rem', '&:hover': { borderColor: '#6C63FF', bgcolor: 'rgba(108,99,255,0.1)' } }}>
              Lihat Promo
            </Button>
          </Box>

          {/* Feature pills */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {features.map(({ icon: Icon, label }) => (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.7)' }}>
                <Icon sx={{ fontSize: 18, color: '#6C63FF' }} />
                <Typography variant="caption" fontWeight={500}>{label}</Typography>
              </Box>
            ))}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
