# API Reference và Best Practices

## 1. Google Sheets API Reference

### 1.1 Authentication Methods

#### Service Account Authentication (Recommended)

```javascript
import { GoogleAuth } from "google-auth-library";

const auth = new GoogleAuth({
  credentials: {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    // ... other credentials
  },
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
  ],
});
```

#### OAuth 2.0 Authentication (For user context)

```javascript
import { OAuth2Client } from "google-auth-library";

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
```

### 1.2 Core Google Sheets Operations

#### Reading Data

```javascript
// Basic read
const response = await sheets.spreadsheets.values.get({
  spreadsheetId: "your-sheet-id",
  range: "Sheet1!A1:D10", // Sheet name + range
});

// Batch read multiple ranges
const response = await sheets.spreadsheets.values.batchGet({
  spreadsheetId: "your-sheet-id",
  ranges: ["Sheet1!A1:D10", "Sheet2!A1:C5"],
  valueRenderOption: "FORMATTED_VALUE", // FORMATTED_VALUE, UNFORMATTED_VALUE, FORMULA
  dateTimeRenderOption: "FORMATTED_STRING", // FORMATTED_STRING, SERIAL_NUMBER
});
```

#### Writing Data

```javascript
// Basic write
const response = await sheets.spreadsheets.values.update({
  spreadsheetId: "your-sheet-id",
  range: "Sheet1!A1:C3",
  valueInputOption: "RAW", // RAW, USER_ENTERED
  requestBody: {
    values: [
      ["Name", "Age", "City"],
      ["John", 30, "New York"],
      ["Jane", 25, "Los Angeles"],
    ],
  },
});

// Batch write
const response = await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId: "your-sheet-id",
  requestBody: {
    valueInputOption: "RAW",
    data: [
      {
        range: "Sheet1!A1:C3",
        values: [["Data1", "Data2", "Data3"]],
      },
      {
        range: "Sheet2!A1:B2",
        values: [["Other1", "Other2"]],
      },
    ],
  },
});
```

#### Appending Data

```javascript
const response = await sheets.spreadsheets.values.append({
  spreadsheetId: "your-sheet-id",
  range: "Sheet1!A1:C1", // Starting range for append
  valueInputOption: "RAW",
  insertDataOption: "INSERT_ROWS", // INSERT_ROWS, OVERWRITE
  requestBody: {
    values: [["New Name", "New Age", "New City"]],
  },
});
```

### 1.3 Advanced Sheets Operations

#### Formatting Cells

```javascript
const response = await sheets.spreadsheets.batchUpdate({
  spreadsheetId: "your-sheet-id",
  requestBody: {
    requests: [
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 3,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.8, green: 0.8, blue: 0.8 },
              textFormat: { bold: true },
              horizontalAlignment: "CENTER",
            },
          },
          fields:
            "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
        },
      },
    ],
  },
});
```

#### Creating New Sheets

```javascript
const response = await sheets.spreadsheets.batchUpdate({
  spreadsheetId: "your-sheet-id",
  requestBody: {
    requests: [
      {
        addSheet: {
          properties: {
            title: "New Sheet Name",
            gridProperties: {
              rowCount: 1000,
              columnCount: 26,
            },
          },
        },
      },
    ],
  },
});
```

#### Data Validation

```javascript
const response = await sheets.spreadsheets.batchUpdate({
  spreadsheetId: "your-sheet-id",
  requestBody: {
    requests: [
      {
        setDataValidation: {
          range: {
            sheetId: 0,
            startRowIndex: 1,
            endRowIndex: 100,
            startColumnIndex: 2,
            endColumnIndex: 3,
          },
          rule: {
            condition: {
              type: "NUMBER_BETWEEN",
              values: [{ userEnteredValue: "1" }, { userEnteredValue: "100" }],
            },
            inputMessage: "Enter a number between 1 and 100",
            strict: true,
          },
        },
      },
    ],
  },
});
```

## 2. Google Drive API Reference

### 2.1 File Operations

#### Upload File

