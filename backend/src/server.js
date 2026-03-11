const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const { google } = require("googleapis");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3001;

// Google Sheets API Setup
const DEFAULT_SPREADSHEET_ID =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
  process.env.REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID ||
  "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As";

// Google Drive API Setup (có thể dùng chung folder ID với Sheets hoặc riêng)
const DEFAULT_DRIVE_FOLDER_ID =
  process.env.GOOGLE_DRIVE_FOLDER_ID ||
  process.env.REACT_APP_GOOGLE_DRIVE_FOLDER_ID ||
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
  process.env.REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID ||
  null; // Default: list from root

let googleSheetsAuth = null;
let googleSheetsClient = null;

let googleDriveAuth = null;
let googleDriveClient = null;

// Initialize Google Drive API (lazy load)
async function initGoogleDrive() {
  if (googleDriveClient) return googleDriveClient; // Return existing client if already initialized

  try {
    // Try to find credentials file (same as Google Sheets)
    const possiblePaths = [
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
      path.join(__dirname, "../../mia-logistics-469406-eec521c603c0.json"),
      path.join(__dirname, "../../config/service_account.json"),
      path.join(__dirname, "../../automation/config/service_account.json"),
    ];

    let keyFile = null;
    const fs = require("fs");
    for (const filePath of possiblePaths) {
      if (filePath && fs.existsSync(filePath)) {
        keyFile = filePath;
        break;
      }
    }

    if (!keyFile) {
      console.warn("⚠️ No Google Drive credentials file found, will use mock data");
      return null;
    }

    googleDriveAuth = new google.auth.GoogleAuth({
      keyFile,
      scopes: [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/drive.readonly",
      ],
    });

    googleDriveClient = google.drive({ version: "v3", auth: googleDriveAuth });
    console.log("✅ Google Drive API initialized");
    return googleDriveClient;
  } catch (error) {
    console.error("⚠️ Google Drive API initialization failed:", error.message);
    console.error("   Will use mock data as fallback");
    return null; // Return null if initialization fails
  }
}

// Initialize Google Sheets API (lazy load)
async function initGoogleSheets() {
  if (googleSheetsClient) return googleSheetsClient;

  try {
    // Try to find credentials file
    const possiblePaths = [
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
      path.join(__dirname, "../../config/service_account.json"),
      path.join(__dirname, "../../automation/config/service_account.json"),
      path.join(__dirname, "../../mia-logistics-469406-eec521c603c0.json"),
    ];

    let keyFile = null;
    for (const filePath of possiblePaths) {
      if (filePath && require("fs").existsSync(filePath)) {
        keyFile = filePath;
        break;
      }
    }

    if (!keyFile) {
      console.warn("⚠️ No Google Sheets credentials file found, will use mock data");
      return null;
    }

    googleSheetsAuth = new google.auth.GoogleAuth({
      keyFile,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
      ],
    });

    googleSheetsClient = google.sheets({ version: "v4", auth: googleSheetsAuth });
    console.log("✅ Google Sheets API initialized with:", keyFile);
    return googleSheetsClient;
  } catch (error) {
    console.error("⚠️ Google Sheets API initialization failed:", error.message);
    console.error("   Will use mock data as fallback");
    return null;
  }
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../build")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend server is running",
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// API Routes
app.get("/api/status", (req, res) => {
  res.json({
    service: "React OAS Backend",
    version: "3.0",
    status: "operational",
    uptime: process.uptime(),
  });
});

// ============================================
// Authentication Endpoints
// ============================================

// Mock user database (in production, use proper database)
const users = [
  {
    email: "admin@mia.vn",
    password: "admin123", // In production, use hashed passwords
    fullName: "Admin User",
    role: "admin",
    permissions: ["*"],
  },
  {
    email: "user@mia.vn",
    password: "user123",
    fullName: "Regular User",
    role: "user",
    permissions: ["read"],
  },
];

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, mfaToken } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email và mật khẩu là bắt buộc",
      });
    }

    // Find user
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Email hoặc mật khẩu không đúng",
      });
    }

    // Check password (in production, use bcrypt to compare hashed passwords)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        error: "Email hoặc mật khẩu không đúng",
      });
    }

    // Generate token
    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    // Create user object (without password)
    const userObj = {
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      permissions: user.permissions,
      id: user.email.replace("@", "_").replace(".", "_"),
    };

    // Create session object
    const session = {
      session_id: sessionId,
      user_id: userObj.id,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    console.log(`✅ User logged in: ${email} at ${new Date().toISOString()}`);

    // Return success response
    res.json({
      success: true,
      user: userObj,
      session: session,
      token: token,
      message: "Đăng nhập thành công",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi server khi xử lý đăng nhập",
    });
  }
});

