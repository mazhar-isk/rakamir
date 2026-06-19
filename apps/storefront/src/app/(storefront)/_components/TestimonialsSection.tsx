'use client';

import { Box, Card, Container, Grid, Rating, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "Koleksi tas kulit dari Rakamir benar-benar melengkapi setiap gaya saya dengan keanggunan yang mewah. Desainnya elegan, jahitannya sangat rapi, dan material kulitnya terasa sangat premium serta tahan lama.",
    author: "Clara Setyaningrum",
    role: "Desainer Mode & Kolektor",
    rating: 5,
  },
  {
    quote: "Sangat menyukai komitmen mereka pada detail dan kualitas. Tas kerja minimalis yang saya beli di sini sangat fungsional, muat laptop, namun tetap terlihat anggun dan profesional saat dibawa rapat.",
    author: "Alya Wibowo",
    role: "Arsitek & Pengusaha",
    rating: 5,
  },
  {
    quote: "Dari shoulder bag yang chic hingga tote bag serbaguna, pengerjaan (craftsmanship) tas Rakamir sangat luar biasa. Modelnya yang timeless sangat mudah dipadukan dengan berbagai gaya pakaian.",
    author: "Nadia Utami",
    role: "Penulis Mode & Gaya Hidup",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <Box sx={{ py: 10, bgcolor: '#FFFFFF', borderTop: '1px solid rgba(235, 196, 184, 0.25)' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#D26B54', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '0.15em', 
              fontSize: '0.75rem',
              mb: 1.5,
              display: 'block'
            }}
          >
            TESTIMONIALS
          </Typography>
          <Typography 
            variant="h3" 
            fontWeight={700} 
            sx={{ 
              color: '#2E2A27', 
              fontFamily: '"Playfair Display", serif',
              letterSpacing: '-0.02em',
              mb: 2 
            }}
          >
            Apa Kata Mereka
          </Typography>
          <Typography variant="body1" sx={{ color: '#7B6E66', maxWidth: 500, mx: 'auto', fontSize: '0.95rem' }}>
            Pengalaman nyata dari mereka yang menghargai keindahan detail, estetika desain, dan kualitas pengerjaan terbaik.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {testimonials.map((t, i) => (
            <Grid item xs={12} md={4} key={t.author}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: '100%' }}
              >
                <Card
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    bgcolor: '#FDFBF9',
                    border: '1px solid rgba(235, 196, 184, 0.15)',
                    borderRadius: '16px',
                    boxShadow: 'none',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(110, 98, 92, 0.04)',
                      borderColor: 'rgba(210, 107, 84, 0.2)'
                    }
                  }}
                >
                  <Box>
                    <Rating value={t.rating} size="small" readOnly sx={{ color: '#D26B54', mb: 2.5 }} />
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontStyle: 'italic', 
                        color: '#6E625C', 
                        lineHeight: 1.8, 
                        fontSize: '0.95rem',
                        mb: 4 
                      }}
                    >
                      “{t.quote}”
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#2E2A27', fontSize: '0.9rem' }}>
                      {t.author}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#7B6E66' }}>
                      {t.role}
                    </Typography>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
