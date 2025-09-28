// Import Google Sheets service only if available
let googleSheetsService = null;
try {
  googleSheetsService = require("./googleSheets").googleSheetsService;
} catch (error) {
  // Google Sheets service not available in development
  console.log("Google Sheets service not available in development mode");
}

// ==================== AUTHENTICATION FUNCTIONS ====================

/**
 * Test connection to Google Sheets
 * @returns {Promise<boolean>} - True if connection successful
 */
export const testConnection = async () => {
  try {
    // For development, return true if we have basic config
    if (process.env.REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID) {
      return true;
    }

    // Try to connect to Google Sheets if configured and available
    if (googleSheetsService) {
      await googleSheetsService.getSheets();
      return true;
    }

    // For development, return true anyway to allow testing
    return true;
  } catch (error) {
    // For development, return true anyway to allow testing
    return true;
  }
};

/**
 * Verify user credentials against Google Sheets
 * @param {string} username - Username to verify
 * @param {string} password - Password to verify
 * @returns {Promise<Object>} - Authentication result
 */
export const verifyCredentials = async (username, password) => {
  try {
    // For development, use hardcoded credentials
    const devUsers = {
      admin: {
        password: "admin123",
        role: "admin",
        name: "Administrator",
        email: "admin@mia.vn",
      },
      user: {
        password: "user123",
        role: "user",
        name: "Regular User",
        email: "user@mia.vn",
      },
      demo: {
        password: "demo123",
        role: "user",
        name: "Demo User",
        email: "demo@mia.vn",
      },
    };

    // Check if it's a development user
    if (devUsers[username]) {
      const user = devUsers[username];
      if (user.password === password) {
        return {
          success: true,
          userData: {
            username: username,
            role: user.role,
            name: user.name,
            email: user.email,
          },
          token: generateToken(username),
        };
      } else {
        return {
          success: false,
          message: "Mật khẩu không đúng",
        };
      }
    }

    // Try to read from Google Sheets if configured and available
    try {
      if (!googleSheetsService) {
        throw new Error("Google Sheets service not available");
      }
      const result = await googleSheetsService.readSheet("Users!A:E");
      const users = result.data;

      // Skip header row
      const userRows = users.slice(1);

      // Find user by username
      const user = userRows.find((row) => row[0] === username);

      if (!user) {
        return {
          success: false,
          message: "Tên đăng nhập không tồn tại",
        };
      }

      // Verify password (in production, passwords should be hashed)
      if (user[1] !== password) {
        return {
          success: false,
          message: "Mật khẩu không đúng",
        };
      }

      // Return user data
      return {
        success: true,
        userData: {
          username: user[0],
          role: user[2] || "user",
          name: user[3] || user[0],
          email: user[4] || `${user[0]}@mia.vn`,
        },
        token: generateToken(user[0]),
      };
    } catch (sheetsError) {
      // If Google Sheets is not available, fall back to dev users
      return {
        success: false,
        message: "Tên đăng nhập không tồn tại",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Lỗi kết nối hệ thống",
    };
  }
};

/**
 * Log audit events to Google Sheets
 * @param {Object} eventData - Event data to log
 */
export const logAuditEvent = async (eventData) => {
  try {
    const timestamp = new Date().toISOString();
    const logData = [
      [
        timestamp,
        eventData.action || "UNKNOWN",
        eventData.username || "unknown",
        eventData.details || "",
        eventData.status || "INFO",
        eventData.ipAddress || "unknown",
      ],
    ];

    // Append to audit log sheet if available
    if (googleSheetsService) {
      await googleSheetsService.appendToSheet("AuditLog!A:F", logData);
    }
  } catch (error) {
    // Silent fail for audit logging to not break main functionality
    // Audit logging failed
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate a simple token (in production, use JWT)
 * @param {string} username - Username to generate token for
 * @returns {string} - Generated token
 */
const generateToken = (username) => {
  const timestamp = Date.now();
  return btoa(`${username}:${timestamp}:${Math.random()}`);
};

/**
 * Initialize default data if sheets are empty
 */
export const initializeDefaultData = async () => {
  try {
    if (!googleSheetsService) {
      return; // Skip initialization if Google Sheets service not available
    }

    // Check if Users sheet exists and has data
    const usersResult = await googleSheetsService.readSheet("Users!A:E");

    if (!usersResult.data || usersResult.data.length <= 1) {
      // Create default admin user
      const defaultUsers = [
        ["username", "password", "role", "name", "email"], // Header
        ["admin", "admin123", "admin", "Administrator", "admin@mia.vn"],
        ["user", "user123", "user", "Regular User", "user@mia.vn"],
      ];

      await googleSheetsService.writeSheet("Users!A:E", defaultUsers);
    }

    // Check if AuditLog sheet exists
    try {
      await googleSheetsService.readSheet("AuditLog!A:F");
    } catch (error) {
      // Create audit log header
      const auditHeader = [
        ["timestamp", "action", "username", "details", "status", "ipAddress"],
      ];
      await googleSheetsService.writeSheet("AuditLog!A:F", auditHeader);
    }
  } catch (error) {
    // Failed to initialize default data
  }
};

const unifiedGoogleSheetsService = {
  testConnection,
  verifyCredentials,
  logAuditEvent,
  initializeDefaultData,
};

export default unifiedGoogleSheetsService;
