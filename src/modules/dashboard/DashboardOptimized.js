import {
  BarChart3,
  Bell,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  Monitor,
  Moon,
  Navigation,
  Package,
  RefreshCw,
  Settings,
  Square as SquareIcon,
  Sun,
  TrendingUp,
  Upload,
  Users,
  Warehouse,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  ConfirmDialog,
  LoadingSpinner,
  ToastNotification,
} from '../../components/ui/CommonComponents'

// ==================== OPTIMIZED DATA GENERATOR ====================
const generateOptimizedData = () => ({
  systemStatus: {
    overall: 'healthy',
    uptime: '99.7%',
    lastUpdate: new Date(),
    criticalAlerts: 2,
    performance: 96.8,
  },

  keyMetrics: [
    {
      id: 'orders-today',
      label: 'Orders Today',
      value: 289,
      change: '+12%',
      trend: 'up',
      color: 'blue',
      icon: Package,
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      value: 15,
      change: '-3%',
      trend: 'down',
      color: 'orange',
      icon: Clock,
    },
    {
      id: 'sla-compliance',
      label: 'SLA Compliance',
      value: '94.8%',
      change: '+2.1%',
      trend: 'up',
      color: 'green',
      icon: CheckCircle,
    },
    {
      id: 'efficiency',
      label: 'Efficiency',
      value: '87.3%',
      change: '+5%',
      trend: 'up',
      color: 'purple',
      icon: TrendingUp,
    },
  ],

  alerts: [
    {
      type: 'critical',
      message: 'VALI-PIS-24 out of stock',
      time: '2m ago',
      module: 'inventory',
    },
    {
      type: 'warning',
      message: '3 staff on unscheduled break',
      time: '5m ago',
      module: 'staff',
    },
    {
      type: 'info',
      message: 'Peak hour efficiency: 98%',
      time: '10m ago',
      module: 'picking',
    },
    {
      type: 'success',
      message: 'Daily backup completed',
      time: '15m ago',
      module: 'system',
    },
  ],

  quickActions: [
    {
      id: 'emergency-stop',
      label: 'Emergency Stop',
      icon: SquareIcon,
      color: 'red',
      critical: true,
    },
    { id: 'force-sync', label: 'Force Sync', icon: RefreshCw, color: 'blue' },
    { id: 'backup-now', label: 'Backup Now', icon: Upload, color: 'green' },
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: Settings,
      color: 'orange',
    },
    {
      id: 'generate-report',
      label: 'Generate Report',
      icon: FileText,
      color: 'purple',
    },
    { id: 'broadcast', label: 'Broadcast Alert', icon: Bell, color: 'yellow' },
  ],

  modules: {
    orders: { status: 'online', performance: 98.5, alerts: 2, icon: Package },
    inventory: {
      status: 'online',
      performance: 96.2,
      alerts: 5,
      icon: Warehouse,
    },
    staff: { status: 'online', performance: 94.8, alerts: 1, icon: Users },
    picking: {
      status: 'online',
      performance: 97.1,
      alerts: 3,
      icon: Navigation,
    },
    analytics: {
      status: 'online',
      performance: 99.2,
      alerts: 0,
      icon: BarChart3,
    },
    alerts: { status: 'online', performance: 98.9, alerts: 7, icon: Bell },
  },

  performanceData: {
    hourlyOrders: [45, 52, 38, 64, 72, 68, 89, 95, 78, 82, 76, 69],
    hourlyEfficiency: [78, 82, 85, 89, 92, 88, 94, 96, 91, 87, 84, 82],
    hours: [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
    ],
  },

  staffStatus: [
    { name: 'Working', value: 18, color: '#10B981' },
    { name: 'Break', value: 3, color: '#F59E0B' },
    { name: 'Absent', value: 2, color: '#EF4444' },
    { name: 'Training', value: 5, color: '#3B82F6' },
  ],

  topProducts: [
    { name: 'Vali Larita 28"', orders: 42, revenue: '52.5M' },
    { name: 'Travel Pillow', orders: 38, revenue: '7.6M' },
    { name: 'TSA Lock Set', orders: 35, revenue: '4.6M' },
    { name: 'Luggage Tag', orders: 28, revenue: '2.5M' },
  ],
})

