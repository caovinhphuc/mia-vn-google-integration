import React, { useState, useEffect } from "react";
import "./SimpleConfigPage.css";

const SimpleConfigPage = () => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    systemUrl: "https://one.tga.com.vn",
    username: "",
    password: "",
    sessionTimeout: 60,
    autoRefresh: true,
    refreshInterval: 30,
    maxRetries: 3,
    timeout: 30,
    batchSize: 20,
    headlessMode: true,
    disableImages: true,
    disableJavascript: false,
    enableNotifications: true,
    enableEmailAlerts: false,
    slaWarningThreshold: 80,
    slaCriticalThreshold: 95,
  });
  const [slaRules, setSlaRules] = useState([
    {
      id: 1,
      name: "SLA Cơ bản",
      description: "Quy tắc SLA cơ bản cho đơn hàng",
      warningThreshold: 80,
      criticalThreshold: 95,
      enabled: true,
    },
    {
      id: 2,
      name: "SLA Khẩn cấp",
      description: "Quy tắc SLA cho đơn hàng khẩn cấp",
      warningThreshold: 60,
      criticalThreshold: 80,
      enabled: true,
    },
  ]);
  const [activeTab, setActiveTab] = useState("system");
  const [message, setMessage] = useState(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showMessage("success", "Cấu hình đã được lưu thành công!");
    } catch (error) {
      showMessage("error", "Lỗi khi lưu cấu hình");
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      // Simulate connection test
      await new Promise((resolve) => setTimeout(resolve, 1500));
      showMessage("success", "Kết nối Google Sheets thành công!");
    } catch (error) {
      showMessage("error", "Kết nối Google Sheets thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSlaRuleChange = (id, field, value) => {
    setSlaRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule))
    );
  };

  const addSlaRule = () => {
    const newRule = {
      id: Date.now(),
      name: "SLA Mới",
      description: "Mô tả quy tắc SLA mới",
      warningThreshold: 80,
      criticalThreshold: 95,
      enabled: true,
    };
    setSlaRules((prev) => [...prev, newRule]);
  };

  const deleteSlaRule = (id) => {
    setSlaRules((prev) => prev.filter((rule) => rule.id !== id));
  };

  return (
    <div className="simple-config-page">
      <div className="config-header">
        <h1>⚙️ Cấu hình Hệ thống</h1>
        <p>Quản lý cấu hình automation và SLA rules</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`message message-${message.type}`}>
          <span className="message-icon">
            {message.type === "success" ? "✅" : "❌"}
          </span>
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="config-tabs">
        <button
          className={`tab ${activeTab === "system" ? "active" : ""}`}
          onClick={() => setActiveTab("system")}
        >
          🖥️ Hệ thống
        </button>
        <button
          className={`tab ${activeTab === "notifications" ? "active" : ""}`}
          onClick={() => setActiveTab("notifications")}
        >
          🔔 Thông báo
        </button>
        <button
          className={`tab ${activeTab === "sla" ? "active" : ""}`}
          onClick={() => setActiveTab("sla")}
        >
          ⏰ SLA Rules
        </button>
        <button
          className={`tab ${activeTab === "advanced" ? "active" : ""}`}
          onClick={() => setActiveTab("advanced")}
        >
          🔧 Nâng cao
        </button>
      </div>

      {/* Tab Content */}
      <div className="config-content">
        {activeTab === "system" && (
          <div className="config-section">
            <h2>🖥️ Cấu hình Hệ thống</h2>

            <div className="form-grid">
              <div className="form-group">
                <label>System URL</label>
                <input
                  type="url"
                  value={config.systemUrl}
                  onChange={(e) =>
                    handleInputChange("systemUrl", e.target.value)
                  }
                  placeholder="https://one.tga.com.vn"
                />
              </div>

              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={config.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  placeholder="Tên đăng nhập"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={config.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Mật khẩu"
                />
              </div>

              <div className="form-group">
                <label>Session Timeout (phút)</label>
                <input
                  type="number"
                  value={config.sessionTimeout}
                  onChange={(e) =>
                    handleInputChange(
                      "sessionTimeout",
                      parseInt(e.target.value)
                    )
                  }
                  min="1"
                  max="120"
                />
              </div>

              <div className="form-group">
                <label>Refresh Interval (giây)</label>
                <input
                  type="number"
                  value={config.refreshInterval}
                  onChange={(e) =>
                    handleInputChange(
                      "refreshInterval",
                      parseInt(e.target.value)
                    )
                  }
                  min="10"
                  max="300"
                />
              </div>

              <div className="form-group">
                <label>Max Retries</label>
                <input
                  type="number"
                  value={config.maxRetries}
                  onChange={(e) =>
                    handleInputChange("maxRetries", parseInt(e.target.value))
                  }
                  min="1"
                  max="10"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "⏳" : "💾"} Lưu cấu hình
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleTestConnection}
                disabled={loading}
              >
                {loading ? "⏳" : "🔗"} Kiểm tra kết nối
              </button>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="config-section">
            <h2>🔔 Cấu hình Thông báo</h2>

            <div className="form-grid">
              <div className="form-group">
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={config.enableNotifications}
                    onChange={(e) =>
                      handleInputChange("enableNotifications", e.target.checked)
                    }
                  />
                  <span className="switch-slider"></span>
                  Bật thông báo
                </label>
              </div>

              <div className="form-group">
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={config.enableEmailAlerts}
                    onChange={(e) =>
                      handleInputChange("enableEmailAlerts", e.target.checked)
                    }
                  />
                  <span className="switch-slider"></span>
                  Cảnh báo email
                </label>
              </div>

              <div className="form-group">
                <label>SLA Warning Threshold (%)</label>
                <input
                  type="number"
                  value={config.slaWarningThreshold}
                  onChange={(e) =>
                    handleInputChange(
                      "slaWarningThreshold",
                      parseInt(e.target.value)
                    )
                  }
                  min="0"
                  max="100"
                />
              </div>

              <div className="form-group">
                <label>SLA Critical Threshold (%)</label>
                <input
                  type="number"
                  value={config.slaCriticalThreshold}
                  onChange={(e) =>
                    handleInputChange(
                      "slaCriticalThreshold",
                      parseInt(e.target.value)
                    )
                  }
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "sla" && (
          <div className="config-section">
            <div className="section-header">
              <h2>⏰ Quản lý SLA Rules</h2>
              <button className="btn btn-primary" onClick={addSlaRule}>
                ➕ Thêm Rule
              </button>
            </div>

            <div className="sla-rules">
              {slaRules.map((rule) => (
                <div key={rule.id} className="sla-rule-card">
                  <div className="rule-header">
                    <h3>{rule.name}</h3>
                    <div className="rule-actions">
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteSlaRule(rule.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="rule-content">
                    <div className="form-group">
                      <label>Tên Rule</label>
                      <input
                        type="text"
                        value={rule.name}
                        onChange={(e) =>
                          handleSlaRuleChange(rule.id, "name", e.target.value)
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Mô tả</label>
                      <textarea
                        value={rule.description}
                        onChange={(e) =>
                          handleSlaRuleChange(
                            rule.id,
                            "description",
                            e.target.value
                          )
                        }
                        rows="2"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Warning Threshold (%)</label>
                        <input
                          type="number"
                          value={rule.warningThreshold}
                          onChange={(e) =>
                            handleSlaRuleChange(
                              rule.id,
                              "warningThreshold",
                              parseInt(e.target.value)
                            )
                          }
                          min="0"
                          max="100"
                        />
                      </div>

                      <div className="form-group">
                        <label>Critical Threshold (%)</label>
                        <input
                          type="number"
                          value={rule.criticalThreshold}
                          onChange={(e) =>
                            handleSlaRuleChange(
                              rule.id,
                              "criticalThreshold",
                              parseInt(e.target.value)
                            )
                          }
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="switch-label">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(e) =>
                            handleSlaRuleChange(
                              rule.id,
                              "enabled",
                              e.target.checked
                            )
                          }
                        />
                        <span className="switch-slider"></span>
                        Kích hoạt
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "advanced" && (
          <div className="config-section">
            <h2>🔧 Cấu hình Nâng cao</h2>

            <div className="form-grid">
              <div className="form-group">
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={config.autoRefresh}
                    onChange={(e) =>
                      handleInputChange("autoRefresh", e.target.checked)
                    }
                  />
                  <span className="switch-slider"></span>
                  Tự động làm mới
                </label>
              </div>

              <div className="form-group">
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={config.headlessMode}
                    onChange={(e) =>
                      handleInputChange("headlessMode", e.target.checked)
                    }
                  />
                  <span className="switch-slider"></span>
                  Headless Mode
                </label>
              </div>

              <div className="form-group">
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={config.disableImages}
                    onChange={(e) =>
                      handleInputChange("disableImages", e.target.checked)
                    }
                  />
                  <span className="switch-slider"></span>
                  Tắt hình ảnh
                </label>
              </div>

              <div className="form-group">
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={config.disableJavascript}
                    onChange={(e) =>
                      handleInputChange("disableJavascript", e.target.checked)
                    }
                  />
                  <span className="switch-slider"></span>
                  Tắt JavaScript
                </label>
              </div>

              <div className="form-group">
                <label>Batch Size</label>
                <input
                  type="number"
                  value={config.batchSize}
                  onChange={(e) =>
                    handleInputChange("batchSize", parseInt(e.target.value))
                  }
                  min="1"
                  max="100"
                />
              </div>

              <div className="form-group">
                <label>Timeout (giây)</label>
                <input
                  type="number"
                  value={config.timeout}
                  onChange={(e) =>
                    handleInputChange("timeout", parseInt(e.target.value))
                  }
                  min="5"
                  max="300"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleConfigPage;