// Verify session/token endpoint (support both GET and POST)
app.get("/api/auth/verify", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Token không được cung cấp",
      });
    }

    // In production, verify JWT token
    // For now, just check if token format is valid
    if (token.startsWith("token_")) {
      res.json({
        success: true,
        valid: true,
        message: "Token hợp lệ",
      });
    } else {
      res.status(401).json({
        success: false,
        error: "Token không hợp lệ",
      });
    }
  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi server khi xác minh token",
    });
  }
});

app.post("/api/auth/verify", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Token không được cung cấp",
      });
    }

    // In production, verify JWT token
    // For now, just check if token format is valid
    if (token.startsWith("token_")) {
      res.json({
        success: true,
        valid: true,
        message: "Token hợp lệ",
      });
    } else {
      res.status(401).json({
        success: false,
        error: "Token không hợp lệ",
      });
    }
  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi server khi xác minh token",
    });
  }
});

// Logout endpoint
app.post("/api/auth/logout", async (req, res) => {
  try {
    // In production, invalidate session/token in database
    console.log("User logged out");
    res.json({
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi server khi đăng xuất",
    });
  }
});

// ============================================
// Reports Endpoints
// ============================================

// Get all reports
app.get("/api/reports", (req, res) => {
  const { timeframe = "7d", type = "all" } = req.query;

  res.json({
    success: true,
    data: {
      timeframe,
      type,
      reports: [
        {
          id: 1,
          title: "Sales Performance Report",
          type: "sales",
          date: new Date().toISOString(),
          summary: {
            totalSales: 1250000,
            growth: 12.5,
            topProduct: "Product A",
            currency: "VND",
          },
        },
        {
          id: 2,
          title: "Customer Analytics Report",
          type: "analytics",
          date: new Date().toISOString(),
          summary: {
            totalCustomers: 5420,
            activeUsers: 3210,
            retention: 78.5,
            newCustomers: 342,
          },
        },
        {
          id: 3,
          title: "Inventory Status Report",
          type: "inventory",
          date: new Date().toISOString(),
          summary: {
            totalItems: 1250,
            lowStock: 45,
            outOfStock: 12,
            value: 850000000,
          },
        },
        {
          id: 4,
          title: "Financial Summary Report",
          type: "financial",
          date: new Date().toISOString(),
          summary: {
            revenue: 2500000000,
            expenses: 1800000000,
            profit: 700000000,
            margin: 28.0,
          },
        },
      ],
      generated_at: new Date().toISOString(),
      total_reports: 4,
    },
  });
});

// Get specific report by ID
app.get("/api/reports/:id", (req, res) => {
  const { id } = req.params;

  res.json({
    success: true,
    data: {
      id: parseInt(id),
      title: `Detailed Report #${id}`,
      type: "detailed",
      created_at: new Date().toISOString(),
      content: {
        summary: "Chi tiết báo cáo đầy đủ",
        metrics: {
          revenue: 1250000000,
          customers: 5420,
          growth: 12.5,
          orders: 1234,
          avgOrderValue: 230000,
        },
        charts: [
          {
            type: "line",
            title: "Revenue Trend",
            data: [100, 120, 135, 142, 158, 175, 190],
          },
          {
            type: "bar",
            title: "Sales by Category",
            data: [100, 200, 150, 300, 250],
          },
          {
            type: "pie",
            title: "Customer Distribution",
            data: [30, 25, 20, 15, 10],
          },
        ],
        insights: [
          "Doanh thu tăng 12.5% so với tháng trước",
          "Sản phẩm A là best seller với 450 đơn hàng",
          "Khách hàng mới tăng 15% trong tuần qua",
          "Tỷ lệ giữ chân khách hàng đạt 78.5%",
        ],
      },
      generated_at: new Date().toISOString(),
    },
  });
});

