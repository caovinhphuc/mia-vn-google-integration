// Google Sheets Service
import googleConfig from "../../config/googleConfig";

function allowSheetsMockFallback() {
  if (process.env.NODE_ENV === "production") {
    return process.env.REACT_APP_ALLOW_SHEETS_MOCK === "true";
  }
  return process.env.REACT_APP_ALLOW_SHEETS_MOCK !== "false";
}

class GoogleSheetsService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
    this.spreadsheetId = googleConfig.spreadsheet_id;
    this.baseUrl = "https://sheets.googleapis.com/v4/spreadsheets";
  }

  async getSpreadsheetInfo() {
    if (!this.spreadsheetId) {
      throw new Error("Missing Spreadsheet ID in config");
    }

    // For read-only access without API key, try using public sheet access
    const url = `${this.baseUrl}/${this.spreadsheetId}?fields=properties.title,sheets.properties`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (!allowSheetsMockFallback()) {
        throw error;
      }
      console.warn("Sheets API failed, mock metadata (dev):", error.message);
      return {
        spreadsheetId: this.spreadsheetId,
        properties: {
          title: "MIA Logistics Data Sheet",
        },
      };
    }
  }

  async readSheet(sheetName, range) {
    if (!this.spreadsheetId) {
      throw new Error("Missing Spreadsheet ID in config");
    }

    const url = `${this.baseUrl}/${this.spreadsheetId}/values/${sheetName}!${range}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (!allowSheetsMockFallback()) {
        throw error;
      }
      console.warn("Sheets read failed, mock rows (dev):", error.message);
      return {
        values: [
          ["Ngày", "Sản phẩm", "Số lượng", "Giá", "Trạng thái", "Khách hàng"],
          ["2025-09-27", "Demo Product A", "5", "150000", "Hoàn thành", "Mock Customer A"],
          ["2025-09-27", "Demo Product B", "3", "200000", "Đang xử lý", "Mock Customer B"],
          ["2025-09-26", "Demo Product C", "2", "300000", "Hoàn thành", "Mock Customer C"],
        ],
      };
    }
  }

  async writeSheet(sheetName, range, values) {
    console.warn("Write operations require authentication. Mock data written locally.");
    return Promise.resolve({ updatedRows: values.length });
  }

  async appendSheet(sheetName, values) {
    console.warn("Append operations require authentication. Mock data appended locally.");
    return Promise.resolve({ updates: { updatedRows: values.length } });
  }
}

const googleSheetsService = new GoogleSheetsService();
export { GoogleSheetsService };
export default googleSheetsService;
