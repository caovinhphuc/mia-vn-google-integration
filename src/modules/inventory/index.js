import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  Target,
  Clock,
  DollarSign,
  Search,
  Download,
  RefreshCw,
  Settings,
  Plus,
  Edit,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Star,
  Award,
  Activity,
  Bell,
  Moon,
  Sun,
  X,
  Scan,
} from 'lucide-react';
import { useTheme } from '../../App';
import logger from "../../utils/logger";

// ==================== IMPORTS ====================

// ==================== MOCK DATA ====================
const generateInventoryData = () => ({
  summary: {
    totalSKUs: 1247,
    totalValue: 847000000, // VND
    lowStockItems: 23,
    outOfStockItems: 5,
    overstockItems: 12,
    stockTurnover: 8.7,
    avgDaysToStockout: 12,
    forecastAccuracy: 94.2,
  },

  products: [
    {
      sku: 'VALI-LAR-28',
      name: 'Vali Larita 28" Premium',
      category: 'Luggage',
      location: 'A-12',
      currentStock: 8,
      minStock: 15,
      maxStock: 50,
      reorderPoint: 20,
      leadTime: 7, // days
      avgDailySales: 2.3,
      unitCost: 890000,
      sellingPrice: 1250000,
      supplier: 'Larita Corp',
      lastRestocked: '2025-05-25',
      stockStatus: 'low',
      daysToStockout: 3,
      turnoverRate: 12.4,
      abc: 'A',
      seasonality: 'high',
      trend: 'up',
    },
    {
      sku: 'TAG-TS-001',
      name: 'Travel Star Luggage Tag Set',
      category: 'Accessories',
      location: 'B-08',
      currentStock: 145,
      minStock: 50,
      maxStock: 200,
      reorderPoint: 75,
      leadTime: 3,
      avgDailySales: 5.6,
      unitCost: 35000,
      sellingPrice: 89000,
      supplier: 'Travel Star Ltd',
      lastRestocked: '2025-05-30',
      stockStatus: 'optimal',
      daysToStockout: 26,
      turnoverRate: 24.1,
      abc: 'B',
      seasonality: 'stable',
      trend: 'stable',
    },
    {
      sku: 'VALI-PIS-24',
      name: 'Vali Pisani 24" Business',
      category: 'Luggage',
      location: 'A-08',
      currentStock: 0,
      minStock: 20,
      maxStock: 60,
      reorderPoint: 30,
      leadTime: 10,
      avgDailySales: 1.8,
      unitCost: 1200000,
      sellingPrice: 1680000,
      supplier: 'Pisani International',
      lastRestocked: '2025-05-18',
      stockStatus: 'out',
      daysToStockout: 0,
      turnoverRate: 8.9,
      abc: 'A',
      seasonality: 'medium',
      trend: 'down',
    },
    {
      sku: 'NECK-PIL-001',
      name: 'Memory Foam Neck Pillow',
      category: 'Comfort',
      location: 'B-15',
      currentStock: 234,
      minStock: 30,
      maxStock: 100,
      reorderPoint: 45,
      leadTime: 5,
      avgDailySales: 1.2,
      unitCost: 89000,
      sellingPrice: 199000,
      supplier: 'Comfort Zone',
      lastRestocked: '2025-05-28',
      stockStatus: 'overstock',
      daysToStockout: 195,
      turnoverRate: 4.2,
      abc: 'C',
      seasonality: 'low',
      trend: 'stable',
    },
    {
      sku: 'LOCK-TSA-001',
      name: 'TSA Approved Combination Lock',
      category: 'Security',
      location: 'B-12',
      currentStock: 67,
      minStock: 40,
      maxStock: 150,
      reorderPoint: 60,
      leadTime: 4,
      avgDailySales: 3.4,
      unitCost: 45000,
      sellingPrice: 129000,
      supplier: 'SecureTravel Inc',
      lastRestocked: '2025-05-29',
      stockStatus: 'optimal',
      daysToStockout: 20,
      turnoverRate: 18.7,
      abc: 'B',
      seasonality: 'stable',
      trend: 'up',
    },
  ],

  forecasting: {
    nextWeek: [
      {
        sku: 'VALI-LAR-28',
        predicted: 16,
        confidence: 92,
        trend: 'increasing',
      },
      { sku: 'TAG-TS-001', predicted: 39, confidence: 89, trend: 'stable' },
      {
        sku: 'VALI-PIS-24',
        predicted: 13,
        confidence: 85,
        trend: 'decreasing',
      },
      { sku: 'NECK-PIL-001', predicted: 8, confidence: 94, trend: 'stable' },
      {
        sku: 'LOCK-TSA-001',
        predicted: 24,
        confidence: 91,
        trend: 'increasing',
      },
    ],
    insights: [
      'Holiday season approaching: Luggage demand +35% expected',
      'Business travel recovery: Premium items trending up 15%',
      'Competitor pricing pressure on accessories category',
      'Supply chain delay risk: Asian suppliers 3-5 days extra lead time',
    ],
  },

  movements: [
    {
      id: 'IN001',
      type: 'in',
      sku: 'TAG-TS-001',
      qty: 100,
      timestamp: '2025-06-01 14:20',
      reason: 'Restock',
      user: 'Nguyễn Văn A',
    },
    {
      id: 'OUT001',
      type: 'out',
      sku: 'VALI-LAR-28',
      qty: 2,
      timestamp: '2025-06-01 14:15',
      reason: 'Sale',
      user: 'System',
    },
    {
      id: 'ADJ001',
      type: 'adjustment',
      sku: 'LOCK-TSA-001',
      qty: -1,
      timestamp: '2025-06-01 13:45',
      reason: 'Damage',
      user: 'Trần Thị B',
    },
    {
      id: 'OUT002',
      type: 'out',
      sku: 'NECK-PIL-001',
      qty: 1,
      timestamp: '2025-06-01 13:30',
      reason: 'Sale',
      user: 'System',
    },
    {
      id: 'IN002',
      type: 'in',
      sku: 'VALI-LAR-28',
      qty: 5,
      timestamp: '2025-06-01 12:00',
      reason: 'Return',
      user: 'Lê Văn C',
    },
  ],

  alerts: [
    {
      type: 'critical',
      message: 'VALI-PIS-24 out of stock - 3 đơn hàng pending',
      action: 'Emergency reorder',
    },
    {
      type: 'warning',
      message: 'VALI-LAR-28 sẽ hết stock trong 3 ngày',
      action: 'Schedule reorder',
    },
    {
      type: 'info',
      message: 'NECK-PIL-001 overstock - consider promotion',
      action: 'Review pricing',
    },
    {
      type: 'opportunity',
      message: 'TSA locks trending up +25% - increase order',
      action: 'Boost inventory',
    },
  ],
});

