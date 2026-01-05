import { ModernNavigation } from './components/ModernNavigation';
import { BlogHeroSection } from './components/BlogHeroSection';
import { FeaturedSection } from './components/FeaturedSection';
import { TrendingSection } from './components/TrendingSection';
import { LatestSection } from './components/LatestSection';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <ModernNavigation />
      <BlogHeroSection />
      <FeaturedSection />
      <TrendingSection />
      <LatestSection />
      <Footer />
    </div>
  );
}