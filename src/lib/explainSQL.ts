/**
 * Generates "behind the scenes" MySQL queries that explain how each
 * metric / chart / prediction is computed. These are display-only — the
 * actual computation is done in JS — but they show the equivalent SQL
 * a database would run.
 */

const tick = (s: string) => `\`${s.replace(/[^a-zA-Z0-9_]/g, "_")}\``;

export const sqlRowCount = (table: string) =>
  `-- Total number of rows in the dataset
SELECT COUNT(*) AS total_rows
FROM ${tick(table)};`;

export const sqlMin = (table: string, col: string) =>
  `-- Minimum value of ${col}
SELECT MIN(${tick(col)}) AS min_value
FROM ${tick(table)}
WHERE ${tick(col)} IS NOT NULL;`;

export const sqlMax = (table: string, col: string) =>
  `-- Maximum value of ${col}
SELECT MAX(${tick(col)}) AS max_value
FROM ${tick(table)}
WHERE ${tick(col)} IS NOT NULL;`;

export const sqlMean = (table: string, col: string) =>
  `-- Mean (average) of ${col}
SELECT AVG(${tick(col)}) AS mean_value
FROM ${tick(table)}
WHERE ${tick(col)} IS NOT NULL;`;

export const sqlMedian = (table: string, col: string) =>
  `-- Median of ${col} (MySQL 8+ using window functions)
SELECT AVG(${tick(col)}) AS median_value
FROM (
  SELECT ${tick(col)},
         ROW_NUMBER() OVER (ORDER BY ${tick(col)}) AS rn,
         COUNT(*)    OVER ()                       AS cnt
  FROM ${tick(table)}
  WHERE ${tick(col)} IS NOT NULL
) t
WHERE rn IN (FLOOR((cnt + 1) / 2), CEIL((cnt + 1) / 2));`;

export const sqlAllStats = (table: string, col: string) =>
  `-- All summary statistics for ${col} in one query
SELECT
  COUNT(*)              AS total_rows,
  MIN(${tick(col)})     AS min_value,
  MAX(${tick(col)})     AS max_value,
  AVG(${tick(col)})     AS mean_value,
  STDDEV(${tick(col)})  AS std_dev
FROM ${tick(table)}
WHERE ${tick(col)} IS NOT NULL;`;

export const sqlChartQuery = (
  table: string,
  xCol: string,
  yCol: string,
  chartType: string,
) => {
  const t = chartType.toLowerCase();
  if (t === "pie" || t === "doughnut" || t === "radar") {
    return `-- Data behind the ${chartType} chart
-- Groups by ${xCol} and sums ${yCol}, top 10 categories
SELECT ${tick(xCol)}        AS category,
       SUM(${tick(yCol)})   AS value
FROM ${tick(table)}
GROUP BY ${tick(xCol)}
ORDER BY value DESC
LIMIT 10;`;
  }
  if (t === "scatter") {
    return `-- Data behind the Scatter chart (raw X / Y pairs)
SELECT ${tick(xCol)} AS x,
       ${tick(yCol)} AS y
FROM ${tick(table)}
WHERE ${tick(xCol)} IS NOT NULL
  AND ${tick(yCol)} IS NOT NULL
LIMIT 200;`;
  }
  // Bar / Line / Area
  return `-- Data behind the ${chartType} chart
SELECT ${tick(xCol)} AS x_axis,
       ${tick(yCol)} AS y_axis
FROM ${tick(table)}
ORDER BY ${tick(xCol)}
LIMIT 200;`;
};

/* ---------------- Prediction page ---------------- */

export const sqlPredictionFeatures = (region: string) =>
  `-- 1. Feature extraction: aggregate historical observations
--    for "${region}" to feed into the AI model.
SELECT
  region,
  COUNT(*)                        AS years_observed,
  AVG(annual_rainfall_mm)         AS avg_rainfall,
  AVG(avg_temperature_c)          AS avg_temp,
  MIN(annual_rainfall_mm)         AS driest_year_mm,
  MAX(avg_temperature_c)          AS hottest_year_c,
  STDDEV(annual_rainfall_mm)      AS rainfall_volatility
FROM climate_observations
WHERE region = '${region.replace(/'/g, "''")}'
GROUP BY region;`;

export const sqlPredictionRiskClassification = () =>
  `-- 2. Risk classification: how thresholds map raw features
--    onto a drought-risk label (illustrative CASE logic).
SELECT
  region,
  avg_rainfall,
  avg_temp,
  CASE
    WHEN avg_rainfall < 400  AND avg_temp > 32 THEN 'Severe'
    WHEN avg_rainfall < 600  AND avg_temp > 28 THEN 'High'
    WHEN avg_rainfall < 900                    THEN 'Moderate'
    WHEN avg_rainfall < 1200                   THEN 'Low'
    ELSE 'Minimal'
  END AS drought_risk,
  CASE
    WHEN avg_rainfall < 400  THEN ROUND(20 + (avg_rainfall / 400) * 20)
    WHEN avg_rainfall < 900  THEN ROUND(40 + ((avg_rainfall - 400) / 500) * 30)
    ELSE                          ROUND(70 + LEAST(((avg_rainfall - 900) / 600) * 30, 30))
  END AS water_security_score
FROM region_features;`;

export const sqlPredictionInsert = (
  region: string,
  population: string,
  avgTemp: string,
  avgRainfall: string,
) =>
  `-- 3. Persist the prediction to history
INSERT INTO prediction_history
  (user_id, region, population, avg_temp, avg_rainfall,
   drought_risk, rainfall_forecast, water_security_score, details)
VALUES
  (auth.uid(),
   '${region.replace(/'/g, "''")}',
   ${population && population !== "unknown" ? `'${population}'` : "NULL"},
   ${avgTemp && avgTemp !== "unknown" ? `'${avgTemp}'` : "NULL"},
   ${avgRainfall && avgRainfall !== "unknown" ? `'${avgRainfall}'` : "NULL"},
   :drought_risk,
   :rainfall_forecast,
   :water_security_score,
   :details);`;