// ==================== MAIN DASHBOARD COMPONENT ====================
const OptimizedDashboard = () => {
  const [darkMode, setDarkMode] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentView, setCurrentView] = useState('overview')
  const [data, setData] = useState(generateOptimizedData())
  const [notifications, setNotifications] = useState([])
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false })
  const [isLoading, setIsLoading] = useState(false)

  const themeClasses = {
    bg: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    surface: darkMode ? 'bg-gray-800' : 'bg-white',
    border: darkMode ? 'border-gray-700' : 'border-gray-200',
    text: {
      primary: darkMode ? 'text-white' : 'text-gray-900',
      secondary: darkMode ? 'text-gray-300' : 'text-gray-700',
      muted: darkMode ? 'text-gray-400' : 'text-gray-500',
    },
  }

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateOptimizedData())
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Show notification helper
  const showNotification = (type, title, message) => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { id, type, title, message }])
  }

  // Remove notification helper
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  // Enhanced quick action handler with confirmations and loading states
  const handleQuickAction = async (actionId) => {
    const actionHandlers = {
      'emergency-stop': () => {
        setConfirmDialog({
          isOpen: true,
          title: 'Emergency Stop',
          message:
            'This will immediately halt all warehouse operations. Are you sure you want to proceed?',
          type: 'danger',
          onConfirm: async () => {
            setIsLoading(true)
            await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API call
            setIsLoading(false)
            showNotification(
              'error',
              'Emergency Stop Activated',
              'All warehouse operations have been halted.',
            )
          },
        })
      },
      'force-sync': async () => {
        setIsLoading(true)
        showNotification('info', 'Sync Started', 'Synchronizing all systems...')
        await new Promise((resolve) => setTimeout(resolve, 3000)) // Simulate sync
        setIsLoading(false)
        showNotification(
          'success',
          'Sync Complete',
          'All systems have been synchronized successfully.',
        )
      },
      'backup-now': async () => {
        setIsLoading(true)
        showNotification('info', 'Backup Started', 'Creating system backup...')
        await new Promise((resolve) => setTimeout(resolve, 4000)) // Simulate backup
        setIsLoading(false)
        showNotification('success', 'Backup Complete', 'System backup created successfully.')
      },
      maintenance: () => {
        setConfirmDialog({
          isOpen: true,
          title: 'Toggle Maintenance Mode',
          message:
            'This will put the system in maintenance mode. Some features may be unavailable.',
          type: 'warning',
          onConfirm: () => {
            showNotification('warning', 'Maintenance Mode', 'System is now in maintenance mode.')
          },
        })
      },
      'generate-report': async () => {
        setIsLoading(true)
        showNotification('info', 'Generating Report', 'Creating comprehensive system report...')
        await new Promise((resolve) => setTimeout(resolve, 3000)) // Simulate report generation
        setIsLoading(false)
        showNotification(
          'success',
          'Report Generated',
          'System report has been generated and saved.',
        )
      },
      broadcast: () => {
        const message = prompt('Enter broadcast message:')
        if (message) {
          showNotification('info', 'Message Broadcasted', `Alert sent to all staff: "${message}"`)
        }
      },
    }

    if (actionHandlers[actionId]) {
      await actionHandlers[actionId]()
    } else {
      showNotification(
        'info',
        'Feature Coming Soon',
        `The "${actionId}" feature will be implemented soon.`,
      )
    }
  }

  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-300`}>
      {/* Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        currentView={currentView}
        setCurrentView={setCurrentView}
        systemStatus={data.systemStatus}
        isLoading={isLoading}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {currentView === 'overview' && (
          <OverviewView
            data={data}
            themeClasses={themeClasses}
            onQuickAction={handleQuickAction}
            isEditMode={isEditMode}
            isLoading={isLoading}
          />
        )}

        {currentView === 'performance' && (
          <PerformanceView data={data} themeClasses={themeClasses} />
        )}

        {currentView === 'settings' && (
          <SettingsView
            themeClasses={themeClasses}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            showNotification={showNotification}
          />
        )}
      </main>

      {/* Notifications */}
      {notifications.map((notification) => (
        <ToastNotification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => removeNotification(notification.id)}
        />
      ))}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <LoadingSpinner size="lg" text="Processing..." />
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== HEADER COMPONENT ====================
const Header = ({
  darkMode,
  setDarkMode,
  isEditMode,
  setIsEditMode,
  currentView,
  setCurrentView,
  systemStatus,
  isLoading,
}) => (
  <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Warehouse Operations
          </h1>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Live • {systemStatus.uptime} uptime</span>
            {isLoading && (
              <div className="flex items-center space-x-2 text-blue-600">
                <LoadingSpinner size="sm" />
                <span className="text-sm">Processing...</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* View Tabs */}
          <nav className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: Monitor },
              { id: 'performance', label: 'Performance', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  currentView === id
                    ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`p-2 rounded-lg transition-colors ${
                isEditMode
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Toggle Edit Mode"
            >
              <Edit size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
)

