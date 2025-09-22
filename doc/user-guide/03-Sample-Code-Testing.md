# Code mẫu và Testing cho React Google Integration

## 1. Component Test Google Sheets

### src/components/GoogleSheet/SheetTester.js

```javascript
import React, { useState, useEffect } from "react";
import { googleSheetsService } from "../../services/googleSheets";
import { validateGoogleConfig } from "../../config/googleConfig";

const SheetTester = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testResult, setTestResult] = useState("");

  // Test data để ghi vào sheet
  const sampleData = [
    ["Timestamp", "Product", "Quantity", "Price", "Total"],
    [new Date().toISOString(), "Test Product", "10", "100", "1000"],
    [new Date().toISOString(), "Another Product", "5", "200", "1000"],
  ];

  useEffect(() => {
    // Validate config khi component mount
    try {
      validateGoogleConfig();
      setTestResult("✅ Google configuration is valid");
    } catch (error) {
      setError(`❌ Configuration error: ${error.message}`);
      setTestResult("❌ Google configuration is invalid");
    }
  }, []);

  // Test đọc dữ liệu từ Google Sheet
  const handleReadSheet = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await googleSheetsService.readSheet("A1:E10");
      setData(result.data);
      setTestResult(`✅ Read successful: ${result.data.length} rows retrieved`);
    } catch (error) {
      setError(`Failed to read sheet: ${error.message}`);
      setTestResult("❌ Read failed");
    } finally {
      setLoading(false);
    }
  };

  // Test ghi dữ liệu vào Google Sheet
  const handleWriteSheet = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await googleSheetsService.writeSheet("A1:E3", sampleData);
      setTestResult(
        `✅ Write successful: ${result.updatedCells} cells updated`
      );

      // Refresh data after writing
      setTimeout(() => handleReadSheet(), 1000);
    } catch (error) {
      setError(`Failed to write to sheet: ${error.message}`);
      setTestResult("❌ Write failed");
    } finally {
      setLoading(false);
    }
  };

  // Test append dữ liệu vào Google Sheet
  const handleAppendSheet = async () => {
    setLoading(true);
    setError(null);

    try {
      const newRow = [
        [new Date().toISOString(), "Appended Product", "3", "50", "150"],
      ];

      const result = await googleSheetsService.appendToSheet("A1:E1", newRow);
      setTestResult(`✅ Append successful: ${result.updatedCells} cells added`);

      // Refresh data after appending
      setTimeout(() => handleReadSheet(), 1000);
    } catch (error) {
      setError(`Failed to append to sheet: ${error.message}`);
      setTestResult("❌ Append failed");
    } finally {
      setLoading(false);
    }
  };

  // Test lấy metadata của sheet
  const handleGetMetadata = async () => {
    setLoading(true);
    setError(null);

    try {
      const metadata = await googleSheetsService.getSheetMetadata();
      setTestResult(
        `✅ Metadata: "${metadata.title}" - ${metadata.sheets.length} sheets`
      );
      console.log("Sheet metadata:", metadata);
    } catch (error) {
      setError(`Failed to get metadata: ${error.message}`);
      setTestResult("❌ Metadata retrieval failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Google Sheets Integration Tester</h2>

      {/* Status display */}
      <div
        style={{
          padding: "10px",
          margin: "10px 0",
          backgroundColor: error ? "#ffebee" : "#e8f5e8",
          border: `1px solid ${error ? "#f44336" : "#4caf50"}`,
          borderRadius: "4px",
        }}
      >
        <p>
          <strong>Status:</strong> {testResult}
        </p>
        {error && (
          <p style={{ color: "#f44336" }}>
            <strong>Error:</strong> {error}
          </p>
        )}
      </div>

      {/* Control buttons */}
      <div style={{ margin: "20px 0" }}>
        <button
          onClick={handleGetMetadata}
          disabled={loading}
          style={{ margin: "5px", padding: "10px 15px" }}
        >
          {loading ? "Loading..." : "Get Sheet Metadata"}
        </button>

        <button
          onClick={handleReadSheet}
          disabled={loading}
          style={{ margin: "5px", padding: "10px 15px" }}
        >
          {loading ? "Loading..." : "Read Sheet Data"}
        </button>

        <button
          onClick={handleWriteSheet}
          disabled={loading}
          style={{ margin: "5px", padding: "10px 15px" }}
        >
          {loading ? "Loading..." : "Write Sample Data"}
        </button>

        <button
          onClick={handleAppendSheet}
          disabled={loading}
          style={{ margin: "5px", padding: "10px 15px" }}
        >
          {loading ? "Loading..." : "Append New Row"}
        </button>
      </div>

      {/* Data display */}
      {data.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Sheet Data:</h3>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #ddd",
              }}
            >
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        style={{
                          border: "1px solid #ddd",
                          padding: "8px",
                          backgroundColor: rowIndex === 0 ? "#f5f5f5" : "white",
                          fontWeight: rowIndex === 0 ? "bold" : "normal",
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SheetTester;
```

