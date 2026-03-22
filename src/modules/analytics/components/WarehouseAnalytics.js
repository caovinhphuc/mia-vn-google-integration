import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Settings,
  Sun,
  Moon,
  Target,
  TrendingUp,
  FileText,
  Lightbulb,
} from 'lucide-react';
import { useTheme } from '../../../App';
import {
  generateAnalyticsData,
  ANALYTICS_VIEWS,
  TIME_RANGES,
  AUTO_REFRESH_INTERVAL,
} from '../config/constants';
import OverviewView from './OverviewView';
import TrendsView from './TrendsView';
import PerformanceView from './PerformanceView';
import ReportsView from './ReportsView';
import PredictionsView from './PredictionsView';

// Icon mapping for view navigation
const VIEW_ICON_MAP = {
  BarChart3,
  TrendingUp,
  Target,
  FileText,
  Lightbulb,
};

const WarehouseAnalytics = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [data, setData] = useState(generateAnalyticsData());
  const [activeView, setActiveView] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');

  // Real-time data refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateAnalyticsData());
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView data={data} />;
      case 'trends':
        return <TrendsView data={data.trends} />;
      case 'performance':
        return <PerformanceView data={data.performance} />;
      case 'reports':
        return <ReportsView />;
      case 'predictions':
        return <PredictionsView data={data.predictions} />;
      default:
        return <OverviewView data={data} />;
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Header */}
      <div
        className={`${
          isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        } border-b p-6`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <BarChart3 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                Warehouse Analytics & Reports
              </h1>
              <p
                className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                Phân tích dữ liệu kho vận • 01/06/2025 14:40 • Auto-refresh: 30s
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Time range selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={`px-3 py-2 border rounded-lg ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {TIME_RANGES.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border hover:opacity-80 transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Export */}
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Download size={16} />
              <span>Export</span>
            </button>

            {/* Settings */}
            <button
              className={`p-2 rounded-lg border hover:opacity-80 transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-2 mt-6 overflow-x-auto">
          {ANALYTICS_VIEWS.map((view) => {
            const IconComponent = VIEW_ICON_MAP[view.icon] || BarChart3;

            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeView === view.id
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600'
                    : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <IconComponent size={16} />
                <span>{view.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">{renderActiveView()}</div>
    </div>
  );
};

export default WarehouseAnalytics;
