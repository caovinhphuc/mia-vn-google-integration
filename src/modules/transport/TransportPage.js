// Enhanced Transport Module - Quản lý vận chuyển tối ưu
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  TrashIcon,
  TruckIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { useMemo, useState } from 'react'
import logger from '../../utils/logger'

const TransportPage = () => {
  const [transports, setTransports] = useState([
    {
      id: 'T001',
      vehicleNumber: '29A-12345',
      driverName: 'Nguyễn Văn Nam',
      driverPhone: '0903123456',
      route: 'Hà Nội - TP.HCM',
      status: 'in_progress',
      departureTime: '2024-01-15 08:00',
      arrivalTime: '2024-01-16 18:00',
      cargo: 'Điện tử tiêu dùng',
      weight: '5.2 tấn',
      cost: 12500000,
      currentLocation: 'Vinh, Nghệ An',
    },
    {
      id: 'T002',
      vehicleNumber: '30B-67890',
      driverName: 'Trần Minh Đức',
      driverPhone: '0907654321',
      route: 'TP.HCM - Cần Thơ',
      status: 'completed',
      departureTime: '2024-01-14 14:00',
      arrivalTime: '2024-01-14 20:30',
      cargo: 'Thực phẩm đông lạnh',
      weight: '3.8 tấn',
      cost: 4200000,
      currentLocation: 'Cần Thơ',
    },
    {
      id: 'T003',
      vehicleNumber: '51C-33333',
      driverName: 'Lê Thị Hoa',
      driverPhone: '0912345678',
      route: 'Đà Nẵng - Hà Nội',
      status: 'scheduled',
      departureTime: '2024-01-16 06:00',
      arrivalTime: '2024-01-17 16:00',
      cargo: 'Vật liệu xây dựng',
      weight: '8.5 tấn',
      cost: 15800000,
      currentLocation: 'Đà Nẵng',
    },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedTransport, setSelectedTransport] = useState(null)
  const [editMode, setEditMode] = useState(false)

  // Filter and search transports
  const filteredTransports = useMemo(() => {
    return transports.filter((transport) => {
      const matchesSearch =
        transport.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transport.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transport.route.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || transport.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [transports, searchTerm, statusFilter])

  // Get status styles
  const getStatusStyle = (status) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'delayed':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'in_progress':
        return <TruckIcon className="w-4 h-4" />
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'scheduled':
        return <CalendarIcon className="w-4 h-4" />
      case 'cancelled':
        return <XCircleIcon className="w-4 h-4" />
      case 'delayed':
        return <ExclamationTriangleIcon className="w-4 h-4" />
      default:
        return <ClockIcon className="w-4 h-4" />
    }
  }

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'in_progress':
        return 'Đang vận chuyển'
      case 'completed':
        return 'Hoàn thành'
      case 'scheduled':
        return 'Đã lên lịch'
      case 'cancelled':
        return 'Đã hủy'
      case 'delayed':
        return 'Bị trễ'
      default:
        return 'Không xác định'
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  // Handle view transport
  const handleViewTransport = (transport) => {
    setSelectedTransport(transport)
    setEditMode(false)
    setShowModal(true)
  }

  // Handle edit transport
  const handleEditTransport = (transport) => {
    setSelectedTransport(transport)
    setEditMode(true)
    setShowModal(true)
  }

  // Handle delete transport
  const handleDeleteTransport = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn vận chuyển này?')) {
      setTransports((prev) => prev.filter((t) => t.id !== id))
    }
  }

  // Statistics
  const stats = useMemo(() => {
    const total = transports.length
    const inProgress = transports.filter((t) => t.status === 'in_progress').length
    const completed = transports.filter((t) => t.status === 'completed').length
    const scheduled = transports.filter((t) => t.status === 'scheduled').length
    const totalRevenue = transports
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + t.cost, 0)

    return { total, inProgress, completed, scheduled, totalRevenue }
  }, [transports])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TruckIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý vận chuyển</h1>
                <p className="text-gray-600">Theo dõi và quản lý các chuyến hàng</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedTransport(null)
                setEditMode(true)
                setShowModal(true)
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Thêm chuyến hàng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng chuyến hàng</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <TruckIcon className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang vận chuyển</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TruckIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã lên lịch</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.scheduled}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <CalendarIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo số xe, tài xế, tuyến đường..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="scheduled">Đã lên lịch</option>
                <option value="in_progress">Đang vận chuyển</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
                <option value="delayed">Bị trễ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transport List */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Danh sách chuyến hàng</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số xe / Tài xế
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tuyến đường
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hàng hóa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chi phí
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransports.map((transport) => (
                  <tr key={transport.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <TruckIcon className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {transport.vehicleNumber}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{transport.driverName}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <PhoneIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{transport.driverPhone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{transport.route}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Vị trí: {transport.currentLocation}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(transport.status)}`}
                      >
                        {getStatusIcon(transport.status)}
                        <span className="ml-2">{getStatusText(transport.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span>Khởi hành: {transport.departureTime}</span>
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span>Dự kiến đến: {transport.arrivalTime}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{transport.cargo}</div>
                      <div className="text-sm text-gray-600">Khối lượng: {transport.weight}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-semibold text-green-600">
                        {formatCurrency(transport.cost)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewTransport(transport)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditTransport(transport)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransport(transport.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransports.length === 0 && (
            <div className="text-center py-12">
              <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy chuyến hàng</h3>
              <p className="text-gray-600">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for view/edit transport */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editMode
                    ? selectedTransport
                      ? 'Chỉnh sửa chuyến hàng'
                      : 'Thêm chuyến hàng mới'
                    : 'Chi tiết chuyến hàng'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {editMode ? (
                <TransportForm
                  transport={selectedTransport}
                  onSave={() => setShowModal(false)}
                  onCancel={() => setShowModal(false)}
                />
              ) : (
                <TransportDetails transport={selectedTransport} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Transport Details Component
const TransportDetails = ({ transport }) => {
  if (!transport) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thông tin xe</label>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TruckIcon className="w-5 h-5 text-gray-600" />
                <span className="font-medium">{transport.vehicleNumber}</span>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <UserIcon className="w-5 h-5 text-gray-600" />
                <span>{transport.driverName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneIcon className="w-5 h-5 text-gray-600" />
                <span>{transport.driverPhone}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tuyến đường</label>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <MapPinIcon className="w-5 h-5 text-gray-600" />
                <span className="font-medium">{transport.route}</span>
              </div>
              <div className="text-gray-600">Vị trí hiện tại: {transport.currentLocation}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian</label>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ClockIcon className="w-5 h-5 text-gray-600" />
                <span>Khởi hành: {transport.departureTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-gray-600" />
                <span>Dự kiến đến: {transport.arrivalTime}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hàng hóa</label>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="font-medium mb-2">{transport.cargo}</div>
              <div className="text-gray-600">Khối lượng: {transport.weight}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
          <div className="bg-gray-50 rounded-lg p-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border`}
            >
              {transport.status === 'in_progress' && <TruckIcon className="w-4 h-4 mr-2" />}
              {transport.status === 'completed' && <CheckCircleIcon className="w-4 h-4 mr-2" />}
              {transport.status === 'scheduled' && <CalendarIcon className="w-4 h-4 mr-2" />}
              {transport.status === 'cancelled' && <XCircleIcon className="w-4 h-4 mr-2" />}
              {transport.status === 'delayed' && (
                <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
              )}
              {transport.status === 'in_progress' && 'Đang vận chuyển'}
              {transport.status === 'completed' && 'Hoàn thành'}
              {transport.status === 'scheduled' && 'Đã lên lịch'}
              {transport.status === 'cancelled' && 'Đã hủy'}
              {transport.status === 'delayed' && 'Bị trễ'}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Chi phí</label>
          <div className="bg-gray-50 rounded-lg p-4">
            <span className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(transport.cost)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Transport Form Component
const TransportForm = ({ transport, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    vehicleNumber: transport?.vehicleNumber || '',
    driverName: transport?.driverName || '',
    driverPhone: transport?.driverPhone || '',
    route: transport?.route || '',
    status: transport?.status || 'scheduled',
    departureTime: transport?.departureTime || '',
    arrivalTime: transport?.arrivalTime || '',
    cargo: transport?.cargo || '',
    weight: transport?.weight || '',
    cost: transport?.cost || '',
    currentLocation: transport?.currentLocation || '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically save to your backend
    logger.info('Saving transport:', formData)
    onSave()
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số xe <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.vehicleNumber}
            onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập số xe"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên tài xế <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.driverName}
            onChange={(e) => handleInputChange('driverName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập tên tài xế"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.driverPhone}
            onChange={(e) => handleInputChange('driverPhone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập số điện thoại"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tuyến đường <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.route}
            onChange={(e) => handleInputChange('route', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Hà Nội - TP.HCM"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="scheduled">Đã lên lịch</option>
            <option value="in_progress">Đang vận chuyển</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
            <option value="delayed">Bị trễ</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vị trí hiện tại</label>
          <input
            type="text"
            value={formData.currentLocation}
            onChange={(e) => handleInputChange('currentLocation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập vị trí hiện tại"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thời gian khởi hành <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={formData.departureTime}
            onChange={(e) => handleInputChange('departureTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thời gian dự kiến đến
          </label>
          <input
            type="datetime-local"
            value={formData.arrivalTime}
            onChange={(e) => handleInputChange('arrivalTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại hàng hóa <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.cargo}
            onChange={(e) => handleInputChange('cargo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập loại hàng hóa"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Khối lượng</label>
          <input
            type="text"
            value={formData.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: 5.2 tấn"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chi phí (VNĐ) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.cost}
            onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập chi phí"
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {transport ? 'Cập nhật' : 'Thêm mới'}
        </button>
      </div>
    </form>
  )
}

export default TransportPage
