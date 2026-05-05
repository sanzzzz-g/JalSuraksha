import { useMemo, useState } from "react";
import { Upload, Table2, Link2, Loader2, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parseFile, ParsedData } from "@/lib/parseFile";
import { useToast } from "@/hooks/use-toast";

type JoinType = "INNER" | "LEFT" | "RIGHT" | "FULL";

const JoinTables = () => {
  const { toast } = useToast();
  const [tableA, setTableA] = useState<ParsedData | null>(null);
  const [tableB, setTableB] = useState<ParsedData | null>(null);
  const [keyA, setKeyA] = useState<string>("");
  const [keyB, setKeyB] = useState<string>("");
  const [joinType, setJoinType] = useState<JoinType>("INNER");
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file: File, which: "A" | "B") => {
    setLoading(true);
    try {
      const data = await parseFile(file);
      if (which === "A") {
        setTableA(data);
        setKeyA(data.headers[0] || "");
      } else {
        setTableB(data);
        setKeyB(data.headers[0] || "");
      }
      toast({ title: `Table ${which} loaded`, description: `${data.rows.length} rows, ${data.headers.length} columns` });
    } catch (e: any) {
      toast({ title: "Failed to parse", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  };

  // Compute joined rows
  const joined = useMemo(() => {
    if (!tableA || !tableB || !keyA || !keyB) return null;
    const aCols = tableA.headers.map(h => `A.${h}`);
    const bCols = tableB.headers.map(h => `B.${h}`);
    const headers = [...aCols, ...bCols];

    const indexB = new Map<string, Record<string, any>[]>();
    for (const r of tableB.rows) {
      const k = String(r[keyB] ?? "");
      if (!indexB.has(k)) indexB.set(k, []);
      indexB.get(k)!.push(r);
    }
    const indexA = new Map<string, Record<string, any>[]>();
    for (const r of tableA.rows) {
      const k = String(r[keyA] ?? "");
      if (!indexA.has(k)) indexA.set(k, []);
      indexA.get(k)!.push(r);
    }

    const rows: Record<string, any>[] = [];
    const matchedBKeys = new Set<string>();

    for (const a of tableA.rows) {
      const k = String(a[keyA] ?? "");
      const matches = indexB.get(k);
      if (matches && matches.length) {
        matchedBKeys.add(k);
        for (const b of matches) {
          const row: Record<string, any> = {};
          tableA.headers.forEach(h => row[`A.${h}`] = a[h] ?? "");
          tableB.headers.forEach(h => row[`B.${h}`] = b[h] ?? "");
          rows.push(row);
        }
      } else if (joinType === "LEFT" || joinType === "FULL") {
        const row: Record<string, any> = {};
        tableA.headers.forEach(h => row[`A.${h}`] = a[h] ?? "");
        tableB.headers.forEach(h => row[`B.${h}`] = "");
        rows.push(row);
      }
    }

    if (joinType === "RIGHT" || joinType === "FULL") {
      for (const b of tableB.rows) {
        const k = String(b[keyB] ?? "");
        if (!indexA.has(k)) {
          const row: Record<string, any> = {};
          tableA.headers.forEach(h => row[`A.${h}`] = "");
          tableB.headers.forEach(h => row[`B.${h}`] = b[h] ?? "");
          rows.push(row);
        }
      }
    }

    return { headers, rows };
  }, [tableA, tableB, keyA, keyB, joinType]);

  // Initialize visible columns when join changes
  const allHeaders = joined?.headers || [];
  const effectiveVisible = (h: string) => visibleCols[h] !== false; // default true
  const shownHeaders = allHeaders.filter(effectiveVisible);

  const toggleCol = (h: string) => setVisibleCols(s => ({ ...s, [h]: !effectiveVisible(h) }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-4 md:px-8 max-w-7xl mx-auto pb-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-accent rounded-full px-4 py-1.5 text-sm text-accent-foreground mb-4">
            <Link2 className="h-4 w-4" /> Relational JOIN
          </div>
          <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight mb-4">
            JOIN <span className="text-gradient-ocean">Two Tables</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Upload two datasets, pick the join keys, and view a curated subset of the joined result.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {(["A", "B"] as const).map(which => {
            const data = which === "A" ? tableA : tableB;
            return (
              <Card key={which} className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                    <Table2 className="h-4 w-4 text-primary" /> Table {which}
                  </h3>
                  {data && <span className="text-xs text-muted-foreground">{data.rows.length} rows · {data.headers.length} cols</span>}
                </div>
                <Label htmlFor={`file-${which}`} className="block">
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {data ? data.fileName : "Click to upload (CSV, JSON, XLSX, …)"}
                    </p>
                  </div>
                  <input
                    id={`file-${which}`}
                    type="file"
                    className="hidden"
                    accept=".csv,.tsv,.json,.xlsx,.xls,.xml,.sql,.html,.txt"
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], which)}
                  />
                </Label>
              </Card>
            );
          })}
        </div>

        {tableA && tableB && (
          <Card className="glass rounded-2xl p-6 mb-6">
            <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" /> JOIN configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs mb-1.5 block">Table A key</Label>
                <Select value={keyA} onValueChange={setKeyA}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {tableA.headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Table B key</Label>
                <Select value={keyB} onValueChange={setKeyB}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {tableB.headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Join type</Label>
                <Select value={joinType} onValueChange={(v) => setJoinType(v as JoinType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INNER">INNER JOIN</SelectItem>
                    <SelectItem value="LEFT">LEFT JOIN</SelectItem>
                    <SelectItem value="RIGHT">RIGHT JOIN</SelectItem>
                    <SelectItem value="FULL">FULL OUTER JOIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}

        {joined && (
          <Card className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" /> Visible columns (user view)
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setVisibleCols(Object.fromEntries(allHeaders.map(h => [h, true])))}>Show all</Button>
                <Button variant="outline" size="sm" onClick={() => setVisibleCols(Object.fromEntries(allHeaders.map(h => [h, false])))}>Hide all</Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {allHeaders.map(h => {
                const on = effectiveVisible(h);
                return (
                  <button
                    key={h}
                    onClick={() => toggleCol(h)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${on ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border"}`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {joined && (
          <Card className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-lg font-semibold">Joined result</h3>
              <span className="text-xs text-muted-foreground">{joined.rows.length} rows · {shownHeaders.length}/{allHeaders.length} columns shown</span>
            </div>
            {shownHeaders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No columns selected — toggle columns above to build the user view.</p>
            ) : (
              <div className="overflow-auto max-h-[60vh] rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      {shownHeaders.map(h => (
                        <th key={h} className="text-left px-3 py-2 font-medium text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {joined.rows.slice(0, 500).map((r, i) => (
                      <tr key={i} className="border-t border-border hover:bg-muted/50">
                        {shownHeaders.map(h => (
                          <td key={h} className="px-3 py-2 whitespace-nowrap text-foreground">{String(r[h] ?? "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {joined.rows.length > 500 && (
                  <p className="text-xs text-muted-foreground text-center py-2 border-t border-border">Showing first 500 of {joined.rows.length} rows</p>
                )}
              </div>
            )}
          </Card>
        )}

        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinTables;
