import { Link } from "react-router-dom";
import { ArrowRight, CloudRain, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
    {/* Background decorations */}
    <div className="absolute inset-0 bg-gradient-ocean-subtle" />
    <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl animate-float" />
    <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-secondary/5 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
    
    {/* Wave decoration */}
    <div className="absolute bottom-0 left-0 right-0 h-24 opacity-10">
      <svg viewBox="0 0 1440 100" className="w-full h-full" preserveAspectRatio="none">
        <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,40 1440,40 L1440,100 L0,100 Z" fill="hsl(var(--primary))" />
      </svg>
    </div>

    <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
      <div className="inline-flex items-center gap-2 bg-accent rounded-full px-4 py-1.5 text-sm text-accent-foreground mb-8">
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        Water Security & Drought Management
      </div>

      <h1 className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95] mb-6">
        Predict <span className="text-gradient-ocean">Drought</span> &<br />
        Secure <span className="text-gradient-ocean">Water</span>
      </h1>

      <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
        Upload datasets, visualize water data, and get AI-powered predictions for drought, rainfall, and water security — all based on regional parameters.
      </p>

      <div className="flex gap-4 justify-center flex-wrap">
        <Link to="/dashboard">
          <Button size="lg" className="bg-gradient-ocean text-primary-foreground shadow-ocean rounded-full px-8 text-base gap-2">
            Upload Dataset <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link to="/predict">
          <Button size="lg" variant="outline" className="rounded-full px-8 text-base gap-2 border-border hover:bg-accent">
            <CloudRain className="h-4 w-4" /> Predict Drought
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 justify-center mt-12">
        {['CSV', 'XLSX', 'JSON', 'XML', 'TSV', 'SQL', 'TXT'].map(fmt => (
          <span key={fmt} className="px-3 py-1 text-xs rounded-lg bg-card border border-border text-muted-foreground">
            {fmt}
          </span>
        ))}
      </div>
    </div>
  </section>
);

export default HeroSection;
