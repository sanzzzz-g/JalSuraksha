// Sample water security datasets for quick demo
export const SAMPLE_DATASETS = {
  rainfall: {
    name: "India Regional Rainfall Data",
    description: "Monthly rainfall data across Indian regions (2018-2023)",
    data: [
      { Region: "Tamil Nadu", Year: 2023, Jan: 25, Feb: 12, Mar: 8, Apr: 35, May: 52, Jun: 48, Jul: 110, Aug: 135, Sep: 180, Oct: 220, Nov: 310, Dec: 140, Annual_mm: 1275 },
      { Region: "Tamil Nadu", Year: 2022, Jan: 18, Feb: 10, Mar: 5, Apr: 28, May: 45, Jun: 42, Jul: 95, Aug: 120, Sep: 165, Oct: 200, Nov: 280, Dec: 125, Annual_mm: 1133 },
      { Region: "Rajasthan", Year: 2023, Jan: 3, Feb: 2, Mar: 1, Apr: 2, May: 8, Jun: 42, Jul: 150, Aug: 130, Sep: 60, Oct: 10, Nov: 2, Dec: 2, Annual_mm: 412 },
      { Region: "Rajasthan", Year: 2022, Jan: 2, Feb: 1, Mar: 1, Apr: 1, May: 5, Jun: 35, Jul: 120, Aug: 110, Sep: 45, Oct: 8, Nov: 1, Dec: 1, Annual_mm: 330 },
      { Region: "Kerala", Year: 2023, Jan: 12, Feb: 18, Mar: 35, Apr: 105, May: 280, Jun: 650, Jul: 710, Aug: 420, Sep: 280, Oct: 290, Nov: 160, Dec: 45, Annual_mm: 3005 },
      { Region: "Kerala", Year: 2022, Jan: 10, Feb: 15, Mar: 30, Apr: 90, May: 260, Jun: 600, Jul: 680, Aug: 390, Sep: 250, Oct: 270, Nov: 145, Dec: 40, Annual_mm: 2780 },
      { Region: "Maharashtra", Year: 2023, Jan: 2, Feb: 1, Mar: 2, Apr: 5, May: 18, Jun: 180, Jul: 310, Aug: 250, Sep: 190, Oct: 80, Nov: 25, Dec: 5, Annual_mm: 1068 },
      { Region: "Maharashtra", Year: 2022, Jan: 1, Feb: 1, Mar: 1, Apr: 3, May: 12, Jun: 155, Jul: 280, Aug: 220, Sep: 170, Oct: 65, Nov: 20, Dec: 3, Annual_mm: 931 },
      { Region: "Uttar Pradesh", Year: 2023, Jan: 15, Feb: 12, Mar: 8, Apr: 5, May: 12, Jun: 95, Jul: 280, Aug: 260, Sep: 180, Oct: 30, Nov: 5, Dec: 8, Annual_mm: 910 },
      { Region: "Uttar Pradesh", Year: 2022, Jan: 12, Feb: 10, Mar: 6, Apr: 4, May: 10, Jun: 80, Jul: 250, Aug: 230, Sep: 160, Oct: 25, Nov: 4, Dec: 6, Annual_mm: 797 },
      { Region: "Gujarat", Year: 2023, Jan: 1, Feb: 0, Mar: 0, Apr: 1, May: 5, Jun: 90, Jul: 250, Aug: 200, Sep: 120, Oct: 20, Nov: 3, Dec: 1, Annual_mm: 691 },
      { Region: "Gujarat", Year: 2022, Jan: 1, Feb: 0, Mar: 0, Apr: 1, May: 3, Jun: 75, Jul: 210, Aug: 175, Sep: 100, Oct: 15, Nov: 2, Dec: 1, Annual_mm: 583 },
    ],
  },
  groundwater: {
    name: "Groundwater Level Monitoring",
    description: "District-wise groundwater levels and extraction rates",
    data: [
      { District: "Chennai", State: "Tamil Nadu", Groundwater_Level_m: 8.2, Extraction_Rate_pct: 92, Recharge_mm: 180, Population_Lakh: 108, Risk_Level: "High", Wells_Monitored: 45 },
      { District: "Jaipur", State: "Rajasthan", Groundwater_Level_m: 22.5, Extraction_Rate_pct: 115, Recharge_mm: 85, Population_Lakh: 78, Risk_Level: "Severe", Wells_Monitored: 62 },
      { District: "Ernakulam", State: "Kerala", Groundwater_Level_m: 3.1, Extraction_Rate_pct: 45, Recharge_mm: 520, Population_Lakh: 33, Risk_Level: "Low", Wells_Monitored: 28 },
      { District: "Pune", State: "Maharashtra", Groundwater_Level_m: 12.8, Extraction_Rate_pct: 78, Recharge_mm: 210, Population_Lakh: 95, Risk_Level: "Moderate", Wells_Monitored: 55 },
      { District: "Lucknow", State: "UP", Groundwater_Level_m: 10.5, Extraction_Rate_pct: 82, Recharge_mm: 190, Population_Lakh: 45, Risk_Level: "Moderate", Wells_Monitored: 38 },
      { District: "Ahmedabad", State: "Gujarat", Groundwater_Level_m: 18.3, Extraction_Rate_pct: 98, Recharge_mm: 120, Population_Lakh: 82, Risk_Level: "High", Wells_Monitored: 50 },
      { District: "Bengaluru", State: "Karnataka", Groundwater_Level_m: 15.7, Extraction_Rate_pct: 88, Recharge_mm: 160, Population_Lakh: 125, Risk_Level: "High", Wells_Monitored: 42 },
      { District: "Hyderabad", State: "Telangana", Groundwater_Level_m: 14.2, Extraction_Rate_pct: 75, Recharge_mm: 175, Population_Lakh: 100, Risk_Level: "Moderate", Wells_Monitored: 48 },
      { District: "Jodhpur", State: "Rajasthan", Groundwater_Level_m: 35.0, Extraction_Rate_pct: 135, Recharge_mm: 45, Population_Lakh: 15, Risk_Level: "Severe", Wells_Monitored: 30 },
      { District: "Thiruvananthapuram", State: "Kerala", Groundwater_Level_m: 4.5, Extraction_Rate_pct: 38, Recharge_mm: 480, Population_Lakh: 18, Risk_Level: "Low", Wells_Monitored: 22 },
    ],
  },
  drought: {
    name: "Drought Index by Region",
    description: "Standard Precipitation Index (SPI) and drought severity",
    data: [
      { Region: "Vidarbha", State: "Maharashtra", SPI_Index: -2.1, Drought_Severity: "Extreme", Crop_Loss_pct: 65, Affected_Area_sqkm: 18000, Water_Deficit_pct: 55, Year: 2023 },
      { Region: "Bundelkhand", State: "UP/MP", SPI_Index: -1.8, Drought_Severity: "Severe", Crop_Loss_pct: 52, Affected_Area_sqkm: 25000, Water_Deficit_pct: 48, Year: 2023 },
      { Region: "Marathwada", State: "Maharashtra", SPI_Index: -1.5, Drought_Severity: "Severe", Crop_Loss_pct: 45, Affected_Area_sqkm: 22000, Water_Deficit_pct: 42, Year: 2023 },
      { Region: "Rayalaseema", State: "AP", SPI_Index: -1.3, Drought_Severity: "Moderate", Crop_Loss_pct: 35, Affected_Area_sqkm: 16000, Water_Deficit_pct: 38, Year: 2023 },
      { Region: "Western Rajasthan", State: "Rajasthan", SPI_Index: -2.4, Drought_Severity: "Extreme", Crop_Loss_pct: 72, Affected_Area_sqkm: 42000, Water_Deficit_pct: 65, Year: 2023 },
      { Region: "Saurashtra", State: "Gujarat", SPI_Index: -1.1, Drought_Severity: "Moderate", Crop_Loss_pct: 28, Affected_Area_sqkm: 12000, Water_Deficit_pct: 32, Year: 2023 },
      { Region: "Cauvery Delta", State: "Tamil Nadu", SPI_Index: -0.8, Drought_Severity: "Mild", Crop_Loss_pct: 15, Affected_Area_sqkm: 8000, Water_Deficit_pct: 20, Year: 2023 },
      { Region: "Malabar", State: "Kerala", SPI_Index: 0.5, Drought_Severity: "None", Crop_Loss_pct: 2, Affected_Area_sqkm: 0, Water_Deficit_pct: 5, Year: 2023 },
    ],
  },
};

export type SampleDatasetKey = keyof typeof SAMPLE_DATASETS;
