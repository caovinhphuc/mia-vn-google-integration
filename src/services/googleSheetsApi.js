/**
 * Google Sheets API Service - Frontend
 * Calls backend API instead of direct Google APIs
 */

import axios from "axios";
import { getGoogleProxyApiBase } from "../utils/apiBase";

const API_BASE_URL = getGoogleProxyApiBase();

/**
 * Nhận diện lỗi mạng (backend down, CORS, timeout) và trả thông báo thân thiện.
 * @returns {Error|null} Error nếu là lỗi mạng, null nếu không
 */
const handleNetworkError = (error, operation) => {
  const errorMessage = String(error.message || "");
  const errorCode = String(error.code || "");
  const errorName = String(error.name || "");

  const isAxiosNetworkError =
    errorName === "AxiosError" && (!error.response || error.code === "ERR_NETWORK");

  const isNetworkError =
    errorCode === "ERR_NETWORK" ||
    errorMessage === "Network Error" ||
    errorMessage === "Failed to fetch" ||
    errorMessage.toLowerCase().includes("failed to fetch") ||
    errorMessage.toLowerCase().includes("network error") ||
    isAxiosNetworkError ||
    (error.request && !error.response) ||
    errorMessage.includes("ERR_NETWORK") ||
    errorMessage.includes("ECONNREFUSED") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("NetworkError");

  if (isNetworkError) {
    const friendlyMessage =
      `Không thể kết nối đến backend server.\n` +
      `Vui lòng kiểm tra:\n` +
      `1. Backend có đang chạy không? (${API_BASE_URL})\n` +
      `   → Local: cd backend && npm start (port 3001)\n` +
      `2. Kiểm tra .env: REACT_APP_API_BASE_URL phải trỏ đúng (local: localhost:3001/api)\n` +
      `3. Kiểm tra CORS settings`;

    console.error(`Error ${operation}:`, friendlyMessage);
    return new Error(friendlyMessage);
  }
  return null;
};

class GoogleSheetsApiService {
  /**
   * Read data from sheet
   */
  async readSheet(range = "A1:Z1000", sheetId) {
    try {
      const params = { range };
      if (sheetId) params.sheetId = sheetId;

      const response = await axios.get(`${API_BASE_URL}/sheets/read`, {
        params,
      });
      return {
        data: response.data.data,
        range: response.data.range,
        majorDimension: response.data.majorDimension,
      };
    } catch (error) {
      const networkError = handleNetworkError(error, "reading sheet");
      if (networkError) throw networkError;

      console.error("Error reading sheet:", error);
      throw new Error(error.response?.data?.error || `Failed to read sheet: ${error.message}`);
    }
  }

  /**
   * Write data to sheet
   */
  async writeSheet(range, values, sheetId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/sheets/write`, {
        range,
        values,
        sheetId,
      });
      return response.data.data;
    } catch (error) {
      const networkError = handleNetworkError(error, "writing to sheet");
      if (networkError) throw networkError;

      console.error("Error writing to sheet:", error);
      throw new Error(error.response?.data?.error || `Failed to write to sheet: ${error.message}`);
    }
  }

  /**
   * Append data to sheet
   */
  async appendToSheet(range, values, sheetId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/sheets/append`, {
        range,
        values,
        sheetId,
      });
      return response.data.data;
    } catch (error) {
      const networkError = handleNetworkError(error, "appending to sheet");
      if (networkError) throw networkError;

      console.error("Error appending to sheet:", error);
      throw new Error(error.response?.data?.error || `Failed to append to sheet: ${error.message}`);
    }
  }

  /**
   * Get sheet metadata
   */
  async getSheetMetadata(sheetId) {
    try {
      const url = sheetId
        ? `${API_BASE_URL}/sheets/metadata/${sheetId}`
        : `${API_BASE_URL}/sheets/metadata`;

      const response = await axios.get(url);
      return response.data.data;
    } catch (error) {
      const networkError = handleNetworkError(error, "getting sheet metadata");
      if (networkError) throw networkError;

      const errText = String(error.response?.data?.error || "");
      const isAuthError =
        errText.includes("invalid_grant") || errText.includes("account not found");

      if (!isAuthError && process.env.NODE_ENV === "development") {
        console.error("Error getting sheet metadata:", error);
      }

      throw new Error(
        error.response?.data?.error || `Failed to get sheet metadata: ${error.message}`
      );
    }
  }

  /**
   * Clear sheet data
   */
  async clearSheet(range, sheetId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/sheets/clear`, {
        data: { range, sheetId },
      });
      return response.data.data;
    } catch (error) {
      const networkError = handleNetworkError(error, "clearing sheet");
      if (networkError) throw networkError;

      console.error("Error clearing sheet:", error);
      throw new Error(error.response?.data?.error || `Failed to clear sheet: ${error.message}`);
    }
  }

  /**
   * Add new worksheet (sheet) to spreadsheet
   */
  async addSheet(sheetName, sheetId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/sheets/add-sheet`, {
        sheetName,
        sheetId,
      });
      return response.data.data;
    } catch (error) {
      const networkError = handleNetworkError(error, "adding sheet");
      if (networkError) throw networkError;

      console.error("Error adding sheet:", error);
      throw new Error(error.response?.data?.error || `Failed to add sheet: ${error.message}`);
    }
  }
}

// Export singleton instance
export const googleSheetsApiService = new GoogleSheetsApiService();
export default googleSheetsApiService;
