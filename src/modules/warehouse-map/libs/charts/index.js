/**
 * Charts Library Index
 * Central export for all chart components
 */

// Import all chart modules
import Chart, {
  ChartRenderer,
  BarChart,
  LineChart,
  PieChart,
  DonutChart,
  CHART_TYPES
} from './ChartRenderer';

// Re-export all modules
export {
  ChartRenderer,
  BarChart,
  LineChart,
  PieChart,
  DonutChart,
  CHART_TYPES
} from './ChartRenderer';

export { Chart };

// Combined export for easy import
export const ChartLibs = {
  Chart,
  ChartRenderer,
  BarChart,
  LineChart,
  PieChart,
  DonutChart,
  CHART_TYPES
};

export default ChartLibs;
