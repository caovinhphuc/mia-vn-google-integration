import {
  BarChart3,
  Check,
  ChevronRight,
  Clock,
  Gauge,
  Lightbulb,
  Map,
  MapPin,
  Navigation,
  Package,
  Pause,
  Play,
  RotateCcw,
  Target,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// ==================== MOCK DATA ====================
const WAREHOUSE_ZONES = {
  A: { name: 'Fast Moving Items', color: 'bg-blue-500', positions: 12 },
  B: { name: 'Accessories & Add-ons', color: 'bg-green-500', positions: 8 },
  C: { name: 'Seasonal Items', color: 'bg-purple-500', positions: 6 },
  D: { name: 'Premium Collection', color: 'bg-yellow-500', positions: 4 },
};

const generatePickingRoutes = () => [
  {
    id: 'RT001',
    picker: 'Nguyễn Văn A',
    staffId: 'NV001',
    status: 'active',
    priority: 'high',
    startTime: new Date(Date.now() - 25 * 60 * 1000),
    estimatedCompletion: new Date(Date.now() + 15 * 60 * 1000),
    progress: 68,
    currentLocation: 'A-08',
    nextLocation: 'A-12',
    totalItems: 24,
    completedItems: 16,
    totalDistance: 280, // meters
    currentDistance: 190,
    efficiency: 94,
    orders: [
      {
        id: 'MIA001234',
        items: ['Vali Larita 28"', 'Luggage Tag'],
        positions: ['A-08', 'B-03'],
        priority: 'P1',
      },
      {
        id: 'MIA001235',
        items: ['Vali Cover'],
        positions: ['B-05'],
        priority: 'P2',
      },
      {
        id: 'MIA001236',
        items: ['Travel Pillow', 'TSA Lock'],
        positions: ['B-09', 'B-12'],
        priority: 'P3',
      },
    ],
    optimizedPath: [
      {
        zone: 'A',
        position: '08',
        item: 'Vali Larita 28"',
        status: 'completed',
        time: 2.5,
      },
      {
        zone: 'A',
        position: '12',
        item: 'Vali Pisani 24"',
        status: 'current',
        time: 3.1,
      },
      {
        zone: 'B',
        position: '03',
        item: 'Luggage Tag',
        status: 'pending',
        time: 1.8,
      },
      {
        zone: 'B',
        position: '05',
        item: 'Vali Cover',
        status: 'pending',
        time: 2.2,
      },
      {
        zone: 'B',
        position: '09',
        item: 'Travel Pillow',
        status: 'pending',
        time: 1.9,
      },
    ],
    suggestions: [
      'Gom 3 đơn cùng zone B để tối ưu di chuyển',
      'Lấy items nhỏ trước để dễ xếp vào cart',
      'Route hiện tại đã tối ưu 85% so với random path',
    ],
  },
  {
    id: 'RT002',
    picker: 'Trần Thị B',
    staffId: 'NV002',
    status: 'planning',
    priority: 'medium',
    startTime: null,
    estimatedCompletion: new Date(Date.now() + 35 * 60 * 1000),
    progress: 0,
    currentLocation: 'Start',
    nextLocation: 'D-01',
    totalItems: 18,
    completedItems: 0,
    totalDistance: 220,
    currentDistance: 0,
    efficiency: 0,
    orders: [
      {
        id: 'MIA001237',
        items: ['Premium Luggage Set'],
        positions: ['D-01'],
        priority: 'P1',
      },
      {
        id: 'MIA001238',
        items: ['Business Tag', 'Travel Kit'],
        positions: ['D-03', 'B-15'],
        priority: 'P2',
      },
    ],
    optimizedPath: [
      {
        zone: 'D',
        position: '01',
        item: 'Premium Luggage Set',
        status: 'pending',
        time: 4.2,
      },
      {
        zone: 'D',
        position: '03',
        item: 'Business Tag',
        status: 'pending',
        time: 2.1,
      },
      {
        zone: 'B',
        position: '15',
        item: 'Travel Kit',
        status: 'pending',
        time: 2.8,
      },
    ],
    suggestions: [
      'Bắt đầu từ zone D (cao cấp) để tránh damage',
      'Route này có thể gom với RT003 để tối ưu',
      'Ưu tiên đơn P1 trước khi xuống zone B',
    ],
  },
  {
    id: 'RT003',
    picker: 'Lê Văn C',
    staffId: 'NV003',
    status: 'completed',
    priority: 'low',
    startTime: new Date(Date.now() - 45 * 60 * 1000),
    estimatedCompletion: new Date(Date.now() - 5 * 60 * 1000),
    progress: 100,
    currentLocation: 'Packing',
    nextLocation: null,
    totalItems: 31,
    completedItems: 31,
    totalDistance: 340,
    currentDistance: 340,
    efficiency: 91,
    orders: [
      {
        id: 'MIA001239',
        items: ['Vali Set 3 pieces'],
        positions: ['A-15', 'A-17', 'A-19'],
        priority: 'P3',
      },
      {
        id: 'MIA001240',
        items: ['Multiple accessories'],
        positions: ['B-01', 'B-07', 'B-11'],
        priority: 'P4',
      },
    ],
    optimizedPath: [
      {
        zone: 'A',
        position: '15',
        item: 'Vali Large',
        status: 'completed',
        time: 3.8,
      },
      {
        zone: 'A',
        position: '17',
        item: 'Vali Medium',
        status: 'completed',
        time: 3.2,
      },
      {
        zone: 'A',
        position: '19',
        item: 'Vali Small',
        status: 'completed',
        time: 2.9,
      },
      {
        zone: 'B',
        position: '01',
        item: 'Accessory 1',
        status: 'completed',
        time: 1.5,
      },
      {
        zone: 'B',
        position: '07',
        item: 'Accessory 2',
        status: 'completed',
        time: 1.8,
      },
      {
        zone: 'B',
        position: '11',
        item: 'Accessory 3',
        status: 'completed',
        time: 2.1,
      },
    ],
    suggestions: [],
  },
];

const PERFORMANCE_METRICS = {
  overall: {
    averagePickTime: 3.2,
    routeOptimization: 87,
    errorRate: 1.4,
    efficiency: 89,
    dailyPicks: 2156,
    completionRate: 94.2,
  },
  byStaff: {
    NV001: { picks: 45, time: 2.8, accuracy: 98.5, efficiency: 94 },
    NV002: { picks: 38, time: 3.1, accuracy: 97.2, efficiency: 91 },
    NV003: { picks: 42, time: 3.0, accuracy: 96.8, efficiency: 89 },
  },
  byZone: {
    A: { utilization: 95, avgTime: 2.5, accuracy: 98 },
    B: { utilization: 78, avgTime: 2.8, accuracy: 97 },
    C: { utilization: 65, avgTime: 3.2, accuracy: 95 },
    D: { utilization: 85, avgTime: 4.1, accuracy: 99 },
  },
};

// ==================== MAIN COMPONENT ====================
const SmartPickingSystem = () => {
  const [routes, setRoutes] = useState(generatePickingRoutes());
  const [selectedRoute, setSelectedRoute] = useState(routes[0]);
  const [viewMode, setViewMode] = useState('routes'); // routes, map, analytics
  const [isRealTime, setIsRealTime] = useState(true);
  const [showOptimizationPanel, setShowOptimizationPanel] = useState(true);

  // Real-time updates
  useEffect(() => {
    if (!isRealTime) return;

    const interval = setInterval(() => {
      setRoutes((prev) =>
        prev.map((route) => {
          if (route.status === 'active') {
            const newProgress = Math.min(route.progress + Math.random() * 3, 100);
            const newCompletedItems = Math.floor((newProgress / 100) * route.totalItems);
            const newCurrentDistance = Math.floor((newProgress / 100) * route.totalDistance);

            return {
              ...route,
              progress: newProgress,
              completedItems: newCompletedItems,
              currentDistance: newCurrentDistance,
              efficiency: 85 + Math.random() * 15,
              status: newProgress >= 100 ? 'completed' : 'active',
            };
          }
          return route;
        }),
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isRealTime]);

  const handleRouteAction = (routeId, action) => {
    setRoutes((prev) =>
      prev.map((route) => {
        if (route.id === routeId) {
          switch (action) {
            case 'start':
              return { ...route, status: 'active', startTime: new Date() };
            case 'pause':
              return { ...route, status: 'paused' };
            case 'complete':
              return { ...route, status: 'completed', progress: 100 };
            case 'optimize':
              return {
                ...route,
                efficiency: Math.min(route.efficiency + 5, 99),
              };
            default:
              return route;
          }
        }
        return route;
      }),
    );
  };

  const generateOptimizedRoute = () => {
    // Simulated route optimization
    const newRoute = {
      id: 'RT' + String(Date.now()).slice(-3),
      picker: 'Auto-assigned',
      staffId: 'AUTO',
      status: 'planning',
      priority: 'high',
      startTime: null,
      estimatedCompletion: new Date(Date.now() + 20 * 60 * 1000),
      progress: 0,
      currentLocation: 'Start',
      nextLocation: 'A-05',
      totalItems: 15,
      completedItems: 0,
      totalDistance: 180,
      currentDistance: 0,
      efficiency: 95,
      orders: [
        {
          id: 'MIA00' + Math.floor(Math.random() * 9999),
          items: ['Auto-optimized route'],
          positions: ['A-05'],
          priority: 'P1',
        },
      ],
      optimizedPath: [
        {
          zone: 'A',
          position: '05',
          item: 'Optimized Item',
          status: 'pending',
          time: 2.1,
        },
      ],
      suggestions: ['Route được tối ưu tự động dựa trên AI algorithm'],
    };

    setRoutes((prev) => [newRoute, ...prev]);
    setSelectedRoute(newRoute);
  };

  const activeRoutes = routes.filter((r) => r.status === 'active').length;
  const totalPicks = routes.reduce((sum, r) => sum + r.completedItems, 0);
  const avgEfficiency = Math.round(
    routes.reduce((sum, r) => sum + r.efficiency, 0) / routes.length,
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
              <Navigation size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Smart Picking & Route Optimization</h1>
              <p className="text-gray-500">Hệ thống lấy hàng thông minh • 01/06/2025 14:35</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* View mode selector */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[
                { id: 'routes', label: 'Routes', icon: Navigation },
                { id: 'map', label: 'Map', icon: Map },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setViewMode(id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === id
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Real-time toggle */}
            <button
              onClick={() => setIsRealTime(!isRealTime)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isRealTime
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {isRealTime ? <Play size={16} /> : <Pause size={16} />}
              <span className="text-sm font-medium">{isRealTime ? 'Live' : 'Paused'}</span>
            </button>

            {/* Quick actions */}
            <button
              onClick={generateOptimizedRoute}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Zap size={16} />
              <span>Auto Optimize</span>
            </button>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Navigation className="text-blue-600" size={20} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Routes</p>
                <p className="text-xl font-bold">{activeRoutes}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Package className="text-green-600" size={20} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Items Picked</p>
                <p className="text-xl font-bold">{totalPicks}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Gauge className="text-purple-600" size={20} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Efficiency</p>
                <p className="text-xl font-bold">{avgEfficiency}%</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Clock className="text-orange-600" size={20} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Pick Time</p>
                <p className="text-xl font-bold">3.2 min</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {viewMode === 'routes' && (
          <RoutesView
            routes={routes}
            selectedRoute={selectedRoute}
            onSelectRoute={setSelectedRoute}
            onRouteAction={handleRouteAction}
            showOptimizationPanel={showOptimizationPanel}
            setShowOptimizationPanel={setShowOptimizationPanel}
          />
        )}

        {viewMode === 'map' && <WarehouseMapView routes={routes} selectedRoute={selectedRoute} />}

        {viewMode === 'analytics' && (
          <AnalyticsView routes={routes} metrics={PERFORMANCE_METRICS} />
        )}
      </div>
    </div>
  );
};

// ==================== ROUTES VIEW ====================
const RoutesView = ({
  routes,
  selectedRoute,
  onSelectRoute,
  onRouteAction,
  showOptimizationPanel,
  setShowOptimizationPanel,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Routes list */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Active Picking Routes</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            + Create New Route
          </button>
        </div>

        {routes.map((route) => (
          <RouteCard
            key={route.id}
            route={route}
            isSelected={selectedRoute?.id === route.id}
            onSelect={() => onSelectRoute(route)}
            onAction={(action) => onRouteAction(route.id, action)}
          />
        ))}
      </div>

      {/* Route details & optimization */}
      <div className="space-y-6">
        {selectedRoute && (
          <RouteDetails
            route={selectedRoute}
            onAction={(action) => onRouteAction(selectedRoute.id, action)}
          />
        )}

        {showOptimizationPanel && (
          <OptimizationPanel onClose={() => setShowOptimizationPanel(false)} />
        )}
      </div>
    </div>
  );
};

// ==================== ROUTE CARD ====================
const RouteCard = ({ route, isSelected, onSelect, onAction }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'planning':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-blue-500 shadow-lg'
          : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold">{route.id}</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                  route.status,
                )}`}
              >
                {route.status.toUpperCase()}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                  route.priority,
                )}`}
              >
                {route.priority.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{route.picker}</p>
          </div>

          <div className="flex space-x-2">
            {route.status === 'planning' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction('start');
                }}
                className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                title="Start Route"
              >
                <Play size={16} />
              </button>
            )}
            {route.status === 'active' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction('pause');
                }}
                className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                title="Pause Route"
              >
                <Pause size={16} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction('optimize');
              }}
              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title="Optimize Route"
            >
              <Zap size={16} />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>
              Progress: {route.completedItems}/{route.totalItems} items
            </span>
            <span>{Math.round(route.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                route.status === 'completed'
                  ? 'bg-green-500'
                  : route.status === 'active'
                  ? 'bg-blue-500'
                  : 'bg-gray-400'
              }`}
              style={{ width: `${route.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-500">Distance</p>
            <p className="font-medium">
              {route.currentDistance}/{route.totalDistance}m
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Efficiency</p>
            <p className="font-medium">{Math.round(route.efficiency)}%</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">ETA</p>
            <p className="font-medium">
              {route.estimatedCompletion
                ? new Date(route.estimatedCompletion).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'N/A'}
            </p>
          </div>
        </div>

        {/* Current location */}
        {route.status === 'active' && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <MapPin size={16} className="text-blue-600" />
              <span className="text-sm">
                Hiện tại: <strong>{route.currentLocation}</strong> → Tiếp theo:{' '}
                <strong>{route.nextLocation}</strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== ROUTE DETAILS ====================
const RouteDetails = ({ route, onAction }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Route Details: {route.id}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onAction('optimize')}
            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Re-optimize"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Optimized path */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Optimized Picking Path</h4>
        <div className="space-y-2">
          {route.optimizedPath.map((step, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 p-3 rounded-lg border ${
                step.status === 'completed'
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : step.status === 'current'
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                  : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  step.status === 'completed'
                    ? 'bg-green-500'
                    : step.status === 'current'
                    ? 'bg-blue-500'
                    : 'bg-gray-400'
                }`}
              >
                {step.status === 'completed' ? <Check size={12} /> : index + 1}
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">
                    {step.zone}-{step.position}
                  </span>
                  <ChevronRight size={14} className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{step.item}</span>
                </div>
                <p className="text-xs text-gray-500">Estimated time: {step.time} minutes</p>
              </div>

              {step.status === 'current' && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <Navigation size={14} />
                  <span className="text-xs font-medium">Current</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Orders in this route */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Orders ({route.orders.length})</h4>
        <div className="space-y-2">
          {route.orders.map((order, index) => (
            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{order.id}</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    order.priority === 'P1'
                      ? 'bg-red-100 text-red-700'
                      : order.priority === 'P2'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {order.priority}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Items: {order.items.join(', ')}
              </p>
              <p className="text-xs text-gray-500">Positions: {order.positions.join(' → ')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      {route.suggestions && route.suggestions.length > 0 && (
        <div>
          <h4 className="font-medium mb-3 flex items-center space-x-2">
            <Lightbulb size={16} className="text-yellow-500" />
            <span>AI Suggestions</span>
          </h4>
          <div className="space-y-2">
            {route.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
              >
                <p className="text-sm text-yellow-800 dark:text-yellow-200">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== OPTIMIZATION PANEL ====================
const OptimizationPanel = ({ onClose }) => {
  const [optimizationSettings, setOptimizationSettings] = useState({
    prioritizeP1: true,
    minimizeDistance: true,
    balanceWorkload: false,
    considerItemWeight: true,
    batchSimilarItems: true,
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Zap size={18} className="text-yellow-500" />
          <span>Route Optimization</span>
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-3">Optimization Rules</h4>
          <div className="space-y-3">
            {Object.entries(optimizationSettings).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    setOptimizationSettings((prev) => ({
                      ...prev,
                      [key]: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <span className="text-sm">
                  {key === 'prioritizeP1'
                    ? 'Ưu tiên đơn P1 trước'
                    : key === 'minimizeDistance'
                    ? 'Tối thiểu hóa khoảng cách di chuyển'
                    : key === 'balanceWorkload'
                    ? 'Cân bằng khối lượng công việc'
                    : key === 'considerItemWeight'
                    ? 'Xem xét trọng lượng sản phẩm'
                    : 'Gom nhóm sản phẩm tương tự'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium mb-2">Current Performance</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <p className="text-green-700 dark:text-green-400 font-medium">Route Efficiency</p>
              <p className="text-green-800 dark:text-green-300 text-lg font-bold">87%</p>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <p className="text-blue-700 dark:text-blue-400 font-medium">Distance Saved</p>
              <p className="text-blue-800 dark:text-blue-300 text-lg font-bold">34%</p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
            <Target size={16} />
            <span>Apply Optimization</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== WAREHOUSE MAP VIEW ====================
const WarehouseMapView = ({ routes, selectedRoute }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Warehouse Layout & Routes</h2>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">3D View</button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">Heat Map</button>
        </div>
      </div>

      {/* Simulated warehouse map */}
      <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg p-8 min-h-96">
        <div className="grid grid-cols-4 gap-8 h-full">
          {Object.entries(WAREHOUSE_ZONES).map(([zone, info]) => (
            <div key={zone} className="relative">
              <div
                className={`w-full h-32 ${info.color} bg-opacity-20 border-2 border-dashed rounded-lg flex items-center justify-center`}
              >
                <div className="text-center">
                  <h3 className="font-bold text-lg">Zone {zone}</h3>
                  <p className="text-sm opacity-75">{info.positions} positions</p>
                </div>
              </div>

              {/* Show active pickers in this zone */}
              {routes
                .filter((r) => r.status === 'active' && r.currentLocation.startsWith(zone))
                .map((route, index) => (
                  <div
                    key={route.id}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse"
                  >
                    {route.picker.charAt(0)}
                  </div>
                ))}
            </div>
          ))}
        </div>

        {/* Route path visualization */}
        {selectedRoute && selectedRoute.status === 'active' && (
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full">
              <path
                d="M 50 50 Q 200 100 350 150 T 600 200"
                stroke="#3B82F6"
                strokeWidth="3"
                fill="none"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm">Active Picker</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm">Optimized Route</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-sm">Available Zone</span>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          💡 3D interactive map và real-time tracking sẽ được tích hợp trong phiên bản production
        </p>
      </div>
    </div>
  );
};

// ==================== ANALYTICS VIEW ====================
const AnalyticsView = ({ routes, metrics }) => {
  return (
    <div className="space-y-6">
      {/* Performance overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold mb-4">Overall Performance</h3>
          <div className="space-y-4">
            {Object.entries(metrics.overall).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="font-medium">
                  {typeof value === 'number' && value < 10 ? value.toFixed(1) : value}
                  {key.includes('Rate') ||
                  key.includes('efficiency') ||
                  key.includes('Optimization')
                    ? '%'
                    : key.includes('Time')
                    ? ' min'
                    : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold mb-4">Staff Performance</h3>
          <div className="space-y-3">
            {Object.entries(metrics.byStaff).map(([staffId, data]) => (
              <div key={staffId} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{staffId}</span>
                  <span className="text-sm text-gray-500">{data.picks} picks</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Accuracy: {data.accuracy}%</span>
                  <span>Efficiency: {data.efficiency}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold mb-4">Zone Performance</h3>
          <div className="space-y-3">
            {Object.entries(metrics.byZone).map(([zone, data]) => (
              <div key={zone} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Zone {zone}</span>
                  <span className="text-sm text-gray-500">{data.utilization}% util</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${data.utilization}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Route efficiency chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold mb-4">Route Efficiency Trends</h3>
        <div className="h-64 flex items-end space-x-2">
          {[85, 91, 87, 94, 89, 92, 88, 96, 90, 93].map((efficiency, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                style={{ height: `${efficiency}%` }}
              ></div>
              <span className="text-xs mt-2">Day {index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmartPickingSystem;
