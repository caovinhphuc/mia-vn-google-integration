# Hướng dẫn cài đặt Dependencies và cấu hình môi trường

## 1. Cài đặt Dependencies

### Dependencies chính

```bash
# Google APIs client
npm install googleapis

# Authentication
npm install google-auth-library

# File handling
npm install multer
npm install formidable

# Date/Time utilities
npm install moment

# Utility libraries
npm install lodash
npm install axios

# Chart libraries (optional)
npm install chart.js react-chartjs-2
npm install recharts
```

### Dev Dependencies

```bash
# Environment variables
npm install --save-dev dotenv

# CORS for development
npm install --save-dev http-proxy-middleware
```

## 2. Cấu trúc thư mục dự án

```
src/
├── components/
│   ├── GoogleSheet/
│   │   ├── SheetReader.js
│   │   ├── SheetWriter.js
│   │   └── SheetManager.js
│   ├── GoogleDrive/
│   │   ├── DriveUploader.js
│   │   ├── DriveManager.js
│   │   └── FileViewer.js
│   ├── Dashboard/
│   │   ├── Dashboard.js
│   │   ├── ReportGenerator.js
│   │   └── Charts.js
│   └── Common/
│       ├── LoadingSpinner.js
│       ├── ErrorBoundary.js
│       └── Notification.js
├── services/
│   ├── googleAuth.js
│   ├── googleSheets.js
│   ├── googleDrive.js
│   └── apiService.js
├── utils/
│   ├── dateUtils.js
│   ├── fileUtils.js
│   └── validators.js
├── hooks/
│   ├── useGoogleSheets.js
│   ├── useGoogleDrive.js
│   └── useFileUpload.js
├── config/
│   └── googleConfig.js
└── constants/
    └── apiConstants.js
```

## 3. Cấu hình Google Authentication Service

### src/config/googleConfig.js

```javascript
// Google API configuration
export const GOOGLE_CONFIG = {
  SCOPES: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive",
  ],
  SHEET_ID: process.env.REACT_APP_GOOGLE_SHEET_ID,
  DRIVE_FOLDER_ID: process.env.REACT_APP_GOOGLE_DRIVE_FOLDER_ID,
};

// Service Account credentials from environment variables
export const SERVICE_ACCOUNT_CREDENTIALS = {
  type: "service_account",
  project_id: process.env.REACT_APP_GOOGLE_PROJECT_ID,
  private_key_id: process.env.REACT_APP_GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.REACT_APP_GOOGLE_CLIENT_EMAIL,
  client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.REACT_APP_GOOGLE_CLIENT_EMAIL}`,
};

