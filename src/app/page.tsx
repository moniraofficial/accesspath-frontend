import CtaBannerSection from "@/components/home/CtaBannerSection";
import ExploreCategoriesSection from "@/components/home/ExploreCategoriesSection";
import FeatureStrip from "@/components/home/FeatureStrip";
import HeroSection from "@/components/home/HeroSection";
import SmartNavigationSection from "@/components/home/SmartNavigationSection";
import StatsSection from "@/components/home/StatsSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection />
      <FeatureStrip />
      <SmartNavigationSection />
      <ExploreCategoriesSection />
      <StatsSection />
      <CtaBannerSection />
    </main>
  );
}
