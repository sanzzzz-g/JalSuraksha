import { useState, useEffect } from "react";
import { History, Trash2, AlertTriangle, Shield, ShieldAlert, ShieldCheck, Loader2, Users, Link2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface PredictionRecord {
  id: string;
  region: string;
  population: string | null;
  avg_temp: string | null;
  avg_rainfall: string | null;
  drought_risk: string;
  rainfall_forecast: string | null;
  water_security_score: number | null;
  details: string | null;
  recommendations: string[] | null;
  created_at: string;
  user_id: string;
  // Joined columns from `profiles` (LEFT JOIN ON prediction_history.user_id = profiles.user_id)
  analyst_name: string | null;
  analyst_avatar: string | null;
}

const riskConfig = (risk: string) => {
  const r = risk?.toLowerCase() || "";
  if (r.includes("severe") || r.includes("extreme")) return { color: "text-destructive", bg: "bg-destructive/10 border-destructive/30", icon: ShieldAlert, label: "Severe" };
  if (r.includes("high")) return { color: "text-destructive", bg: "bg-destructive/10 border-destructive/30", icon: ShieldAlert, label: "High" };
  if (r.includes("moderate") || r.includes("medium")) return { color: "text-warning", bg: "bg-warning/10 border-warning/30", icon: AlertTriangle, label: "Moderate" };
  return { color: "text-success", bg: "bg-success/10 border-success/30", icon: ShieldCheck, label: "Low" };
};

const PredictionHistory = () => {
  const [records, setRecords] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  /**
   * Performs a LEFT JOIN between `prediction_history` and `profiles`
   * on `user_id`, equivalent to the MySQL query:
   *
   *   SELECT ph.*, p.display_name AS analyst_name, p.avatar_url AS analyst_avatar
   *   FROM prediction_history ph
   *   LEFT JOIN profiles p ON ph.user_id = p.user_id
   *   ORDER BY ph.created_at DESC;
   *
   * Implemented as two queries + an in-memory hash join because no
   * foreign key is declared between the tables in the schema.
   */
  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }

    const [historyRes, profilesRes] = await Promise.all([
      supabase.from("prediction_history").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, display_name, avatar_url"),
    ]);

    if (historyRes.error) {
      toast({ title: "Failed to load history", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Build hash map for O(1) lookup — the "build" side of a hash join.
    const profileMap = new Map<string, { display_name: string | null; avatar_url: string | null }>();
    (profilesRes.data || []).forEach(p => {
      profileMap.set(p.user_id, { display_name: p.display_name, avatar_url: p.avatar_url });
    });

    // "Probe" each prediction against the profile map (LEFT JOIN — keep prediction even if no profile).
    const joined: PredictionRecord[] = (historyRes.data || []).map(r => {
      const prof = profileMap.get(r.user_id);
      return {
        ...r,
        analyst_name: prof?.display_name ?? null,
        analyst_avatar: prof?.avatar_url ?? null,
      };
    });

    setRecords(joined);
    setLoading(false);
  };

  const deleteRecord = async (id: string) => {
    const { error } = await supabase.from("prediction_history").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
    } else {
      setRecords(prev => prev.filter(r => r.id !== id));
      toast({ title: "Prediction deleted" });
    }
  };

  // Group by risk level
  const highRisk = records.filter(r => {
    const l = r.drought_risk.toLowerCase();
    return l.includes("high") || l.includes("severe") || l.includes("extreme");
  });
  const medRisk = records.filter(r => {
    const l = r.drought_risk.toLowerCase();
    return l.includes("moderate") || l.includes("medium");
  });
  const lowRisk = records.filter(r => {
    const l = r.drought_risk.toLowerCase();
    return l.includes("low") || (!l.includes("high") && !l.includes("severe") && !l.includes("extreme") && !l.includes("moderate") && !l.includes("medium"));
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-4 md:px-8 max-w-6xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold flex items-center gap-3">
              <History className="h-8 w-8 text-primary" /> Prediction History
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{records.length} predictions saved</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : records.length === 0 ? (
          <Card className="glass rounded-2xl p-12 text-center">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-heading text-xl font-semibold mb-2">No predictions yet</h2>
            <p className="text-muted-foreground text-sm mb-6">Run your first drought prediction to see it here.</p>
            <Button onClick={() => navigate("/predict")} className="bg-gradient-ocean text-primary-foreground rounded-full px-6">Make a Prediction</Button>
          </Card>
        ) : (
          <>
            {/* JOIN summary — derived from prediction_history ⨝ profiles ON user_id */}
            <Card className="glass rounded-2xl p-5 mb-6 border-primary/20">
              <div className="flex items-center gap-3">
                <Link2 className="h-7 w-7 text-primary" />
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Users className="h-3 w-3" /> JOIN: prediction_history ⨝ profiles
                  </p>
                  <p className="text-sm font-medium mt-0.5">
                    {new Set(records.filter(r => r.analyst_name).map(r => r.user_id)).size} distinct analyst{new Set(records.filter(r => r.analyst_name).map(r => r.user_id)).size === 1 ? "" : "s"} contributed{" "}
                    {records.length} prediction{records.length === 1 ? "" : "s"}
                    {records.some(r => !r.analyst_name) && ` · ${records.filter(r => !r.analyst_name).length} unmatched (LEFT JOIN preserved)`}
                  </p>
                </div>
              </div>
            </Card>

            {/* Risk Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="glass rounded-2xl p-5 border-destructive/20">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-8 w-8 text-destructive" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">High Risk</p>
                    <p className="font-heading text-3xl font-bold text-destructive">{highRisk.length}</p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{highRisk.map(r => r.region).join(", ") || "None"}</div>
              </Card>
              <Card className="glass rounded-2xl p-5 border-warning/20">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-warning" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Moderate Risk</p>
                    <p className="font-heading text-3xl font-bold text-warning">{medRisk.length}</p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{medRisk.map(r => r.region).join(", ") || "None"}</div>
              </Card>
              <Card className="glass rounded-2xl p-5 border-success/20">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-success" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Low Risk</p>
                    <p className="font-heading text-3xl font-bold text-success">{lowRisk.length}</p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{lowRisk.map(r => r.region).join(", ") || "None"}</div>
              </Card>
            </div>

            {/* Prediction Cards */}
            <div className="space-y-4">
              {records.map(rec => {
                const risk = riskConfig(rec.drought_risk);
                const RiskIcon = risk.icon;
                return (
                  <Card key={rec.id} className="glass rounded-2xl p-6 hover:border-primary/20 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <h3 className="font-heading text-lg font-semibold">{rec.region}</h3>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${risk.bg} ${risk.color}`}>
                            <RiskIcon className="h-3.5 w-3.5" /> {rec.drought_risk}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-primary/20 bg-primary/5 text-primary">
                            <Users className="h-3 w-3" /> {rec.analyst_name || "Unknown analyst"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          <div><p className="text-xs text-muted-foreground">Rainfall</p><p className="text-sm font-medium">{rec.rainfall_forecast || "—"}</p></div>
                          <div><p className="text-xs text-muted-foreground">Water Security</p><p className="text-sm font-medium">{rec.water_security_score != null ? `${rec.water_security_score}/100` : "—"}</p></div>
                          <div><p className="text-xs text-muted-foreground">Temperature</p><p className="text-sm font-medium">{rec.avg_temp && rec.avg_temp !== "unknown" ? `${rec.avg_temp}°C` : "—"}</p></div>
                          <div><p className="text-xs text-muted-foreground">Population</p><p className="text-sm font-medium">{rec.population && rec.population !== "unknown" ? rec.population : "—"}</p></div>
                        </div>
                        {rec.details && <p className="text-xs text-muted-foreground line-clamp-2">{rec.details}</p>}
                        <p className="text-xs text-muted-foreground mt-2">{new Date(rec.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteRecord(rec.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PredictionHistory;