```javascript
// Simple upload
const response = await drive.files.create({
  requestBody: {
    name: "filename.txt",
    parents: ["folder-id"], // Optional: specify parent folder
  },
  media: {
    mimeType: "text/plain",
    body: fileContent,
  },
});

// Resumable upload for large files
const response = await drive.files.create({
  requestBody: {
    name: "large-file.zip",
    parents: ["folder-id"],
  },
  media: {
    mimeType: "application/zip",
    body: fs.createReadStream("path/to/large-file.zip"),
  },
  uploadType: "resumable",
});
```

#### Download File

```javascript
const response = await drive.files.get({
  fileId: "file-id",
  alt: "media", // Download file content
});

// Get file metadata
const metadata = await drive.files.get({
  fileId: "file-id",
  fields: "id,name,size,mimeType,createdTime,modifiedTime",
});
```

#### List Files

```javascript
const response = await drive.files.list({
  q: "name contains 'report' and mimeType='application/pdf'",
  pageSize: 10,
  fields: "nextPageToken, files(id, name, size, createdTime)",
  orderBy: "createdTime desc",
});
```

### 2.2 Query Operators

#### Common Query Examples

```javascript
// Files in a specific folder
const query = "'folder-id' in parents";

// Files modified after a date
const query = "modifiedTime > '2023-01-01T00:00:00'";

// Files with specific name pattern
const query = "name contains 'report' and name contains '2023'";

// Files of specific type
const query = "mimeType='application/vnd.google-apps.spreadsheet'";

// Combine multiple conditions
const query =
  "name contains 'sales' and mimeType='text/csv' and modifiedTime > '2023-01-01'";
```

### 2.3 Folder Operations

#### Create Folder

```javascript
const response = await drive.files.create({
  requestBody: {
    name: "New Folder",
    mimeType: "application/vnd.google-apps.folder",
    parents: ["parent-folder-id"],
  },
});
```

#### Move File to Folder

```javascript
const response = await drive.files.update({
  fileId: "file-id",
  addParents: "new-parent-folder-id",
  removeParents: "old-parent-folder-id",
});
```

## 3. Error Handling Best Practices

### 3.1 Common Error Types

#### Google API Errors

```javascript
class GoogleAPIErrorHandler {
  static handleError(error) {
    switch (error.code) {
      case 400:
        return "Bad Request: Check your request parameters";
      case 401:
        return "Unauthorized: Check your authentication credentials";
      case 403:
        return "Forbidden: Check API permissions and quotas";
      case 404:
        return "Not Found: Check if the resource exists";
      case 429:
        return "Rate Limit Exceeded: Please retry after some time";
      case 500:
        return "Internal Server Error: Google API temporary issue";
      default:
        return `Unknown error: ${error.message}`;
    }
  }
}
```

#### Retry Logic with Exponential Backoff

```javascript
class RetryHelper {
  static async withRetry(operation, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Only retry on specific errors
        if (error.code === 429 || error.code >= 500) {
          console.log(`Retry attempt ${attempt} after ${delay}ms`);
          continue;
        }

        throw error;
      }
    }
  }
}
```

### 3.2 Rate Limiting Best Practices

#### Implement Rate Limiting

```javascript
class RateLimiter {
  constructor(requestsPerSecond = 10) {
    this.requestsPerSecond = requestsPerSecond;
    this.lastRequestTime = 0;
    this.queue = [];
  }

  async throttle() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 1000 / this.requestsPerSecond;

    if (timeSinceLastRequest < minInterval) {
      const delay = minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
  }

  async execute(operation) {
    await this.throttle();
    return await operation();
  }
}

// Usage
const rateLimiter = new RateLimiter(10); // 10 requests per second
const result = await rateLimiter.execute(() => sheets.spreadsheets.values.get(...));
```

## 4. Performance Optimization

### 4.1 Batch Operations

#### Batch Multiple Sheet Operations

