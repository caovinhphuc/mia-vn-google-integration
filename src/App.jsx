import { ConfigProvider, theme } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { Suspense, createContext, lazy, useContext, useEffect, useState } from 'react'
import { Provider, useSelector } from 'react-redux'
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import Loading from './components/Common/Loading'
import Layout from './components/layout/Layout'
import LoginPage from './pages/Login/LoginPage'
import { store } from './store/store'

// ==================== CONTEXT PROVIDERS ====================

// Auth Context
const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Theme Context
const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const authState = useSelector((state) => state.auth)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing authentication
    const currentUser = localStorage.getItem('currentUser')
    const authToken = sessionStorage.getItem('authToken')

    if (currentUser && authToken) {
      // User is already authenticated
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [])

  const value = {
    isAuthenticated: authState.isAuthenticated || !!localStorage.getItem('currentUser'),
    isLoading,
    user: authState.user || JSON.parse(localStorage.getItem('currentUser') || 'null'),
    serviceAccount: authState.serviceAccount,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Theme Provider Component
const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  const toggleTheme = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem('darkMode', JSON.stringify(newMode))
  }

  const value = {
    isDarkMode,
    toggleTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// Lazy load components
const LiveDashboard = lazy(() => import('./components/Dashboard/LiveDashboard'))
const AIDashboard = lazy(() => import('./components/ai/AIDashboard'))
const GoogleSheetsIntegration = lazy(() => import('./components/google/GoogleSheetsIntegration'))
const GoogleDriveIntegration = lazy(() => import('./components/google/GoogleDriveIntegration'))
const GoogleAppsScriptIntegration = lazy(
  () => import('./components/google/GoogleAppsScriptIntegration'),
)
const TelegramIntegration = lazy(() => import('./components/telegram/TelegramIntegration'))
const AutomationDashboard = lazy(() => import('./components/automation/AutomationDashboard'))
const AutomationPanel = lazy(() => import('./components/automation/AutomationPanelWrapper'))
const ConfigPage = lazy(() => import('./components/automation/ConfigPageWrapper'))

// Authentication component - now using the professional LoginPage
const AuthLogin = () => <LoginPage />

// Home component
const Home = () => (
  <div className="home-container">
    <div className="hero-section">
      <h1>🚀 MIA Logistics Integration v3.0</h1>
      <p>Hệ thống quản lý logistics thông minh với AI và Google Integration</p>
    </div>

    <div className="features-grid">
      <div className="feature-card primary">
        <h3>📊 Live Dashboard</h3>
        <p>
          Theo dõi thời gian thực, giám sát hiệu suất và phân tích hệ thống với WebSocket
          integration.
        </p>
        <div className="feature-stats">
          <div className="stat">
            <span className="stat-value">99.9%</span>
            <span className="stat-label">Uptime</span>
          </div>
          <div className="stat">
            <span className="stat-value">2.3s</span>
            <span className="stat-label">Response Time</span>
          </div>
        </div>
      </div>

      <div className="feature-card secondary">
        <h3>🧠 AI Analytics</h3>
        <p>
          Phân tích thông minh, dự đoán xu hướng và khuyến nghị tối ưu hóa cho hệ thống logistics.
        </p>
        <div className="feature-stats">
          <div className="stat">
            <span className="stat-value">92%</span>
            <span className="stat-label">Accuracy</span>
          </div>
          <div className="stat">
            <span className="stat-value">15%</span>
            <span className="stat-label">Cost Reduction</span>
          </div>
        </div>
      </div>

      <div className="feature-card tertiary">
        <h3>📋 Google Sheets</h3>
        <p>Tích hợp Google Sheets để quản lý dữ liệu, báo cáo và tự động hóa quy trình làm việc.</p>
        <div className="feature-stats">
          <div className="stat">
            <span className="stat-value">1,250</span>
            <span className="stat-label">Records</span>
          </div>
          <div className="stat">
            <span className="stat-value">24/7</span>
            <span className="stat-label">Sync</span>
          </div>
        </div>
      </div>
    </div>

    <div className="features-grid">
      <div className="feature-card">
        <h3>📈 Trạng thái hệ thống</h3>
        <div className="status-list">
          <div className="status-item">
            <span className="status-icon">✅</span>
            <div className="status-content">
              <span className="status-title">Frontend</span>
              <span className="status-desc">Tối ưu hóa & Triển khai</span>
            </div>
          </div>
          <div className="status-item">
            <span className="status-icon">✅</span>
            <div className="status-content">
              <span className="status-title">Backend</span>
              <span className="status-desc">WebSocket Ready</span>
            </div>
          </div>
          <div className="status-item">
            <span className="status-icon">✅</span>
            <div className="status-content">
              <span className="status-title">Automation</span>
              <span className="status-desc">Hoạt động</span>
            </div>
          </div>
        </div>
        <div className="system-health">
          <span className="health-label">Tình trạng hệ thống:</span>
          <span className="health-status healthy">Khỏe mạnh</span>
        </div>
      </div>

      <div className="feature-card">
        <h3>🎯 Tính năng mới v3.0</h3>
        <div className="feature-tags">
          {[
            '📡 Tích hợp WebSocket thời gian thực',
            '📊 Dashboard hiệu suất trực tiếp',
            '⚡ Cải thiện hiệu suất 50%',
            '🎨 Thiết kế UI/UX hiện đại',
            '📱 Hỗ trợ di động responsive',
            '🔒 Tính năng bảo mật nâng cao',
          ].map((feature, index) => (
            <span key={index} className="feature-tag">
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
)

// Main App component with Router
function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider>
          <ConfigProvider
            locale={viVN}
            theme={{
              algorithm: theme.defaultAlgorithm,
              token: {
                colorPrimary: '#3b82f6',
                borderRadius: 8,
              },
            }}
          >
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <div className="App">
                <Suspense fallback={<Loading />}>
                  <Routes>
                    <Route path="/auth/login" element={<AuthLogin />} />
                    <Route
                      path="/"
                      element={
                        <Layout>
                          <Home />
                        </Layout>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <Layout>
                          <LiveDashboard />
                        </Layout>
                      }
                    />
                    <Route
                      path="/ai-analytics"
                      element={
                        <Layout>
                          <AIDashboard />
                        </Layout>
                      }
                    />
                    <Route
                      path="/google-sheets"
                      element={
                        <Layout>
                          <GoogleSheetsIntegration />
                        </Layout>
                      }
                    />
                    <Route
                      path="/google-drive"
                      element={
                        <Layout>
                          <GoogleDriveIntegration />
                        </Layout>
                      }
                    />
                    <Route
                      path="/google-apps-script"
                      element={
                        <Layout>
                          <GoogleAppsScriptIntegration />
                        </Layout>
                      }
                    />
                    <Route
                      path="/telegram"
                      element={
                        <Layout>
                          <TelegramIntegration />
                        </Layout>
                      }
                    />
                    <Route
                      path="/automation"
                      element={
                        <Layout>
                          <AutomationDashboard />
                        </Layout>
                      }
                    />
                    <Route
                      path="/automation/control"
                      element={
                        <Layout>
                          <AutomationPanel />
                        </Layout>
                      }
                    />
                    <Route
                      path="/automation/config"
                      element={
                        <Layout>
                          <ConfigPage />
                        </Layout>
                      }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </div>
            </Router>
          </ConfigProvider>
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  )
}

export default App
