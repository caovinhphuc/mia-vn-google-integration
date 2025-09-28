// Google API configuration
export const GOOGLE_CONFIG = {
  SCOPES: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive",
  ],
  SHEET_ID:
    process.env.REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID ||
    "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As",
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
