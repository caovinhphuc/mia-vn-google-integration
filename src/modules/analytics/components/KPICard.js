import React from 'react';
import {
  ArrowUp,
  ArrowDown,
  Package,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Users,
  Warehouse,
} from 'lucide-react';
import { useTheme } from '../../../App';
import { KPI_COLOR_MAP } from '../config/constants';

// Icon mapping for string references
const ICON_MAP = {
  Package,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Users,
  Warehouse,
};

const KPICard = ({ kpi }) => {
  const { themeClasses } = useTheme();

  const IconComponent =
    typeof kpi.icon === 'string' ? ICON_MAP[kpi.icon] : kpi.icon;

  return (
    <div
      className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-4 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm ${themeClasses.text.muted} mb-1`}>{kpi.label}</p>
          <p className="text-2xl font-bold mb-2">{kpi.value}</p>
          <div className="flex items-center space-x-1">
            {kpi.positive ? (
              <ArrowUp size={14} className="text-green-500" />
            ) : (
              <ArrowDown size={14} className="text-red-500" />
            )}
            <span
              className={`text-sm font-medium ${kpi.positive ? 'text-green-600' : 'text-red-600'
                }`}
            >
              {kpi.change}
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${KPI_COLOR_MAP[kpi.color]}`}>
          {IconComponent && <IconComponent size={20} />}
        </div>
      </div>
    </div>
  );
};

export default KPICard;