```javascript
class BatchOperationManager {
  constructor() {
    this.operations = [];
  }

  addReadOperation(range) {
    this.operations.push({ type: "read", range });
  }

  addWriteOperation(range, values) {
    this.operations.push({ type: "write", range, values });
  }

  async executeBatch(sheets, spreadsheetId) {
    const readOperations = this.operations.filter((op) => op.type === "read");
    const writeOperations = this.operations.filter((op) => op.type === "write");

    // Execute reads in batch
    let readResults = [];
    if (readOperations.length > 0) {
      const response = await sheets.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges: readOperations.map((op) => op.range),
      });
      readResults = response.data.valueRanges;
    }

    // Execute writes in batch
    let writeResults = [];
    if (writeOperations.length > 0) {
      const response = await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: "RAW",
          data: writeOperations.map((op) => ({
            range: op.range,
            values: op.values,
          })),
        },
      });
      writeResults = response.data.replies;
    }

    return { readResults, writeResults };
  }
}
```

### 4.2 Caching Strategies

#### Simple In-Memory Cache

```javascript
class SimpleCache {
  constructor(ttlMinutes = 5) {
    this.cache = new Map();
    this.ttl = ttlMinutes * 60 * 1000;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

// Usage
const cache = new SimpleCache(10); // 10 minutes TTL

async function getCachedSheetData(range) {
  const cacheKey = `sheet_${range}`;
  let data = cache.get(cacheKey);

  if (!data) {
    data = await sheets.spreadsheets.values.get({ range });
    cache.set(cacheKey, data);
  }

  return data;
}
```

## 5. Security Best Practices

### 5.1 Environment Variables Management

#### Secure Environment Configuration

```javascript
// .env.example
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID=your_key_id
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=your-service@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_CLIENT_ID=your_client_id
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_SHEET_ID=your-sheet-id
GOOGLE_DRIVE_FOLDER_ID=your-folder-id

// Environment validation
const requiredEnvVars = [
  'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
  'GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL',
  'GOOGLE_PROJECT_ID'
];

function validateEnvironment() {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}
```

### 5.2 Data Validation

#### Input Validation

```javascript
class DataValidator {
  static validateSheetRange(range) {
    const rangePattern = /^[A-Za-z0-9\s]+![A-Z]+\d+:[A-Z]+\d+$/;
    if (!rangePattern.test(range)) {
      throw new Error("Invalid sheet range format");
    }
  }

  static validateSheetData(data) {
    if (!Array.isArray(data)) {
      throw new Error("Sheet data must be an array");
    }

    data.forEach((row, index) => {
      if (!Array.isArray(row)) {
        throw new Error(`Row ${index} must be an array`);
      }
    });
  }

  static sanitizeFileName(fileName) {
    // Remove potentially dangerous characters
    return fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  }
}
```

### 5.3 Access Control

#### Role-Based Access Control

```javascript
class AccessControl {
  constructor() {
    this.roles = {
      admin: ["read", "write", "delete", "manage"],
      editor: ["read", "write"],
      viewer: ["read"],
    };
  }

  hasPermission(userRole, action) {
    const permissions = this.roles[userRole] || [];
    return permissions.includes(action);
  }

  requirePermission(userRole, action) {
    if (!this.hasPermission(userRole, action)) {
      throw new Error(
        `Permission denied: ${action} requires higher privileges`
      );
    }
  }
}

// Usage
const accessControl = new AccessControl();

function secureSheetOperation(userRole, operation) {
  accessControl.requirePermission(userRole, "write");
  return operation();
}
```

## 6. Testing Best Practices

### 6.1 Unit Testing

#### Mock Google APIs

```javascript
// __mocks__/googleapis.js
export const google = {
  sheets: jest.fn(() => ({
    spreadsheets: {
      values: {
        get: jest.fn(),
        update: jest.fn(),
        append: jest.fn(),
        batchGet: jest.fn(),
        batchUpdate: jest.fn(),
      },
    },
  })),
  drive: jest.fn(() => ({
    files: {
      create: jest.fn(),
      get: jest.fn(),
      list: jest.fn(),
      delete: jest.fn(),
    },
  })),
};
```

#### Test Example

```javascript
// services/__tests__/googleSheets.test.js
import { googleSheetsService } from "../googleSheets";
import { google } from "googleapis";

jest.mock("googleapis");

describe("GoogleSheetsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should read sheet data successfully", async () => {
    const mockData = {
      data: {
        values: [
          ["Name", "Age"],
          ["John", "30"],
        ],
      },
    };

    google.sheets().spreadsheets.values.get.mockResolvedValue(mockData);

    const result = await googleSheetsService.readSheet("A1:B2");

    expect(result.data).toEqual(mockData.data.values);
    expect(google.sheets().spreadsheets.values.get).toHaveBeenCalledWith({
      spreadsheetId: expect.any(String),
      range: "A1:B2",
    });
  });
});
```

