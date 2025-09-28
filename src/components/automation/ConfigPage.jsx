import {
  ApiOutlined,
  BellOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  SecurityScanOutlined,
  SettingOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

const ConfigPage = () => {
  const { message } = App.useApp(); // Use App's message hook
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [config, setConfig] = useState({});
  const [slaRules, setSlaRules] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [editingRule, setEditingRule] = useState(null);
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [sheetsConnection, setSheetsConnection] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);

  const testSheetsConnection = async () => {
    setTestingConnection(true);
    try {
      const response = await fetch("/api/config/test-connection");
      const data = await response.json();
      setSheetsConnection(data);

      if (data.success) {
        message.success("🎉 Kết nối Google Sheets thành công!");
      } else {
        message.error("❌ Kết nối Google Sheets thất bại");
      }
    } catch (error) {
      console.error("Error testing sheets connection:", error);
      message.error("Lỗi khi kiểm tra kết nối Google Sheets");
      setSheetsConnection({ success: false, error: error.message });
    } finally {
      setTestingConnection(false);
    }
  };

  // Test connection on component mount
  useEffect(() => {
    testSheetsConnection();
  }, []);

  const loadConfiguration = useCallback(async () => {
    try {
      const response = await fetch("/api/config");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();

      if (result.success) {
        const data = result.data;
        setConfig(data);

        // Flatten config for form
        const formData = {
          ...data.system,
          ...data.credentials,
          ...data.notifications,
        };
        form.setFieldsValue(formData);

        // Show config source info
        if (data._metadata) {
          const source = data._metadata.source || "unknown";
          const hasSheets = data._metadata.hasSheetConfig;
          message.info(
            `Configuration loaded from ${source}${
              hasSheets ? " (Google Sheets active)" : " (Local fallback)"
            }`
          );
        }
      } else {
        throw new Error(result.message || "Failed to load config");
      }
    } catch (error) {
      console.error("Error loading configuration:", error);
      message.error(
        "Không thể tải cấu hình từ Google Sheets, sử dụng cấu hình mặc định"
      );
      // Set default config for development
      const defaultConfig = {
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
      };
      setConfig(defaultConfig);
      form.setFieldsValue(defaultConfig);
    }
  }, [form]);

  const loadSLARules = useCallback(async () => {
    try {
      const response = await fetch("/api/config/sla-rules");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setSlaRules(data.rules || data);
    } catch (error) {
      console.error("Error loading SLA rules:", error);
      // Set default SLA rules for development
      const defaultRules = [
        {
          id: 1,
          platform: "Shopee",
          orderAfter: "18:00",
          confirmBefore: "09:00",
          handoverBefore: "12:00",
        },
        {
          id: 2,
          platform: "TikTok",
          orderAfter: "14:00",
          confirmBefore: "21:00",
          handoverBefore: "21:00",
        },
      ];
      setSlaRules(defaultRules);
    }
  }, []);

  const loadEmailTemplates = useCallback(async () => {
    try {
      const response = await fetch("/api/config/email-templates");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setEmailTemplates(data);
    } catch (error) {
      console.error("Error loading email templates:", error);
      // Set default templates for development
      setEmailTemplates([]);
    }
  }, []);

  // Load configuration
  useEffect(() => {
    loadConfiguration();
    loadSLARules();
    loadEmailTemplates();
  }, [loadConfiguration, loadSLARules, loadEmailTemplates]);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success("Cấu hình đã được lưu thành công");
        loadConfiguration();
      } else {
        message.error(
          "Lỗi khi lưu cấu hình - API endpoint chưa được triển khai"
        );
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      message.error(
        "Không thể lưu cấu hình - API endpoint chưa được triển khai"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Default values for reset
    const defaultConfig = {
      systemUrl: "https://one.tga.com.vn",
      username: "admin",
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
      notificationTypes: ["orderNew", "slaWarning"],
      notificationSound: true,
      enableEmailAlerts: false,
      emailRecipients: "",
      emailFrequency: "immediate",
      slaWarningThreshold: 80,
      slaCriticalThreshold: 95,
      enableSchedule: false,
      scheduleType: "daily",
      scheduleInterval: 60,
      dailyRunTime: "09:00",
      weeklyRunDays: ["1", "2", "3", "4", "5"],
      cronExpression: "0 0 * * *",
    };

    form.setFieldsValue(defaultConfig);
    message.info("Đã khôi phục về cấu hình mặc định");
  };

  // SLA Rule Modal
  const showRuleModal = (rule = null) => {
    setEditingRule(rule);
    setRuleModalVisible(true);
  };

  const handleRuleSubmit = async (values) => {
    try {
      const method = editingRule ? "PUT" : "POST";
      const url = editingRule
        ? `/api/config/sla-rules/${editingRule.id}`
        : "/api/config/sla-rules";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success(
          `Quy tắc đã được ${editingRule ? "cập nhật" : "tạo"} thành công`
        );
        setRuleModalVisible(false);
        loadSLARules();
      } else {
        message.error(
          "Lỗi khi lưu quy tắc - API endpoint chưa được triển khai"
        );
      }
    } catch (error) {
      console.error("Error saving rule:", error);
      message.error("Lỗi khi lưu quy tắc - API endpoint chưa được triển khai");
    }
  };

  const deleteRule = async (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa quy tắc này?",
      onOk: async () => {
        try {
          const response = await fetch(`/api/config/sla-rules/${id}`, {
            method: "DELETE",
          });
          if (response.ok) {
            message.success("Quy tắc đã được xóa thành công");
            loadSLARules();
          } else {
            message.error(
              "Lỗi khi xóa quy tắc - API endpoint chưa được triển khai"
            );
          }
        } catch (error) {
          console.error("Error deleting rule:", error);
          message.error(
            "Lỗi khi xóa quy tắc - API endpoint chưa được triển khai"
          );
        }
      },
    });
  };

  // SLA Rules columns
  const slaColumns = [
    {
      title: "Sàn thương mại",
      dataIndex: "platform",
      key: "platform",
      render: (platform) => <Tag color="blue">{platform}</Tag>,
    },
    {
      title: "Đặt hàng sau",
      dataIndex: "orderAfter",
      key: "orderAfter",
      render: (time) => <Tag color="orange">{time}</Tag>,
    },
    {
      title: "Xác nhận trước",
      dataIndex: "confirmBefore",
      key: "confirmBefore",
      render: (time) => <Tag color="green">{time}</Tag>,
    },
    {
      title: "Bàn giao trước",
      dataIndex: "handoverBefore",
      key: "handoverBefore",
      render: (time) => <Tag color="purple">{time}</Tag>,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => showRuleModal(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => deleteRule(record.id)}
          />
        </Space>
      ),
    },
  ];

  // Tab items for new Tabs API
  const tabItems = [
    {
      key: "1",
      label: (
        <span>
          <SettingOutlined />
          Cài đặt chung
        </span>
      ),
      children: (
        <Row gutter={24}>
          <Col span={12}>
            <Card title="Kết nối hệ thống">
              <Form.Item
                name="systemUrl"
                label="URL hệ thống ONE"
                rules={[{ required: true, message: "Vui lòng nhập URL" }]}
              >
                <Input
                  prefix={<ApiOutlined />}
                  placeholder="https://one.example.com"
                />
              </Form.Item>

              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[
                  { required: true, message: "Vui lòng nhập tên đăng nhập" },
                ]}
              >
                <Input
                  prefix={<SecurityScanOutlined />}
                  autoComplete="username"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
              >
                <Input.Password
                  prefix={<SecurityScanOutlined />}
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item
                name="sessionTimeout"
                label="Thời gian hết phiên (phút)"
              >
                <InputNumber min={30} max={1440} style={{ width: "100%" }} />
              </Form.Item>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Cài đặt tự động hóa">
              <Form.Item
                name="autoRefresh"
                label="Tự động làm mới"
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>

              <Form.Item
                name="refreshInterval"
                label="Khoảng thời gian làm mới (giây)"
              >
                <InputNumber min={10} max={300} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item name="maxRetries" label="Số lần thử lại tối đa">
                <InputNumber min={1} max={10} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="timeout"
                label="Thời gian chờ mỗi yêu cầu (giây)"
              >
                <InputNumber min={10} max={120} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item name="batchSize" label="Số lượng xử lý mỗi lô">
                <InputNumber min={5} max={50} style={{ width: "100%" }} />
              </Form.Item>
            </Card>
          </Col>

          <Col span={24} style={{ marginTop: 24 }}>
            <Card title="Cài đặt trình duyệt Chrome">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="headlessMode"
                    label="Chế độ ẩn giao diện"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="disableImages"
                    label="Tắt tải hình ảnh"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="disableJavascript"
                    label="Tắt JavaScript"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "2",
      label: (
        <span>
          <ClockCircleOutlined />
          Cấu hình SLA
        </span>
      ),
      children: (
        <>
          <Card
            title="Quy tắc SLA theo sàn thương mại"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showRuleModal()}
              >
                Thêm quy tắc mới
              </Button>
            }
          >
            <Alert
              message="Hướng dẫn cấu hình SLA"
              description={
                <ul>
                  <li>
                    Shopee: Đơn hàng sau 18:00 → Xác nhận trước 09:00 hôm sau,
                    Bàn giao trước 12:00
                  </li>
                  <li>
                    TikTok: Đơn hàng sau 14:00 → Bàn giao trước 21:00 hôm sau
                  </li>
                  <li>Khác: Áp dụng quy tắc riêng theo từng sàn thương mại</li>
                </ul>
              }
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Table
              columns={slaColumns}
              dataSource={slaRules}
              rowKey="id"
              pagination={false}
            />
          </Card>

          <Card title="Cài đặt cảnh báo SLA" style={{ marginTop: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="slaWarningThreshold"
                  label="Ngưỡng cảnh báo (%)"
                  tooltip="Cảnh báo khi thời gian xử lý đạt % này của SLA"
                >
                  <InputNumber
                    min={50}
                    max={95}
                    formatter={(value) => `${value}%`}
                    parser={(value) => value.replace("%", "")}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="slaCriticalThreshold"
                  label="Ngưỡng nghiêm trọng (%)"
                  tooltip="Cảnh báo nghiêm trọng khi thời gian xử lý đạt % này của SLA"
                >
                  <InputNumber
                    min={80}
                    max={100}
                    formatter={(value) => `${value}%`}
                    parser={(value) => value.replace("%", "")}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </>
      ),
    },
    {
      key: "3",
      label: (
        <span>
          <BellOutlined />
          Thông báo
        </span>
      ),
      children: (
        <Row gutter={24}>
          <Col span={12}>
            <Card title="Cài đặt thông báo">
              <Form.Item
                name="enableNotifications"
                label="Bật thông báo"
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>

              <Form.Item name="notificationTypes" label="Loại thông báo">
                <Select mode="multiple" placeholder="Chọn loại thông báo">
                  <Option value="orderNew">Đơn hàng mới</Option>
                  <Option value="orderOverdue">Đơn hàng quá hạn</Option>
                  <Option value="slaWarning">Cảnh báo SLA</Option>
                  <Option value="systemError">Lỗi hệ thống</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="notificationSound"
                label="Âm thanh thông báo"
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Cài đặt email">
              <Form.Item
                name="enableEmailAlerts"
                label="Gửi email cảnh báo"
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>

              <Form.Item
                name="emailRecipients"
                label="Danh sách email nhận thông báo"
                tooltip="Nhập nhiều email, cách nhau bằng dấu phẩy"
              >
                <TextArea
                  rows={3}
                  placeholder="email1@example.com, email2@example.com"
                />
              </Form.Item>

              <Form.Item name="emailFrequency" label="Tần suất gửi email">
                <Select>
                  <Option value="immediate">Ngay lập tức</Option>
                  <Option value="hourly">Mỗi giờ</Option>
                  <Option value="daily">Hàng ngày</Option>
                </Select>
              </Form.Item>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "4",
      label: (
        <span>
          <CalendarOutlined />
          Lịch trình
        </span>
      ),
      children: (
        <Card title="Cấu hình lịch chạy tự động">
          <Alert
            message="Lưu ý quan trọng"
            description="Hệ thống sẽ tự động chạy theo lịch được cấu hình. Đảm bảo máy chủ luôn hoạt động."
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="enableSchedule"
                label="Bật lịch chạy tự động"
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>

              <Form.Item name="scheduleType" label="Loại lịch chạy">
                <Select>
                  <Option value="interval">Theo khoảng thời gian</Option>
                  <Option value="daily">Hàng ngày</Option>
                  <Option value="weekly">Hàng tuần</Option>
                  <Option value="custom">Tùy chỉnh (Cron)</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="scheduleInterval"
                label="Khoảng thời gian (phút)"
                tooltip="Chỉ áp dụng cho loại 'Theo khoảng thời gian'"
              >
                <InputNumber min={5} max={1440} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="dailyRunTime"
                label="Thời gian chạy hàng ngày"
                tooltip="Chỉ áp dụng cho loại 'Hàng ngày'. Định dạng: HH:mm (ví dụ: 09:00)"
              >
                <Input placeholder="09:00" style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="weeklyRunDays"
                label="Ngày chạy trong tuần"
                tooltip="Chỉ áp dụng cho loại 'Hàng tuần'"
              >
                <Select mode="multiple">
                  <Option value="1">Thứ 2</Option>
                  <Option value="2">Thứ 3</Option>
                  <Option value="3">Thứ 4</Option>
                  <Option value="4">Thứ 5</Option>
                  <Option value="5">Thứ 6</Option>
                  <Option value="6">Thứ 7</Option>
                  <Option value="0">Chủ nhật</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="cronExpression"
                label="Biểu thức Cron"
                tooltip="Chỉ áp dụng cho loại 'Tùy chỉnh'"
              >
                <Input placeholder="0 0 * * *" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: "5",
      label: (
        <span>
          <CalendarOutlined />
          Khoảng thời gian
        </span>
      ),
      children: (
        <Row gutter={24}>
          <Col span={12}>
            <Card title="Cấu hình khoảng thời gian">
              <Form.Item name="dateRangeMode" label="Chế độ khoảng thời gian">
                <Radio.Group>
                  <Radio value="auto">Tự động (linh hoạt)</Radio>
                  <Radio value="custom">Tùy chỉnh (cố định)</Radio>
                  <Radio value="relative">Tương đối</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="autoCalculate"
                label="Tự động tính toán"
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>

              <Form.Item name="defaultRangeDays" label="Số ngày mặc định">
                <InputNumber min={1} max={365} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="enableDateRange"
                label="Bật lọc theo ngày"
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Khoảng thời gian cố định">
              <Form.Item name="startDate" label="Ngày bắt đầu">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item name="endDate" label="Ngày kết thúc">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>

              <Alert
                message="Hướng dẫn sử dụng"
                description={
                  <ul>
                    <li>
                      <strong>Tự động:</strong> Bảng điều khiển sẽ tự động tính
                      toán khoảng thời gian
                    </li>
                    <li>
                      <strong>Tùy chỉnh:</strong> Sử dụng ngày cố định được cấu
                      hình
                    </li>
                    <li>
                      <strong>Tương đối:</strong> Sử dụng số ngày mặc định từ
                      hiện tại trở về trước
                    </li>
                  </ul>
                }
                type="info"
                showIcon
              />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "6",
      label: (
        <span>
          <DatabaseOutlined />
          Xử lý dữ liệu
        </span>
      ),
      children: (
        <Row gutter={24}>
          <Col span={12}>
            <Card title="Xử lý dữ liệu">
              <Form.Item
                name="maxRowsForTesting"
                label="Giới hạn dòng cho kiểm thử"
              >
                <InputNumber min={100} max={10000} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="maxRowsProduction"
                label="Giới hạn dòng sản xuất"
              >
                <InputNumber min={1000} max={50000} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="fastMode"
                label="Chế độ nhanh"
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>

              <Form.Item
                name="enableBatchProcessing"
                label="Xử lý theo lô"
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>

              <Form.Item name="batchProcessingSize" label="Kích thước lô">
                <InputNumber min={10} max={1000} style={{ width: "100%" }} />
              </Form.Item>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Cấu hình hiệu suất">
              <Form.Item
                name="enableParallelProcessing"
                label="Xử lý song song"
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>

              <Form.Item name="parallelThreads" label="Số luồng song song">
                <InputNumber min={1} max={10} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="cacheResults"
                label="Lưu cache kết quả"
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>

              <Form.Item name="cacheTimeout" label="Thời gian cache (phút)">
                <InputNumber min={5} max={1440} style={{ width: "100%" }} />
              </Form.Item>

              <Alert
                message="Khuyến nghị"
                description="Bật chế độ nhanh và cache để tăng hiệu suất khi xử lý lượng lớn dữ liệu"
                type="success"
                showIcon
              />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "7",
      label: (
        <span>
          <TagsOutlined />
          Ánh xạ sàn thương mại
        </span>
      ),
      children: (
        <Row gutter={24}>
          <Col span={24}>
            <Card title="Ánh xạ tên sàn thương mại">
              <Alert
                message="Giải quyết vấn đề không khớp tên sàn thương mại"
                description="Cấu hình ánh xạ để đảm bảo tên sàn thương mại trong CSV khớp với bộ lọc trên Bảng điều khiển"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Row gutter={16}>
                <Col span={12}>
                  <Card title="Tên sàn trong CSV" size="small">
                    <Form.Item name="csvShopee" label="Shopee trong CSV">
                      <Input placeholder="Shopee" />
                    </Form.Item>
                    <Form.Item name="csvTiktok" label="TikTok trong CSV">
                      <Input placeholder="Tiktok" />
                    </Form.Item>
                    <Form.Item name="csvLazada" label="Lazada trong CSV">
                      <Input placeholder="Lazada" />
                    </Form.Item>
                    <Form.Item name="csvTiki" label="Tiki trong CSV">
                      <Input placeholder="Tiki" />
                    </Form.Item>
                    <Form.Item name="csvFacebook" label="Facebook trong CSV">
                      <Input placeholder="Facebook" />
                    </Form.Item>
                    <Form.Item
                      name="csvLivestream"
                      label="Livestream trong CSV"
                    >
                      <Input placeholder="Livestream" />
                    </Form.Item>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card title="Tên hiển thị trên Dashboard" size="small">
                    <Form.Item name="displayShopee" label="Shopee hiển thị">
                      <Input placeholder="Shopee" />
                    </Form.Item>
                    <Form.Item name="displayTiktok" label="TikTok hiển thị">
                      <Input placeholder="TikTok" />
                    </Form.Item>
                    <Form.Item name="displayLazada" label="Lazada hiển thị">
                      <Input placeholder="Lazada" />
                    </Form.Item>
                    <Form.Item name="displayTiki" label="Tiki hiển thị">
                      <Input placeholder="Tiki" />
                    </Form.Item>
                    <Form.Item name="displayFacebook" label="Facebook hiển thị">
                      <Input placeholder="Facebook" />
                    </Form.Item>
                    <Form.Item
                      name="displayLivestream"
                      label="Livestream hiển thị"
                    >
                      <Input placeholder="Livestream" />
                    </Form.Item>
                  </Card>
                </Col>
              </Row>

              <Card title="Nhóm sàn thương mại" style={{ marginTop: 16 }}>
                <Form.Item name="platformGroups" label="Nhóm 'Khác' bao gồm">
                  <Select
                    mode="multiple"
                    placeholder="Chọn các sàn thương mại nhóm vào 'Khác'"
                  >
                    <Option value="Facebook">Facebook</Option>
                    <Option value="Livestream">Livestream</Option>
                    <Option value="MIA.vn website">Website MIA.vn</Option>
                    <Option value="MIA RETAIL">MIA RETAIL</Option>
                    <Option value="B2B">B2B</Option>
                  </Select>
                </Form.Item>
              </Card>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "8",
      label: (
        <span>
          <ExportOutlined />
          Xuất dữ liệu & Dashboard
        </span>
      ),
      children: (
        <Row gutter={24}>
          <Col span={12}>
            <Card title="Cấu hình xuất dữ liệu">
              <Form.Item name="exportFormats" label="Định dạng xuất">
                <Select mode="multiple" placeholder="Chọn định dạng">
                  <Option value="csv">CSV</Option>
                  <Option value="xlsx">Excel</Option>
                  <Option value="json">JSON</Option>
                  <Option value="pdf">PDF</Option>
                </Select>
              </Form.Item>

              <Form.Item name="outputDirectory" label="Thư mục xuất">
                <Input placeholder="data/" />
              </Form.Item>

              <Form.Item name="filenamePrefix" label="Tiền tố tên file">
                <Input placeholder="orders_export_" />
              </Form.Item>

              <Form.Item
                name="includeTimestamp"
                label="Bao gồm dấu thời gian"
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>

              <Form.Item
                name="compressFiles"
                label="Nén file"
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Cấu hình bảng điều khiển">
              <Form.Item
                name="dashboardRefreshRate"
                label="Tốc độ làm mới (giây)"
              >
                <InputNumber min={5} max={300} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item name="maxDisplayOrders" label="Số đơn hiển thị tối đa">
                <InputNumber min={50} max={10000} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="enableRealtime"
                label="Cập nhật thời gian thực"
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>

              <Form.Item
                name="enableDataSource"
                label="Hiển thị nguồn dữ liệu"
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>

              <Form.Item
                name="preferredDataSource"
                label="Nguồn dữ liệu ưu tiên"
              >
                <Select>
                  <Option value="database">Cơ sở dữ liệu</Option>
                  <Option value="csv_automation">CSV Tự động</Option>
                  <Option value="google_sheets">Google Sheets</Option>
                  <Option value="mock">Dữ liệu mẫu</Option>
                </Select>
              </Form.Item>

              <Alert
                message="Thứ tự ưu tiên"
                description="1. Cơ sở dữ liệu → 2. CSV Tự động → 3. Google Sheets → 4. Dữ liệu mẫu"
                type="info"
                showIcon
              />
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      {/* Google Sheets Connection Status */}
      <Card
        title="📊 Tích hợp Google Sheets"
        style={{ marginBottom: 24 }}
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={testSheetsConnection}
            loading={testingConnection}
            size="small"
          >
            Kiểm tra kết nối
          </Button>
        }
      >
        {sheetsConnection ? (
          <Row gutter={16}>
            <Col span={8}>
              <Text strong>Trạng thái: </Text>
              <Tag color={sheetsConnection.success ? "success" : "error"}>
                {sheetsConnection.success ? "✅ Đã kết nối" : "❌ Thất bại"}
              </Tag>
            </Col>
            <Col span={8}>
              <Text strong>Lần kiểm tra cuối: </Text>
              <Text>
                {sheetsConnection.data?.timestamp
                  ? new Date(
                      sheetsConnection.data.timestamp
                    ).toLocaleTimeString("vi-VN")
                  : "Chưa có"}
              </Text>
            </Col>
            <Col span={8}>
              <Text strong>ID Bảng tính: </Text>
              <Text code>
                {sheetsConnection.data?.spreadsheetId || "Chưa cấu hình"}
              </Text>
            </Col>
          </Row>
        ) : (
          <Alert
            message="Đang kiểm tra kết nối Google Sheets..."
            type="info"
            showIcon
            style={{ margin: 0 }}
          />
        )}

        {sheetsConnection && !sheetsConnection.success && (
          <Alert
            message="Kết nối Google Sheets thất bại"
            description={sheetsConnection.error || "Lỗi không xác định"}
            type="error"
            showIcon
            style={{ marginTop: 16 }}
            action={
              <Button size="small" onClick={testSheetsConnection}>
                Thử lại
              </Button>
            }
          />
        )}
      </Card>

      <Card>
        <Row
          align="middle"
          justify="space-between"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              <SettingOutlined /> Cấu hình hệ thống
            </Title>
            <Text type="secondary">
              Quản lý cấu hình cho Hệ thống Tự động hóa Kho
            </Text>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                Khôi phục
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={loading}
                onClick={() => form.submit()}
              >
                Lưu cấu hình
              </Button>
            </Space>
          </Col>
        </Row>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            // System & Automation Settings
            systemUrl: "https://one.tga.com.vn",
            username: "admin",
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

            // SLA Settings
            slaWarningThreshold: 80,
            slaCriticalThreshold: 95,

            // Notification Settings
            enableNotifications: true,
            notificationTypes: ["orderNew", "slaWarning"],
            notificationSound: true,
            enableEmailAlerts: false,
            emailRecipients: "",
            emailFrequency: "immediate",

            // Schedule Settings
            enableSchedule: false,
            scheduleType: "daily",
            scheduleInterval: 60,
            dailyRunTime: "09:00",
            weeklyRunDays: ["1", "2", "3", "4", "5"],
            cronExpression: "0 0 * * *",

            // Date Range Settings
            dateRangeMode: "auto",
            autoCalculate: true,
            defaultRangeDays: 7,
            enableDateRange: true,
            startDate: dayjs().subtract(7, "days"),
            endDate: dayjs(),

            // Data Processing Settings
            maxRowsForTesting: 1000,
            maxRowsProduction: 10000,
            fastMode: true,
            enableBatchProcessing: true,
            batchProcessingSize: 100,
            enableParallelProcessing: true,
            parallelThreads: 3,
            cacheResults: true,
            cacheTimeout: 60,

            // Platform Mapping Settings
            csvShopee: "Shopee",
            csvTiktok: "Tiktok", // Note: lowercase k in CSV
            csvLazada: "Lazada",
            csvTiki: "Tiki",
            csvFacebook: "Facebook",
            csvLivestream: "Livestream",
            displayShopee: "Shopee",
            displayTiktok: "TikTok", // Note: uppercase K for display
            displayLazada: "Lazada",
            displayTiki: "Tiki",
            displayFacebook: "Facebook",
            displayLivestream: "Livestream",
            platformGroups: ["Facebook", "Livestream", "MIA.vn website"],

            // Export & Dashboard Settings
            exportFormats: ["csv", "xlsx"],
            outputDirectory: "data/",
            filenamePrefix: "orders_export_",
            includeTimestamp: true,
            compressFiles: false,
            dashboardRefreshRate: 30,
            maxDisplayOrders: 1000,
            enableRealtime: true,
            enableDataSource: true,
            preferredDataSource: "csv_automation",
          }}
        >
          <Tabs defaultActiveKey="1" items={tabItems} />
        </Form>
      </Card>

      {/* SLA Rule Modal */}
      <Modal
        title={editingRule ? "Chỉnh sửa quy tắc SLA" : "Thêm quy tắc SLA mới"}
        open={ruleModalVisible}
        onCancel={() => setRuleModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          onFinish={handleRuleSubmit}
          initialValues={editingRule}
        >
          <Form.Item
            name="platform"
            label="Sàn thương mại"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="Shopee">Shopee</Option>
              <Option value="TikTok">TikTok</Option>
              <Option value="Lazada">Lazada</Option>
              <Option value="Others">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="orderAfter"
            label="Đặt hàng sau (HH:mm)"
            rules={[{ required: true }]}
          >
            <Input placeholder="18:00" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="confirmBefore"
            label="Xác nhận trước (HH:mm)"
            rules={[{ required: true }]}
          >
            <Input placeholder="09:00" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="handoverBefore"
            label="Bàn giao trước (HH:mm)"
            rules={[{ required: true }]}
          >
            <Input placeholder="12:00" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingRule ? "Cập nhật" : "Thêm mới"}
              </Button>
              <Button onClick={() => setRuleModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ConfigPage;
