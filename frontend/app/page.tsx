import type { Metadata } from 'next';
import { HeroSection } from '@/components/homepage/HeroSection';
import { StatsBar } from '@/components/homepage/StatsBar';
import { CategoryGrid } from '@/components/homepage/CategoryGrid';
import { FeaturedJobs } from '@/components/homepage/FeaturedJobs';
import { HowItWorks } from '@/components/homepage/HowItWorks';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'KaamKaaj — India\'s #1 Job Platform',
  description:
    'Find your dream job from 50 Lakh+ opportunities. Connect with top employers across India. Free job search for candidates.',
};

export default function HomePage() {
  return (
    <>
      <main>
        <HeroSection />
        <StatsBar />
        <CategoryGrid />
        <FeaturedJobs />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
