import StorefrontLayout from '@/components/layout/StorefrontLayout';
import type { Metadata } from 'next';
import BestSellersSection from './_components/BestSellersSection';
import CategorySection from './_components/CategorySection';
import FeaturedSection from './_components/FeaturedSection';
import HeroSection from './_components/HeroSection';
import NewArrivalsSection from './_components/NewArrivalsSection';
import PromoSection from './_components/PromoSection';
import TestimonialsSection from './_components/TestimonialsSection';

export const metadata: Metadata = {
  title: 'Rakamir Webstore — Belanja Online Terpercaya',
  description: 'Temukan ribuan produk berkualitas dengan harga terbaik. Belanja online mudah, cepat, dan terpercaya.',
};

export default function HomePage() {
  return (
    <StorefrontLayout>
      {/* 2. Hero with featured product */}
      <HeroSection />

      {/* 3. Category cards */}
      <CategorySection />

      {/* 4. Product grid */}
      <NewArrivalsSection />

      {/* 5. Promotional banner */}
      <PromoSection />

      {/* 6. Featured collection */}
      <FeaturedSection />

      {/* Best Sellers Section */}
      <BestSellersSection />

      {/* 7. Testimonials */}
      <TestimonialsSection />

      {/* 8. Newsletter */}
      {/* <NewsletterSection /> */}
    </StorefrontLayout>
  );
}
