import { google } from "googleapis";
import { googleAuthService } from "./googleAuth";
import { GOOGLE_CONFIG } from "../config/googleConfig";

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
  }

  async initialize() {
    try {
      const authClient = await googleAuthService.getAuthClient();
      this.sheets = google.sheets({ version: "v4", auth: authClient });
      return this.sheets;
    } catch (error) {
      console.error("Failed to initialize Google Sheets:", error);
      throw error;
    }
  }

  async getSheets() {
    if (!this.sheets) {
      await this.initialize();
    }
    return this.sheets;
  }

  // Read data from sheet
  async readSheet(range = "A1:Z1000", sheetId = GOOGLE_CONFIG.SHEET_ID) {
    try {
      const sheets = await this.getSheets();
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: range,
      });

      return {
        data: response.data.values || [],
        range: response.data.range,
        majorDimension: response.data.majorDimension,
      };
    } catch (error) {
      console.error("Error reading sheet:", error);
      throw new Error(`Failed to read sheet: ${error.message}`);
    }
  }

  // Write data to sheet
  async writeSheet(range, values, sheetId = GOOGLE_CONFIG.SHEET_ID) {
    try {
      const sheets = await this.getSheets();
      const response = await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: range,
        valueInputOption: "RAW",
        requestBody: {
          values: values,
        },
      });

      return {
        updatedCells: response.data.updatedCells,
        updatedRows: response.data.updatedRows,
        updatedColumns: response.data.updatedColumns,
      };
    } catch (error) {
      console.error("Error writing to sheet:", error);
      throw new Error(`Failed to write to sheet: ${error.message}`);
    }
  }

  // Append data to sheet
  async appendToSheet(range, values, sheetId = GOOGLE_CONFIG.SHEET_ID) {
    try {
      const sheets = await this.getSheets();
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: range,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: values,
        },
      });

      return {
        updates: response.data.updates,
        updatedCells: response.data.updates.updatedCells,
        updatedRows: response.data.updates.updatedRows,
      };
    } catch (error) {
      console.error("Error appending to sheet:", error);
      throw new Error(`Failed to append to sheet: ${error.message}`);
    }
  }

  // Get sheet metadata
  async getSheetMetadata(sheetId = GOOGLE_CONFIG.SHEET_ID) {
    try {
      const sheets = await this.getSheets();
      const response = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      });

      return {
        title: response.data.properties.title,
        sheets: response.data.sheets.map((sheet) => ({
          title: sheet.properties.title,
          sheetId: sheet.properties.sheetId,
          gridProperties: sheet.properties.gridProperties,
        })),
      };
    } catch (error) {
      console.error("Error getting sheet metadata:", error);
      throw new Error(`Failed to get sheet metadata: ${error.message}`);
    }
  }

  // Clear sheet data
  async clearSheet(range, sheetId = GOOGLE_CONFIG.SHEET_ID) {
    try {
      const sheets = await this.getSheets();
      const response = await sheets.spreadsheets.values.clear({
        spreadsheetId: sheetId,
        range: range,
      });

      return response.data;
    } catch (error) {
      console.error("Error clearing sheet:", error);
      throw new Error(`Failed to clear sheet: ${error.message}`);
    }
  }
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