// Generate new report
app.post("/api/reports/generate", (req, res) => {
  const { reportType = "general", timeframe = "7d", options = {} } = req.body;

  res.json({
    success: true,
    message: "Báo cáo đang được tạo",
    data: {
      reportId: Date.now(),
      status: "processing",
      estimatedTime: "2-3 phút",
      reportType,
      timeframe,
      options,
      progress: 0,
      created_at: new Date().toISOString(),
    },
  });
});

// Get report generation status
app.get("/api/reports/status/:reportId", (req, res) => {
  const { reportId } = req.params;

  res.json({
    success: true,
    data: {
      reportId: parseInt(reportId),
      status: "completed",
      progress: 100,
      downloadUrl: `/api/reports/download/${reportId}`,
      completed_at: new Date().toISOString(),
    },
  });
});

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send welcome message
  socket.emit("welcome", {
    message: "Connected to React OAS Backend",
    timestamp: new Date().toISOString(),
  });

  // Handle real-time data requests
  socket.on("request_data", (data) => {
    console.log("Data request received:", data);

    // Simulate real-time data
    const mockData = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      value: Math.random() * 100,
      status: "active",
    };

    socket.emit("data_update", mockData);
  });

  // Handle AI analytics requests
  socket.on("ai_analysis", (data) => {
    console.log("AI analysis request:", data);

    // Simulate AI processing
    setTimeout(() => {
      const aiResult = {
        id: Date.now(),
        prediction: Math.random() * 100,
        confidence: Math.random(),
        timestamp: new Date().toISOString(),
        analysis: "AI analysis completed",
      };

      socket.emit("ai_result", aiResult);
    }, 1000);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// ============================================
// Retail/Dashboard API Endpoints
// ============================================

// Retail Dashboard
app.get("/api/retail/dashboard", (req, res) => {
  res.json({
    success: true,
    data: {
      totalSales: 1250000,
      totalOrders: 342,
      averageOrderValue: 3654,
      conversionRate: 3.2,
      topProducts: [
        { name: "Product A", sales: 45000, quantity: 120 },
        { name: "Product B", sales: 38000, quantity: 95 },
      ],
    },
  });
});

// Sales Metrics
app.get("/api/retail/sales", (req, res) => {
  const timeframe = req.query.timeframe || "7d";
  res.json({
    success: true,
    data: {
      timeframe,
      totalSales: 1250000,
      growth: 12.5,
      metrics: [
        { date: "2025-11-19", sales: 180000 },
        { date: "2025-11-20", sales: 195000 },
        { date: "2025-11-21", sales: 210000 },
      ],
    },
  });
});

// Inventory Status
app.get("/api/retail/inventory", (req, res) => {
  res.json({
    success: true,
    data: {
      totalItems: 1250,
      lowStock: 45,
      outOfStock: 12,
      categories: [
        { name: "Electronics", count: 450, lowStock: 15 },
        { name: "Clothing", count: 320, lowStock: 8 },
      ],
    },
  });
});

// Customer Analytics
app.get("/api/retail/customers", (req, res) => {
  const timeframe = req.query.timeframe || "7d";
  res.json({
    success: true,
    data: {
      timeframe,
      totalCustomers: 1250,
      newCustomers: 85,
      activeCustomers: 450,
      segments: [
        { segment: "VIP", count: 120, revenue: 450000 },
        { segment: "Regular", count: 880, revenue: 650000 },
      ],
    },
  });
});

// Products
app.get("/api/retail/products", (req, res) => {
  res.json({
    success: true,
    data: {
      products: [
        { id: 1, name: "Product A", price: 99, stock: 45 },
        { id: 2, name: "Product B", price: 149, stock: 28 },
      ],
    },
  });
});

// Stores
app.get("/api/retail/stores", (req, res) => {
  res.json({
    success: true,
    data: {
      stores: [
        { id: 1, name: "Store A", location: "City A", sales: 450000 },
        { id: 2, name: "Store B", location: "City B", sales: 380000 },
      ],
    },
  });
});

// ============================================
// Google Drive API Endpoints
// ============================================

// List files in Google Drive
app.get("/api/drive/files", async (req, res) => {
  try {
    const { folderId, pageSize = 100 } = req.query;
    // Use folderId from query, or default folder ID, or root
    const targetFolderId = folderId || DEFAULT_DRIVE_FOLDER_ID;

    // Initialize Google Drive API
    const drive = await initGoogleDrive();

    if (!drive) {
      // Fallback to mock data if API not available
      console.warn("⚠️ Using mock data - Google Drive API not available");
      const mockFiles = [
        {
          id: "file_1",
          name: "Document 1.pdf",
          mimeType: "application/pdf",
          size: 1024000,
          modifiedTime: new Date().toISOString(),
          createdTime: new Date().toISOString(),
          webViewLink: "https://drive.google.com/file/d/file_1/view",
        },
        {
          id: "folder_1",
          name: "My Folder",
          mimeType: "application/vnd.google-apps.folder",
          modifiedTime: new Date().toISOString(),
          createdTime: new Date().toISOString(),
          webViewLink: "https://drive.google.com/drive/folders/folder_1",
        },
        {
          id: "file_2",
          name: "Spreadsheet 1.xlsx",
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          size: 512000,
          modifiedTime: new Date().toISOString(),
          createdTime: new Date().toISOString(),
          webViewLink: "https://drive.google.com/file/d/file_2/view",
        },
      ];

      return res.json({
        success: true,
        data: mockFiles,
        nextPageToken: null,
      });
    }

    // Build query for Google Drive API
    let query = "trashed = false";
    if (targetFolderId) {
      query += ` and '${targetFolderId}' in parents`;
    } else {
      // If no folderId, list files in root (files not in any folder)
      query += " and 'root' in parents";
    }

    // Get real data from Google Drive
    const response = await drive.files.list({
      q: query,
      pageSize: parseInt(pageSize) || 100,
      fields:
        "nextPageToken, files(id, name, mimeType, size, modifiedTime, createdTime, webViewLink, parents)",
      orderBy: "modifiedTime desc",
    });

    const files = (response.data.files || []).map((file) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size ? parseInt(file.size) : undefined,
      modifiedTime: file.modifiedTime,
      createdTime: file.createdTime,
      webViewLink: file.webViewLink,
      parents: file.parents,
    }));

    res.json({
      success: true,
      data: files,
      nextPageToken: response.data.nextPageToken || null,
    });
  } catch (error) {
    console.error("Error listing Drive files:", error);
    res.status(500).json({
      success: false,
      error: `Lỗi khi tải danh sách files từ Drive: ${error.message}`,
    });
  }
});