## 2. Component Test Google Drive

### src/components/GoogleDrive/DriveTester.js

```javascript
import React, { useState, useRef } from "react";
import { googleDriveService } from "../../services/googleDrive";

const DriveTester = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testResult, setTestResult] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef(null);

  // Test upload file
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setUploadProgress(`Uploading ${file.name}...`);

    try {
      const fileBuffer = await file.arrayBuffer();
      const result = await googleDriveService.uploadFile(
        fileBuffer,
        file.name,
        file.type
      );

      setTestResult(`✅ Upload successful: ${result.name}`);
      setUploadProgress("");
      console.log("Uploaded file:", result);

      // Refresh file list
      setTimeout(() => handleListFiles(), 1000);
    } catch (error) {
      setError(`Upload failed: ${error.message}`);
      setTestResult("❌ Upload failed");
      setUploadProgress("");
    } finally {
      setLoading(false);
    }
  };

  // Test list files
  const handleListFiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await googleDriveService.listFiles();
      setFiles(result.files);
      setTestResult(`✅ Listed ${result.files.length} files`);
    } catch (error) {
      setError(`Failed to list files: ${error.message}`);
      setTestResult("❌ List files failed");
    } finally {
      setLoading(false);
    }
  };

  // Test create folder
  const handleCreateFolder = async () => {
    const folderName = `Test Folder ${new Date().getTime()}`;
    setLoading(true);
    setError(null);

    try {
      const result = await googleDriveService.createFolder(folderName);
      setTestResult(`✅ Folder created: ${result.name}`);
      console.log("Created folder:", result);

      // Refresh file list
      setTimeout(() => handleListFiles(), 1000);
    } catch (error) {
      setError(`Failed to create folder: ${error.message}`);
      setTestResult("❌ Create folder failed");
    } finally {
      setLoading(false);
    }
  };

  // Test delete file
  const handleDeleteFile = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await googleDriveService.deleteFile(fileId);
      setTestResult(`✅ Deleted: ${fileName}`);

      // Refresh file list
      setTimeout(() => handleListFiles(), 1000);
    } catch (error) {
      setError(`Failed to delete file: ${error.message}`);
      setTestResult("❌ Delete failed");
    } finally {
      setLoading(false);
    }
  };

  // Generate and upload test report
  const handleGenerateTestReport = async () => {
    setLoading(true);
    setError(null);
    setUploadProgress("Generating test report...");

    try {
      const reportData = {
        title: "Test Report",
        timestamp: new Date().toISOString(),
        data: [
          ["Item", "Quantity", "Price", "Total"],
          ["Product A", "10", "100", "1000"],
          ["Product B", "5", "200", "1000"],
          ["Product C", "3", "300", "900"],
        ],
        summary: {
          totalItems: 3,
          totalQuantity: 18,
          totalValue: 2900,
        },
      };

      const jsonContent = JSON.stringify(reportData, null, 2);
      const buffer = new TextEncoder().encode(jsonContent);

      const fileName = `test-report-${new Date().getTime()}.json`;
      const result = await googleDriveService.uploadFile(
        buffer,
        fileName,
        "application/json"
      );

      setTestResult(`✅ Report uploaded: ${result.name}`);
      setUploadProgress("");

      // Refresh file list
      setTimeout(() => handleListFiles(), 1000);
    } catch (error) {
      setError(`Failed to generate report: ${error.message}`);
      setTestResult("❌ Report generation failed");
      setUploadProgress("");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2>Google Drive Integration Tester</h2>

      {/* Status display */}
      <div
        style={{
          padding: "10px",
          margin: "10px 0",
          backgroundColor: error ? "#ffebee" : "#e8f5e8",
          border: `1px solid ${error ? "#f44336" : "#4caf50"}`,
          borderRadius: "4px",
        }}
      >
        <p>
          <strong>Status:</strong> {testResult}
        </p>
        {error && (
          <p style={{ color: "#f44336" }}>
            <strong>Error:</strong> {error}
          </p>
        )}
        {uploadProgress && (
          <p style={{ color: "#2196f3" }}>
            <strong>Progress:</strong> {uploadProgress}
          </p>
        )}
      </div>

      {/* Control buttons */}
      <div style={{ margin: "20px 0" }}>
        <button
          onClick={handleListFiles}
          disabled={loading}
          style={{ margin: "5px", padding: "10px 15px" }}
        >
          {loading ? "Loading..." : "List Files"}
        </button>

        <button
          onClick={handleCreateFolder}
          disabled={loading}
          style={{ margin: "5px", padding: "10px 15px" }}
        >
          {loading ? "Loading..." : "Create Test Folder"}
        </button>

        <button
          onClick={handleGenerateTestReport}
          disabled={loading}
          style={{ margin: "5px", padding: "10px 15px" }}
        >
          {loading ? "Loading..." : "Generate Test Report"}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ margin: "5px", padding: "10px" }}
          disabled={loading}
        />
      </div>

      {/* Files list */}
      {files.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Files in Drive:</h3>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #ddd",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5" }}>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    Size
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    Modified
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, index) => (
                  <tr key={file.id}>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none", color: "#1976d2" }}
                      >
                        {file.name}
                      </a>
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {file.mimeType.includes("folder")
                        ? "📁 Folder"
                        : "📄 File"}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {formatFileSize(file.size)}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {formatDate(file.modifiedTime)}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      <button
                        onClick={() => handleDeleteFile(file.id, file.name)}
                        disabled={loading}
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriveTester;
```

