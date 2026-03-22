// Warehouse Map Actions - Business Logic Layer
import { generateSampleLocations, generateSampleInventory, generateSampleStatistics } from '../data/sampleData';
import { exportToCSV, validateLocationCode } from '../utils/helpers';
import logger from "../../../utils/logger";

export class WarehouseActions {
  constructor() {
    this.locations = [];
    this.inventory = [];
    this.statistics = {};
    this.selectedLocation = null;
    this.filters = {
      zone: 'all',
      floor: 'all',
      status: 'all',
      category: 'all'
    };
    this.searchTerm = '';
  }

  // === INITIALIZATION ===
  async initializeData() {
    try {
      this.locations = generateSampleLocations();
      this.inventory = generateSampleInventory();
      this.statistics = generateSampleStatistics();
      return { success: true };
    } catch (error) {
      logger.error('Error initializing data:', error);
      return { success: false, error: error.message };
    }
  }

  // === LOCATION MANAGEMENT ===
  getLocations(filters = {}) {
    let filtered = [...this.locations];

    // Apply filters
    if (filters.zone && filters.zone !== 'all') {
      filtered = filtered.filter(loc => loc.zone === filters.zone);
    }
    if (filters.floor && filters.floor !== 'all') {
      filtered = filtered.filter(loc => loc.floor === parseInt(filters.floor));
    }
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(loc => loc.status === filters.status);
    }