// Get file metadata
app.get("/api/drive/files/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    // Initialize Google Drive API
    const drive = await initGoogleDrive();

    if (!drive) {
      // Fallback to mock data if API not available
      console.warn("⚠️ Using mock metadata - Google Drive API not available");
      const mockFile = {
        id: fileId,
        name: "Document 1.pdf",
        mimeType: "application/pdf",
        size: 1024000,
        modifiedTime: new Date().toISOString(),
        createdTime: new Date().toISOString(),
        webViewLink: `https://drive.google.com/file/d/${fileId}/view`,
        owners: [{ displayName: "Admin User", emailAddress: "admin@mia.vn" }],
      };

      return res.json({
        success: true,
        data: mockFile,
      });
    }

    // Get real file metadata from Google Drive
    const response = await drive.files.get({
      fileId: fileId,
      fields: "id, name, mimeType, size, modifiedTime, createdTime, webViewLink, owners, parents",
    });

    const fileData = {
      id: response.data.id,
      name: response.data.name,
      mimeType: response.data.mimeType,
      size: response.data.size ? parseInt(response.data.size) : undefined,
      modifiedTime: response.data.modifiedTime,
      createdTime: response.data.createdTime,
      webViewLink: response.data.webViewLink,
      owners: response.data.owners || [],
      parents: response.data.parents || [],
    };

    res.json({
      success: true,
      data: fileData,
    });
  } catch (error) {
    console.error("Error getting file metadata:", error);
    res.status(500).json({
      success: false,
      error: `Lỗi khi lấy thông tin file: ${error.message}`,
    });
  }
});

