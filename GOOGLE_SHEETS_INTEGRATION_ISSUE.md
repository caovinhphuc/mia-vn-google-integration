# 🔍 Phân Tích Vấn Đề Google Sheets Integration

## ❌ Vấn Đề Hiện Tại

Frontend ở mục Google Sheets đang hiển thị **MOCK DATA** thay vì data thật từ Google Sheets.

## 📊 Luồng Dữ Liệu Hiện Tại

### 1. Frontend (GoogleSheetsIntegration.jsx)

- **Component**: `src/components/google/GoogleSheetsIntegration.jsx`
- **Service**: `src/services/googleSheetsApi.js`
- **Calls**:
  - `googleSheetsApiService.getSheetMetadata()` → `GET /api/sheets/metadata`
  - `googleSheetsApiService.readSheet(range)` → `GET /api/sheets/read`
- **Spreadsheet ID**: `18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As` (hardcoded)

### 2. Backend (server.js)

- **Endpoints**:
  - `GET /api/sheets/metadata/:sheetId?` (dòng 825)
  - `GET /api/sheets/read` (dòng 745)
- **Status**: ❌ **Đang trả về MOCK DATA**

  ```javascript
  // Mock data (dòng 750-756)
  const mockData = [
    ["Name", "Email", "Phone", "Status"],
    ["John Doe", "john@example.com", "123-456-7890", "Active"],
    // ...
  ];
  ```

## ✅ Giải Pháp

### Backend đã có sẵn helpers

- **File**: `backend/utils/googleSheetsHelpers.js`
- **Functions**:
  - `getAllRecords()` - Lấy tất cả records từ sheet
  - Helper này sử dụng Google Sheets API thật
- **Credentials**: Tìm ở:
  - `process.env.GOOGLE_APPLICATION_CREDENTIALS`
  - `process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH`
  - `../../mia-logistics-469406-eec521c603c0.json`
- **Default Spreadsheet ID**: `18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As`

### Cần làm

1. **Update `/api/sheets/read` endpoint**:
   - Sử dụng Google Sheets API thật
   - Parse range để lấy sheet name và range
   - Trả về data thật từ Google Sheets

2. **Update `/api/sheets/metadata/:sheetId?` endpoint**:
   - Sử dụng Google Sheets API để lấy metadata thật
   - Trả về sheets list và properties thật

3. **Đảm bảo format response đúng**:
   - Frontend expect: `{ success: true, data: [...] }`
   - Metadata expect: `{ title, sheets: [{ properties: { sheetId, title, gridProperties } }] }`
   - Read expect: `{ data: [[...]], range, majorDimension }`

## 📝 Chi Tiết Cần Fix

### Endpoint 1: GET /api/sheets/read

**Current (Mock)**:

```javascript
app.get("/api/sheets/read", async (req, res) => {
  const mockData = [
    ["Name", "Email", "Phone", "Status"],
    ["John Doe", "john@example.com", "123-456-7890", "Active"],
    // ...
  ];
  res.json({ success: true, data: mockData, range, majorDimension: "ROWS" });
});
```

**Should be**:

```javascript
app.get("/api/sheets/read", async (req, res) => {
  const { range = "A1:Z1000", sheetId } = req.query;
  // Parse range: "Sheet1!A1:Z1000" → sheetName = "Sheet1", range = "A1:Z1000"
  // Use Google Sheets API to get real data
  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId || DEFAULT_SPREADSHEET_ID,
    range: range,
  });
  res.json({
    success: true,
    data: response.data.values || [],
    range: range,
    majorDimension: "ROWS",
  });
});
```

### Endpoint 2: GET /api/sheets/metadata/:sheetId?

**Current (Mock)**:

```javascript
app.get('/api/sheets/metadata/:sheetId?', async (req, res) => {
  const mockMetadata = {
    spreadsheetId: sheetId || 'default_sheet_id',
    properties: { title: 'Sample Spreadsheet', ... },
    sheets: [
      { properties: { sheetId: 0, title: 'Sheet1', ... } },
      { properties: { sheetId: 1, title: 'Sheet2', ... } },
    ],
  }
  res.json({ success: true, data: mockMetadata })
})
```

**Should be**:

```javascript
app.get("/api/sheets/metadata/:sheetId?", async (req, res) => {
  const { sheetId } = req.params;
  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.get({
    spreadsheetId: sheetId || DEFAULT_SPREADSHEET_ID,
  });
  res.json({
    success: true,
    data: {
      spreadsheetId: response.data.spreadsheetId,
      properties: response.data.properties,
      sheets: response.data.sheets.map((sheet) => ({
        sheetId: sheet.properties.sheetId,
        title: sheet.properties.title,
        gridProperties: sheet.properties.gridProperties,
      })),
    },
  });
});
```

## 🔧 Files Cần Sửa

1. **`backend/src/server.js`**:
   - Update endpoint `/api/sheets/read` (dòng 745)
   - Update endpoint `/api/sheets/metadata/:sheetId?` (dòng 825)
   - Import Google Sheets API helpers hoặc setup auth

2. **Có thể cần**:
   - Kiểm tra credentials file tồn tại
   - Handle errors properly
   - Add logging

## ⚠️ Lưu Ý

- Cần có Google Service Account credentials
- Cần enable Google Sheets API
- Cần share spreadsheet với service account email
- Default spreadsheet ID: `18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As`
