/**
 * 🛒 MIA Retail Dashboard Widget
 *
 * Retail-specific dashboard widget for MIA Retail analytics platform.
 * Displays sales, inventory, customer, and store performance metrics.
 */

import React, { useState, useEffect } from "react";
import { Card, Typography, Spin, Alert, Row, Col, Tag, Space } from "antd";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  fetchRetailDashboard,
  fetchSalesMetrics,
  fetchInventoryStatus,
  fetchCustomerAnalytics,
  formatVND,
} from "../../services/retailService";

const MIARetailDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRetailData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchRetailData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRetailData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use Promise.allSettled to handle individual failures gracefully
      const [dashboardResult, salesResult, inventoryResult, customersResult] =
        await Promise.allSettled([
          fetchRetailDashboard(),
          fetchSalesMetrics("30d"),
          fetchInventoryStatus(),
          fetchCustomerAnalytics("30d"),
        ]);

      // Handle each result individually
      if (dashboardResult.status === "fulfilled" && dashboardResult.value) {
        setDashboardData(dashboardResult.value);
      }
      if (salesResult.status === "fulfilled" && salesResult.value) {
        setSalesData(salesResult.value);
      }
      if (inventoryResult.status === "fulfilled" && inventoryResult.value) {
        setInventoryData(inventoryResult.value);
      }
      if (customersResult.status === "fulfilled" && customersResult.value) {
        setCustomerData(customersResult.value);
      }

      // Only set error if all requests failed
      const allFailed = [dashboardResult, salesResult, inventoryResult, customersResult].every(
        (result) => result.status === "rejected"
      );

      if (allFailed) {
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error fetching retail data:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Sales trend chart data (Recharts format)
  const salesChartData = [
    { name: "Mon", revenue: 120000 },
    { name: "Tue", revenue: 150000 },
    { name: "Wed", revenue: 180000 },
    { name: "Thu", revenue: 140000 },
    { name: "Fri", revenue: 160000 },
    { name: "Sat", revenue: 200000 },
    { name: "Sun", revenue: 220000 },
  ];

  // Top products chart (Recharts format)
  const topProductsData = salesData?.topProducts
    ? salesData.topProducts.map((p) => ({
        name: p.name,
        sales: p.sales,
      }))
    : [];

  // Inventory status pie chart (Recharts format)
  const inventoryStatusData = inventoryData
    ? [
        { name: "In Stock", value: inventoryData.inStock },
        { name: "Low Stock", value: inventoryData.lowStock },
        { name: "Out of Stock", value: inventoryData.outOfStock },
      ]
    : [];

  const COLORS = ["#06a77d", "#f59e0b", "#d62828"];

  if (loading && !dashboardData) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={`Error loading retail data: ${error}`}
        type="error"
        showIcon
        style={{ margin: 16 }}
      />
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={2} style={{ marginBottom: 24, fontWeight: 700, color: "#3b82f6" }}>
        🛒 MIA Retail Dashboard
      </Typography.Title>

      <Row gutter={[16, 16]}>
        {/* Today's Revenue */}
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              color: "white",
            }}
          >
            <Typography.Text
              style={{
                display: "block",
                marginBottom: 8,
                opacity: 0.9,
                color: "white",
              }}
            >
              Today's Revenue
            </Typography.Text>
            <Typography.Title level={3} style={{ fontWeight: 700, color: "white", margin: 0 }}>
              {formatVND(dashboardData?.today?.revenue || 0)}
            </Typography.Title>
            <Typography.Text
              style={{
                display: "block",
                marginTop: 8,
                opacity: 0.8,
                color: "white",
              }}
            >
              {dashboardData?.today?.orders || 0} orders
            </Typography.Text>
          </Card>
        </Col>

        {/* Total Customers */}
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #f77f00 0%, #fcbf49 100%)",
              color: "white",
            }}
          >
            <Typography.Text
              style={{
                display: "block",
                marginBottom: 8,
                opacity: 0.9,
                color: "white",
              }}
            >
              Active Customers
            </Typography.Text>
            <Typography.Title level={3} style={{ fontWeight: 700, color: "white", margin: 0 }}>
              {customerData?.activeCustomers?.toLocaleString() || 0}
            </Typography.Title>
            <Typography.Text
              style={{
                display: "block",
                marginTop: 8,
                opacity: 0.8,
                color: "white",
              }}
            >
              {customerData?.newCustomers || 0} new this month
            </Typography.Text>
          </Card>
        </Col>

        {/* Inventory Status */}
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #06a77d 0%, #3b82f6 100%)",
              color: "white",
            }}
          >
            <Typography.Text
              style={{
                display: "block",
                marginBottom: 8,
                opacity: 0.9,
                color: "white",
              }}
            >
              Inventory
            </Typography.Text>
            <Typography.Title level={3} style={{ fontWeight: 700, color: "white", margin: 0 }}>
              {inventoryData?.inStock || 0} / {inventoryData?.totalProducts || 0}
            </Typography.Title>
            <Typography.Text
              style={{
                display: "block",
                marginTop: 8,
                opacity: 0.8,
                color: "white",
              }}
            >
              {inventoryData?.lowStock || 0} low stock items
            </Typography.Text>
          </Card>
        </Col>

        {/* Conversion Rate */}
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "white",
            }}
          >
            <Typography.Text
              style={{
                display: "block",
                marginBottom: 8,
                opacity: 0.9,
                color: "white",
              }}
            >
              Conversion Rate
            </Typography.Text>
            <Typography.Title level={3} style={{ fontWeight: 700, color: "white", margin: 0 }}>
              {salesData?.conversionRate?.toFixed(1) || 0}%
            </Typography.Title>
            <Typography.Text
              style={{
                display: "block",
                marginTop: 8,
                opacity: 0.8,
                color: "white",
              }}
            >
              AOV: {salesData?.averageOrderValue?.toLocaleString("vi-VN") || 0}₫
            </Typography.Text>
          </Card>
        </Col>

        {/* Sales Trend Chart */}
        <Col xs={24} md={16}>
          <Card>
            <Typography.Title level={4} style={{ marginBottom: 16 }}>
              📈 Sales Trend (Last 7 Days)
            </Typography.Title>
            {salesChartData && salesChartData.length > 0 ? (
              <div style={{ width: "100%", minWidth: 0, height: 300, minHeight: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => value.toLocaleString("vi-VN") + "₫"} />
                    <Tooltip
                      formatter={(value) => [value.toLocaleString("vi-VN") + "₫", "Revenue"]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Revenue (VND)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div
                style={{
                  height: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography.Text type="secondary">Không có dữ liệu để hiển thị</Typography.Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Inventory Status Pie */}
        <Col xs={24} md={8}>
          <Card>
            <Typography.Title level={4} style={{ marginBottom: 16 }}>
              📦 Inventory Status
            </Typography.Title>
            {inventoryStatusData && inventoryStatusData.length > 0 ? (
              <div style={{ width: "100%", minWidth: 0, height: 300, minHeight: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {inventoryStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div
                style={{
                  height: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography.Text type="secondary">Không có dữ liệu để hiển thị</Typography.Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Top Products */}
        <Col xs={24} md={12}>
          <Card>
            <Typography.Title level={4} style={{ marginBottom: 16 }}>
              🏆 Top Selling Products
            </Typography.Title>
            {topProductsData && topProductsData.length > 0 ? (
              <div style={{ width: "100%", minWidth: 0, height: 300, minHeight: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => value.toLocaleString("vi-VN") + "₫"} />
                    <Tooltip
                      formatter={(value) => [value.toLocaleString("vi-VN") + "₫", "Sales"]}
                    />
                    <Bar dataKey="sales" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div
                style={{
                  height: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography.Text type="secondary">Không có dữ liệu để hiển thị</Typography.Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Customer Metrics */}
        <Col xs={24} md={12}>
          <Card>
            <Typography.Title level={4} style={{ marginBottom: 16 }}>
              👥 Customer Metrics
            </Typography.Title>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography.Text>Total Customers</Typography.Text>
                <Tag color="blue">{customerData?.totalCustomers?.toLocaleString() || 0}</Tag>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography.Text>Retention Rate</Typography.Text>
                <Tag color="green">{`${customerData?.retentionRate?.toFixed(1) || 0}%`}</Tag>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography.Text>Customer Lifetime Value</Typography.Text>
                <Tag color="cyan">
                  {`${customerData?.customerLifetimeValue?.toLocaleString("vi-VN") || 0}₫`}
                </Tag>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography.Text>Average Order Frequency</Typography.Text>
                <Tag color="orange">
                  {`${customerData?.averageOrderFrequency?.toFixed(1) || 0}x`}
                </Tag>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MIARetailDashboard;