const CATEGORIES = ['All', 'Luggage', 'Accessories', 'Comfort', 'Security'];
const ABC_CLASSES = ['All', 'A', 'B', 'C'];
const STOCK_STATUSES = ['All', 'optimal', 'low', 'out', 'overstock'];

// ==================== MAIN COMPONENT ====================
const InventoryManagement = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [data, setData] = useState(generateInventoryData());
  const [activeView, setActiveView] = useState('overview');
  const [filters, setFilters] = useState({
    category: 'All',
    stockStatus: 'All',
    abcClass: 'All',
    search: '',
  });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        summary: {
          ...prev.summary,
          totalValue:
            prev.summary.totalValue + Math.random() * 1000000 - 500000,
        },
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return data.products.filter((product) => {
      if (filters.category !== 'All' && product.category !== filters.category)
        return false;
      if (
        filters.stockStatus !== 'All' &&
        product.stockStatus !== filters.stockStatus
      )
        return false;
      if (filters.abcClass !== 'All' && product.abc !== filters.abcClass)
        return false;
      if (
        filters.search &&
        !product.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !product.sku.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [data.products, filters]);

  const views = [
    { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
    { id: 'products', label: 'Sản phẩm', icon: Package },
    { id: 'forecasting', label: 'Dự báo', icon: TrendingUp },
    { id: 'movements', label: 'Xuất nhập', icon: Activity },
    { id: 'alerts', label: 'Cảnh báo', icon: AlertTriangle },
  ];

  const themeClasses = {
    background: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    surface: isDarkMode ? 'bg-gray-800' : 'bg-white',
    text: {
      primary: isDarkMode ? 'text-white' : 'text-gray-900',
      secondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      muted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    },
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  };

  const handleBulkAction = (action) => {
    logger.info(`Performing ${action} on ${selectedProducts.length} products`);
    setSelectedProducts([]);
    setShowBulkActions(false);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${themeClasses.background} ${themeClasses.text.primary}`}
    >
      {/* Header */}
      <div
        className={`${themeClasses.surface} border-b ${themeClasses.border} p-6`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl">
              <Package size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Smart Inventory Management</h1>
              <p className={`${themeClasses.text.muted}`}>
                Quản lý tồn kho thông minh • 01/06/2025 14:45 •{' '}
                {data.summary.totalSKUs} SKUs
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick actions */}
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Scan size={16} />
              <span>Scan Item</span>
            </button>

            <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <Plus size={16} />
              <span>Add Stock</span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${themeClasses.surface} border ${themeClasses.border} hover:opacity-80 transition-colors`}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              className={`p-2 rounded-lg ${themeClasses.surface} border ${themeClasses.border} hover:opacity-80 transition-colors`}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-2 mt-6 overflow-x-auto">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${activeView === view.id
                  ? 'bg-green-600 text-white'
                  : `${themeClasses.surface} ${themeClasses.text.secondary} hover:${themeClasses.text.primary}`
                }`}
            >
              <view.icon size={16} />
              <span>{view.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeView === 'overview' && (
          <OverviewView data={data} themeClasses={themeClasses} />
        )}
        {activeView === 'products' && (
          <ProductsView
            products={filteredProducts}
            filters={filters}
            setFilters={setFilters}
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            showBulkActions={showBulkActions}
            setShowBulkActions={setShowBulkActions}
            onBulkAction={handleBulkAction}
            themeClasses={themeClasses}
          />
        )}
        {activeView === 'forecasting' && (
          <ForecastingView
            data={data.forecasting}
            themeClasses={themeClasses}
          />
        )}
        {activeView === 'movements' && (
          <MovementsView
            movements={data.movements}
            themeClasses={themeClasses}
          />
        )}
        {activeView === 'alerts' && (
          <AlertsView alerts={data.alerts} themeClasses={themeClasses} />
        )}
      </div>
    </div>
  );
};

// ==================== OVERVIEW VIEW ====================
const OverviewView = ({ data, themeClasses }) => {
  const kpiCards = [
    {
      label: 'Tổng SKUs',
      value: data.summary.totalSKUs,
      change: '+2.1%',
      icon: Package,
      color: 'blue',
    },
    {
      label: 'Giá trị tồn kho',
      value: `${Math.round(data.summary.totalValue / 1000000)}M VND`,
      change: '+5.7%',
      icon: DollarSign,
      color: 'green',
    },
    {
      label: 'Stock turnover',
      value: `${data.summary.stockTurnover}x`,
      change: '+12.3%',
      icon: TrendingUp,
      color: 'purple',
    },
    {
      label: 'Forecast accuracy',
      value: `${data.summary.forecastAccuracy}%`,
      change: '+3.8%',
      icon: Target,
      color: 'orange',
    },
  ];

  const stockStatusData = [
    {
      status: 'Optimal',
      count:
        data.summary.totalSKUs -
        data.summary.lowStockItems -
        data.summary.outOfStockItems -
        data.summary.overstockItems,
      color: 'bg-green-500',
    },
    {
      status: 'Low Stock',
      count: data.summary.lowStockItems,
      color: 'bg-yellow-500',
    },
    {
      status: 'Out of Stock',
      count: data.summary.outOfStockItems,
      color: 'bg-red-500',
    },
    {
      status: 'Overstock',
      count: data.summary.overstockItems,
      color: 'bg-blue-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <div
            key={index}
            className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-4 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-sm ${themeClasses.text.muted} mb-1`}>
                  {kpi.label}
                </p>
                <p className="text-2xl font-bold mb-2">{kpi.value}</p>
                <div className="flex items-center space-x-1">
                  <ArrowUp size={14} className="text-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    {kpi.change}
                  </span>
                </div>
              </div>
              <div
                className={`p-3 rounded-lg bg-${kpi.color}-100 dark:bg-${kpi.color}-900/30`}
              >
                <kpi.icon size={20} className={`text-${kpi.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stock Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
        >
          <h3 className="text-lg font-semibold mb-4">
            Stock Status Distribution
          </h3>
          <div className="space-y-4">
            {stockStatusData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${item.color}`}></div>
                  <span className="font-medium">{item.status}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">{item.count}</span>
                  <span className="text-sm text-gray-500 ml-1">
                    ({Math.round((item.count / data.summary.totalSKUs) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Visual bar chart */}
          <div className="mt-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
            {stockStatusData.map((item, index) => {
              const percentage = (item.count / data.summary.totalSKUs) * 100;
              return (
                <div
                  key={index}
                  className={item.color}
                  style={{ width: `${percentage}%` }}
                ></div>
              );
            })}
          </div>
        </div>

        <div
          className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
        >
          <h3 className="text-lg font-semibold mb-4">
            Critical Actions Required
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="text-red-600" size={16} />
                <span className="font-medium text-red-700 dark:text-red-400">
                  {data.summary.outOfStockItems} sản phẩm hết hàng
                </span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                Cần reorder ngay lập tức để tránh mất sales
              </p>
            </div>

            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="text-yellow-600" size={16} />
                <span className="font-medium text-yellow-700 dark:text-yellow-400">
                  {data.summary.lowStockItems} sản phẩm sắp hết
                </span>
              </div>
              <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                Trung bình {data.summary.avgDaysToStockout} ngày để hết stock
              </p>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingDown className="text-blue-600" size={16} />
                <span className="font-medium text-blue-700 dark:text-blue-400">
                  {data.summary.overstockItems} sản phẩm tồn kho cao
                </span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                Consider promotion để tăng turnover
              </p>
            </div>
          </div>

          <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            View Action Plan
          </button>
        </div>
      </div>

      {/* ABC Analysis */}
      <div
        className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
      >
        <h3 className="text-lg font-semibold mb-4">
          ABC Analysis & Category Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <Award className="mx-auto mb-2 text-yellow-600" size={24} />
            <p className="text-2xl font-bold text-yellow-600">Class A</p>
            <p className="text-sm text-gray-600">
              High value • 20% items • 80% revenue
            </p>
            <p className="text-xs text-gray-500 mt-1">
              156 SKUs • 94.2% in stock
            </p>
          </div>

          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Star className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="text-2xl font-bold text-blue-600">Class B</p>
            <p className="text-sm text-gray-600">
              Medium value • 30% items • 15% revenue
            </p>
            <p className="text-xs text-gray-500 mt-1">
              374 SKUs • 96.8% in stock
            </p>
          </div>

          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Package className="mx-auto mb-2 text-gray-600" size={24} />
            <p className="text-2xl font-bold text-gray-600">Class C</p>
            <p className="text-sm text-gray-600">
              Low value • 50% items • 5% revenue
            </p>
            <p className="text-xs text-gray-500 mt-1">
              717 SKUs • 91.3% in stock
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== PRODUCTS VIEW ====================
const ProductsView = ({
  products,
  filters,
  setFilters,
  selectedProducts,
  setSelectedProducts,
  showBulkActions,
  setShowBulkActions,
  onBulkAction,
  themeClasses,
}) => {
  const handleSelectProduct = (sku) => {
    setSelectedProducts((prev) =>
      prev.includes(sku) ? prev.filter((s) => s !== sku) : [...prev, sku]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.sku));
    }
  };

  useEffect(() => {
    setShowBulkActions(selectedProducts.length > 0);
  }, [selectedProducts, setShowBulkActions]);

  const getStatusBadge = (status) => {
    const badges = {
      optimal: 'bg-green-100 text-green-700 border-green-200',
      low: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      out: 'bg-red-100 text-red-700 border-red-200',
      overstock: 'bg-blue-100 text-blue-700 border-blue-200',
    };

    const labels = {
      optimal: 'Tối ưu',
      low: 'Sắp hết',
      out: 'Hết hàng',
      overstock: 'Dư thừa',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${badges[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div
        className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-4`}
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm SKU hoặc tên sản phẩm..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 w-64"
            />
          </div>

          <select
            value={filters.category}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, category: e.target.value }))
            }
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={filters.stockStatus}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, stockStatus: e.target.value }))
            }
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {STOCK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status === 'All' ? 'Tất cả trạng thái' : status}
              </option>
            ))}
          </select>

          <select
            value={filters.abcClass}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, abcClass: e.target.value }))
            }
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {ABC_CLASSES.map((cls) => (
              <option key={cls} value={cls}>
                {cls === 'All' ? 'Tất cả ABC' : `Class ${cls}`}
              </option>
            ))}
          </select>

          <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && (
        <div
          className={`${themeClasses.surface} rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {selectedProducts.length} sản phẩm được chọn
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => onBulkAction('reorder')}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
              >
                Bulk Reorder
              </button>
              <button
                onClick={() => onBulkAction('adjust')}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Adjust Stock
              </button>
              <button
                onClick={() => onBulkAction('export')}
                className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
              >
                Export Selected
              </button>
              <button
                onClick={() => setSelectedProducts([])}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products table */}
      <div
        className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} overflow-hidden`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tồn kho
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turnover
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá trị
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {products.map((product) => (
                <ProductRow
                  key={product.sku}
                  product={product}
                  isSelected={selectedProducts.includes(product.sku)}
                  onSelect={() => handleSelectProduct(product.sku)}
                  getStatusBadge={getStatusBadge}
                  themeClasses={themeClasses}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==================== PRODUCT ROW ====================
const ProductRow = ({
  product,
  isSelected,
  onSelect,
  getStatusBadge,
  themeClasses,
}) => {
  const stockPercentage = (product.currentStock / product.maxStock) * 100;

  return (
    <tr
      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
        }`}
    >
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="rounded"
        />
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-2 h-8 rounded ${product.abc === 'A'
                ? 'bg-yellow-500'
                : product.abc === 'B'
                  ? 'bg-blue-500'
                  : 'bg-gray-500'
              }`}
          ></div>
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-gray-500">
              {product.sku} • {product.category}
            </p>
            <p className="text-xs text-gray-400">
              {product.location} • Class {product.abc}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium">{product.currentStock}</span>
            <span className="text-gray-500">/ {product.maxStock}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${stockPercentage < 30
                  ? 'bg-red-500'
                  : stockPercentage < 60
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
              style={{ width: `${Math.min(stockPercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">
            Min: {product.minStock} • Reorder: {product.reorderPoint}
          </p>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="space-y-2">
          {getStatusBadge(product.stockStatus)}
          {product.daysToStockout <= 7 && product.stockStatus !== 'out' && (
            <p className="text-xs text-red-600">
              {product.daysToStockout} ngày để hết
            </p>
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <span className="font-medium">{product.turnoverRate}x</span>
          {product.trend === 'up' ? (
            <TrendingUp size={14} className="text-green-500" />
          ) : product.trend === 'down' ? (
            <TrendingDown size={14} className="text-red-500" />
          ) : (
            <Minus size={14} className="text-gray-500" />
          )}
        </div>
        <p className="text-xs text-gray-500">{product.avgDailySales}/day</p>
      </td>

      <td className="px-6 py-4">
        <div>
          <p className="font-medium">
            {Math.round((product.currentStock * product.unitCost) / 1000)}K
          </p>
          <p className="text-xs text-gray-500">
            Cost: {Math.round(product.unitCost / 1000)}K
          </p>
          <p className="text-xs text-green-600">
            Margin:{' '}
            {Math.round(
              ((product.sellingPrice - product.unitCost) /
                product.sellingPrice) *
              100
            )}
            %
          </p>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex space-x-2">
          <button className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors">
            <Eye size={14} />
          </button>
          <button className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors">
            <Edit size={14} />
          </button>
          <button className="p-1 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};

// ==================== FORECASTING VIEW ====================
const ForecastingView = ({ data, themeClasses }) => {
  return (
    <div className="space-y-6">
      {/* Forecast table */}
      <div
        className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
      >
        <h3 className="text-lg font-semibold mb-4">Dự báo tuần tới</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4">SKU</th>
                <th className="text-left py-3 px-4">Predicted Sales</th>
                <th className="text-left py-3 px-4">Confidence</th>
                <th className="text-left py-3 px-4">Trend</th>
                <th className="text-left py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.nextWeek.map((forecast, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="py-3 px-4 font-medium">{forecast.sku}</td>
                  <td className="py-3 px-4">{forecast.predicted} units</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span>{forecast.confidence}%</span>
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${forecast.confidence >= 90
                              ? 'bg-green-500'
                              : forecast.confidence >= 80
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                          style={{ width: `${forecast.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${forecast.trend === 'increasing'
                          ? 'bg-green-100 text-green-700'
                          : forecast.trend === 'decreasing'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                      {forecast.trend}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div
        className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
      >
        <h3 className="text-lg font-semibold mb-4">
          AI Insights & Market Intelligence
        </h3>
        <div className="space-y-3">
          {data.insights.map((insight, index) => (
            <div
              key={index}
              className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {insight}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== MOVEMENTS VIEW ====================
const MovementsView = ({ movements, themeClasses }) => {
  const getMovementIcon = (type) => {
    switch (type) {
      case 'in':
        return <ArrowDown className="text-green-600" size={16} />;
      case 'out':
        return <ArrowUp className="text-red-600" size={16} />;
      case 'adjustment':
        return <Edit className="text-blue-600" size={16} />;
      default:
        return <Activity className="text-gray-600" size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div
        className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Stock Movements</h3>
          <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            <Plus size={16} />
            <span>New Movement</span>
          </button>
        </div>

        <div className="space-y-3">
          {movements.map((movement) => (
            <div
              key={movement.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-white dark:bg-gray-600 rounded-lg">
                  {getMovementIcon(movement.type)}
                </div>
                <div>
                  <p className="font-medium">{movement.sku}</p>
                  <p className="text-sm text-gray-500">
                    {movement.type === 'in'
                      ? '+'
                      : movement.type === 'out'
                        ? '-'
                        : '±'}
                    {Math.abs(movement.qty)} • {movement.reason}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{movement.user}</p>
                <p className="text-xs text-gray-500">{movement.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== ALERTS VIEW ====================
const AlertsView = ({ alerts, themeClasses }) => {
  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="text-red-600" size={20} />;
      case 'warning':
        return <Clock className="text-yellow-600" size={20} />;
      case 'info':
        return <Package className="text-blue-600" size={20} />;
      case 'opportunity':
        return <TrendingUp className="text-green-600" size={20} />;
      default:
        return <Bell className="text-gray-600" size={20} />;
    }
  };

  const getAlertBg = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'opportunity':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`${themeClasses.surface
            } rounded-xl border p-6 ${getAlertBg(alert.type)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <p className="font-medium mb-2">{alert.message}</p>
                <button className="text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  {alert.action}
                </button>
              </div>
            </div>
            <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryManagement;
