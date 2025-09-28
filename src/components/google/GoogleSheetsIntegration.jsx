import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Loading from "../Common/Loading";
import "./GoogleSheetsIntegration.css";

const GoogleSheetsIntegration = () => {
  // const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.sheets);
  const { isAuthenticated, serviceAccount } = useSelector(
    (state) => state.auth
  );

  const [selectedSheet, setSelectedSheet] = useState(null);
  const [sheetContent, setSheetContent] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  // Sample sheet data
  const sampleSheets = [
    {
      id: "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As",
      title: "mia-logistics-final",
      sheets: [
        { name: "Orders", id: 0, rowCount: 150, columnCount: 8 },
        { name: "Inventory", id: 1, rowCount: 75, columnCount: 6 },
        { name: "Customers", id: 2, rowCount: 200, columnCount: 5 },
        { name: "Suppliers", id: 3, rowCount: 50, columnCount: 7 },
        { name: "Analytics", id: 4, rowCount: 30, columnCount: 4 },
      ],
    },
  ];

  const sampleData = {
    Orders: [
      [
        "ID",
        "Customer",
        "Product",
        "Quantity",
        "Price",
        "Date",
        "Status",
        "Notes",
      ],
      [
        "ORD001",
        "Nguyễn Văn A",
        "Laptop Dell",
        "1",
        "15000000",
        "2024-01-15",
        "Completed",
        "Delivered on time",
      ],
      [
        "ORD002",
        "Trần Thị B",
        "Mouse Logitech",
        "2",
        "500000",
        "2024-01-16",
        "Processing",
        "Waiting for stock",
      ],
      [
        "ORD003",
        "Lê Văn C",
        "Keyboard Mechanical",
        "1",
        "1200000",
        "2024-01-17",
        "Pending",
        "Customer review",
      ],
      [
        "ORD004",
        "Phạm Thị D",
        'Monitor 24"',
        "1",
        "3500000",
        "2024-01-18",
        "Completed",
        "Express delivery",
      ],
      [
        "ORD005",
        "Hoàng Văn E",
        "Webcam HD",
        "1",
        "800000",
        "2024-01-19",
        "Processing",
        "Standard shipping",
      ],
    ],
    Inventory: [
      ["Product ID", "Product Name", "Stock", "Min Stock", "Price", "Category"],
      ["PROD001", "Laptop Dell", "25", "5", "15000000", "Electronics"],
      ["PROD002", "Mouse Logitech", "150", "20", "500000", "Accessories"],
      ["PROD003", "Keyboard Mechanical", "45", "10", "1200000", "Accessories"],
      ["PROD004", 'Monitor 24"', "12", "3", "3500000", "Electronics"],
      ["PROD005", "Webcam HD", "30", "8", "800000", "Accessories"],
    ],
  };

  useEffect(() => {
    if (selectedSheet) {
      setSheetContent(sampleData[selectedSheet.name] || []);
    }
  }, [selectedSheet, sampleData]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = sheetContent.filter((row) =>
        row.some((cell) =>
          cell.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(sheetContent);
    }
  }, [searchTerm, sheetContent]);

  const handleSheetSelect = (sheet) => {
    setSelectedSheet(sheet);
    setIsEditing(false);
    setEditData({});
  };

  const handleCellEdit = (rowIndex, colIndex, value) => {
    setEditData({
      ...editData,
      [`${rowIndex}-${colIndex}`]: value,
    });
  };

  // const handleSave = () => {
  //   // Simulate save operation
  //   console.log("Saving data:", editData);
  //   setIsEditing(false);
  //   setEditData({});
  //   // Here you would dispatch an action to save to Google Sheets
  // };

  const handleExport = () => {
    // Simulate export operation
    const csvContent = filteredData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedSheet?.name || "sheet"}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCreateSheet = () => {
    if (!newSheetName.trim()) return;

    const newSheet = {
      name: newSheetName,
      id: Date.now(),
      rowCount: 1,
      columnCount: 5,
    };

    // Add to sample sheets
    sampleSheets[0].sheets.push(newSheet);
    setNewSheetName("");
    setShowCreateModal(false);
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim() || !selectedSheet) return;

    const updatedContent = sheetContent.map((row, index) => {
      if (index === 0) {
        // Header row
        return [...row, newColumnName];
      } else {
        // Data rows
        return [...row, ""];
      }
    });

    setSheetContent(updatedContent);
    setNewColumnName("");
    setShowColumnModal(false);
  };

  const handleDeleteColumn = (columnIndex) => {
    if (!selectedSheet) return;

    const updatedContent = sheetContent.map((row) =>
      row.filter((_, index) => index !== columnIndex)
    );

    setSheetContent(updatedContent);
  };

  const handleAddRow = () => {
    if (!selectedSheet) return;

    const newRow = Array(selectedSheet.headers.length).fill("");
    setSheetContent([...sheetContent, newRow]);
  };

  const handleDeleteRow = (rowIndex) => {
    const updatedContent = sheetContent.filter(
      (_, index) => index !== rowIndex
    );
    setSheetContent(updatedContent);
  };

  const handleDeleteEmptyRows = () => {
    const updatedContent = sheetContent.filter((row) =>
      row.some((cell) => cell.toString().trim() !== "")
    );
    setSheetContent(updatedContent);
  };

  const handleRowSelect = (rowIndex) => {
    setSelectedRows((prev) =>
      prev.includes(rowIndex)
        ? prev.filter((index) => index !== rowIndex)
        : [...prev, rowIndex]
    );
  };

  const handleSelectAllRows = () => {
    const allRowIndices = sheetContent.map((_, index) => index);
    setSelectedRows(
      selectedRows.length === allRowIndices.length ? [] : allRowIndices
    );
  };

  const handleDeleteSelectedRows = () => {
    const updatedContent = sheetContent.filter(
      (_, index) => !selectedRows.includes(index)
    );
    setSheetContent(updatedContent);
    setSelectedRows([]);
  };

  const handleViewId = (item) => {
    alert(`ID: ${item.id || selectedSheet?.id}`);
  };

  const handleMoveRow = (fromIndex, toIndex) => {
    const updatedContent = [...sheetContent];
    const [movedRow] = updatedContent.splice(fromIndex, 1);
    updatedContent.splice(toIndex, 0, movedRow);
    setSheetContent(updatedContent);
  };

  if (loading) {
    return <Loading text="Đang tải Google Sheets..." fullScreen />;
  }

  if (error) {
    return (
      <div className="sheets-error">
        <h3>Lỗi kết nối Google Sheets</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="google-sheets-integration">
      <div className="sheets-header">
        <h2>📊 Google Sheets Integration</h2>
        <div className="sheets-controls">
          {selectedSheet && (
            <>
              <button
                className="edit-btn"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "💾 Lưu" : "✏️ Chỉnh sửa"}
              </button>
              <button className="export-btn" onClick={handleExport}>
                📥 Xuất CSV
              </button>
            </>
          )}
        </div>
      </div>

      <div className="sheets-container">
        {/* Sidebar - Sheet List */}
        <div className="sheets-sidebar">
          <div className="sidebar-header">
            <h3>📋 Danh sách Sheets</h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowCreateModal(true)}
            >
              ➕ Tạo sheet mới
            </button>
          </div>

          <div className="sheet-list">
            {sampleSheets.map((spreadsheet) => (
              <div key={spreadsheet.id} className="spreadsheet-group">
                <div className="spreadsheet-title">{spreadsheet.title}</div>
                {spreadsheet.sheets.map((sheet) => (
                  <div
                    key={sheet.id}
                    className={`sheet-item ${
                      selectedSheet?.id === sheet.id ? "active" : ""
                    }`}
                    onClick={() => handleSheetSelect(sheet)}
                  >
                    <div className="sheet-info">
                      <span className="sheet-name">{sheet.name}</span>
                      <span className="sheet-meta">
                        {sheet.rowCount} hàng × {sheet.columnCount} cột
                      </span>
                    </div>
                    <div className="sheet-actions">
                      <button
                        className="action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewId(sheet);
                        }}
                        title="Xem ID"
                      >
                        👁️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {selectedSheet && (
            <div className="sheet-actions-panel">
              <h4>Thao tác với Sheet</h4>
              <div className="action-buttons">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "💾 Lưu" : "✏️ Chỉnh sửa"}
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowColumnModal(true)}
                >
                  ➕ Thêm cột
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddRow}
                >
                  ➕ Thêm hàng
                </button>
                <button
                  className="btn btn-warning btn-sm"
                  onClick={handleDeleteEmptyRows}
                >
                  🗑️ Xóa hàng trống
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleExport}
                >
                  📊 Xuất CSV
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Content - Sheet Data */}
        <div className="sheets-content">
          {selectedSheet ? (
            <>
              <div className="sheet-header">
                <h3>{selectedSheet.name}</h3>
                <div className="sheet-actions">
                  <input
                    type="text"
                    placeholder="🔍 Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <span className="row-count">{filteredData.length} rows</span>
                </div>
              </div>

              <div className="sheet-table-container">
                <table className="sheet-table">
                  <thead>
                    {filteredData.length > 0 && (
                      <tr>
                        {filteredData[0].map((header, index) => (
                          <th key={index}>{header}</th>
                        ))}
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {filteredData.slice(1).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, colIndex) => (
                          <td key={colIndex}>
                            {isEditing ? (
                              <input
                                type="text"
                                value={
                                  editData[`${rowIndex + 1}-${colIndex}`] ||
                                  cell
                                }
                                onChange={(e) =>
                                  handleCellEdit(
                                    rowIndex + 1,
                                    colIndex,
                                    e.target.value
                                  )
                                }
                                className="cell-input"
                              />
                            ) : (
                              <span className="cell-content">{cell}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="no-sheet-selected">
              <div className="no-sheet-icon">📊</div>
              <h3>Chọn một sheet để xem dữ liệu</h3>
              <p>Nhấp vào một sheet trong danh sách bên trái để bắt đầu</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Sheet Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Tạo sheet mới</h3>
              <button
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tên sheet</label>
                <input
                  type="text"
                  value={newSheetName}
                  onChange={(e) => setNewSheetName(e.target.value)}
                  placeholder="Nhập tên sheet..."
                  className="input-field"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateSheet}
                disabled={!newSheetName.trim()}
              >
                Tạo sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Column Modal */}
      {showColumnModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Thêm cột mới</h3>
              <button
                className="close-btn"
                onClick={() => setShowColumnModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tên cột</label>
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Nhập tên cột..."
                  className="input-field"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowColumnModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddColumn}
                disabled={!newColumnName.trim()}
              >
                Thêm cột
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleSheetsIntegration;