// Validation function
export const validateGoogleConfig = () => {
  const requiredEnvVars = [
    "REACT_APP_GOOGLE_PROJECT_ID",
    "REACT_APP_GOOGLE_PRIVATE_KEY_ID",
    "REACT_APP_GOOGLE_PRIVATE_KEY",
    "REACT_APP_GOOGLE_CLIENT_EMAIL",
    "REACT_APP_GOOGLE_CLIENT_ID",
    "REACT_APP_GOOGLE_SHEET_ID",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  return true;
};
```

## 4. Google Authentication Service

### src/services/googleAuth.js

```javascript
import { GoogleAuth } from "google-auth-library";
import {
  SERVICE_ACCOUNT_CREDENTIALS,
  GOOGLE_CONFIG,
} from "../config/googleConfig";

class GoogleAuthService {
  constructor() {
    this.auth = null;
    this.authClient = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Create auth instance with service account credentials
      this.auth = new GoogleAuth({
        credentials: SERVICE_ACCOUNT_CREDENTIALS,
        scopes: GOOGLE_CONFIG.SCOPES,
      });

      // Get auth client
      this.authClient = await this.auth.getClient();
      this.initialized = true;

      console.log("Google Auth initialized successfully");
      return this.authClient;
    } catch (error) {
      console.error("Failed to initialize Google Auth:", error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async getAuthClient() {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.authClient;
  }

  async getAccessToken() {
    try {
      const authClient = await this.getAuthClient();
      const accessToken = await authClient.getAccessToken();
      return accessToken.token;
    } catch (error) {
      console.error("Failed to get access token:", error);
      throw error;
    }
  }

  isInitialized() {
    return this.initialized;
  }
}

// Export singleton instance
export const googleAuthService = new GoogleAuthService();
export default googleAuthService;
```

## 5. Google Sheets Service

### src/services/googleSheets.js

```javascript
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
```

## 6. Google Drive Service

### src/services/googleDrive.js

```javascript
import { google } from "googleapis";
import { googleAuthService } from "./googleAuth";
import { GOOGLE_CONFIG } from "../config/googleConfig";

class GoogleDriveService {
  constructor() {
    this.drive = null;
  }

  async initialize() {
    try {
      const authClient = await googleAuthService.getAuthClient();
      this.drive = google.drive({ version: "v3", auth: authClient });
      return this.drive;
    } catch (error) {
      console.error("Failed to initialize Google Drive:", error);
      throw error;
    }
  }

  async getDrive() {
    if (!this.drive) {
      await this.initialize();
    }
    return this.drive;
  }

  // Upload file to Drive
  async uploadFile(
    fileBuffer,
    fileName,
    mimeType,
    folderId = GOOGLE_CONFIG.DRIVE_FOLDER_ID
  ) {
    try {
      const drive = await this.getDrive();

      const fileMetadata = {
        name: fileName,
        parents: folderId ? [folderId] : undefined,
      };

      const media = {
        mimeType: mimeType,
        body: fileBuffer,
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id,name,webViewLink,webContentLink",
      });

      return {
        id: response.data.id,
        name: response.data.name,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  // Create folder
  async createFolder(
    folderName,
    parentFolderId = GOOGLE_CONFIG.DRIVE_FOLDER_ID
  ) {
    try {
      const drive = await this.getDrive();

      const fileMetadata = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: parentFolderId ? [parentFolderId] : undefined,
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        fields: "id,name,webViewLink",
      });

      return {
        id: response.data.id,
        name: response.data.name,
        webViewLink: response.data.webViewLink,
      };
    } catch (error) {
      console.error("Error creating folder:", error);
      throw new Error(`Failed to create folder: ${error.message}`);
    }
  }

  // List files in folder
  async listFiles(folderId = GOOGLE_CONFIG.DRIVE_FOLDER_ID, pageSize = 10) {
    try {
      const drive = await this.getDrive();

      const query = folderId ? `'${folderId}' in parents` : undefined;

      const response = await drive.files.list({
        q: query,
        pageSize: pageSize,
        fields:
          "nextPageToken, files(id, name, size, mimeType, createdTime, modifiedTime, webViewLink)",
      });

      return {
        files: response.data.files,
        nextPageToken: response.data.nextPageToken,
      };
    } catch (error) {
      console.error("Error listing files:", error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  // Delete file
  async deleteFile(fileId) {
    try {
      const drive = await this.getDrive();
      await drive.files.delete({
        fileId: fileId,
      });
      return { success: true, message: "File deleted successfully" };
    } catch (error) {
      console.error("Error deleting file:", error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // Get file metadata
  async getFileMetadata(fileId) {
    try {
      const drive = await this.getDrive();
      const response = await drive.files.get({
        fileId: fileId,
        fields:
          "id, name, size, mimeType, createdTime, modifiedTime, webViewLink, webContentLink",
      });

      return response.data;
    } catch (error) {
      console.error("Error getting file metadata:", error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }
}

// Export singleton instance
export const googleDriveService = new GoogleDriveService();
export default googleDriveService;
```

## 7. Package.json cập nhật

Thêm scripts hữu ích vào package.json:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "test:google": "node scripts/testGoogleConnection.js",
    "setup:env": "node scripts/setupEnvironment.js"
  }
}
```

## 8. Test Script

### scripts/testGoogleConnection.js

```javascript
const { GoogleAuth } = require("google-auth-library");
require("dotenv").config();

async function testGoogleConnection() {
  try {
    console.log("Testing Google Service Account connection...");

    // Test credentials
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
    const accessToken = await authClient.getAccessToken();

    console.log("✅ Google Service Account connection successful!");
    console.log("Access token obtained:", accessToken.token ? "Yes" : "No");
    console.log("Client email:", process.env.REACT_APP_GOOGLE_CLIENT_EMAIL);
  } catch (error) {
    console.error("❌ Google Service Account connection failed:");
    console.error(error.message);
  }
}

testGoogleConnection();
```

## 9. Chạy và kiểm tra

```bash
# Cài đặt dependencies
npm install

# Test kết nối Google
npm run test:google

# Chạy ứng dụng
npm start
```

## 10. Troubleshooting phổ biến

### Lỗi CORS trong development

Tạo file `src/setupProxy.js`:

```javascript
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api/google",
    createProxyMiddleware({
      target: "https://sheets.googleapis.com",
      changeOrigin: true,
      pathRewrite: {
        "^/api/google": "",
      },
    })
  );
};
```

### Lỗi Private Key format

Đảm bảo private key trong .env được format đúng:

```env
REACT_APP_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

Tiếp theo, tôi sẽ tạo file code mẫu để test thực tế.
