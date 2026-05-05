import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface ParsedData {
  headers: string[];
  rows: Record<string, string | number>[];
  fileName: string;
  fileType: string;
}

// Flatten nested objects: { a: { b: 1 } } → { "a.b": 1 }
function flattenObj(obj: Record<string, any>, prefix = ""): Record<string, string | number> {
  const result: Record<string, string | number> = {};
  for (const key of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      Object.assign(result, flattenObj(val, path));
    } else {
      result[path] = Array.isArray(val) ? JSON.stringify(val) : (val ?? "");
    }
  }
  return result;
}

// Try parsing text as CSV/TSV/JSON in order (smart fallback for .txt)
function smartParse(text: string, fileName: string): ParsedData | null {
  // Try JSON first
  try {
    let data = JSON.parse(text);
    if (!Array.isArray(data)) data = [data];
    if (data.length > 0 && typeof data[0] === "object") {
      const flat = data.map((r: any) => flattenObj(r));
      return { headers: Object.keys(flat[0]), rows: flat, fileName, fileType: "json" };
    }
  } catch { /* not JSON */ }

  // Try tab-separated
  const tsvResult = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: true, delimiter: "\t" });
  if (tsvResult.meta.fields && tsvResult.meta.fields.length > 1 && tsvResult.data.length > 0) {
    return { headers: tsvResult.meta.fields, rows: tsvResult.data as Record<string, string | number>[], fileName, fileType: "tsv" };
  }

  // Try comma-separated
  const csvResult = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: true });
  if (csvResult.meta.fields && csvResult.meta.fields.length > 1 && csvResult.data.length > 0) {
    return { headers: csvResult.meta.fields, rows: csvResult.data as Record<string, string | number>[], fileName, fileType: "csv" };
  }

  return null;
}

// Parse XML text — find repeating elements and extract attributes/children
function parseXML(text: string, fileName: string): ParsedData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/xml");

  // Find the most common child element tag under root
  const root = doc.documentElement;
  const tagCounts: Record<string, number> = {};
  for (const child of Array.from(root.children)) {
    tagCounts[child.tagName] = (tagCounts[child.tagName] || 0) + 1;
  }
  const rowTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!rowTag) throw new Error("No repeating XML elements found");

  const elements = root.getElementsByTagName(rowTag);
  const rows: Record<string, string | number>[] = [];
  const headerSet = new Set<string>();

  for (const el of Array.from(elements)) {
    const row: Record<string, string | number> = {};
    // Attributes
    for (const attr of Array.from(el.attributes)) {
      row[attr.name] = attr.value;
      headerSet.add(attr.name);
    }
    // Child elements
    for (const child of Array.from(el.children)) {
      const val = child.textContent?.trim() || "";
      const numVal = Number(val);
      row[child.tagName] = val !== "" && !isNaN(numVal) ? numVal : val;
      headerSet.add(child.tagName);
    }
    rows.push(row);
  }

  return { headers: Array.from(headerSet), rows, fileName, fileType: "xml" };
}

