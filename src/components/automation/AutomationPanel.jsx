import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { useCallback, useEffect, useState } from "react";

const { Title, Text } = Typography;

const AutomationPanel = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("stopped"); // stopped, running, paused
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [lastResult, setLastResult] = useState(null); // Store last automation result
  const [stats, setStats] = useState({
    totalOrders: 0,
    processedOrders: 0,
    failedOrders: 0,
    lastRunTime: null,
  });

  // Mock automation control functions
  const startAutomation = useCallback(async () => {
    try {
      setLoading(true);
      setStatus("running");
      setProgress(0);

      // Gọi API backend để bắt đầu automation với improved error handling
      console.log("🚀 Starting automation request...");

      const response = await fetch("/api/automation/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "sla",
          userApproved: true,
          permissions: {
            systemAccess: true,
            dataProcessing: true,
            riskAwareness: true,
          },
        }),
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response headers:", response.headers);

      // Check if response is actually JSON
      const contentType = response.headers.get("content-type");
      console.log("📄 Content-Type:", contentType);

      let result;
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
        console.log("✅ JSON response:", result);
      } else {
        // Handle non-JSON response (like proxy errors)
        const textResponse = await response.text();
        console.error("❌ Non-JSON response:", textResponse);
        throw new Error(
          `Invalid response format. Expected JSON, got: ${textResponse.substring(
            0,
            100
          )}...`
        );
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            `HTTP ${response.status}: ${
              result.error || "Failed to start automation"
            }`
        );
      }

      // Store result for display
      setLastResult(result);

      message.success(
        `🚀 ${result.message || "Automation started successfully!"}`,
        5 // Display for 5 seconds
      );

      console.log(
        "🎉 Automation started successfully, starting progress simulation..."
      );

      // Simulate progress (backend có thể trả về real-time progress)
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 10;
          console.log(`📊 Progress update: ${newProgress}%`);

          if (newProgress >= 100) {
            clearInterval(interval);
            setStatus("stopped");
            setStats((prevStats) => ({
              ...prevStats,
              processedOrders: prevStats.processedOrders + 15,
              lastRunTime: new Date().toISOString(),
            }));
            message.success("✅ Automation completed successfully!", 5);
            console.log("✅ Automation simulation completed!");
            return 100;
          }
          return newProgress;
        });
      }, 1500); // Slower progress for better visibility
    } catch (error) {
      console.error("❌ Automation error:", error);
      message.error(`❌ Failed to start automation: ${error.message}`);
      setStatus("stopped");
    } finally {
      setLoading(false);
    }
  }, []);

  const stopAutomation = useCallback(() => {
    setStatus("stopped");
    setProgress(0);
    message.info("⏹️ Automation stopped");
  }, []);

  const pauseAutomation = useCallback(() => {
    setStatus("paused");
    message.info("⏸️ Automation paused");
  }, []);

  const resumeAutomation = useCallback(() => {
    setStatus("running");
    message.info("▶️ Automation resumed");
  }, []);

  // Mock log data
  useEffect(() => {
    const mockLogs = [
      {
        key: "1",
        timestamp: new Date().toISOString(),
        level: "info",
        message: "System initialized successfully",
        details: "Chrome driver ready, Google Sheets connected",
      },
      {
        key: "2",
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: "success",
        message: "Processed 15 orders from Shopee",
        details: "All orders processed within SLA",
      },
      {
        key: "3",
        timestamp: new Date(Date.now() - 120000).toISOString(),
        level: "warning",
        message: "SLA warning for order SO240001",
        details: "Order approaching deadline",
      },
      {
        key: "4",
        timestamp: new Date(Date.now() - 180000).toISOString(),
        level: "error",
        message: "Failed to process order SO240002",
        details: "Element not found: confirm button",
      },
    ];

    setLogs(mockLogs);
    setStats({
      totalOrders: 150,
      processedOrders: 135,
      failedOrders: 3,
      lastRunTime: new Date(Date.now() - 300000).toISOString(),
    });
  }, []);

  const logColumns = [
    {
      title: "Thời gian",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 180,
      render: (timestamp) => new Date(timestamp).toLocaleString("vi-VN"),
    },
    {
      title: "Mức độ",
      dataIndex: "level",
      key: "level",
      width: 100,
      render: (level) => {
        const colors = {
          info: "blue",
          success: "green",
          warning: "orange",
          error: "red",
        };
        return <Tag color={colors[level]}>{level.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Thông báo",
      dataIndex: "message",
      key: "message",
    },
    {
      title: "Chi tiết",
      dataIndex: "details",
      key: "details",
      ellipsis: true,
    },
  ];

  const getStatusIcon = () => {
    switch (status) {
      case "running":
        return <PlayCircleOutlined style={{ color: "#52c41a" }} />;
      case "paused":
        return <ClockCircleOutlined style={{ color: "#fa8c16" }} />;
      default:
        return <StopOutlined style={{ color: "#f5222d" }} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "running":
        return "#52c41a";
      case "paused":
        return "#fa8c16";
      default:
        return "#f5222d";
    }
  };

  return (
    <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
      <Title level={2}>🤖 Automation Control Panel</Title>

      {/* Last Automation Result */}
      {lastResult && (
        <Alert
          message="✅ Automation Response"
          description={
            <div>
              <p>
                <strong>Status:</strong> {lastResult.status}
              </p>
              <p>
                <strong>Mode:</strong> {lastResult.mode}
              </p>
              <p>
                <strong>Message:</strong> {lastResult.message}
              </p>
              <p>
                <strong>Success:</strong> {lastResult.success ? "Yes" : "No"}
              </p>
            </div>
          }
          type={lastResult.success ? "success" : "error"}
          showIcon
          closable
          style={{ marginBottom: 24 }}
          onClose={() => setLastResult(null)}
        />
      )}

      {/* Status Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={stats.totalOrders}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Đã xử lý"
              value={stats.processedOrders}
              valueStyle={{ color: "#3f8600" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Thất bại"
              value={stats.failedOrders}
              valueStyle={{ color: "#cf1322" }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Tỷ lệ thành công"
              value={(
                (stats.processedOrders / stats.totalOrders) *
                100
              ).toFixed(1)}
              precision={1}
              suffix="%"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Control Panel */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="🎮 Điều khiển Automation" extra={getStatusIcon()}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Descriptions bordered size="small">
                <Descriptions.Item label="Trạng thái" span={2}>
                  <Tag color={getStatusColor()}>
                    {status === "running"
                      ? "Đang chạy"
                      : status === "paused"
                      ? "Tạm dừng"
                      : "Đã dừng"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tiến độ" span={2}>
                  <Progress percent={progress} size="small" />
                </Descriptions.Item>
                <Descriptions.Item label="Lần chạy cuối" span={2}>
                  <Text>
                    {stats.lastRunTime
                      ? new Date(stats.lastRunTime).toLocaleString("vi-VN")
                      : "Chưa chạy"}
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              <Space wrap>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={startAutomation}
                  loading={loading}
                  disabled={status === "running"}
                >
                  Bắt đầu
                </Button>
                <Button
                  icon={<StopOutlined />}
                  onClick={stopAutomation}
                  disabled={status === "stopped"}
                >
                  Dừng
                </Button>
                <Button
                  icon={<ClockCircleOutlined />}
                  onClick={
                    status === "paused" ? resumeAutomation : pauseAutomation
                  }
                  disabled={status === "stopped"}
                >
                  {status === "paused" ? "Tiếp tục" : "Tạm dừng"}
                </Button>
                <Button icon={<ReloadOutlined />}>Restart</Button>
                <Button icon={<SettingOutlined />}>Cài đặt</Button>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="📊 Thống kê thời gian thực">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Alert
                message="Hệ thống đang hoạt động bình thường"
                description="Tất cả các dịch vụ đang kết nối và hoạt động ổn định."
                type="success"
                showIcon
              />

              <div>
                <Text strong>Chrome Driver: </Text>
                <Tag color="green">Kết nối</Tag>
              </div>

              <div>
                <Text strong>Google Sheets: </Text>
                <Tag color="green">Kết nối</Tag>
              </div>

              <div>
                <Text strong>ONE System: </Text>
                <Tag color="green">Kết nối</Tag>
              </div>

              <div>
                <Text strong>Lần cập nhật cuối: </Text>
                <Text>{new Date().toLocaleTimeString("vi-VN")}</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Automation Logs */}
      <Card title="📋 Nhật ký Automation" style={{ marginBottom: 24 }}>
        <Table
          columns={logColumns}
          dataSource={logs}
          pagination={{ pageSize: 10 }}
          size="small"
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Quick Actions */}
      <Card title="⚡ Hành động nhanh">
        <Space wrap>
          <Button type="dashed" icon={<CheckCircleOutlined />}>
            Kiểm tra hệ thống
          </Button>
          <Button type="dashed" icon={<ReloadOutlined />}>
            Sync Google Sheets
          </Button>
          <Button type="dashed" icon={<ExclamationCircleOutlined />}>
            Kiểm tra SLA
          </Button>
          <Button type="dashed" icon={<SettingOutlined />}>
            Cấu hình nâng cao
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default AutomationPanel;