// Upload file to Drive
app.post("/api/drive/upload", async (req, res) => {
  try {
    // Mock upload response
    const mockUploadedFile = {
      id: `file_${Date.now()}`,
      name: "Uploaded File",
      mimeType: "application/octet-stream",
      size: 1024,
      webViewLink: "https://drive.google.com/file/d/new_file/view",
    };

    res.json({
      success: true,
      data: mockUploadedFile,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi upload file",
    });
  }
});

// Create folder
app.post("/api/drive/folders", async (req, res) => {
  try {
    const { folderName, parentFolderId } = req.body;

    // Mock folder creation
    const mockFolder = {
      id: `folder_${Date.now()}`,
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      webViewLink: "https://drive.google.com/drive/folders/new_folder",
    };

    res.json({
      success: true,
      data: mockFolder,
      message: "Folder created successfully",
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi tạo folder",
    });
  }
});

// Delete file
app.delete("/api/drive/files/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    // Initialize Google Drive API
    const drive = await initGoogleDrive();

    if (!drive) {
      // Fallback: return error if API not available
      console.warn("⚠️ Google Drive API not available for delete operation");
      return res.status(503).json({
        success: false,
        error: "Google Drive API không khả dụng. Vui lòng kiểm tra credentials.",
      });
    }

    // Delete file/folder from Google Drive
    await drive.files.delete({
      fileId: fileId,
    });

    console.log(`✅ Deleted file/folder: ${fileId}`);

    res.json({
      success: true,
      message: "File/folder deleted successfully",
      fileId: fileId,
    });
  } catch (error) {
    console.error("Error deleting file:", error);

    // Handle specific errors
    if (error.code === 404) {
      return res.status(404).json({
        success: false,
        error: "File/folder không tồn tại hoặc đã bị xóa",
      });
    } else if (error.code === 403) {
      return res.status(403).json({
        success: false,
        error: "Không có quyền xóa file/folder này",
      });
    }

    res.status(500).json({
      success: false,
      error: `Lỗi khi xóa file/folder: ${error.message}`,
    });
  }
});

// Share file
app.post("/api/drive/files/:fileId/share", async (req, res) => {
  try {
    const { fileId } = req.params;
    const { email, role } = req.body;

    res.json({
      success: true,
      message: `File shared with ${email} as ${role}`,
    });
  } catch (error) {
    console.error("Error sharing file:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi chia sẻ file",
    });
  }
});

// Rename file
app.put("/api/drive/files/:fileId/rename", async (req, res) => {
  try {
    const { fileId } = req.params;
    const { name } = req.body;

    res.json({
      success: true,
      data: { id: fileId, name },
      message: "File renamed successfully",
    });
  } catch (error) {
    console.error("Error renaming file:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi đổi tên file",
    });
  }
});

// Download file
app.get("/api/drive/files/:fileId/download", async (req, res) => {
  try {
    const { fileId } = req.params;

    // Mock download - in production, stream from Google Drive
    res.setHeader("Content-Disposition", `attachment; filename="file_${fileId}.pdf"`);
    res.setHeader("Content-Type", "application/pdf");
    res.send(Buffer.from("Mock file content"));
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi tải file",
    });
  }
});

// ============================================
// Google Sheets API Endpoints
// ============================================