## 3. Dashboard Component tích hợp

### src/components/Dashboard/TestDashboard.js

```javascript
import React, { useState } from "react";
import SheetTester from "../GoogleSheet/SheetTester";
import DriveTester from "../GoogleDrive/DriveTester";

const TestDashboard = () => {
  const [activeTab, setActiveTab] = useState("sheets");

  const tabStyle = (isActive) => ({
    padding: "10px 20px",
    margin: "0 5px",
    border: "1px solid #ddd",
    backgroundColor: isActive ? "#1976d2" : "#f5f5f5",
    color: isActive ? "white" : "#333",
    cursor: "pointer",
    borderRadius: "4px 4px 0 0",
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9f9f9" }}>
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", color: "#333" }}>
          Google Services Integration Test Dashboard
        </h1>

        <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>
          Test your React app's integration with Google Sheets and Google Drive
        </p>

        {/* Tab navigation */}
        <div style={{ marginBottom: "20px", borderBottom: "1px solid #ddd" }}>
          <button
            style={tabStyle(activeTab === "sheets")}
            onClick={() => setActiveTab("sheets")}
          >
            📊 Google Sheets Test
          </button>
          <button
            style={tabStyle(activeTab === "drive")}
            onClick={() => setActiveTab("drive")}
          >
            💾 Google Drive Test
          </button>
        </div>

        {/* Tab content */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "0 4px 4px 4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            minHeight: "500px",
          }}
        >
          {activeTab === "sheets" && <SheetTester />}
          {activeTab === "drive" && <DriveTester />}
        </div>

        {/* Instructions */}
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Instructions:</h3>
          <ol>
            <li>
              <strong>Google Sheets Test:</strong> Test reading, writing, and
              appending data to your Google Sheet
            </li>
            <li>
              <strong>Google Drive Test:</strong> Test uploading files, creating
              folders, and managing files in your Google Drive
            </li>
            <li>
              <strong>Check Console:</strong> Open browser developer tools to
              see detailed logs
            </li>
            <li>
              <strong>Verify Results:</strong> Check your actual Google Sheet
              and Drive to confirm operations
            </li>
          </ol>

          <h4>Expected Results:</h4>
          <ul>
            <li>✅ Green status messages indicate successful operations</li>
            <li>
              ❌ Red error messages indicate configuration or permission issues
            </li>
            <li>
              Files uploaded should appear in your configured Google Drive
              folder
            </li>
            <li>Data written should appear in your configured Google Sheet</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;
```

