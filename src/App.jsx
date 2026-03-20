import { App as AntApp, ConfigProvider, theme } from "antd";
import viVN from "antd/locale/vi_VN";
import { Suspense, lazy } from "react";
import { Provider } from "react-redux";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import ErrorBoundary from "./components/Common/ErrorBoundary";
import Loading from "./components/Common/Loading";
import PWAUpdatePrompt from "./components/Common/PWAUpdatePrompt";
import { BRAND_CONFIG } from "./config/brand";
import { LayoutProvider } from "./contexts/LayoutContext";
import "./global.css"; /* ✅ Import global styles first */
import { store } from "./store/store";

// Enhanced lazy loading with route-based code splitting
// Each lazy import creates a separate chunk, reducing main bundle size

// Authentication (load immediately)
const Login = lazy(() => import("./components/auth/Login"));
const Layout = lazy(() => import(/* webpackChunkName: "layout" */ "./components/layout/Layout"));
const ProtectedRoute = lazy(
  () => import(/* webpackChunkName: "auth-protected" */ "./components/auth/ProtectedRoute")
);

// Core Dashboard (high priority - preload)
const LiveDashboard = lazy(
  () => import(/* webpackChunkName: "dashboard" */ "./components/Dashboard/LiveDashboard")
);

// AI & Analytics Group (separate chunk)
const AIDashboard = lazy(
  () => import(/* webpackChunkName: "ai-analytics" */ "./components/ai/AIDashboard")
);
const AdvancedAnalyticsDashboard = lazy(
  () =>
    import(
      /* webpackChunkName: "advanced-analytics" */ "./components/analytics/AdvancedAnalyticsDashboard"
    )
);
const NLPDashboard = lazy(
  () => import(/* webpackChunkName: "nlp" */ "./components/nlp/NLPDashboard")
);

// Google Integration Group (separate chunk)
const GoogleSheetsIntegration = lazy(
  () =>
    import(/* webpackChunkName: "google-sheets" */ "./components/google/GoogleSheetsIntegration")
);
const GoogleDriveIntegration = lazy(
  () => import(/* webpackChunkName: "google-drive" */ "./components/google/GoogleDriveIntegration")
);
const GoogleAppsScriptIntegration = lazy(
  () =>
    import(
      /* webpackChunkName: "google-apps-script" */ "./components/google/GoogleAppsScriptIntegration"
    )
);

// Communication Group (separate chunk)
const TelegramIntegration = lazy(
  () => import(/* webpackChunkName: "telegram" */ "./components/telegram/TelegramIntegration")
);

// Automation Group (separate chunk)
const AutomationDashboard = lazy(
  () => import(/* webpackChunkName: "automation" */ "./components/automation/AutomationDashboard")
);
const SmartAutomationDashboard = lazy(
  () =>
    import(
      /* webpackChunkName: "smart-automation" */ "./components/smart-automation/SmartAutomationDashboard"
    )
);

// Trang chủ — chunk riêng (trước đây inline trong App làm phình main)
const Home = lazy(() => import(/* webpackChunkName: "home" */ "./pages/Home"));

// Business Features Group (separate chunk)
const MIARetailDashboard = lazy(
  () => import(/* webpackChunkName: "retail" */ "./components/custom/MIARetailDashboard")
);
const AlertsManagement = lazy(
  () => import(/* webpackChunkName: "alerts" */ "./components/Alerts/AlertsManagement")
);

// Security Group (separate chunk)
const SecurityDashboard = lazy(
  () => import(/* webpackChunkName: "security" */ "./components/security/SecurityDashboard")
);

// Main App component with Router
function App() {
  return (
    <Provider store={store}>
      <ConfigProvider
        locale={viVN}
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: BRAND_CONFIG.colors.primary,
            borderRadius: 8,
          },
        }}
      >
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <LayoutProvider>
            <AntApp>
              <ErrorBoundary>
                <div className="App">
                  <Suspense fallback={<Loading />}>
                    <Routes>
                      {/* Public Routes - No Layout */}
                      <Route path="/login" element={<Login />} />

                      {/* Routes with Layout */}
                      <Route
                        path="/*"
                        element={
                          <Layout>
                            <Routes>
                              <Route path="/" element={<Home />} />

                              {/* Protected Routes - Yêu cầu authentication */}
                              <Route
                                path="/dashboard"
                                element={
                                  <ProtectedRoute>
                                    <LiveDashboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/ai-analytics"
                                element={
                                  <ProtectedRoute>
                                    <AIDashboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/retail"
                                element={
                                  <ProtectedRoute>
                                    <MIARetailDashboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/google-sheets"
                                element={
                                  <ProtectedRoute>
                                    <GoogleSheetsIntegration />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/google-drive"
                                element={
                                  <ProtectedRoute>
                                    <GoogleDriveIntegration />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/google-apps-script"
                                element={
                                  <ProtectedRoute>
                                    <GoogleAppsScriptIntegration />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/telegram"
                                element={
                                  <ProtectedRoute>
                                    <TelegramIntegration />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/automation"
                                element={
                                  <ProtectedRoute>
                                    <AutomationDashboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/alerts"
                                element={
                                  <ProtectedRoute>
                                    <AlertsManagement />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/advanced-analytics"
                                element={
                                  <ProtectedRoute>
                                    <AdvancedAnalyticsDashboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/smart-automation"
                                element={
                                  <ProtectedRoute>
                                    <SmartAutomationDashboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/nlp"
                                element={
                                  <ProtectedRoute>
                                    <NLPDashboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/security"
                                element={
                                  <ProtectedRoute>
                                    <SecurityDashboard />
                                  </ProtectedRoute>
                                }
                              />

                              <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                          </Layout>
                        }
                      />
                    </Routes>
                  </Suspense>
                  <PWAUpdatePrompt />
                </div>
              </ErrorBoundary>
            </AntApp>
          </LayoutProvider>
        </Router>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