// ==================== OVERVIEW VIEW ====================
const OverviewView = ({ data, themeClasses, onQuickAction, isEditMode, isLoading }) => (
  <div className="space-y-8">
    {/* Key Metrics */}
    <section>
      <h2 className="text-xl font-semibold mb-6">Key Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.keyMetrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} themeClasses={themeClasses} />
        ))}
      </div>
    </section>

    {/* Quick Actions & Alerts */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Quick Actions */}
      <section
        className={`lg:col-span-2 ${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
      >
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {data.quickActions.map((action) => (
            <QuickActionButton
              key={action.id}
              action={action}
              onClick={() => onQuickAction(action.id)}
              themeClasses={themeClasses}
              isLoading={isLoading}
            />
          ))}
        </div>
      </section>

      {/* Live Alerts */}
      <section className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}>
        <h3 className="text-lg font-semibold mb-4">Live Alerts</h3>
        <div className="space-y-3">
          {data.alerts.map((alert, index) => (
            <AlertItem key={index} alert={alert} themeClasses={themeClasses} />
          ))}
        </div>
      </section>
    </div>

    {/* Analytics Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Staff Status */}
      <section className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}>
        <h3 className="text-lg font-semibold mb-4">Staff Status</h3>
        <StaffStatusChart data={data.staffStatus} />
      </section>

      {/* Top Products */}
      <section className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}>
        <h3 className="text-lg font-semibold mb-4">Top Products Today</h3>
        <TopProductsTable data={data.topProducts} themeClasses={themeClasses} />
      </section>
    </div>

    {/* Module Status */}
    <section>
      <h2 className="text-xl font-semibold mb-6">System Modules</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(data.modules).map(([moduleName, moduleData]) => (
          <ModuleCard
            key={moduleName}
            name={moduleName}
            data={moduleData}
            themeClasses={themeClasses}
          />
        ))}
      </div>
    </section>
  </div>
)

// ==================== PERFORMANCE VIEW ====================
const PerformanceView = ({ data, themeClasses }) => (
  <div className="space-y-8">
    <section>
      <h2 className="text-xl font-semibold mb-6">Performance Analytics</h2>

      {/* Performance Chart */}
      <div className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}>
        <h3 className="text-lg font-semibold mb-4">Hourly Performance Trends</h3>
        <PerformanceChart data={data.performanceData} themeClasses={themeClasses} />
      </div>
    </section>

    {/* Performance Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}>
        <h3 className="text-lg font-semibold mb-4">Efficiency Score</h3>
        <div className="text-3xl font-bold text-green-600">96.8%</div>
        <p className="text-sm text-gray-500">+2.4% from yesterday</p>
      </div>

      <div className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}>
        <h3 className="text-lg font-semibold mb-4">Avg Processing Time</h3>
        <div className="text-3xl font-bold text-blue-600">22.5m</div>
        <p className="text-sm text-gray-500">-8% improvement</p>
      </div>

      <div className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}>
        <h3 className="text-lg font-semibold mb-4">Error Rate</h3>
        <div className="text-3xl font-bold text-yellow-600">1.2%</div>
        <p className="text-sm text-gray-500">Within acceptable range</p>
      </div>
    </div>
  </div>
)

// ==================== SETTINGS VIEW ====================
const SettingsView = ({ themeClasses, darkMode, setDarkMode, showNotification }) => (
  <div className="space-y-8">
    <section>
      <h2 className="text-xl font-semibold mb-6">Dashboard Settings</h2>

      <div
        className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6 space-y-6`}
      >
        {/* General Settings */}
        <div>
          <h3 className="text-lg font-semibold mb-4">General</h3>
          <div className="space-y-4">
            <SettingToggle
              label="Auto Refresh"
              description="Automatically refresh data every 5 seconds"
              defaultChecked={true}
            />
            <SettingToggle
              label="Dark Mode"
              description="Switch to dark theme"
              checked={darkMode}
              onChange={setDarkMode}
            />
            <SettingToggle
              label="Sound Notifications"
              description="Play sound for critical alerts"
              defaultChecked={true}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">System Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActionButton
              title="Backup System Data"
              description="Create a full system backup"
              color="blue"
              onClick={() =>
                showNotification('info', 'Backup Started', 'System backup initiated from settings')
              }
            />
            <ActionButton
              title="Force Sync All Modules"
              description="Synchronize all module data"
              color="green"
              onClick={() =>
                showNotification('info', 'Sync Started', 'Module synchronization initiated')
              }
            />
            <ActionButton
              title="System Health Check"
              description="Run comprehensive diagnostics"
              color="yellow"
              onClick={() =>
                showNotification('info', 'Health Check', 'Running system diagnostics...')
              }
            />
            <ActionButton
              title="Restart All Services"
              description="⚠️ This will cause temporary downtime"
              color="red"
              onClick={() => {
                if (window.confirm('This will restart all services. Continue?')) {
                  showNotification(
                    'warning',
                    'Services Restarting',
                    'All services are being restarted',
                  )
                }
              }}
            />
          </div>
        </div>
      </div>
    </section>
  </div>
)

