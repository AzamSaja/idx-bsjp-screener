import fs from "fs";
import path from "path";

export interface IdxCompanyInfo {
  code: string;
  name: string;
  board?: string;
  sector?: string;
}

let cachedCompanies: IdxCompanyInfo[] | null = null;

/**
 * Loads company master from the adjacent idx-bei-main data folder if available
 */
export function getIdxCompanyMaster(): IdxCompanyInfo[] {
  if (cachedCompanies) return cachedCompanies;

  const candidatePaths = [
    path.join(process.cwd(), "..", "idx-bei-main", "data", "allCompanies.json"),
    path.join("d:", "Workspace", "idx-bei-main", "data", "allCompanies.json"),
  ];

  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf-8");
        const json = JSON.parse(raw);
        if (Array.isArray(json)) {
          cachedCompanies = json.map((item: any) => ({
            code: item.KodeEmiten || item.code || item.StockCode || "",
            name: item.NamaEmiten || item.name || item.StockName || "",
            board: item.PapanPencatatan || item.board || "",
            sector: item.Sektor || item.sector || "",
          })).filter((c) => c.code.length > 0);
          return cachedCompanies;
        }
      }
    } catch {
      // Fallback
    }
  }

  return [];
}

