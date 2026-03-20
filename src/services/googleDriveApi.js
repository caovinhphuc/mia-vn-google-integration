/* eslint-disable */
/**
 * Google Drive API Service - Frontend
 * Calls backend API instead of direct Google APIs
 */

import axios from "axios";

const resolveDriveApiBase = () => {
  const raw =
    process.env.REACT_APP_API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    process.env.REACT_APP_API_URL ||
    process.env.VITE_API_URL;
  if (!raw) return "http://localhost:3001/api";

  const s = String(raw)
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/$/, "");
  const isAbsoluteHttp = /^https?:\/\//i.test(s);
  const isRootRelative = s.startsWith("/");
  if (!isAbsoluteHttp && !isRootRelative) return "http://localhost:3001/api";

  return s.endsWith("/api") ? s : `${s}/api`;
};

const API_BASE_URL = resolveDriveApiBase();

class GoogleDriveApiService {
  /**
   * List files in folder
   */
  async listFiles(folderId, pageSize = 10) {
    try {
      const params = { pageSize };
      if (folderId) params.folderId = folderId;

      const response = await axios.get(`${API_BASE_URL}/drive/files`, {
        params,
      });
      return {
        files: response.data.data || [],
        nextPageToken: response.data.nextPageToken,
      };
    } catch (error) {
      console.error("Error listing files:", error);
      throw new Error(error.response?.data?.error || `Failed to list files: ${error.message}`);
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/drive/files/${fileId}`);
      return response.data.data;
    } catch (error) {
      console.error("Error getting file metadata:", error);
      throw new Error(
        error.response?.data?.error || `Failed to get file metadata: ${error.message}`
      );
    }
  }

  /**
   * Upload file to Drive
   */
  async uploadFile(file, fileName, mimeType, folderId) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (folderId) formData.append("folderId", folderId);

      const response = await axios.post(`${API_BASE_URL}/drive/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error(error.response?.data?.error || `Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Create folder
   */
  async createFolder(folderName, parentFolderId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/drive/folders`, {
        folderName,
        parentFolderId,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error creating folder:", error);
      throw new Error(error.response?.data?.error || `Failed to create folder: ${error.message}`);
    }
  }

  /**
   * Delete file
   */
  async deleteFile(fileId) {
    try {
      console.log(`🗑️ [googleDriveApiService] deleteFile called with fileId: ${fileId}`);
      console.log(`📡 [googleDriveApiService] API URL: ${API_BASE_URL}/drive/files/${fileId}`);

      const response = await axios.delete(`${API_BASE_URL}/drive/files/${fileId}`);

      console.log(`✅ [googleDriveApiService] Delete response:`, response.data);

      // Backend returns {success: true, message, fileId} - not {data: {...}}
      const result = response.data.success
        ? { fileId: response.data.fileId || fileId, success: true }
        : response.data;

      console.log(`✅ [googleDriveApiService] Delete result:`, result);
      return result;
    } catch (error) {
      console.error("❌ [googleDriveApiService] Error deleting file:", error);
      console.error("❌ [googleDriveApiService] Error response:", error.response?.data);
      console.error("❌ [googleDriveApiService] Error status:", error.response?.status);
      throw new Error(error.response?.data?.error || `Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Share file/folder with email
   */
  async shareFile(fileId, email, role = "writer") {
    try {
      const response = await axios.post(`${API_BASE_URL}/drive/files/${fileId}/share`, {
        email,
        role,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error sharing file:", error);
      throw new Error(error.response?.data?.error || `Failed to share file: ${error.message}`);
    }
  }

  /**
   * Rename file/folder
   */
  async renameFile(fileId, newName) {
    try {
      const response = await axios.put(`${API_BASE_URL}/drive/files/${fileId}/rename`, {
        name: newName,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error renaming file:", error);
      throw new Error(error.response?.data?.error || `Failed to rename file: ${error.message}`);
    }
  }

  /**
   * Download file
   */
  async downloadFile(fileId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/drive/files/${fileId}/download`, {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers["content-disposition"];
      let fileName = "download";
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, fileName };
    } catch (error) {
      console.error("Error downloading file:", error);
      throw new Error(error.response?.data?.error || `Failed to download file: ${error.message}`);
    }
  }
}

// Export singleton instance
export const googleDriveApiService = new GoogleDriveApiService();
export default googleDriveApiService;