## 4. Cập nhật App.js để sử dụng Test Dashboard

### src/App.js

```javascript
import React from "react";
import "./App.css";
import TestDashboard from "./components/Dashboard/TestDashboard";

function App() {
  return (
    <div className="App">
      <TestDashboard />
    </div>
  );
}

export default App;
```

## 5. Custom Hook cho Google Sheets

### src/hooks/useGoogleSheets.js

```javascript
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
```

## 6. Custom Hook cho Google Drive

### src/hooks/useGoogleDrive.js

```javascript
import { useState, useCallback } from "react";
import { googleDriveService } from "../services/googleDrive";

export const useGoogleDrive = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState("");

  const uploadFile = useCallback(async (file, fileName, mimeType, folderId) => {
    setLoading(true);
    setError(null);
    setUploadProgress(`Uploading ${fileName || "file"}...`);

    try {
      const result = await googleDriveService.uploadFile(
        file,
        fileName,
        mimeType,
        folderId
      );
      setUploadProgress("");
      return result;
    } catch (err) {
      setError(err.message);
      setUploadProgress("");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listFiles = useCallback(async (folderId, pageSize = 10) => {
    setLoading(true);
    setError(null);

    try {
      const result = await googleDriveService.listFiles(folderId, pageSize);
      setFiles(result.files);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createFolder = useCallback(async (folderName, parentFolderId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await googleDriveService.createFolder(
        folderName,
        parentFolderId
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFile = useCallback(async (fileId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await googleDriveService.deleteFile(fileId);
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
    files,
    loading,
    error,
    uploadProgress,
    uploadFile,
    listFiles,
    createFolder,
    deleteFile,
    clearError,
  };
};
```

## 7. Script kiểm tra kết nối hoàn chỉnh

### scripts/fullConnectionTest.js

