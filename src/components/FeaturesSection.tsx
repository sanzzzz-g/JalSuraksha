import { BarChart3, Brain, CloudRain, FileUp, Lock, MapPin } from "lucide-react";

const features = [
  { icon: FileUp, title: "10+ File Formats", desc: "CSV, Excel, JSON, XML, TSV, SQL — all parsed in your browser with zero server uploads.", color: "text-primary" },
  { icon: Brain, title: "AI-Powered Insights", desc: "Get smart analysis of your water data with drought predictions and rainfall forecasting.", color: "text-secondary" },
  { icon: MapPin, title: "Region-Based Prediction", desc: "Enter your region and get tailored drought risk assessments and water security scores.", color: "text-warning" },
  { icon: BarChart3, title: "7 Chart Types", desc: "Bar, Line, Area, Scatter, Pie, Doughnut, and Radar charts with full control.", color: "text-primary" },
  { icon: CloudRain, title: "Rainfall Forecasting", desc: "Statistical models analyze historical patterns to predict future rainfall trends.", color: "text-ocean-light" },
  { icon: Lock, title: "100% Private", desc: "All data processing runs locally. Your datasets never leave your browser.", color: "text-success" },
];

const FeaturesSection = () => (
  <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <p className="text-xs uppercase tracking-widest text-primary mb-3">Capabilities</p>
      <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight mb-4">Built for water data analysis</h2>
      <p className="text-muted-foreground max-w-md mx-auto">From raw datasets to actionable drought predictions — everything you need in one platform.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {features.map(f => (
        <div key={f.title} className="glass rounded-2xl p-6 hover:border-primary/30 transition-all hover:-translate-y-1 group">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
            <f.icon className={`h-6 w-6 ${f.color}`} />
          </div>
          <h3 className="font-heading font-semibold text-lg mb-2">{f.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default FeaturesSection;
