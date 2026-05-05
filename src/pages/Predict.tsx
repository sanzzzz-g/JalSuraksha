import { useState } from "react";
import { CloudRain, Droplets, Thermometer, MapPin, Users, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import SqlReveal from "@/components/SqlReveal";
import { sqlPredictionFeatures, sqlPredictionRiskClassification, sqlPredictionInsert } from "@/lib/explainSQL";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface PredictionResult {
  droughtRisk: string;
  rainfallForecast: string;
  waterSecurityScore: number;
  recommendations: string[];
  details: string;
}

const Predict = () => {
  const [region, setRegion] = useState("");
  const [population, setPopulation] = useState("");
  const [avgTemp, setAvgTemp] = useState("");
  const [avgRainfall, setAvgRainfall] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePredict = async () => {
    if (!region.trim()) {
      toast({ title: "Region is required", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    setSaved(false);
    try {
      const { data, error } = await supabase.functions.invoke("predict-drought", {
        body: { region, population: population || "unknown", avgTemp: avgTemp || "unknown", avgRainfall: avgRainfall || "unknown" },
      });
      if (error) throw error;
      setResult(data);

      // Auto-save if logged in
      if (user) {
        await savePrediction(data);
      }
    } catch (e: any) {
      toast({ title: "Prediction failed", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const savePrediction = async (pred: PredictionResult) => {
    if (!user) {
      toast({ title: "Sign in to save", description: "Create an account to save your predictions.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("prediction_history").insert({
      user_id: user.id,
      region,
      population: population || null,
      avg_temp: avgTemp || null,
      avg_rainfall: avgRainfall || null,
      drought_risk: pred.droughtRisk,
      rainfall_forecast: pred.rainfallForecast,
      water_security_score: pred.waterSecurityScore,
      details: pred.details,
      recommendations: pred.recommendations,
    });
    if (error) {
      toast({ title: "Failed to save", variant: "destructive" });
    } else {
      setSaved(true);
      toast({ title: "Prediction saved to history!" });
    }
    setSaving(false);
  };

  const riskColor = (risk: string) => {
    if (risk?.toLowerCase().includes("high") || risk?.toLowerCase().includes("severe")) return "text-destructive";
    if (risk?.toLowerCase().includes("moderate") || risk?.toLowerCase().includes("medium")) return "text-warning";
    return "text-success";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-4 md:px-8 max-w-4xl mx-auto pb-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent rounded-full px-4 py-1.5 text-sm text-accent-foreground mb-4">
            <CloudRain className="h-4 w-4" /> AI-Powered Prediction
          </div>
          <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Drought & Rainfall <span className="text-gradient-ocean">Prediction</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">Enter regional parameters to get AI-powered drought risk assessment and rainfall forecasting.</p>
        </div>

        <Card className="glass rounded-2xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="flex items-center gap-2 mb-2 text-sm"><MapPin className="h-4 w-4 text-primary" /> Region *</Label>
              <Input placeholder="e.g., Tamil Nadu, India" value={region} onChange={e => setRegion(e.target.value)} className="bg-background" />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2 text-sm"><Users className="h-4 w-4 text-primary" /> Population</Label>
              <Input placeholder="e.g., 72 million" value={population} onChange={e => setPopulation(e.target.value)} className="bg-background" />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2 text-sm"><Thermometer className="h-4 w-4 text-primary" /> Avg Temperature (°C)</Label>
              <Input placeholder="e.g., 28.5" value={avgTemp} onChange={e => setAvgTemp(e.target.value)} className="bg-background" />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2 text-sm"><Droplets className="h-4 w-4 text-primary" /> Avg Annual Rainfall (mm)</Label>
              <Input placeholder="e.g., 950" value={avgRainfall} onChange={e => setAvgRainfall(e.target.value)} className="bg-background" />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={handlePredict} disabled={loading} className="bg-gradient-ocean text-primary-foreground shadow-ocean rounded-full px-8 gap-2">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><CloudRain className="h-4 w-4" /> Predict Drought</>}
            </Button>
            {!user && <Button variant="outline" className="rounded-full" onClick={() => navigate("/auth")}>Sign in to save results</Button>}
          </div>
        </Card>

        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass rounded-2xl p-6 text-center">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Drought Risk</p>
                <p className={`font-heading text-2xl font-bold ${riskColor(result.droughtRisk)}`}>{result.droughtRisk}</p>
              </Card>
              <Card className="glass rounded-2xl p-6 text-center">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Rainfall Forecast</p>
                <p className="font-heading text-2xl font-bold text-primary">{result.rainfallForecast}</p>
              </Card>
              <Card className="glass rounded-2xl p-6 text-center">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Water Security</p>
                <p className="font-heading text-2xl font-bold text-secondary">{result.waterSecurityScore}/100</p>
              </Card>
            </div>
            <Card className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading text-lg font-semibold">Analysis</h3>
                {user && !saved && (
                  <Button variant="outline" size="sm" onClick={() => savePrediction(result)} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
                  </Button>
                )}
                {saved && <span className="text-xs text-success flex items-center gap-1">✓ Saved to history</span>}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{result.details}</p>
              <h3 className="font-heading text-lg font-semibold mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {result.recommendations?.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Predict;