// Read data from sheet
app.get("/api/sheets/read", async (req, res) => {
  try {
    const { range = "A1:Z1000", sheetId } = req.query;
    const spreadsheetId = sheetId || DEFAULT_SPREADSHEET_ID;

    // Initialize Google Sheets API
    const sheets = await initGoogleSheets();

    if (!sheets) {
      // Fallback to mock data if API not available
      console.warn("⚠️ Using mock data - Google Sheets API not available");
      const mockData = [
        ["Name", "Email", "Phone", "Status"],
        ["John Doe", "john@example.com", "123-456-7890", "Active"],
        ["Jane Smith", "jane@example.com", "098-765-4321", "Active"],
        ["Bob Johnson", "bob@example.com", "555-123-4567", "Inactive"],
        ["Alice Williams", "alice@example.com", "444-555-6666", "Active"],
      ];

      return res.json({
        success: true,
        data: mockData,
        range: range,
        majorDimension: "ROWS",
      });
    }

    // Get real data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });

    const values = response.data.values || [];

    res.json({
      success: true,
      data: values,
      range: response.data.range || range,
      majorDimension: response.data.majorDimension || "ROWS",
    });
  } catch (error) {
    console.error("Error reading sheet:", error);
    res.status(500).json({
      success: false,
      error: `Lỗi khi đọc dữ liệu từ sheet: ${error.message}`,
    });
  }
});

// Write data to sheet
app.post("/api/sheets/write", async (req, res) => {
  try {
    const { range, values, sheetId } = req.body;

    res.json({
      success: true,
      data: {
        updatedRange: range,
        updatedRows: values.length,
        updatedColumns: values[0]?.length || 0,
        updatedCells: values.length * (values[0]?.length || 0),
      },
      message: "Dữ liệu đã được ghi thành công",
    });
  } catch (error) {
    console.error("Error writing to sheet:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi ghi dữ liệu vào sheet",
    });
  }
});

// Append data to sheet
app.post("/api/sheets/append", async (req, res) => {
  try {
    const { range, values, sheetId } = req.body;

    res.json({
      success: true,
      data: {
        updates: {
          spreadsheetId: sheetId || "default_sheet",
          updatedRange: range,
          updatedRows: values.length,
          updatedColumns: values[0]?.length || 0,
          updatedCells: values.length * (values[0]?.length || 0),
        },
      },
      message: "Dữ liệu đã được thêm thành công",
    });
  } catch (error) {
    console.error("Error appending to sheet:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi thêm dữ liệu vào sheet",
    });
  }
});

// Get sheet metadata
async function sheetMetadataHandler(req, res) {
  try {
    const sheetId = req.params.sheetId || req.query.sheetId;
    const spreadsheetId = sheetId || DEFAULT_SPREADSHEET_ID;

    // Initialize Google Sheets API
    const sheets = await initGoogleSheets();

    if (!sheets) {
      // Fallback to mock data if API not available
      console.warn("⚠️ Using mock metadata - Google Sheets API not available");
      const mockMetadata = {
        spreadsheetId: spreadsheetId,
        properties: {
          title: "Sample Spreadsheet",
          locale: "vi_VN",
          autoRecalc: "ON_CHANGE",
          timeZone: "Asia/Ho_Chi_Minh",
        },
        sheets: [
          {
            properties: {
              sheetId: 0,
              title: "Sheet1",
              index: 0,
              sheetType: "GRID",
              gridProperties: {
                rowCount: 1000,
                columnCount: 26,
              },
            },
          },
          {
            properties: {
              sheetId: 1,
              title: "Sheet2",
              index: 1,
              sheetType: "GRID",
              gridProperties: {
                rowCount: 1000,
                columnCount: 26,
              },
            },
          },
        ],
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      };

      return res.json({
        success: true,
        data: mockMetadata,
      });
    }

    // Get real metadata from Google Sheets
    const response = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
    });

    const metadata = {
      spreadsheetId: response.data.spreadsheetId,
      properties: response.data.properties,
      sheets: response.data.sheets.map((sheet) => ({
        sheetId: sheet.properties.sheetId,
        title: sheet.properties.title,
        index: sheet.properties.index,
        sheetType: sheet.properties.sheetType,
        gridProperties: sheet.properties.gridProperties,
      })),
      spreadsheetUrl: response.data.spreadsheetUrl,
    };

    res.json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    console.error("Error getting sheet metadata:", error);
    res.status(500).json({
      success: false,
      error: `Lỗi khi lấy metadata của sheet: ${error.message}`,
    });
  }
}
app.get("/api/sheets/metadata/:sheetId", sheetMetadataHandler);
app.get("/api/sheets/metadata", sheetMetadataHandler);

