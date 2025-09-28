import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Loading from "../Common/Loading";
import "./GoogleDriveIntegration.css";

const GoogleDriveIntegration = () => {
  const { loading, error } = useSelector((state) => state.drive);
  const { isAuthenticated, serviceAccount } = useSelector(
    (state) => state.auth
  );

  const [currentFolder, setCurrentFolder] = useState(null);
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // grid hoặc list
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState(""); // file hoặc folder
  const [newItemName, setNewItemName] = useState("");

  // Sample data
  const sampleFiles = [
    {
      id: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
      name: "Báo cáo tháng 1.xlsx",
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      size: "2.5 MB",
      modifiedTime: "2024-01-15T10:30:00Z",
      owner: "admin@mia.vn",
      webViewLink:
        "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view",
    },
    {
      id: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms2",
      name: "Danh sách khách hàng.pdf",
      type: "application/pdf",
      size: "1.2 MB",
      modifiedTime: "2024-01-14T15:45:00Z",
      owner: "admin@mia.vn",
      webViewLink:
        "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms2/view",
    },
    {
      id: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms3",
      name: "Hợp đồng mẫu.docx",
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size: "850 KB",
      modifiedTime: "2024-01-13T09:20:00Z",
      owner: "admin@mia.vn",
      webViewLink:
        "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms3/view",
    },
  ];

  const sampleFolders = [
    {
      id: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms_folder1",
      name: "Tài liệu công ty",
      modifiedTime: "2024-01-15T10:30:00Z",
      owner: "admin@mia.vn",
    },
    {
      id: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms_folder2",
      name: "Báo cáo hàng tháng",
      modifiedTime: "2024-01-14T15:45:00Z",
      owner: "admin@mia.vn",
    },
    {
      id: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms_folder3",
      name: "Hợp đồng khách hàng",
      modifiedTime: "2024-01-13T09:20:00Z",
      owner: "admin@mia.vn",
    },
  ];

  useEffect(() => {
    setFiles(sampleFiles);
    setFolders(sampleFolders);
  }, []);

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemSelect = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    const allIds = [...files, ...folders].map((item) => item.id);
    setSelectedItems(selectedItems.length === allIds.length ? [] : allIds);
  };

  const handleCreateItem = () => {
    if (!newItemName.trim()) return;

    const newItem = {
      id: `new_${Date.now()}`,
      name: newItemName,
      type:
        createType === "file"
          ? "text/plain"
          : "application/vnd.google-apps.folder",
      size: createType === "file" ? "0 KB" : "",
      modifiedTime: new Date().toISOString(),
      owner: "admin@mia.vn",
    };

    if (createType === "file") {
      setFiles((prev) => [newItem, ...prev]);
    } else {
      setFolders((prev) => [newItem, ...prev]);
    }

    setNewItemName("");
    setShowCreateModal(false);
    setCreateType("");
  };

  const handleDeleteItems = () => {
    if (selectedItems.length === 0) return;

    setFiles((prev) => prev.filter((file) => !selectedItems.includes(file.id)));
    setFolders((prev) =>
      prev.filter((folder) => !selectedItems.includes(folder.id))
    );
    setSelectedItems([]);
  };

  const handleDownloadItems = () => {
    if (selectedItems.length === 0) return;

    selectedItems.forEach((itemId) => {
      const item = [...files, ...folders].find((i) => i.id === itemId);
      if (item && item.webViewLink) {
        window.open(item.webViewLink, "_blank");
      }
    });
  };

  const handleExportCSV = () => {
    const csvData = [
      ["Tên", "Loại", "Kích thước", "Ngày sửa", "Chủ sở hữu", "ID"],
      ...files.map((file) => [
        file.name,
        file.type,
        file.size,
        new Date(file.modifiedTime).toLocaleDateString("vi-VN"),
        file.owner,
        file.id,
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "google_drive_files.csv";
    link.click();
  };

  const getFileIcon = (type) => {
    if (type.includes("spreadsheet")) return "📊";
    if (type.includes("document")) return "📄";
    if (type.includes("pdf")) return "📕";
    if (type.includes("image")) return "🖼️";
    if (type.includes("video")) return "🎥";
    if (type.includes("audio")) return "🎵";
    if (type.includes("folder")) return "📁";
    return "📄";
  };

  const formatFileSize = (size) => {
    return size || "0 KB";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <Loading />;
  if (error) return <div className="error-state">Lỗi: {error}</div>;

  return (
    <div className="drive-integration-container">
      {/* Header */}
      <div className="drive-header">
        <div className="header-left">
          <h1>📁 Google Drive</h1>
          <div className="breadcrumb">
            <span>Drive của tôi</span>
            {currentFolder && <span> / {currentFolder.name}</span>}
          </div>
        </div>

        <div className="header-right">
          <div className="view-controls">
            <button
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              ⊞
            </button>
            <button
              className={`view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              ☰
            </button>
          </div>

          <div className="action-buttons">
            <button
              className="btn btn-primary"
              onClick={() => {
                setCreateType("folder");
                setShowCreateModal(true);
              }}
            >
              📁 Tạo thư mục
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setCreateType("file");
                setShowCreateModal(true);
              }}
            >
              📄 Tạo tệp
            </button>
            <button className="btn btn-secondary">⬆️ Tải lên</button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="drive-toolbar">
        <div className="toolbar-left">
          <input
            type="text"
            placeholder="Tìm kiếm tệp tin và thư mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="toolbar-right">
          {selectedItems.length > 0 && (
            <>
              <span className="selected-count">
                {selectedItems.length} mục đã chọn
              </span>
              <button className="btn btn-danger" onClick={handleDeleteItems}>
                🗑️ Xóa
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleDownloadItems}
              >
                ⬇️ Tải xuống
              </button>
            </>
          )}
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            📊 Xuất CSV
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="drive-content">
        {/* Folders */}
        {filteredFolders.length > 0 && (
          <div className="folders-section">
            <h3>📁 Thư mục</h3>
            <div className={`items-grid ${viewMode}`}>
              {filteredFolders.map((folder) => (
                <div
                  key={folder.id}
                  className={`item-card ${
                    selectedItems.includes(folder.id) ? "selected" : ""
                  }`}
                  onClick={() => handleItemSelect(folder.id)}
                >
                  <div className="item-icon">📁</div>
                  <div className="item-info">
                    <div className="item-name">{folder.name}</div>
                    <div className="item-meta">
                      {formatDate(folder.modifiedTime)}
                    </div>
                  </div>
                  <div className="item-actions">
                    <button
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("View ID:", folder.id);
                      }}
                      title="Xem ID"
                    >
                      👁️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        {filteredFiles.length > 0 && (
          <div className="files-section">
            <h3>📄 Tệp tin</h3>
            <div className={`items-grid ${viewMode}`}>
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={`item-card ${
                    selectedItems.includes(file.id) ? "selected" : ""
                  }`}
                  onClick={() => handleItemSelect(file.id)}
                >
                  <div className="item-icon">{getFileIcon(file.type)}</div>
                  <div className="item-info">
                    <div className="item-name">{file.name}</div>
                    <div className="item-meta">
                      {formatFileSize(file.size)} •{" "}
                      {formatDate(file.modifiedTime)}
                    </div>
                  </div>
                  <div className="item-actions">
                    <button
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(file.webViewLink, "_blank");
                      }}
                      title="Mở"
                    >
                      🔗
                    </button>
                    <button
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("View ID:", file.id);
                      }}
                      title="Xem ID"
                    >
                      👁️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredFiles.length === 0 && filteredFolders.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>Không có tệp tin nào</h3>
            <p>Tạo thư mục hoặc tải lên tệp tin để bắt đầu</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                {createType === "file" ? "Tạo tệp tin mới" : "Tạo thư mục mới"}
              </h3>
              <button
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder={
                  createType === "file" ? "Tên tệp tin" : "Tên thư mục"
                }
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="input-field"
                autoFocus
              />
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
                onClick={handleCreateItem}
                disabled={!newItemName.trim()}
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GoogleDriveIntegration;