// ==================== COMPONENT HELPERS ====================
const MetricCard = ({ metric, themeClasses }) => {
  const Icon = metric.icon
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
  }

  return (
    <div
      className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6 hover:shadow-lg transition-all`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[metric.color]}`}>
          <Icon size={24} />
        </div>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>

      <div className="space-y-2">
        <p className={`text-sm font-medium ${themeClasses.text.muted}`}>{metric.label}</p>
        <p className="text-2xl font-bold">{metric.value}</p>
        <p
          className={`text-sm flex items-center space-x-1 ${
            metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          <span>{metric.change}</span>
          <TrendingUp size={14} className={metric.trend === 'down' ? 'rotate-180' : ''} />
        </p>
      </div>
    </div>
  )
}

const QuickActionButton = ({ action, onClick, themeClasses, isLoading }) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className={`flex flex-col items-center p-4 rounded-lg border-2 border-dashed transition-all hover:shadow-md group disabled:opacity-50 disabled:cursor-not-allowed ${
      action.critical
        ? 'border-red-300 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
    }`}
  >
    {isLoading ? (
      <LoadingSpinner size="sm" />
    ) : (
      <action.icon
        size={24}
        className={`mb-2 transition-transform group-hover:scale-110 ${
          action.critical ? 'text-red-500' : 'text-gray-600'
        }`}
      />
    )}
    <span className="text-sm font-medium text-center">{action.label}</span>
  </button>
)

const AlertItem = ({ alert, themeClasses }) => {
  const alertColors = {
    critical: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20',
  }

  return (
    <div className={`p-3 rounded-lg border ${alertColors[alert.type]}`}>
      <p className="text-sm font-medium">{alert.message}</p>
      <p className="text-xs opacity-75 mt-1">
        {alert.time} • {alert.module}
      </p>
    </div>
  )
}

const StaffStatusChart = ({ data }) => (
  <div className="flex flex-col items-center">
    <div className="relative w-32 h-32 mb-6">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {data.map((item, index) => {
          const total = data.reduce((sum, d) => sum + d.value, 0)
          const percentage = (item.value / total) * 100
          const strokeDasharray = `${percentage} ${100 - percentage}`
          const rotation = data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0)

          return (
            <circle
              key={item.name}
              cx="50"
              cy="50"
              r="15"
              fill="none"
              stroke={item.color}
              strokeWidth="8"
              strokeDasharray={strokeDasharray}
              strokeDashoffset="25"
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: '50px 50px',
              }}
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold">{data.reduce((sum, item) => sum + item.value, 0)}</span>
      </div>
    </div>

    <div className="space-y-2 w-full">
      {data.map((item) => (
        <div key={item.name} className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
            <span className="text-sm">{item.name}</span>
          </div>
          <span className="text-sm font-medium">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
)

const TopProductsTable = ({ data, themeClasses }) => (
  <div className="overflow-hidden">
    <table className="w-full">
      <thead>
        <tr className={`border-b ${themeClasses.border}`}>
          <th className="text-left py-3 text-sm font-medium">Product</th>
          <th className="text-left py-3 text-sm font-medium">Orders</th>
          <th className="text-left py-3 text-sm font-medium">Revenue</th>
        </tr>
      </thead>
      <tbody>
        {data.map((product, index) => (
          <tr key={index} className={`border-b ${themeClasses.border}`}>
            <td className="py-3 text-sm">{product.name}</td>
            <td className="py-3 text-sm font-medium">{product.orders}</td>
            <td className="py-3 text-sm text-green-600">{product.revenue}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const ModuleCard = ({ name, data, themeClasses }) => {
  const Icon = data.icon
  return (
    <div
      className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6 hover:shadow-lg transition-all`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg ${
              data.status === 'online'
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            }`}
          >
            <Icon
              size={20}
              className={data.status === 'online' ? 'text-green-600' : 'text-red-600'}
            />
          </div>
          <span className="font-medium capitalize">{name}</span>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            data.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {data.status}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Performance</span>
            <span>{data.performance}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-blue-500"
              style={{ width: `${data.performance}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className={themeClasses.text.muted}>Active Alerts</span>
          <span className={`font-medium ${data.alerts > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
            {data.alerts}
          </span>
        </div>
      </div>
    </div>
  )
}

const PerformanceChart = ({ data, themeClasses }) => (
  <div className="h-64 flex items-end justify-between space-x-2">
    {data.hourlyOrders.map((orders, index) => (
      <div key={index} className="flex flex-col items-center flex-1">
        <div className="flex flex-col items-center space-y-1 mb-2">
          <div
            className="w-full bg-blue-500 rounded-t"
            style={{
              height: `${(orders / Math.max(...data.hourlyOrders)) * 150}px`,
            }}
          ></div>
          <div
            className="w-full bg-green-500 rounded-t"
            style={{ height: `${(data.hourlyEfficiency[index] / 100) * 50}px` }}
          ></div>
        </div>
        <span className="text-xs text-gray-500 transform rotate-45">{data.hours[index]}</span>
      </div>
    ))}
  </div>
)

const SettingToggle = ({ label, description, checked, onChange, defaultChecked }) => (
  <div className="flex items-center justify-between">
    <div>
      <h4 className="font-medium">{label}</h4>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
    </label>
  </div>
)

const ActionButton = ({ title, description, color, onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    green:
      'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400',
    yellow:
      'bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    red: 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400',
  }

  return (
    <button
      onClick={onClick}
      className={`text-left p-4 rounded-lg transition-colors ${colorClasses[color]}`}
    >
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm opacity-75">{description}</p>
    </button>
  )
}

export default OptimizedDashboard
