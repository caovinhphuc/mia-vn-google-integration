// Enhanced Warehouse Map Module - Bản đồ kho tối ưu
import React, { useState, useMemo } from 'react';
import {
  MapIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  BuildingStorefrontIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

const WarehouseMapPage = () => {
  const [viewMode, setViewMode] = useState('2d'); // '2d' or '3d'
  const [selectedZone, setSelectedZone] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    occupancy: 'all',
    type: 'all'
  });

  // Mock warehouse data
  const warehouseData = {
    zones: [
      {
        id: 'A1',
        name: 'Khu vực A1',
        type: 'storage',
        capacity: 100,
        occupied: 85,
        status: 'active',
        items: ['Điện tử', 'Gia dụng'],
        coordinates: { x: 50, y: 50, width: 80, height: 60 },
        temperature: 22,
        humidity: 55
      },
      {
        id: 'A2',
        name: 'Khu vực A2',
        type: 'storage',
        capacity: 120,
        occupied: 45,
        status: 'active',
        items: ['Thực phẩm', 'Đồ uống'],
        coordinates: { x: 150, y: 50, width: 80, height: 60 },
        temperature: 18,
        humidity: 60
      },
      {
        id: 'B1',
        name: 'Khu vực B1',
        type: 'cold_storage',
        capacity: 80,
        occupied: 78,
        status: 'warning',
        items: ['Thực phẩm tươi sống'],
        coordinates: { x: 50, y: 130, width: 80, height: 60 },
        temperature: -5,
        humidity: 85
      },
      {
        id: 'B2',
        name: 'Khu vực B2',
        type: 'staging',
        capacity: 60,
        occupied: 25,
        status: 'active',
        items: ['Hàng chờ xuất'],
        coordinates: { x: 150, y: 130, width: 80, height: 60 },
        temperature: 25,
        humidity: 50
      },
      {
        id: 'C1',
        name: 'Khu vực C1',
        type: 'receiving',
        capacity: 40,
        occupied: 35,
        status: 'maintenance',
        items: ['Hàng mới nhập'],
        coordinates: { x: 50, y: 210, width: 80, height: 60 },
        temperature: 23,
        humidity: 52
      },
      {
        id: 'C2',
        name: 'Khu vực C2',
        type: 'shipping',
        capacity: 50,
        occupied: 12,
        status: 'active',
        items: ['Hàng sẵn sàng xuất'],
        coordinates: { x: 150, y: 210, width: 80, height: 60 },
        temperature: 24,
        humidity: 48
      }
    ],
    equipment: [
      { id: 'F1', name: 'Xe nâng 01', type: 'forklift', status: 'active', position: { x: 100, y: 100 } },
      { id: 'F2', name: 'Xe nâng 02', type: 'forklift', status: 'maintenance', position: { x: 200, y: 150 } },
      { id: 'C1', name: 'Băng chuyền 01', type: 'conveyor', status: 'active', position: { x: 125, y: 180 } }
    ]
  };

  // Filter zones based on search and filters
  const filteredZones = useMemo(() => {
    return warehouseData.zones.filter(zone => {
      const matchesSearch = zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.items.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = filters.status === 'all' || zone.status === filters.status;
      const matchesType = filters.type === 'all' || zone.type === filters.type;

      let matchesOccupancy = true;
      if (filters.occupancy === 'high') {
        matchesOccupancy = (zone.occupied / zone.capacity) > 0.8;
      } else if (filters.occupancy === 'medium') {
        matchesOccupancy = (zone.occupied / zone.capacity) >= 0.5 && (zone.occupied / zone.capacity) <= 0.8;
      } else if (filters.occupancy === 'low') {
        matchesOccupancy = (zone.occupied / zone.capacity) < 0.5;
      }

      return matchesSearch && matchesStatus && matchesType && matchesOccupancy;
    });
  }, [searchTerm, filters, warehouseData.zones]);

  // Get zone color based on status and occupancy
  const getZoneColor = (zone) => {
    const occupancyRate = zone.occupied / zone.capacity;

    if (zone.status === 'maintenance') return '#ef4444'; // red
    if (zone.status === 'warning') return '#f59e0b'; // amber

    if (occupancyRate > 0.9) return '#dc2626'; // red-600
    if (occupancyRate > 0.8) return '#ea580c'; // orange-600
    if (occupancyRate > 0.6) return '#d97706'; // amber-600
    if (occupancyRate > 0.4) return '#65a30d'; // lime-600
    return '#16a34a'; // green-600
  };

  // Get zone status text
  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'warning': return 'Cảnh báo';
      case 'maintenance': return 'Bảo trì';
      case 'inactive': return 'Không hoạt động';
      default: return 'Không xác định';
    }
  };

  // Get type text
  const getTypeText = (type) => {
    switch (type) {
      case 'storage': return 'Kho lưu trữ';
      case 'cold_storage': return 'Kho lạnh';
      case 'staging': return 'Khu tập kết';
      case 'receiving': return 'Khu nhận hàng';
      case 'shipping': return 'Khu xuất hàng';
      default: return 'Khác';
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const totalCapacity = warehouseData.zones.reduce((sum, zone) => sum + zone.capacity, 0);
    const totalOccupied = warehouseData.zones.reduce((sum, zone) => sum + zone.occupied, 0);
    const utilizationRate = (totalOccupied / totalCapacity) * 100;

    const activeZones = warehouseData.zones.filter(z => z.status === 'active').length;
    const warningZones = warehouseData.zones.filter(z => z.status === 'warning').length;
    const maintenanceZones = warehouseData.zones.filter(z => z.status === 'maintenance').length;

    return {
      totalCapacity,
      totalOccupied,
      utilizationRate,
      activeZones,
      warningZones,
      maintenanceZones,
      totalZones: warehouseData.zones.length
    };
  }, [warehouseData.zones]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bản đồ kho</h1>
                <p className="text-gray-600">Sơ đồ và theo dõi trạng thái kho hàng</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('2d')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === '2d'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <Squares2X2Icon className="w-4 h-4 inline mr-2" />
                  2D View
                </button>
                <button
                  onClick={() => setViewMode('3d')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === '3d'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <CubeIcon className="w-4 h-4 inline mr-2" />
                  3D View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng khu vực</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalZones}</p>
              </div>
              <BuildingStorefrontIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeZones}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cảnh báo</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.warningZones}</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bảo trì</p>
                <p className="text-2xl font-bold text-red-600">{stats.maintenanceZones}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <XMarkIcon className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sức chứa</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalCapacity.toLocaleString()}</p>
              </div>
              <CubeIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tỷ lệ sử dụng</p>
                <p className="text-2xl font-bold text-purple-600">{stats.utilizationRate.toFixed(1)}%</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-purple-600">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm khu vực, mã vùng, loại hàng hóa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 border rounded-lg transition-colors flex items-center space-x-2 ${showFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                <span>Bộ lọc</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tất cả</option>
                    <option value="active">Hoạt động</option>
                    <option value="warning">Cảnh báo</option>
                    <option value="maintenance">Bảo trì</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại khu vực</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tất cả</option>
                    <option value="storage">Kho lưu trữ</option>
                    <option value="cold_storage">Kho lạnh</option>
                    <option value="staging">Khu tập kết</option>
                    <option value="receiving">Khu nhận hàng</option>
                    <option value="shipping">Khu xuất hàng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ sử dụng</label>
                  <select
                    value={filters.occupancy}
                    onChange={(e) => setFilters(prev => ({ ...prev, occupancy: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tất cả</option>
                    <option value="high">Cao ({'>'}80%)</option>
                    <option value="medium">Trung bình (50-80%)</option>
                    <option value="low">Thấp (&lt;50%)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Map Container */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Sơ đồ kho hàng</h2>
                <div className="flex items-center space-x-4">
                  {/* Legend */}
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-gray-600">Bình thường</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span className="text-gray-600">Cảnh báo</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span className="text-gray-600">Bảo trì</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gray-100 rounded-lg relative overflow-hidden" style={{ height: '500px' }}>
                <svg width="100%" height="100%" viewBox="0 0 300 320" className="absolute inset-0">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Warehouse zones */}
                  {filteredZones.map((zone) => (
                    <g key={zone.id}>
                      <rect
                        x={zone.coordinates.x}
                        y={zone.coordinates.y}
                        width={zone.coordinates.width}
                        height={zone.coordinates.height}
                        fill={getZoneColor(zone)}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedZone(zone)}
                      />
                      <text
                        x={zone.coordinates.x + zone.coordinates.width / 2}
                        y={zone.coordinates.y + zone.coordinates.height / 2 - 10}
                        textAnchor="middle"
                        className="fill-white text-sm font-bold pointer-events-none"
                      >
                        {zone.id}
                      </text>
                      <text
                        x={zone.coordinates.x + zone.coordinates.width / 2}
                        y={zone.coordinates.y + zone.coordinates.height / 2 + 5}
                        textAnchor="middle"
                        className="fill-white text-xs pointer-events-none"
                      >
                        {zone.occupied}/{zone.capacity}
                      </text>
                    </g>
                  ))}

                  {/* Equipment */}
                  {warehouseData.equipment.map((item) => (
                    <g key={item.id}>
                      <circle
                        cx={item.position.x}
                        cy={item.position.y}
                        r="8"
                        fill={item.status === 'active' ? '#10b981' : '#ef4444'}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="cursor-pointer"
                      />
                      <text
                        x={item.position.x}
                        y={item.position.y + 3}
                        textAnchor="middle"
                        className="fill-white text-xs font-bold pointer-events-none"
                      >
                        {item.type === 'forklift' ? 'F' : 'C'}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>

          {/* Zone Details Panel */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedZone ? 'Chi tiết khu vực' : 'Thông tin khu vực'}
              </h2>
            </div>

            <div className="p-6">
              {selectedZone ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedZone.name} ({selectedZone.id})
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${selectedZone.status === 'active' ? 'bg-green-100 text-green-800' :
                        selectedZone.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {getStatusText(selectedZone.status)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {getTypeText(selectedZone.type)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Sức chứa</span>
                        <span className="text-sm font-bold text-gray-900">
                          {selectedZone.occupied}/{selectedZone.capacity}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${(selectedZone.occupied / selectedZone.capacity) > 0.8 ? 'bg-red-500' :
                            (selectedZone.occupied / selectedZone.capacity) > 0.6 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                          style={{ width: `${(selectedZone.occupied / selectedZone.capacity) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Tỷ lệ sử dụng: {((selectedZone.occupied / selectedZone.capacity) * 100).toFixed(1)}%
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-blue-900">Nhiệt độ</div>
                        <div className="text-lg font-bold text-blue-600">{selectedZone.temperature}°C</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-green-900">Độ ẩm</div>
                        <div className="text-lg font-bold text-green-600">{selectedZone.humidity}%</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Loại hàng hóa</h4>
                      <div className="space-y-2">
                        {selectedZone.items.map((item, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CubeIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                        <EyeIcon className="w-4 h-4" />
                        <span>Xem chi tiết</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chọn khu vực</h3>
                  <p className="text-gray-600">Click vào một khu vực trên bản đồ để xem thông tin chi tiết</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Zone List */}
        <div className="bg-white rounded-xl shadow-sm border mt-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Danh sách khu vực</h2>
              <div className="flex items-center space-x-2">
                <ListBulletIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">{filteredZones.length} khu vực</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khu vực
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sức chứa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Môi trường
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hàng hóa
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredZones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedZone(zone)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: getZoneColor(zone) }}
                        ></div>
                        <div>
                          <div className="font-medium text-gray-900">{zone.name}</div>
                          <div className="text-sm text-gray-600">{zone.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{getTypeText(zone.type)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${zone.status === 'active' ? 'bg-green-100 text-green-800' :
                        zone.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {getStatusText(zone.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-20">
                          <div
                            className={`h-2 rounded-full ${(zone.occupied / zone.capacity) > 0.8 ? 'bg-red-500' :
                              (zone.occupied / zone.capacity) > 0.6 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                            style={{ width: `${(zone.occupied / zone.capacity) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">
                          {zone.occupied}/{zone.capacity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {zone.temperature}°C / {zone.humidity}%
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {zone.items.join(', ')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseMapPage;
