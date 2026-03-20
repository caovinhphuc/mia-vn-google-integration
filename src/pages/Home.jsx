import { BRAND_CONFIG } from "../config/brand";

/**
 * Trang chủ — tách chunk riêng (React.lazy trong App) để giảm main bundle.
 */
export default function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>🛒 {BRAND_CONFIG.productName}</h1>
        <p>Hệ thống phân tích retail thông minh với AI và Google Integration</p>
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
          <h3>🛒 Retail Analytics</h3>
          <p>
            Phân tích retail thông minh, dự đoán sales, quản lý inventory và tối ưu hóa hiệu suất
            cửa hàng.
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
          <p>
            Tích hợp Google Sheets để quản lý dữ liệu, báo cáo và tự động hóa quy trình làm việc.
          </p>
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
              "📡 Tích hợp WebSocket thời gian thực",
              "📊 Dashboard hiệu suất trực tiếp",
              "⚡ Cải thiện hiệu suất 50%",
              "🎨 Thiết kế UI/UX hiện đại",
              "📱 Hỗ trợ di động responsive",
              "🔒 Tính năng bảo mật nâng cao",
            ].map((feature, index) => (
              <span key={index} className="feature-tag">
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
