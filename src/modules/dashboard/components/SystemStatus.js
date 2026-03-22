// ==================== SYSTEM STATUS VIEW ====================
import React from 'react';
import { CheckCircle, Activity, RefreshCw } from 'react-feather';
import ModuleStatusCard from './ModuleStatusCard';
import PropTypes from 'prop-types';

const SystemStatusView = ({ data, themeClasses }) => {
  return (
    <div className="space-y-6">
      {/* Overall status */}
      <div
        className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
      >
        <h3 className="text-lg font-semibold mb-4">System Health Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h4 className="font-semibold text-green-600">HEALTHY</h4>
            <p className="text-sm text-gray-500 mt-1">
              All systems operational
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Activity size={32} className="text-blue-600" />
            </div>
            <h4 className="font-semibold text-blue-600">UPTIME</h4>
            <p className="text-sm text-gray-500 mt-1">{data.uptime}</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <RefreshCw size={32} className="text-purple-600" />
            </div>
            <h4 className="font-semibold text-purple-600">LAST UPDATE</h4>
            <p className="text-sm text-gray-500 mt-1">
              {data.lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Module details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(data.modules).map(([module, status]) => (
          <ModuleStatusCard
            key={module}
            module={module}
            status={status}
            themeClasses={themeClasses}
          />
        ))}
      </div>

      {/* Integration status */}
      <div
        className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}
      >
        <h3 className="text-lg font-semibold mb-4">External Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(data.integrations).map(([integration, status]) => (
            <div
              key={integration}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    status.status === 'connected'
                      ? 'bg-green-500'
                      : 'bg-yellow-500'
                  }`}
                ></div>
                <span className="font-medium capitalize">{integration}</span>
              </div>
              <span className="text-sm text-gray-500">{status.lastSync}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

SystemStatusView.propTypes = {
  data: PropTypes.shape({
    uptime: PropTypes.string.isRequired,
    lastUpdate: PropTypes.instanceOf(Date).isRequired,
    modules: PropTypes.objectOf(
      PropTypes.shape({
        status: PropTypes.string.isRequired,
        lastChecked: PropTypes.instanceOf(Date).isRequired,
      })
    ).isRequired,
    integrations: PropTypes.objectOf(
      PropTypes.shape({
        status: PropTypes.string.isRequired,
        lastSync: PropTypes.instanceOf(Date).isRequired,
      })
    ).isRequired,
  }).isRequired,
  themeClasses: PropTypes.shape({
    surface: PropTypes.string.isRequired,
    border: PropTypes.string.isRequired,
  }).isRequired,
};

export default SystemStatusView;
// This component displays the system status overview, including overall health, module statuses, and integration statuses.
// It uses icons to visually represent the status and provides a clean layout for easy readability.
