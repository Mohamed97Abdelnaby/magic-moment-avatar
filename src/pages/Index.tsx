import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import EventSetup from "@/components/EventSetup";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <EventSetup />
    </div>
  );
};

export default Index;