```javascript
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");
require("dotenv").config();

async function fullConnectionTest() {
  console.log("🔍 Starting comprehensive Google Services connection test...\n");

  try {
    // 1. Test Service Account Credentials
    console.log("1️⃣ Testing Service Account Credentials...");
    const credentials = {
      type: "service_account",
      project_id: process.env.REACT_APP_GOOGLE_PROJECT_ID,
      private_key_id: process.env.REACT_APP_GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
      ),
      client_email: process.env.REACT_APP_GOOGLE_CLIENT_EMAIL,
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    };

    const auth = new GoogleAuth({
      credentials: credentials,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file",
      ],
    });

    const authClient = await auth.getClient();
    console.log("✅ Service Account authentication successful");
    console.log(`📧 Client Email: ${credentials.client_email}`);

    // 2. Test Google Sheets API
    console.log("\n2️⃣ Testing Google Sheets API...");
    const sheets = google.sheets({ version: "v4", auth: authClient });

    const sheetId = process.env.REACT_APP_GOOGLE_SHEET_ID;
    if (sheetId) {
      try {
        const sheetInfo = await sheets.spreadsheets.get({
          spreadsheetId: sheetId,
        });
        console.log("✅ Google Sheets API connection successful");
        console.log(`📊 Sheet Title: ${sheetInfo.data.properties.title}`);
        console.log(`📋 Number of sheets: ${sheetInfo.data.sheets.length}`);

        // Test reading data
        try {
          const readResult = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: "A1:E5",
          });
          console.log(
            `📖 Read test successful: ${
              readResult.data.values?.length || 0
            } rows found`
          );
        } catch (readError) {
          console.log(
            "⚠️ Read test failed (might be empty sheet):",
            readError.message
          );
        }

        // Test writing data
        try {
          const testData = [["Test", "Connection", new Date().toISOString()]];
          const writeResult = await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: "A1:C1",
            valueInputOption: "RAW",
            requestBody: { values: testData },
          });
          console.log(
            `✏️ Write test successful: ${writeResult.data.updatedCells} cells updated`
          );
        } catch (writeError) {
          console.log("❌ Write test failed:", writeError.message);
        }
      } catch (sheetError) {
        console.log("❌ Google Sheets access failed:", sheetError.message);
      }
    } else {
      console.log("⚠️ REACT_APP_GOOGLE_SHEET_ID not configured");
    }

    // 3. Test Google Drive API
    console.log("\n3️⃣ Testing Google Drive API...");
    const drive = google.drive({ version: "v3", auth: authClient });

    try {
      const driveInfo = await drive.about.get({ fields: "user" });
      console.log("✅ Google Drive API connection successful");
      console.log(`👤 Drive User: ${driveInfo.data.user.displayName}`);

      // Test listing files
      const filesList = await drive.files.list({
        pageSize: 5,
        fields: "files(id, name, mimeType)",
      });
      console.log(`📁 Files accessible: ${filesList.data.files.length}`);

      // Test folder access if configured
      const folderId = process.env.REACT_APP_GOOGLE_DRIVE_FOLDER_ID;
      if (folderId) {
        try {
          const folderFiles = await drive.files.list({
            q: `'${folderId}' in parents`,
            pageSize: 5,
            fields: "files(id, name, mimeType)",
          });
          console.log(
            `📂 Target folder accessible: ${folderFiles.data.files.length} files found`
          );
        } catch (folderError) {
          console.log("❌ Target folder access failed:", folderError.message);
        }
      } else {
        console.log("⚠️ REACT_APP_GOOGLE_DRIVE_FOLDER_ID not configured");
      }
    } catch (driveError) {
      console.log("❌ Google Drive access failed:", driveError.message);
    }

    console.log("\n🎉 Connection test completed!");
  } catch (error) {
    console.error("\n❌ Connection test failed:", error.message);
    console.error("Details:", error);
  }
}

fullConnectionTest();
```

## 8. Cách chạy và test

```bash
# 1. Cài đặt dependencies
npm install

# 2. Cấu hình file .env với thông tin service account

# 3. Test kết nối cơ bản
npm run test:google

# 4. Test kết nối đầy đủ
node scripts/fullConnectionTest.js

# 5. Chạy ứng dụng React
npm start

# 6. Truy cập http://localhost:3000 để test UI
```

## 9. Checklist cho Testing

### Trước khi test:

- [ ] Service Account đã được tạo và có file JSON key
- [ ] Google Sheets API và Drive API đã được kích hoạt
- [ ] Service account đã được share quyền truy cập Google Sheet
- [ ] Service account đã được share quyền truy cập Google Drive folder
- [ ] File .env đã được cấu hình đúng
- [ ] Dependencies đã được cài đặt

### Khi test UI:

- [ ] Test Dashboard hiển thị đúng
- [ ] Google Sheets tab hoạt động: Read, Write, Append
- [ ] Google Drive tab hoạt động: Upload, List, Create folder
- [ ] Không có lỗi trong Console
- [ ] Dữ liệu thực tế được cập nhật trong Google Sheet/Drive

### Nếu có lỗi:

1. Kiểm tra Console để xem lỗi chi tiết
2. Chạy `node scripts/fullConnectionTest.js` để debug
3. Xác nhận quyền truy cập service account
4. Kiểm tra format của private key trong .env

Bây giờ bạn có thể test đầy đủ tính năng Google Services integration!
