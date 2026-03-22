import React from 'react';
import {
  Plus,
  MoreVertical,
  FileText,
  Database,
  Share2,
  Calendar,
  TrendingUp,
  BarChart3,
  Package,
} from 'lucide-react';
import { useTheme } from '../../../App';
import { REPORT_TEMPLATES } from '../config/constants';

// Icon mapping for string references
const ICON_MAP = {
  Calendar,
  TrendingUp,
  BarChart3,
  Package,
  FileText,
};

const ReportsView = ({ templates = REPORT_TEMPLATES }) => {
  const { themeClasses } = useTheme();

  return (
    <div className="space-y-6">
      {/* Report templates */}
      <div className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Automated Report Templates</h3>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={16} />
            <span>Tạo mới</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => {
            const IconComponent = ICON_MAP[template.icon] || FileText;

            return (
              <div
                key={template.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <IconComponent size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-500">
                        {template.schedule}
                      </p>
                    </div>
                  </div>
                  <button className="p-1 text-gray-500 hover:text-gray-700">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Recipients:</span>
                    <span>{template.recipients.length} users</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Format:</span>
                    <span>{template.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last run:</span>
                    <span>{template.lastRun}</span>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors">
                    Run Now
                  </button>
                  <button className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export options */}
      <div className={`${themeClasses.surface} rounded-xl border ${themeClasses.border} p-6`}>
        <h3 className="text-lg font-semibold mb-4">Export Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <FileText className="mx-auto mb-2 text-red-500" size={24} />
            <p className="font-medium">PDF Report</p>
            <p className="text-sm text-gray-500">Executive summary</p>
          </button>

          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Database className="mx-auto mb-2 text-green-500" size={24} />
            <p className="font-medium">Excel Data</p>
            <p className="text-sm text-gray-500">Raw data export</p>
          </button>

          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Share2 className="mx-auto mb-2 text-blue-500" size={24} />
            <p className="font-medium">Share Dashboard</p>
            <p className="text-sm text-gray-500">Live link</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
