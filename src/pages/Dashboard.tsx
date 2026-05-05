import { useState, useCallback, useMemo } from "react";
import { Upload, BarChart3, Table2, FileText, RotateCcw, Database, Loader2, CheckCircle2, FileSearch, Cog, Code2, Copy, Download, Play, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { parseFile, ParsedData, getNumericColumns, getStats } from "@/lib/parseFile";
import { SAMPLE_DATASETS, SampleDatasetKey } from "@/lib/sampleData";
import { generateFullSQL, generateCreateTable, generateInsertStatements, generateTableName } from "@/lib/generateSQL";
import { sqlRowCount, sqlMin, sqlMax, sqlMean, sqlMedian, sqlChartQuery } from "@/lib/explainSQL";
import SqlReveal from "@/components/SqlReveal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from "recharts";

const COLORS = ["#f43f5e", "#8b5cf6", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#84cc16", "#ef4444", "#6366f1", "#14b8a6", "#d946ef"];
const CHART_TYPES = ["Bar", "Line", "Area", "Scatter", "Pie", "Doughnut", "Radar"] as const;

type Tab = "charts" | "table" | "raw" | "sql";

const loadingSteps = [
  { icon: FileSearch, label: "Reading file..." },
  { icon: Cog, label: "Detecting format..." },
  { icon: Database, label: "Parsing data..." },
  { icon: BarChart3, label: "Building visualizations..." },
  { icon: CheckCircle2, label: "Done!" },
];

const Dashboard = () => {
  const [data, setData] = useState<ParsedData | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [tab, setTab] = useState<Tab>("charts");
  const [chartType, setChartType] = useState<typeof CHART_TYPES[number]>("Bar");
  const [xCol, setXCol] = useState("");
  const [yCol, setYCol] = useState("");
  const [copied, setCopied] = useState(false);
  const [mysqlHost, setMysqlHost] = useState("");
  const [mysqlPort, setMysqlPort] = useState("3306");
  const [mysqlUser, setMysqlUser] = useState("");
  const [mysqlPass, setMysqlPass] = useState("");
  const [mysqlDb, setMysqlDb] = useState("");
  const [mysqlTableName, setMysqlTableName] = useState("");
  const [executing, setExecuting] = useState(false);
  const [execResult, setExecResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  const sqlTableName = useMemo(() => data ? (mysqlTableName || generateTableName(data.fileName)) : "", [data, mysqlTableName]);
  const fullSQL = useMemo(() => data ? generateFullSQL(data, sqlTableName) : "", [data, sqlTableName]);
  const createSQL = useMemo(() => data ? generateCreateTable(data, sqlTableName) : "", [data, sqlTableName]);

  const numCols = useMemo(() => data ? getNumericColumns(data) : [], [data]);

  const animateLoading = async (parseFn: () => Promise<ParsedData>) => {
    setLoading(true);
    setLoadingStep(0);
    const stepInterval = setInterval(() => setLoadingStep(s => Math.min(s + 1, 3)), 500);
    try {
      const parsed = await parseFn();
      clearInterval(stepInterval);
      setLoadingStep(4);
      await new Promise(r => setTimeout(r, 400));
      setData(parsed);
      const nums = getNumericColumns(parsed);
      setXCol(parsed.headers[0] || "");
      setYCol(nums[0] || parsed.headers[1] || "");
      setTab("charts");
    } catch { /* ignore */ }
    clearInterval(stepInterval);
    setLoading(false);
    setLoadingStep(0);
  };

  const handleFile = useCallback(async (file: File) => {
    animateLoading(() => parseFile(file));
  }, []);

  const loadSample = (key: SampleDatasetKey) => {
    const sample = SAMPLE_DATASETS[key];
    animateLoading(async () => ({
      headers: Object.keys(sample.data[0]),
      rows: sample.data as Record<string, string | number>[],
      fileName: `${sample.name}.json`,
      fileType: "sample",
    }));
  };

  const copySQL = async () => {
    await navigator.clipboard.writeText(fullSQL);
    setCopied(true);
    toast({ title: "Copied!", description: "MySQL queries copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSQL = () => {
    const blob = new Blob([fullSQL], { type: "text/sql" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sqlTableName}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const executeOnMySQL = async () => {
    if (!mysqlHost || !mysqlUser || !mysqlDb) {
      toast({ title: "Missing fields", description: "Please fill in host, user, and database name", variant: "destructive" });
      return;
    }
    setExecuting(true);
    setExecResult(null);
    try {
      const { data: res, error } = await supabase.functions.invoke("execute-mysql", {
        body: { host: mysqlHost, port: parseInt(mysqlPort), user: mysqlUser, password: mysqlPass, database: mysqlDb, sql: fullSQL },
      });
      if (error) throw error;
      if (res?.error) throw new Error(res.error);
      setExecResult({ success: true, message: `Table "${sqlTableName}" created with ${data?.rows.length || 0} rows inserted!` });
      toast({ title: "Success!", description: "Table created on your MySQL database" });
    } catch (err: any) {
      setExecResult({ success: false, message: err.message || "Failed to connect" });
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setExecuting(false);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const stats = useMemo(() => {
    if (!data || !yCol) return null;
    const vals = data.rows.map(r => Number(r[yCol])).filter(v => !isNaN(v));
    return getStats(vals);
  }, [data, yCol]);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.rows.slice(0, 200).map(r => ({ ...r }));
  }, [data]);

  const pieData = useMemo(() => {
    if (!data || !xCol || !yCol) return [];
    return data.rows.slice(0, 10).map(r => ({ name: String(r[xCol]), value: Number(r[yCol]) || 0 }));
  }, [data, xCol, yCol]);

  const [chartKey, setChartKey] = useState(0);
  const handleChartSwitch = (t: typeof CHART_TYPES[number]) => {
    setChartType(t);
    setChartKey(k => k + 1);
  };

  const renderChart = () => {
    if (!data || !xCol || !yCol) return <p className="text-muted-foreground text-center py-12">Select X and Y axes</p>;
    const common = { data: chartData, margin: { top: 10, right: 20, bottom: 30, left: 20 } };
    const tooltipStyle = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 };
    switch (chartType) {
      case "Bar": return (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart {...common}>
            <defs>
              {COLORS.map((c, i) => (
                <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={c} stopOpacity={0.5} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={xCol} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} animationDuration={200} />
            <Bar dataKey={yCol} radius={[6,6,0,0]} animationBegin={0} animationDuration={800} animationEasing="ease-out">
              {chartData.map((_, i) => <Cell key={i} fill={`url(#barGrad${i % COLORS.length})`} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
      case "Line": return (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart {...common}>
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="33%" stopColor="#ec4899" />
                <stop offset="66%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={xCol} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} animationDuration={200} />
            <Line type="monotone" dataKey={yCol} stroke="url(#lineGrad)" strokeWidth={3} animationBegin={0} animationDuration={1000} animationEasing="ease-out" dot={({ cx, cy, index }: any) => <circle key={index} cx={cx} cy={cy} r={4} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={1.5} className="transition-all duration-300 hover:r-[6]" />} activeDot={{ r: 7, stroke: "#fff", strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      );
      case "Area": return (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart {...common}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#ec4899" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="areaStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={xCol} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} animationDuration={200} />
            <Area type="monotone" dataKey={yCol} fill="url(#areaGrad)" stroke="url(#areaStroke)" strokeWidth={2.5} animationBegin={0} animationDuration={900} animationEasing="ease-out" dot={({ cx, cy, index }: any) => <circle key={index} cx={cx} cy={cy} r={3.5} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={1} />} />
          </AreaChart>
        </ResponsiveContainer>
      );
      case "Scatter": return (
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart {...common}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={xCol} tick={{ fontSize: 11 }} type="number" />
            <YAxis dataKey={yCol} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} animationDuration={200} />
            <Scatter data={chartData} animationBegin={0} animationDuration={800} animationEasing="ease-out" shape={({ cx, cy, index }: any) => <circle key={index} cx={cx} cy={cy} r={6} fill={COLORS[index % COLORS.length]} fillOpacity={0.85} stroke={COLORS[index % COLORS.length]} strokeWidth={1.5} strokeOpacity={0.4} style={{ transition: 'all 0.3s ease' }} />} />
          </ScatterChart>
        </ResponsiveContainer>
      );
      case "Pie": case "Doughnut": return (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <defs>
              {COLORS.map((c, i) => (
                <linearGradient key={i} id={`pieGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={c} stopOpacity={1} />
                  <stop offset="100%" stopColor={c} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={chartType === "Doughnut" ? 60 : 0} outerRadius={110} label strokeWidth={2} stroke="hsl(var(--background))" animationBegin={0} animationDuration={900} animationEasing="ease-out">
              {pieData.map((_, i) => <Cell key={i} fill={`url(#pieGrad${i % COLORS.length})`} />)}
            </Pie>
            <Tooltip animationDuration={200} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
      case "Radar": return (
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={pieData} cx="50%" cy="50%" outerRadius={100}>
            <defs>
              <linearGradient id="radarGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#ec4899" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis />
            <Radar dataKey="value" stroke="#8b5cf6" fill="url(#radarGrad)" strokeWidth={2} animationBegin={0} animationDuration={800} animationEasing="ease-out" dot={{ r: 4, fill: "#ec4899", stroke: "#fff", strokeWidth: 1.5 }} />
          </RadarChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 md:px-8 max-w-7xl mx-auto pb-20">
        {!data && !loading ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
            <div
              className={`w-full max-w-2xl border-2 border-dashed rounded-3xl p-16 text-center transition-all cursor-pointer ${dragOver ? "border-primary bg-accent" : "border-border hover:border-primary/40 hover:bg-accent/50"}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-ocean-subtle flex items-center justify-center animate-float">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-heading text-2xl font-bold mb-3">Drop your data file here</h2>
              <p className="text-muted-foreground text-sm mb-6">or click to browse — all formats supported</p>
              <div className="flex gap-2 flex-wrap justify-center">
                {[".csv",".xlsx",".xls",".ods",".json",".tsv",".xml",".sql",".html",".txt"].map(f => (
                  <span key={f} className="px-2 py-0.5 text-xs bg-card border border-border rounded text-muted-foreground">{f}</span>
                ))}
              </div>
              <input id="fileInput" type="file" className="hidden" accept=".csv,.xlsx,.xls,.json,.tsv,.txt,.ods,.xml,.sql,.html,.htm,.tab" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>

            {/* Sample Datasets */}
            <div className="w-full max-w-2xl">
              <p className="text-sm text-muted-foreground text-center mb-4">Or try a sample water security dataset:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(Object.entries(SAMPLE_DATASETS) as [SampleDatasetKey, typeof SAMPLE_DATASETS[SampleDatasetKey]][]).map(([key, ds]) => (
                  <button key={key} onClick={() => loadSample(key)} className="glass rounded-xl p-4 text-left hover:border-primary/30 transition-all hover:-translate-y-1">
                    <Database className="h-5 w-5 text-primary mb-2" />
                    <p className="font-heading text-sm font-semibold">{ds.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{ds.description}</p>
                    <p className="text-xs text-primary mt-2">{ds.data.length} rows →</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : loading ? (
          /* Loading Animation */
          <div className="flex items-center justify-center min-h-[70vh]">
            <Card className="glass rounded-3xl p-10 w-full max-w-md text-center">
              <Loader2 className="h-12 w-12 text-primary mx-auto mb-6 animate-spin" />
              <h2 className="font-heading text-xl font-bold mb-6">Processing your data</h2>
              <div className="space-y-3">
                {loadingSteps.map((step, i) => {
                  const StepIcon = step.icon;
                  const isActive = i === loadingStep;
                  const isDone = i < loadingStep;
                  return (
                    <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${isActive ? "bg-primary/10 border border-primary/20" : isDone ? "bg-success/5" : "opacity-40"}`}>
                      <StepIcon className={`h-5 w-5 shrink-0 ${isDone ? "text-success" : isActive ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                      <span className={`text-sm ${isActive ? "text-foreground font-medium" : isDone ? "text-success" : "text-muted-foreground"}`}>{step.label}</span>
                      {isDone && <CheckCircle2 className="h-4 w-4 text-success ml-auto" />}
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-ocean rounded-full transition-all duration-500" style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }} />
              </div>
            </Card>
          </div>
        ) : data ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <h1 className="font-heading text-2xl font-bold">{data.fileName}</h1>
                <p className="text-sm text-muted-foreground">{data.rows.length} rows · {data.headers.length} columns · .{data.fileType}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setData(null)}><RotateCcw className="h-3.5 w-3.5" /> New File</Button>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                {[
                  { label: "Rows", value: data.rows.length, color: "text-primary", sql: sqlRowCount(sqlTableName) },
                  { label: "Min", value: stats.min.toFixed(2), color: "text-secondary", sql: sqlMin(sqlTableName, yCol) },
                  { label: "Max", value: stats.max.toFixed(2), color: "text-warning", sql: sqlMax(sqlTableName, yCol) },
                  { label: "Mean", value: stats.mean.toFixed(2), color: "text-primary", sql: sqlMean(sqlTableName, yCol) },
                  { label: "Median", value: stats.median.toFixed(2), color: "text-success", sql: sqlMedian(sqlTableName, yCol) },
                ].map(s => (
                  <Card key={s.label} className="p-4 glass">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{s.label}</p>
                    <p className={`font-heading text-2xl font-bold ${s.color} mb-2`}>{s.value}</p>
                    <SqlReveal sql={s.sql} />
                  </Card>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-0 bg-card border border-border rounded-xl p-1 w-fit mb-6">
              {([["charts", BarChart3, "Charts"], ["table", Table2, "Data Table"], ["sql", Code2, "MySQL"], ["raw", FileText, "Raw"]] as const).map(([key, Icon, label]) => (
                <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${tab === key ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>

            {/* Charts Tab */}
            {tab === "charts" && (
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  <label className="text-sm text-muted-foreground">X Axis</label>
                  <select value={xCol} onChange={e => setXCol(e.target.value)} className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-foreground">
                    {data.headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <label className="text-sm text-muted-foreground">Y Axis</label>
                  <select value={yCol} onChange={e => setYCol(e.target.value)} className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-foreground">
                    {data.headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <div className="flex gap-1 flex-wrap">
                    {CHART_TYPES.map(t => (
                      <button key={t} onClick={() => handleChartSwitch(t)} className={`px-3 py-1 rounded-lg text-xs transition-all duration-200 ${chartType === t ? "bg-primary/10 text-primary border border-primary/30 scale-105" : "bg-card border border-border text-muted-foreground hover:text-foreground hover:scale-105"}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <Card className="glass p-6 rounded-2xl overflow-hidden">
                  <div key={chartKey} className="animate-fade-in">
                    {renderChart()}
                  </div>
                  {xCol && yCol && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <SqlReveal
                        variant="button"
                        label="View SQL behind this chart"
                        sql={sqlChartQuery(sqlTableName, xCol, yCol, chartType)}
                      />
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Table Tab */}
            {tab === "table" && (
              <Card className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>{data.headers.map(h => <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {data.rows.slice(0, 200).map((r, i) => (
                        <tr key={i} className="border-t border-border hover:bg-muted/30">
                          {data.headers.map(h => <td key={h} className="px-4 py-2 text-foreground max-w-[200px] truncate">{String(r[h] ?? "")}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {data.rows.length > 200 && <p className="text-xs text-muted-foreground p-3 border-t border-border">Showing 200 of {data.rows.length} rows</p>}
              </Card>
            )}

            {/* SQL Tab */}
            {tab === "sql" && (
              <div className="space-y-6">
                {/* Table name config */}
                <div className="flex items-center gap-3">
                  <label className="text-sm text-muted-foreground">Table name:</label>
                  <input
                    value={mysqlTableName || sqlTableName}
                    onChange={e => setMysqlTableName(e.target.value)}
                    className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-foreground w-48"
                    placeholder={sqlTableName}
                  />
                </div>

                {/* SQL Preview */}
                <Card className="glass rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-primary" />
                      <span className="font-heading text-sm font-semibold">Generated MySQL Queries</span>
                      <span className="text-xs text-muted-foreground">({data.rows.length} rows)</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={copySQL}>
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadSQL}>
                        <Download className="h-3.5 w-3.5" /> Download .sql
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-[400px] overflow-auto p-4">
                    <pre className="text-xs text-foreground font-mono whitespace-pre-wrap leading-relaxed">
                      <code>{fullSQL}</code>
                    </pre>
                  </div>
                </Card>

                {/* CREATE TABLE only preview */}
                <Card className="glass rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">CREATE TABLE only</p>
                  <pre className="text-xs text-primary/80 font-mono whitespace-pre-wrap bg-muted/30 rounded-lg p-3">{createSQL}</pre>
                </Card>

                {/* MySQL Connection Panel */}
                <Card className="glass rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Database className="h-5 w-5 text-primary" />
                    <h3 className="font-heading text-lg font-semibold">Execute on MySQL Database</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect to your MySQL server to automatically create the table and insert data.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Host</label>
                      <input value={mysqlHost} onChange={e => setMysqlHost(e.target.value)} placeholder="localhost or IP" className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Port</label>
                      <input value={mysqlPort} onChange={e => setMysqlPort(e.target.value)} placeholder="3306" className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Username</label>
                      <input value={mysqlUser} onChange={e => setMysqlUser(e.target.value)} placeholder="root" className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Password</label>
                      <input type="password" value={mysqlPass} onChange={e => setMysqlPass(e.target.value)} placeholder="••••••" className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-muted-foreground mb-1 block">Database Name</label>
                      <input value={mysqlDb} onChange={e => setMysqlDb(e.target.value)} placeholder="my_database" className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                    </div>
                  </div>

                  {execResult && (
                    <div className={`flex items-start gap-2 p-3 rounded-lg mb-4 text-sm ${execResult.success ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                      {execResult.success ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> : <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
                      {execResult.message}
                    </div>
                  )}

                  <Button onClick={executeOnMySQL} disabled={executing} className="gap-2">
                    {executing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    {executing ? "Executing..." : "Create Table & Insert Data"}
                  </Button>
                </Card>
              </div>
            )}

            {/* Raw Tab */}
            {tab === "raw" && (
              <Card className="glass rounded-2xl p-6">
                <pre className="text-xs text-muted-foreground max-h-[500px] overflow-auto whitespace-pre-wrap">{JSON.stringify(data.rows.slice(0, 50), null, 2)}</pre>
              </Card>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Dashboard;
