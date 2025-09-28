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
