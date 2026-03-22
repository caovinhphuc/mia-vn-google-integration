// ==================== WIDGET RENDERER ====================
import React from 'react'
import { Edit, X } from 'lucide-react'
import {
  Package,
  Warehouse,
  Users,
  Navigation,
  BarChart3,
  Bell,
  Activity,
} from 'lucide-react'
import PropTypes from 'prop-types'
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'
import { useTheme } from '../../../../App'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const WidgetRenderer = ({ widget, themeClasses, isEditMode }) => {
  const { isDarkMode } = useTheme()
  const renderWidget = () => {
    switch (widget.type) {
      case 'metric-grid':
        return (
          <div className="grid grid-cols-2 gap-4">
            {widget.data.metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <p className={`text-sm ${themeClasses.text.muted} mb-1`}>
                  {metric.label}
                </p>
                <p className="text-xl font-bold mb-1">{metric.value}</p>
                <p
                  className={`text-xs ${
                    metric.change.startsWith('+')
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {metric.change}
                </p>
              </div>
            ))}
          </div>
        );

      case 'alert-feed':
        return (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {widget.data.alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'critical'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : alert.type === 'warning'
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                    : alert.type === 'success'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                }`}
              >
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <span className="text-xs text-gray-500">{alert.time}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{alert.module}</p>
              </div>
            ))}
          </div>
        );

      case 'line-chart': {
        const textColor = isDarkMode ? '#9ca3af' : '#6b7280'
        const gridColor = isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.5)'
        const chartData = {
          labels:
            widget.data.categories?.length === widget.data.series?.[0]?.data?.length
              ? widget.data.categories
              : widget.data.series?.[0]?.data?.map((_, i) => `${String(i + 8).padStart(2, '0')}:00`) || [],
          datasets: (widget.data.series || []).map((s, i) => ({
            label: s.name,
            data: s.data,
            borderColor: i === 0 ? '#3b82f6' : '#10b981',
            backgroundColor: i === 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.3,
          })),
        }
        const options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: textColor } },
          },
          scales: {
            x: { grid: { color: gridColor }, ticks: { color: textColor } },
            y: { grid: { color: gridColor }, ticks: { color: textColor } },
          },
        }
        return (
          <div className="h-48">
            <Line data={chartData} options={options} />
          </div>
        )
      }

      case 'donut-chart': {
        const series = widget.data.series || []
        const textColor = isDarkMode ? '#9ca3af' : '#6b7280'
        const chartData = {
          labels: series.map((s) => s.name),
          datasets: [
            {
              data: series.map((s) => s.value),
              backgroundColor: series.map((s) => s.color || '#6b7280'),
              borderWidth: 0,
            },
          ],
        }
        const options = {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '60%',
          plugins: {
            legend: { position: 'bottom', labels: { color: textColor, padding: 8 } },
          },
        }
        return (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[200px]">
              <Doughnut data={chartData} options={options} />
            </div>
          </div>
        )
      }

      case 'progress-bars':
        return (
          <div className="space-y-3">
            {widget.data.items.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-${item.color}-500`}
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {widget.data.headers.map((header, index) => (
                    <th
                      key={index}
                      className="text-left py-2 px-3 text-sm font-medium"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {widget.data.rows.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="py-2 px-3 text-sm">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500">Unknown widget type</div>
        );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{widget.title}</h3>
        {isEditMode && (
          <div className="flex space-x-2">
            <button className="p-1 text-gray-500 hover:text-gray-700">
              <Edit size={14} />
            </button>
            <button className="p-1 text-gray-500 hover:text-gray-700">
              <X size={14} />
            </button>
          </div>
        )}
      </div>
      {renderWidget()}
    </div>
  );
};

// ==================== MODULE STATUS CARD ====================
const ModuleStatusCard = ({ module, status, themeClasses }) => {
  const getModuleIcon = (module) => {
    const icons = {
      orders: Package,
      inventory: Warehouse,
      staff: Users,
      picking: Navigation,
      analytics: BarChart3,
      alerts: Bell,
    };
    return icons[module] || Activity;
  };

  const ModuleIcon = getModuleIcon(module);

  return (
    <div
      className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-4 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg ${
              status.status === 'online'
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            }`}
          >
            <ModuleIcon
              size={20}
              className={`${
                status.status === 'online' ? 'text-green-600' : 'text-red-600'
              }`}
            />
          </div>
          <span className="font-medium capitalize">{module}</span>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            status.status === 'online'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {status.status}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className={themeClasses.text.muted}>Performance:</span>
          <span className="font-medium">{status.performance}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              status.performance >= 95
                ? 'bg-green-500'
                : status.performance >= 85
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${status.performance}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm">
          <span className={themeClasses.text.muted}>Active Alerts:</span>
          <span
            className={`font-medium ${
              status.alerts > 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {status.alerts}
          </span>
        </div>
      </div>
    </div>
  );
};

WidgetRenderer.propTypes = {
  widget: PropTypes.shape({
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
  }).isRequired,
  themeClasses: PropTypes.object.isRequired,
  isEditMode: PropTypes.bool.isRequired,
};
ModuleStatusCard.propTypes = {
  module: PropTypes.string.isRequired,
  status: PropTypes.shape({
    status: PropTypes.string.isRequired,
    performance: PropTypes.number.isRequired,
    alerts: PropTypes.number.isRequired,
  }).isRequired,
  themeClasses: PropTypes.object.isRequired,
};
export { WidgetRenderer, ModuleStatusCard };
export default WidgetRenderer;
// This code defines a WidgetRenderer component that dynamically renders different types of widgets based on the provided data.
// It supports various widget types like metric grids, alert feeds, line charts, donut charts, progress bars, and tables.
// Each widget type has its own rendering logic, and the component can be used in edit mode to allow for modifications.
// Additionally, a ModuleStatusCard component is provided to display the status of different modules in the system.
// The ModuleStatusCard component shows the module name, status, performance, and active alerts with appropriate icons and styles.