    // Apply search
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(loc =>
        loc.code.toLowerCase().includes(term) ||
        loc.zone.toLowerCase().includes(term) ||
        loc.status.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  selectLocation(locationId) {
    this.selectedLocation = this.locations.find(loc => loc.id === locationId);
    return this.selectedLocation;
  }

  addLocation(locationData) {
    try {
      // Validate required fields
      if (!locationData.code || !validateLocationCode(locationData.code)) {
        throw new Error('Mã vị trí không hợp lệ');
      }

      // Check for duplicate code
      if (this.locations.some(loc => loc.code === locationData.code)) {
        throw new Error('Mã vị trí đã tồn tại');
      }

      const newLocation = {
        id: `LOC-${Date.now()}`,
        code: locationData.code,
        zone: locationData.zone,
        floor: locationData.floor,
        section: locationData.section,
        position: locationData.position,
        status: locationData.status || 'available',
        type: locationData.type || 'storage',
        capacity: locationData.capacity || 100,
        occupied: 0,
        temperature: locationData.temperature || 22,
        humidity: locationData.humidity || 50,
        lastUpdated: new Date().toISOString()
      };

      this.locations.push(newLocation);
      this.updateStatistics();
      return { success: true, location: newLocation };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  updateLocation(locationId, updates) {
    try {
      const index = this.locations.findIndex(loc => loc.id === locationId);
      if (index === -1) {
        throw new Error('Không tìm thấy vị trí');
      }

      // Validate code if being updated
      if (updates.code && updates.code !== this.locations[index].code) {
        if (!validateLocationCode(updates.code)) {
          throw new Error('Mã vị trí không hợp lệ');
        }
        if (this.locations.some((loc, i) => i !== index && loc.code === updates.code)) {
          throw new Error('Mã vị trí đã tồn tại');
        }
      }

      this.locations[index] = {
        ...this.locations[index],
        ...updates,
        lastUpdated: new Date().toISOString()
      };

      this.updateStatistics();
      return { success: true, location: this.locations[index] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  deleteLocation(locationId) {
    try {
      const index = this.locations.findIndex(loc => loc.id === locationId);
      if (index === -1) {
        throw new Error('Không tìm thấy vị trí');
      }

      const deletedLocation = this.locations.splice(index, 1)[0];
      this.updateStatistics();
      return { success: true, location: deletedLocation };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // === INVENTORY MANAGEMENT ===
  getInventory(filters = {}) {
    let filtered = [...this.inventory];

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(item => item.category === filters.category);
    }
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    if (filters.location) {
      filtered = filtered.filter(item => item.location.includes(filters.location));
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  addInventoryItem(itemData) {
    try {
      // Validate required fields
      if (!itemData.name || !itemData.code) {
        throw new Error('Tên và mã sản phẩm là bắt buộc');
      }

      // Check for duplicate code
      if (this.inventory.some(item => item.code === itemData.code)) {
        throw new Error('Mã sản phẩm đã tồn tại');
      }

      const newItem = {
        id: `ITEM-${Date.now()}`,
        code: itemData.code,
        name: itemData.name,
        category: itemData.category || 'electronics',
        location: itemData.location || '',
        quantity: itemData.quantity || 0,
        unit: itemData.unit || 'Cái',
        status: this.calculateStockStatus(itemData.quantity || 0),
        price: itemData.price || 0,
        supplier: itemData.supplier || '',
        description: itemData.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.inventory.push(newItem);
      this.updateStatistics();
      return { success: true, item: newItem };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  updateInventoryItem(itemId, updates) {
    try {
      const index = this.inventory.findIndex(item => item.id === itemId);
      if (index === -1) {
        throw new Error('Không tìm thấy sản phẩm');
      }

      // Update stock status if quantity changed
      if (updates.quantity !== undefined) {
        updates.status = this.calculateStockStatus(updates.quantity);
      }

      this.inventory[index] = {
        ...this.inventory[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this.updateStatistics();
      return { success: true, item: this.inventory[index] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  deleteInventoryItem(itemId) {
    try {
      const index = this.inventory.findIndex(item => item.id === itemId);
      if (index === -1) {
        throw new Error('Không tìm thấy sản phẩm');
      }

      const deletedItem = this.inventory.splice(index, 1)[0];
      this.updateStatistics();
      return { success: true, item: deletedItem };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // === UTILITY METHODS ===
  calculateStockStatus(quantity) {
    if (quantity === 0) return 'out-of-stock';
    if (quantity < 10) return 'low-stock';
    return 'in-stock';
  }

  updateStatistics() {
    const totalLocations = this.locations.length;
    const occupiedLocations = this.locations.filter(loc => loc.status === 'occupied').length;
    const totalCapacity = this.locations.reduce((sum, loc) => sum + (loc.capacity || 0), 0);
    const usedCapacity = this.locations.reduce((sum, loc) => sum + (loc.occupied || 0), 0);

    this.statistics = {
      totalLocations,
      occupiedLocations,
      availableLocations: totalLocations - occupiedLocations,
      totalCapacity,
      usedCapacity,
      availableCapacity: totalCapacity - usedCapacity,
      utilizationRate: totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0,
      totalItems: this.inventory.length,
      lastUpdated: new Date().toISOString()
    };

    return this.statistics;
  }

  // === SEARCH & FILTER ===
  setSearchTerm(term) {
    this.searchTerm = term;
  }

  setFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters };
  }

  clearFilters() {
    this.filters = {
      zone: 'all',
      floor: 'all',
      status: 'all',
      category: 'all'
    };
    this.searchTerm = '';
  }

  // === EXPORT/IMPORT ===
  exportLocations() {
    const data = this.locations.map(loc => ({
      'Mã vị trí': loc.code,
      'Khu vực': loc.zone,
      'Tầng': loc.floor,
      'Trạng thái': loc.status,
      'Loại': loc.type,
      'Sức chứa': loc.capacity,
      'Đã sử dụng': loc.occupied,
      'Nhiệt độ': loc.temperature,
      'Độ ẩm': loc.humidity
    }));
    exportToCSV(data, 'warehouse-locations.csv');
  }

  exportInventory() {
    const data = this.inventory.map(item => ({
      'Mã SP': item.code,
      'Tên sản phẩm': item.name,
      'Danh mục': item.category,
      'Vị trí': item.location,
      'Số lượng': item.quantity,
      'Đơn vị': item.unit,
      'Trạng thái': item.status,
      'Giá': item.price,
      'Nhà cung cấp': item.supplier
    }));
    exportToCSV(data, 'warehouse-inventory.csv');
  }

  // === REPORTING ===
  generateUtilizationReport() {
    const zoneStats = {};

    this.locations.forEach(loc => {
      if (!zoneStats[loc.zone]) {
        zoneStats[loc.zone] = {
          total: 0,
          occupied: 0,
          capacity: 0,
          used: 0
        };
      }

      zoneStats[loc.zone].total++;
      if (loc.status === 'occupied') zoneStats[loc.zone].occupied++;
      zoneStats[loc.zone].capacity += loc.capacity || 0;
      zoneStats[loc.zone].used += loc.occupied || 0;
    });

    return Object.keys(zoneStats).map(zone => ({
      zone,
      ...zoneStats[zone],
      utilizationRate: zoneStats[zone].capacity > 0
        ? Math.round((zoneStats[zone].used / zoneStats[zone].capacity) * 100)
        : 0
    }));
  }

  getInventoryByCategory() {
    const categoryStats = {};

    this.inventory.forEach(item => {
      if (!categoryStats[item.category]) {
        categoryStats[item.category] = {
          count: 0,
          totalQuantity: 0,
          totalValue: 0
        };
      }

      categoryStats[item.category].count++;
      categoryStats[item.category].totalQuantity += item.quantity || 0;
      categoryStats[item.category].totalValue += (item.quantity || 0) * (item.price || 0);
    });

    return categoryStats;
  }
}
