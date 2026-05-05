import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import { Droplets } from "lucide-react";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    <FeaturesSection />
    <footer className="border-t border-border py-8 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-primary" />
          <span className="font-heading text-sm font-bold text-gradient-ocean">JalSuraksha</span>
        </div>
        <p className="text-xs text-muted-foreground">© 2024 DataFlow — VIT Chennai · Water Security & Drought Management</p>
      </div>
    </footer>
  </div>
);

export default Index;
