import React, { useState, useEffect } from "react";
import {
  getUnifiedGoogleSheetsService,
  testConnection,
  logAuditEvent,
} from "../services/unifiedGoogleSheetsService";
import Loading from "./Common/Loading";
import "./GoogleSheetsDataViewer.css";

const GoogleSheetsDataViewer = ({ sheetName = "Sheet1" }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("checking");
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const sheetsService = getUnifiedGoogleSheetsService();

  useEffect(() => {
    checkConnection();
    loadData();
  }, [sheetName]);

  const checkConnection = async () => {
    try {
      const result = await testConnection();
      setConnectionStatus(result.success ? "connected" : "error");
    } catch (error) {
      console.error("Connection check failed:", error);
      setConnectionStatus("error");
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await sheetsService.fetchSheetData(sheetName);
      if (result && result.data) {
        setData(result.data);
        await logAuditEvent({
          event: "Data Loaded",
          details: `Loaded ${result.data.length} rows from ${sheetName}`,
          status: "Success",
        });
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      await logAuditEvent({
        event: "Data Load Failed",
        details: error.message,
        status: "Error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleRowSelect = (rowIndex) => {
    setSelectedRows((prev) =>
      prev.includes(rowIndex)
        ? prev.filter((i) => i !== rowIndex)
        : [...prev, rowIndex]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredData.map((_, index) => index));
    }
  };

  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    return Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const getHeaders = () => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="sheets-data-viewer">
      <div className="viewer-header">
        <h2>📊 Google Sheets Data Viewer</h2>
        <div className="header-controls">
          <div className={`connection-status ${connectionStatus}`}>
            <span className="status-dot"></span>
            {connectionStatus === "connected"
              ? "Connected"
              : connectionStatus === "checking"
                ? "Checking..."
                : "Connection Error"}
          </div>
          <button className="btn-refresh" onClick={loadData} disabled={loading}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="viewer-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search in data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="data-info">
          <span>Total: {data.length} rows</span>
          <span>Filtered: {filteredData.length} rows</span>
          <span>Selected: {selectedRows.length} rows</span>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="select-column">
                <input
                  type="checkbox"
                  checked={
                    selectedRows.length === filteredData.length &&
                    filteredData.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </th>
              {getHeaders().map((header) => (
                <th
                  key={header}
                  onClick={() => handleSort(header)}
                  className="sortable"
                >
                  {header}
                  {sortConfig.key === header && (
                    <span className="sort-indicator">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => {
              const actualIndex = (currentPage - 1) * itemsPerPage + index;
              return (
                <tr
                  key={actualIndex}
                  className={
                    selectedRows.includes(actualIndex) ? "selected" : ""
                  }
                >
                  <td className="select-column">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(actualIndex)}
                      onChange={() => handleRowSelect(actualIndex)}
                    />
                  </td>
                  {getHeaders().map((header) => (
                    <td key={header}>{row[header] || "-"}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="no-data">
          <div className="no-data-icon">📭</div>
          <h3>No Data Available</h3>
          <p>No data found in the sheet "{sheetName}"</p>
          <button className="btn-primary" onClick={loadData}>
            🔄 Reload Data
          </button>
        </div>
      )}

      {data.length > 0 && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, sortedData.length)} of{" "}
            {sortedData.length} entries
          </div>

          <div className="pagination-controls">
            <button
              className="btn-page"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              ⏮️ First
            </button>
            <button
              className="btn-page"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ⏪ Previous
            </button>

            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="btn-page"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next ⏩
            </button>
            <button
              className="btn-page"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last ⏭️
            </button>
          </div>
        </div>
      )}

      {selectedRows.length > 0 && (
        <div className="selected-actions">
          <h4>Actions for {selectedRows.length} selected rows:</h4>
          <div className="action-buttons">
            <button className="btn-action btn-export">
              📥 Export Selected
            </button>
            <button className="btn-action btn-delete">
              🗑️ Delete Selected
            </button>
            <button className="btn-action btn-edit">✏️ Edit Selected</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleSheetsDataViewer;
