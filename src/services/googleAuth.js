import { google } from "googleapis";
import {
  SERVICE_ACCOUNT_CREDENTIALS,
  GOOGLE_CONFIG,
} from "../config/googleConfig";

class GoogleAuthService {
  constructor() {
    this.auth = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Create JWT auth client for service account
      this.auth = new google.auth.JWT(
        SERVICE_ACCOUNT_CREDENTIALS.client_email,
        null,
        SERVICE_ACCOUNT_CREDENTIALS.private_key,
        GOOGLE_CONFIG.SCOPES
      );

      this.initialized = true;
      console.log("Google Auth initialized successfully");
      return this.auth;
    } catch (error) {
      console.error("Failed to initialize Google Auth:", error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async getAuthClient() {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.auth;
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
