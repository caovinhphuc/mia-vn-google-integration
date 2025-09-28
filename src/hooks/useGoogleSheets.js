import { useState, useCallback } from "react";
import { googleSheetsService } from "../services/googleSheets";

export const useGoogleSheets = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  const readSheet = useCallback(async (range = "A1:Z1000", sheetId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await googleSheetsService.readSheet(range, sheetId);
      setData(result.data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const writeSheet = useCallback(async (range, values, sheetId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await googleSheetsService.writeSheet(
        range,
        values,
        sheetId
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const appendToSheet = useCallback(async (range, values, sheetId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await googleSheetsService.appendToSheet(
        range,
        values,
        sheetId
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    readSheet,
    writeSheet,
    appendToSheet,
    clearError,
  };
};
