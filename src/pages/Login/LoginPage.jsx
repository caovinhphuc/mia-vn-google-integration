import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useTheme } from "../../App"; // Import useAuth and useTheme hooks

import {
  Activity,
  AlertTriangle,
  Clock,
  Database,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Moon,
  Package,
  RefreshCw,
  Shield,
  Sun,
  User,
  UserCheck,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  logAuditEvent,
  testConnection,
  verifyCredentials,
} from "../../services/unifiedGoogleSheetsService";

// ==================== OFFICIAL MIA WAREHOUSE LOGIN SYSTEM ====================
/**
 * Official Login Component for MIA Warehouse Management System
 * - Production-ready authentication via Google Sheets
 * - No demo accounts - all authentication through real database
 * - Comprehensive security features and audit logging
 * - Role-based access control
 */
export default function LoginPage() {
  // ==================== HOOKS AND CONTEXTS ====================
  const navigate = useNavigate();
  // Use authentication and theme hooks
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  // Use theme context for dark mode support
  const { isDarkMode, toggleTheme } = useTheme();
  // ==================== STATE MANAGEMENT ====================

  // Authentication state
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");

  // Security state
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeLeft, setBlockTimeLeft] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);

  // Connection state
  const [connectionStatus, setConnectionStatus] = useState("checking");
  const [showConnectionDetails, setShowConnectionDetails] = useState(false);

  // Security constants
  const MAX_LOGIN_ATTEMPTS = 3;
  const BLOCK_DURATION = 300; // 5 minutes in seconds

  // ==================== LIFECYCLE EFFECTS ====================

  // Redirect if already authenticated (only after auth loading is complete)
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Initial setup and authentication check
  // Initial setup
  useEffect(() => {
    const initLogin = async () => {
      try {
        // Don't navigate here - let the routing system handle authentication redirects
        // This prevents conflicts with ProtectedRoute navigation

        // Check Google Sheets connection with timeout
        try {
          setConnectionStatus("checking");
          const connectionTest = Promise.race([
            testConnection(),
            new Promise((resolve) => setTimeout(() => resolve(false), 8000)), // 8 second timeout
          ]);

          const isConnected = await connectionTest;
          setConnectionStatus(isConnected ? "connected" : "disconnected");
        } catch (error) {
          // Connection test failed
          setConnectionStatus("error");
        }

        // Load saved credentials if "Remember Me" was used
        const savedUsername = localStorage.getItem("rememberedUsername");
        if (savedUsername) {
          setCredentials((prev) => ({ ...prev, username: savedUsername }));
          setRememberMe(true);
        }

        // Check for existing login blocks
        const blockInfo = localStorage.getItem("loginBlock");
        if (blockInfo) {
          const { timestamp, attempts } = JSON.parse(blockInfo);
          const timePassed = Date.now() - timestamp;
          const remainingTime = BLOCK_DURATION * 1000 - timePassed;

          if (remainingTime > 0) {
            setIsBlocked(true);
            setBlockTimeLeft(Math.ceil(remainingTime / 1000));
            setLoginAttempts(attempts);
          } else {
            localStorage.removeItem("loginBlock");
          }
        }
      } catch (error) {
        // Login system initialization failed
        setError("Lỗi khởi tạo hệ thống. Vui lòng thử lại.");
      }
    };

    initLogin();
  }, []); // Remove navigate dependency to prevent re-running

  // Login blocking timer
  useEffect(() => {
    let interval;
    if (isBlocked && blockTimeLeft > 0) {
      interval = setInterval(() => {
        setBlockTimeLeft((prev) => {
          if (prev <= 1) {
            setIsBlocked(false);
            setLoginAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBlocked, blockTimeLeft]);

  // ==================== INITIALIZATION FUNCTIONS ====================

  // ==================== AUTHENTICATION FUNCTIONS ====================

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Prevent login if blocked
    if (isBlocked) {
      setError(
        `Tài khoản bị khóa. Vui lòng thử lại sau ${formatTime(blockTimeLeft)}`
      );
      return;
    }

    // Validate input
    if (!credentials.username.trim() || !credentials.password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
      return;
    }

    setIsLoading(true);
    setError("");
    setLoadingMessage("Đang kết nối tới hệ thống...");

    try {
      // Create a timeout for the entire login process
      const loginTimeout = new Promise(
        (_, reject) => setTimeout(() => reject(new Error("Timeout")), 15000) // 15 second timeout
      );

      setLoadingMessage("Đang xác thực thông tin đăng nhập...");

      // Check Google Sheets connection first
      if (connectionStatus !== "connected") {
        setError(
          "Không thể kết nối tới hệ thống xác thực. Vui lòng kiểm tra kết nối mạng và thử lại."
        );

        // Log failed connection attempt
        try {
          logAuditEvent({
            action: "LOGIN_FAILED",
            username: credentials.username,
            details: "Google Sheets connection not available",
            status: "CONNECTION_ERROR",
            ipAddress: "local",
          });
        } catch (auditError) {
          // Audit logging failed
        }
        return;
      }

      // Verify credentials with Google Sheets with timeout protection
      const authResult = await Promise.race([
        verifyCredentials(credentials.username, credentials.password),
        loginTimeout,
      ]);

      if (authResult.success) {
        setLoadingMessage("Đăng nhập thành công! Đang chuyển hướng...");

        // Reset login attempts on successful login
        setLoginAttempts(0);
        localStorage.removeItem("loginBlock");

        // Handle "Remember Me" functionality
        if (rememberMe) {
          localStorage.setItem("rememberedUsername", credentials.username);
        } else {
          localStorage.removeItem("rememberedUsername");
        }

        // Store user session data
        localStorage.setItem(
          "currentUser",
          JSON.stringify(authResult.userData)
        );
        sessionStorage.setItem("authToken", authResult.token);
        sessionStorage.setItem("loginTime", new Date().toISOString());

        // Trigger a storage event to update AuthProvider state
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "currentUser",
            newValue: JSON.stringify(authResult.userData),
            storageArea: localStorage,
          })
        );

        // Simple audit log (no external IP fetch to avoid hanging)
        try {
          logAuditEvent({
            action: "LOGIN_SUCCESS",
            username: credentials.username,
            details: "Successful login",
            status: "SUCCESS",
            ipAddress: "local",
          });
        } catch (auditError) {
          // Audit logging failed, but login succeeded
        }

        // Let the authentication state handle navigation
      } else {
        // Handle failed login
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          // Block user
          setIsBlocked(true);
          setBlockTimeLeft(BLOCK_DURATION);
          localStorage.setItem(
            "loginBlock",
            JSON.stringify({
              timestamp: Date.now(),
              attempts: newAttempts,
            })
          );

          setError(
            `Quá nhiều lần đăng nhập sai. Tài khoản bị khóa trong ${BLOCK_DURATION / 60} phút.`
          );
        } else {
          setError(
            `Sai tên đăng nhập hoặc mật khẩu. Còn lại ${MAX_LOGIN_ATTEMPTS - newAttempts} lần thử.`
          );
        }

        // Simple audit log for failed attempt (no external IP fetch)
        try {
          logAuditEvent({
            action: "LOGIN_FAILED",
            username: credentials.username,
            details: `Failed login attempt ${newAttempts}/${MAX_LOGIN_ATTEMPTS}`,
            status: "FAILED",
            ipAddress: "local",
          });
        } catch (auditError) {
          // Audit logging failed
        }
      }
    } catch (error) {
      // Login error occurred

      if (error.message === "Timeout") {
        setError("Kết nối quá chậm. Vui lòng kiểm tra mạng và thử lại.");
      } else {
        setError("Lỗi hệ thống. Vui lòng thử lại sau.");
      }

      // Simple audit log for system error (no external IP fetch)
      try {
        logAuditEvent({
          action: "LOGIN_ERROR",
          username: credentials.username || "unknown",
          details: `System error during login: ${error.message}`,
          status: "ERROR",
          ipAddress: "local",
        });
      } catch (auditError) {
        // Audit logging failed
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // ==================== UTILITY FUNCTIONS ====================

  const refreshConnection = async () => {
    try {
      setConnectionStatus("checking");
      const isConnected = await testConnection();
      setConnectionStatus(isConnected ? "connected" : "disconnected");
    } catch (error) {
      setConnectionStatus("error");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-600";
      case "disconnected":
        return "text-red-600";
      case "checking":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="w-4 h-4" />;
      case "disconnected":
        return <WifiOff className="w-4 h-4" />;
      case "checking":
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Kết nối Google Sheets thành công";
      case "disconnected":
        return "Không thể kết nối Google Sheets";
      case "checking":
        return "Đang kiểm tra kết nối...";
      default:
        return "Lỗi kết nối";
    }
  };

  // ==================== RENDER COMPONENT ====================

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 ${isDarkMode
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900"
        : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
        }`}
    >
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 p-3 rounded-full transition-colors duration-200 ${isDarkMode
          ? "bg-gray-800 hover:bg-gray-700 text-yellow-400"
          : "bg-white hover:bg-gray-100 text-gray-600"
          } shadow-lg`}
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPgo8L3N2Zz4=')]"></div>
      </div>

      {/* Main Login Container */}
      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div
              className={`p-3 rounded-full ${isDarkMode ? "bg-blue-500" : "bg-blue-600"}`}
            >
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1
            className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            MIA Warehouse
          </h1>
          <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            Hệ thống quản lý kho chính thức
          </p>
        </div>

        {/* Connection Status */}
        <div className="mb-6">
          <div
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors duration-200 ${connectionStatus === "connected"
              ? isDarkMode
                ? "bg-green-900/30 border-green-700 text-green-400"
                : "bg-green-50 border-green-200 text-green-800"
              : connectionStatus === "disconnected"
                ? isDarkMode
                  ? "bg-red-900/30 border-red-700 text-red-400"
                  : "bg-red-50 border-red-200 text-red-800"
                : isDarkMode
                  ? "bg-yellow-900/30 border-yellow-700 text-yellow-400"
                  : "bg-yellow-50 border-yellow-200 text-yellow-800"
              }`}
            onClick={() => setShowConnectionDetails(!showConnectionDetails)}
          >
            <div className="flex items-center gap-2">
              <span className={getConnectionStatusColor()}>
                {getConnectionStatusIcon()}
              </span>
              <span
                className={`text-sm font-medium ${getConnectionStatusColor()}`}
              >
                {getConnectionStatusText()}
              </span>
            </div>
            <button
              type="button"
              className={`p-1 rounded hover:bg-white/50 ${getConnectionStatusColor()}`}
            >
              <RefreshCw
                className="w-4 h-4"
                onClick={(e) => {
                  e.stopPropagation();
                  refreshConnection();
                }}
              />
            </button>
          </div>

          {/* Connection Details */}
          {showConnectionDetails && (
            <div
              className={`mt-2 p-3 border rounded-lg text-sm transition-colors duration-200 ${isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-50 border-gray-200"
                }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Database
                  className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                />
                <span
                  className={`font-medium ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}
                >
                  Trạng thái kết nối:
                </span>
              </div>
              <ul
                className={`space-y-1 ml-6 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                <li>
                  • Google Sheets API:{" "}
                  {connectionStatus === "connected" ? "✅ Hoạt động" : "❌ Lỗi"}
                </li>
                <li>
                  • Xác thực người dùng:{" "}
                  {connectionStatus === "connected"
                    ? "✅ Sẵn sàng"
                    : "❌ Không khả dụng"}
                </li>
                <li>
                  • Ghi log audit:{" "}
                  {connectionStatus === "connected"
                    ? "✅ Hoạt động"
                    : "❌ Tạm dừng"}
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Login Form */}
        <div
          className={`p-8 rounded-2xl shadow-xl border transition-colors duration-200 ${isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-100"
            }`}
        >
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div
                className={`flex items-center gap-2 p-4 border rounded-lg transition-colors duration-200 ${isDarkMode
                  ? "bg-red-900/30 border-red-700 text-red-400"
                  : "bg-red-50 border-red-200 text-red-700"
                  }`}
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Block Warning */}
            {isBlocked && (
              <div
                className={`flex items-center gap-2 p-4 border rounded-lg transition-colors duration-200 ${isDarkMode
                  ? "bg-orange-900/30 border-orange-700 text-orange-400"
                  : "bg-orange-50 border-orange-200 text-orange-700"
                  }`}
              >
                <Clock className="w-5 h-5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium">Tài khoản bị khóa tạm thời</div>
                  <div>Thời gian còn lại: {formatTime(blockTimeLeft)}</div>
                </div>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
              >
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User
                    className={`h-5 w-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                  />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  disabled={isBlocked || isLoading}
                  value={credentials.username}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-800 disabled:cursor-not-allowed"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    }`}
                  placeholder="Nhập tên đăng nhập"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
              >
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock
                    className={`h-5 w-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                  />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isBlocked || isLoading}
                  value={credentials.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-800 disabled:cursor-not-allowed"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    }`}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  disabled={isBlocked || isLoading}
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center disabled:cursor-not-allowed transition-colors duration-200 ${isDarkMode
                    ? "text-gray-500 hover:text-gray-300"
                    : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                disabled={isBlocked || isLoading}
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded disabled:cursor-not-allowed ${isDarkMode
                  ? "border-gray-600 bg-gray-700"
                  : "border-gray-300 bg-white"
                  }`}
              />
              <label
                htmlFor="remember-me"
                className={`ml-2 block text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Ghi nhớ tên đăng nhập
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={
                isBlocked || isLoading || connectionStatus !== "connected"
              }
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${isBlocked || isLoading || connectionStatus !== "connected"
                ? "bg-gray-400 cursor-not-allowed"
                : isDarkMode
                  ? "bg-blue-500 hover:bg-blue-600 focus:ring-blue-400"
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                } focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{loadingMessage || "Đang đăng nhập..."}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </div>
              )}
            </button>

            {/* Login Attempts Warning */}
            {loginAttempts > 0 && !isBlocked && (
              <div className="text-center text-sm text-orange-600">
                Đã thử {loginAttempts}/{MAX_LOGIN_ATTEMPTS} lần
              </div>
            )}
          </form>

          {/* Security Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
              <Shield className="w-4 h-4" />
              <span>Hệ thống bảo mật với Google Sheets</span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <UserCheck className="w-4 h-4" />
              <span>Xác thực chính thức</span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-4 h-4" />
              <span>Ghi log hoạt động</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            © 2025 MIA Warehouse Management System
          </p>
        </div>
      </div>
    </div>
  );
}