### 6.2 Integration Testing

#### Test Real API Connections

```javascript
// tests/integration/googleAPI.test.js
describe("Google API Integration", () => {
  test("should connect to Google Sheets API", async () => {
    const result = await googleSheetsService.getSheetMetadata();
    expect(result.title).toBeDefined();
    expect(result.sheets).toBeInstanceOf(Array);
  });

  test("should upload file to Google Drive", async () => {
    const testFile = Buffer.from("test content");
    const result = await googleDriveService.uploadFile(
      testFile,
      "test-file.txt",
      "text/plain"
    );

    expect(result.id).toBeDefined();
    expect(result.name).toBe("test-file.txt");

    // Cleanup
    await googleDriveService.deleteFile(result.id);
  });
});
```

## 7. Monitoring và Logging

### 7.1 Logging Best Practices

#### Structured Logging

```javascript
class Logger {
  static info(message, metadata = {}) {
    console.log(
      JSON.stringify({
        level: "info",
        message,
        timestamp: new Date().toISOString(),
        ...metadata,
      })
    );
  }

  static error(message, error = {}, metadata = {}) {
    console.error(
      JSON.stringify({
        level: "error",
        message,
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code,
        },
        timestamp: new Date().toISOString(),
        ...metadata,
      })
    );
  }

  static performance(operation, duration, metadata = {}) {
    console.log(
      JSON.stringify({
        level: "performance",
        operation,
        duration,
        timestamp: new Date().toISOString(),
        ...metadata,
      })
    );
  }
}
```

### 7.2 Performance Monitoring

#### Track API Performance

```javascript
class PerformanceMonitor {
  static async trackOperation(operationName, operation) {
    const startTime = Date.now();

    try {
      const result = await operation();
      const duration = Date.now() - startTime;

      Logger.performance(operationName, duration, {
        status: "success",
        resultSize: JSON.stringify(result).length,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      Logger.performance(operationName, duration, {
        status: "error",
        error: error.message,
      });

      throw error;
    }
  }
}

// Usage
const result = await PerformanceMonitor.trackOperation("sheets.read", () =>
  googleSheetsService.readSheet("A1:D100")
);
```

## 8. Deployment Best Practices

### 8.1 Environment Configuration

#### Multi-Environment Setup

```javascript
// config/environments.js
const environments = {
  development: {
    googleSheetId: process.env.DEV_GOOGLE_SHEET_ID,
    googleDriveFolderId: process.env.DEV_GOOGLE_DRIVE_FOLDER_ID,
    logLevel: "debug",
  },
  staging: {
    googleSheetId: process.env.STAGING_GOOGLE_SHEET_ID,
    googleDriveFolderId: process.env.STAGING_GOOGLE_DRIVE_FOLDER_ID,
    logLevel: "info",
  },
  production: {
    googleSheetId: process.env.PROD_GOOGLE_SHEET_ID,
    googleDriveFolderId: process.env.PROD_GOOGLE_DRIVE_FOLDER_ID,
    logLevel: "error",
  },
};

export const getConfig = () => {
  const env = process.env.NODE_ENV || "development";
  return environments[env];
};
```

### 8.2 Health Checks

#### API Health Monitoring

```javascript
class HealthChecker {
  static async checkGoogleAPIs() {
    const checks = {
      sheets: false,
      drive: false,
      timestamp: new Date().toISOString(),
    };

    try {
      await googleSheetsService.getSheetMetadata();
      checks.sheets = true;
    } catch (error) {
      Logger.error("Google Sheets health check failed", error);
    }

    try {
      await googleDriveService.listFiles();
      checks.drive = true;
    } catch (error) {
      Logger.error("Google Drive health check failed", error);
    }

    return checks;
  }
}
```

Đây là tài liệu reference hoàn chỉnh để phát triển và maintain ứng dụng React Google Integration một cách hiệu quả và an toàn!