// Clear sheet data
app.delete("/api/sheets/clear", async (req, res) => {
  try {
    const { range, sheetId } = req.body;

    res.json({
      success: true,
      data: {
        clearedRange: range,
        spreadsheetId: sheetId || "default_sheet",
      },
      message: "Dữ liệu đã được xóa thành công",
    });
  } catch (error) {
    console.error("Error clearing sheet:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi xóa dữ liệu sheet",
    });
  }
});

// Add new worksheet to spreadsheet
app.post("/api/sheets/add-sheet", async (req, res) => {
  try {
    const { sheetName, sheetId } = req.body;

    const newSheet = {
      properties: {
        sheetId: Date.now(),
        title: sheetName || "New Sheet",
        index: 2,
        sheetType: "GRID",
        gridProperties: {
          rowCount: 1000,
          columnCount: 26,
        },
      },
    };

    res.json({
      success: true,
      data: newSheet,
      message: `Sheet "${sheetName}" đã được tạo thành công`,
    });
  } catch (error) {
    console.error("Error adding sheet:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi thêm sheet mới",
    });
  }
});

// Get spreadsheet data (for compatibility)
app.get("/api/sheets/:spreadsheetId", async (req, res) => {
  try {
    const { spreadsheetId } = req.params;
    const { range } = req.query;

    // Mock spreadsheet data
    const mockData = {
      spreadsheetId,
      properties: {
        title: "Sample Spreadsheet",
      },
      sheets: [
        {
          properties: {
            sheetId: 0,
            title: "Sheet1",
            index: 0,
            gridProperties: {
              rowCount: 1000,
              columnCount: 26,
            },
          },
        },
      ],
      values: [
        ["Name", "Email", "Phone", "Status"],
        ["John Doe", "john@example.com", "123-456-7890", "Active"],
        ["Jane Smith", "jane@example.com", "098-765-4321", "Active"],
        ["Bob Johnson", "bob@example.com", "555-123-4567", "Inactive"],
      ],
    };

    res.json({
      success: true,
      data: mockData,
    });
  } catch (error) {
    console.error("Error getting spreadsheet:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy dữ liệu spreadsheet",
    });
  }
});

// Update spreadsheet data
app.put("/api/sheets/:spreadsheetId", async (req, res) => {
  try {
    const { spreadsheetId } = req.params;
    const { range, values } = req.body;

    res.json({
      success: true,
      message: "Spreadsheet updated successfully",
      updatedCells: values.length,
    });
  } catch (error) {
    console.error("Error updating spreadsheet:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi cập nhật spreadsheet",
    });
  }
});

// Append data to spreadsheet (alternative endpoint)
app.post("/api/sheets/:spreadsheetId/append", async (req, res) => {
  try {
    const { spreadsheetId } = req.params;
    const { range, values } = req.body;

    res.json({
      success: true,
      message: "Data appended successfully",
      updates: {
        spreadsheetId,
        updatedRange: range,
        updatedRows: values.length,
      },
    });
  } catch (error) {
    console.error("Error appending to spreadsheet:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi thêm dữ liệu vào spreadsheet",
    });
  }
});

// Create new spreadsheet
app.post("/api/sheets/create", async (req, res) => {
  try {
    const { title, sheets } = req.body;

    const mockSpreadsheet = {
      spreadsheetId: `sheet_${Date.now()}`,
      properties: {
        title: title || "New Spreadsheet",
      },
      spreadsheetUrl: "https://docs.google.com/spreadsheets/d/new_sheet/edit",
    };

    res.json({
      success: true,
      data: mockSpreadsheet,
      message: "Spreadsheet created successfully",
    });
  } catch (error) {
    console.error("Error creating spreadsheet:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi tạo spreadsheet",
    });
  }
});

// ============================================
// Serve React app for all non-API routes
// IMPORTANT: This must be LAST, after all API routes
// ============================================
app.get("/{*path}", (req, res) => {
  // Only serve React app for non-API routes
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "../build/index.html"));
  } else {
    // Return 404 for undefined API routes
    res.status(404).json({
      success: false,
      error: "API endpoint not found",
      path: req.path,
    });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 WebSocket server ready for connections`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
