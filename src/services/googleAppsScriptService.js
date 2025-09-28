// Google Apps Script Service
import axios from "axios";

const GOOGLE_APPS_SCRIPT_URL =
  process.env.REACT_APP_GOOGLE_APPS_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbxd3lMPfORirKOnPN52684-P4htWuw42VIogwBnb-oG/dev";

// Call Google Apps Script Web App
export const callWebApp = async (functionName, parameters = {}) => {
  try {
    const response = await axios.post(
      GOOGLE_APPS_SCRIPT_URL,
      {
        action: functionName,
        parameters: parameters,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Operation completed successfully",
      };
    } else {
      throw new Error(response.data.error || "Unknown error occurred");
    }
  } catch (error) {
    console.error("Google Apps Script call error:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to execute Google Apps Script function",
    };
  }
};

// Execute Google Apps Script with custom code
export const executeScript = async (scriptCode, parameters = {}) => {
  try {
    const response = await axios.post(
      GOOGLE_APPS_SCRIPT_URL,
      {
        action: "executeScript",
        scriptCode: scriptCode,
        parameters: parameters,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Script executed successfully",
      };
    } else {
      throw new Error(response.data.error || "Script execution failed");
    }
  } catch (error) {
    console.error("Script execution error:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to execute script",
    };
  }
};

// Enhanced user profile update function
export const updateUserProfileEnhanced = async (userId, profileData) => {
  try {
    const result = await callWebApp("updateUserProfile", {
      userId: userId,
      profileData: profileData,
    });

    if (result.success) {
      return {
        success: true,
        data: result.data,
        message: "User profile updated successfully",
      };
    } else {
      throw new Error(result.error || "Failed to update user profile");
    }
  } catch (error) {
    console.error("Enhanced user profile update error:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to update user profile",
    };
  }
};

// Get Google Apps Script service instance
export const getGoogleAppsScriptService = () => {
  return {
    callWebApp,
    executeScript,
    updateUserProfileEnhanced,
    // Additional utility functions
    sendNotification: async (message, recipients = []) => {
      return await callWebApp("sendNotification", {
        message: message,
        recipients: recipients,
      });
    },
    generateReport: async (reportType, parameters = {}) => {
      return await callWebApp("generateReport", {
        reportType: reportType,
        parameters: parameters,
      });
    },
    backupData: async (tableName, backupOptions = {}) => {
      return await callWebApp("backupData", {
        tableName: tableName,
        options: backupOptions,
      });
    },
  };
};