// Parse SQL — extract INSERT INTO values and CREATE TABLE columns
function parseSQL(text: string, fileName: string): ParsedData {
  const rows: Record<string, string | number>[] = [];
  let headers: string[] = [];

  // Try to get column names from CREATE TABLE
  const createMatch = text.match(/CREATE\s+TABLE\s+\S+\s*\(([\s\S]*?)\)/i);
  if (createMatch) {
    headers = createMatch[1]
      .split(",")
      .map(col => col.trim().split(/\s+/)[0].replace(/[`"[\]]/g, ""))
      .filter(c => c && !c.toUpperCase().startsWith("PRIMARY") && !c.toUpperCase().startsWith("CONSTRAINT") && !c.toUpperCase().startsWith("FOREIGN"));
  }

  // Extract INSERT INTO values
  const insertRegex = /INSERT\s+INTO\s+\S+\s*(?:\([^)]*\)\s*)?VALUES\s*\(([^)]+)\)/gi;
  let match;
  while ((match = insertRegex.exec(text)) !== null) {
    const vals = match[1].split(",").map(v => {
      const trimmed = v.trim().replace(/^['"]|['"]$/g, "");
      const num = Number(trimmed);
      return trimmed !== "" && !isNaN(num) ? num : trimmed;
    });

    // If no headers from CREATE TABLE, generate generic ones
    if (headers.length === 0) {
      headers = vals.map((_, i) => `col_${i + 1}`);
    }

    const row: Record<string, string | number> = {};
    vals.forEach((v, i) => { row[headers[i] || `col_${i + 1}`] = v; });
    rows.push(row);
  }

  if (rows.length === 0) throw new Error("No INSERT statements found in SQL file");
  return { headers, rows, fileName, fileType: "sql" };
}

// Parse HTML — extract <table> elements
function parseHTML(text: string, fileName: string): ParsedData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");
  const table = doc.querySelector("table");
  if (!table) throw new Error("No <table> found in HTML");

  const thElements = table.querySelectorAll("thead th, tr:first-child th, tr:first-child td");
  const headers: string[] = [];
  thElements.forEach(th => headers.push(th.textContent?.trim() || ""));

  const bodyRows = table.querySelectorAll("tbody tr, tr");
  const rows: Record<string, string | number>[] = [];
  const startIdx = headers.length > 0 ? 1 : 0;

  for (let i = startIdx; i < bodyRows.length; i++) {
    const cells = bodyRows[i].querySelectorAll("td");
    if (cells.length === 0) continue;
    const row: Record<string, string | number> = {};
    cells.forEach((cell, j) => {
      const key = headers[j] || `col_${j + 1}`;
      const val = cell.textContent?.trim() || "";
      const num = Number(val);
      row[key] = val !== "" && !isNaN(num) ? num : val;
    });
    rows.push(row);
  }

  if (headers.length === 0 && rows.length > 0) {
    return { headers: Object.keys(rows[0]), rows, fileName, fileType: "html" };
  }
  return { headers, rows, fileName, fileType: "html" };
}

export function parseFile(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";

    // Excel binary formats
    if (["xlsx", "xls", "ods"].includes(ext)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target?.result, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws);
          const headers = json.length > 0 ? Object.keys(json[0]) : [];
          resolve({ headers, rows: json, fileName: file.name, fileType: ext });
        } catch (err) { reject(err); }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    // All text-based formats
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        if (ext === "json") {
          let data = JSON.parse(text);
          if (!Array.isArray(data)) data = [data];
          const flat = data.map((r: any) => typeof r === "object" && r !== null ? flattenObj(r) : { value: r });
          const headers = flat.length > 0 ? Object.keys(flat[0]) : [];
          resolve({ headers, rows: flat, fileName: file.name, fileType: "json" });
        } else if (ext === "xml") {
          resolve(parseXML(text, file.name));
        } else if (ext === "sql") {
          resolve(parseSQL(text, file.name));
        } else if (["html", "htm"].includes(ext)) {
          resolve(parseHTML(text, file.name));
        } else if (["csv", "tsv", "tab"].includes(ext)) {
          Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            delimiter: ext === "csv" ? "," : "\t",
            complete: (result) => {
              resolve({ headers: result.meta.fields || [], rows: result.data as Record<string, string | number>[], fileName: file.name, fileType: ext });
            },
            error: (err) => reject(err),
          });
        } else {
          // Smart fallback for .txt and unknown extensions
          const result = smartParse(text, file.name);
          if (result) {
            resolve(result);
          } else {
            // Last resort: try PapaParse auto-detect
            Papa.parse(text, {
              header: true,
              skipEmptyLines: true,
              dynamicTyping: true,
              complete: (result) => {
                if (result.meta.fields && result.meta.fields.length > 0 && result.data.length > 0) {
                  resolve({ headers: result.meta.fields, rows: result.data as Record<string, string | number>[], fileName: file.name, fileType: ext || "txt" });
                } else {
                  reject(new Error(`Could not parse file: ${file.name}`));
                }
              },
              error: (err) => reject(err),
            });
          }
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
}

export function getNumericColumns(data: ParsedData): string[] {
  return data.headers.filter(h =>
    data.rows.some(r => typeof r[h] === "number" && !isNaN(r[h] as number))
  );
}

export function getStats(values: number[]) {
  const clean = values.filter(v => typeof v === "number" && !isNaN(v));
  if (clean.length === 0) return { min: 0, max: 0, mean: 0, median: 0, sum: 0, count: 0 };
  const sorted = [...clean].sort((a, b) => a - b);
  const sum = clean.reduce((a, b) => a + b, 0);
  const mean = sum / clean.length;
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return { min: sorted[0], max: sorted[sorted.length - 1], mean, median, sum, count: clean.length };
}
