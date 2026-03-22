import logger from "../../../../utils/logger";
/**
 * DataProcessor - Advanced data processing and analysis library
 * Handles data transformation, filtering, sorting, and analytics
 */

export class DataProcessor {
  constructor(config = {}) {
    this.config = {
      enableCaching: true,
      cacheExpiry: 300000, // 5 minutes
      debugMode: false,
      ...config
    };

    this.cache = new Map();
    this.transformers = new Map();
    this.validators = new Map();

    this.initialize();
  }

  initialize() {
    this.registerDefaultTransformers();
    this.registerDefaultValidators();
    logger.info('[DataProcessor] Initialized');
  }

  /**
   * Data Transformation
   */
  transform(data, transformerName, options = {}) {
    if (!this.transformers.has(transformerName)) {
      throw new Error(`Transformer '${transformerName}' not found`);
    }

    const cacheKey = this.generateCacheKey('transform', transformerName, data, options);

    if (this.config.enableCaching && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.cacheExpiry) {
        return cached.data;
      }
    }

    const transformer = this.transformers.get(transformerName);
    const result = transformer(data, options);

    if (this.config.enableCaching) {
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
    }

    return result;
  }

  /**
   * Register custom transformer
   */
  registerTransformer(name, transformerFn) {
    this.transformers.set(name, transformerFn);
  }

  /**
   * Data Validation
   */
  validate(data, validatorName, options = {}) {
    if (!this.validators.has(validatorName)) {
      throw new Error(`Validator '${validatorName}' not found`);
    }

    const validator = this.validators.get(validatorName);
    return validator(data, options);
  }

  /**
   * Register custom validator
   */
  registerValidator(name, validatorFn) {
    this.validators.set(name, validatorFn);
  }

  /**
   * Filtering and Sorting
   */
  filter(data, filterFn) {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array for filtering');
    }
    return data.filter(filterFn);
  }

  sort(data, sortKey, direction = 'asc') {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array for sorting');
    }

    return [...data].sort((a, b) => {
      let aVal = this.getNestedValue(a, sortKey);
      let bVal = this.getNestedValue(b, sortKey);

      // Handle different data types
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Advanced filtering with multiple criteria
   */
  advancedFilter(data, criteria) {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array for filtering');
    }

    return data.filter(item => {
      return criteria.every(criterion => {
        const value = this.getNestedValue(item, criterion.field);
        return this.applyCriterion(value, criterion);
      });
    });
  }

  /**
   * Data Aggregation
   */
  aggregate(data, aggregations) {
    const result = {};

    for (const [key, config] of Object.entries(aggregations)) {
      const values = data.map(item => this.getNestedValue(item, config.field))
        .filter(val => val !== null && val !== undefined);

      switch (config.operation) {
        case 'sum':
          result[key] = values.reduce((sum, val) => sum + Number(val), 0);
          break;
        case 'avg':
          result[key] = values.length > 0 ?
            values.reduce((sum, val) => sum + Number(val), 0) / values.length : 0;
          break;
        case 'min':
          result[key] = values.length > 0 ? Math.min(...values.map(Number)) : 0;
          break;
        case 'max':
          result[key] = values.length > 0 ? Math.max(...values.map(Number)) : 0;
          break;
        case 'count':
          result[key] = values.length;
          break;
        case 'distinct':
          result[key] = [...new Set(values)].length;
          break;
        default:
          logger.warn(`Unknown aggregation operation: ${config.operation}`);
      }
    }

    return result;
  }

  /**
   * Group data by specified field
   */
  groupBy(data, groupField) {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array for grouping');
    }

    return data.reduce((groups, item) => {
      const key = this.getNestedValue(item, groupField);
      const groupKey = key?.toString() || 'undefined';

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);

      return groups;
    }, {});
  }

  /**
   * Data Analysis
   */
  analyze(data, analysisType = 'basic') {
    const analysis = {
      totalCount: data.length,
      timestamp: new Date().toISOString()
    };

    switch (analysisType) {
      case 'basic':
        analysis.basicStats = this.calculateBasicStats(data);
        break;
      case 'warehouse':
        analysis.warehouseStats = this.calculateWarehouseStats(data);
        break;
      case 'inventory':
        analysis.inventoryStats = this.calculateInventoryStats(data);
        break;
      default:
        logger.warn(`Unknown analysis type: ${analysisType}`);
    }

    return analysis;
  }

  /**
   * Export data in various formats
   */
  export(data, format = 'json', options = {}) {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(data, null, options.pretty ? 2 : 0);
      case 'csv':
        return this.convertToCSV(data, options);
      case 'xml':
        return this.convertToXML(data, options);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Import data from various formats
   */
  import(dataString, format = 'json') {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.parse(dataString);
      case 'csv':
        return this.parseCSV(dataString);
      default:
        throw new Error(`Unsupported import format: ${format}`);
    }
  }

  /**
   * Helper Methods
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  applyCriterion(value, criterion) {
    switch (criterion.operator) {
      case 'equals':
        return value === criterion.value;
      case 'not_equals':
        return value !== criterion.value;
      case 'contains':
        return String(value).toLowerCase().includes(String(criterion.value).toLowerCase());
      case 'greater_than':
        return Number(value) > Number(criterion.value);
      case 'less_than':
        return Number(value) < Number(criterion.value);
      case 'greater_equal':
        return Number(value) >= Number(criterion.value);
      case 'less_equal':
        return Number(value) <= Number(criterion.value);
      case 'in':
        return Array.isArray(criterion.value) && criterion.value.includes(value);
      case 'not_in':
        return Array.isArray(criterion.value) && !criterion.value.includes(value);
      default:
        return true;
    }
  }

  calculateBasicStats(data) {
    return {
      count: data.length,
      types: this.analyzeDataTypes(data),
      nullCount: data.filter(item => item === null || item === undefined).length
    };
  }

  calculateWarehouseStats(locations) {
    const occupied = locations.filter(loc => loc.status === 'occupied');
    const empty = locations.filter(loc => loc.status === 'empty');
    const reserved = locations.filter(loc => loc.status === 'reserved');

    return {
      totalLocations: locations.length,
      occupiedCount: occupied.length,
      emptyCount: empty.length,
      reservedCount: reserved.length,
      utilizationRate: locations.length > 0 ? (occupied.length / locations.length) * 100 : 0,
      capacityUtilization: this.calculateCapacityUtilization(locations)
    };
  }

  calculateInventoryStats(inventory) {
    const totalQuantity = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalValue = inventory.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0);

    return {
      totalItems: inventory.length,
      totalQuantity,
      totalValue,
      averageValue: inventory.length > 0 ? totalValue / inventory.length : 0,
      categories: [...new Set(inventory.map(item => item.category).filter(Boolean))].length
    };
  }

  calculateCapacityUtilization(locations) {
    const totalCapacity = locations.reduce((sum, loc) => sum + (loc.capacity || 0), 0);
    const usedCapacity = locations.reduce((sum, loc) => sum + (loc.currentStock || 0), 0);

    return totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;
  }

  analyzeDataTypes(data) {
    const types = {};
    data.forEach(item => {
      const type = typeof item;
      types[type] = (types[type] || 0) + 1;
    });
    return types;
  }

  convertToCSV(data, options = {}) {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    const delimiter = options.delimiter || ',';
    const headers = options.headers || Object.keys(data[0]);

    const csvHeaders = headers.join(delimiter);
    const csvRows = data.map(row =>
      headers.map(header => {
        const value = this.getNestedValue(row, header);
        // Escape quotes and wrap in quotes if needed
        const stringValue = String(value || '');
        return stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue;
      }).join(delimiter)
    );

    return [csvHeaders, ...csvRows].join('\n');
  }

  parseCSV(csvString, options = {}) {
    const delimiter = options.delimiter || ',';
    const lines = csvString.trim().split('\n');

    if (lines.length === 0) return [];

    const headers = lines[0].split(delimiter).map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map(v => v.trim());
      const row = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      data.push(row);
    }

    return data;
  }

  convertToXML(data, options = {}) {
    const rootElement = options.rootElement || 'data';
    const itemElement = options.itemElement || 'item';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootElement}>\n`;

    data.forEach(item => {
      xml += `  <${itemElement}>\n`;
      Object.entries(item).forEach(([key, value]) => {
        xml += `    <${key}>${this.escapeXML(String(value || ''))}</${key}>\n`;
      });
      xml += `  </${itemElement}>\n`;
    });

    xml += `</${rootElement}>`;
    return xml;
  }

  escapeXML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  generateCacheKey(...args) {
    return JSON.stringify(args);
  }

  clearCache() {
    this.cache.clear();
  }

  /**
   * Register default transformers
   */
  registerDefaultTransformers() {
    // Location transformer
    this.registerTransformer('normalizeLocations', (locations) => {
      return locations.map(loc => ({
        ...loc,
        id: loc.id || `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: loc.status || 'empty',
        capacity: Number(loc.capacity) || 100,
        currentStock: Number(loc.currentStock) || 0,
        utilizationRate: loc.capacity > 0 ? (loc.currentStock / loc.capacity) * 100 : 0
      }));
    });

    // Inventory transformer
    this.registerTransformer('normalizeInventory', (inventory) => {
      return inventory.map(item => ({
        ...item,
        id: item.id || `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        quantity: Number(item.quantity) || 0,
        price: Number(item.price) || 0,
        value: (Number(item.quantity) || 0) * (Number(item.price) || 0)
      }));
    });
  }

  /**
   * Register default validators
   */
  registerDefaultValidators() {
    // Location validator
    this.registerValidator('validateLocation', (location) => {
      const errors = [];

      if (!location.name || location.name.trim() === '') {
        errors.push('Location name is required');
      }

      if (location.capacity && location.capacity < 0) {
        errors.push('Capacity must be positive');
      }

      if (location.currentStock && location.currentStock < 0) {
        errors.push('Current stock must be positive');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    });

    // Inventory validator
    this.registerValidator('validateInventory', (item) => {
      const errors = [];

      if (!item.name || item.name.trim() === '') {
        errors.push('Item name is required');
      }

      if (item.quantity && item.quantity < 0) {
        errors.push('Quantity must be positive');
      }

      if (item.price && item.price < 0) {
        errors.push('Price must be positive');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    });
  }
}

export default DataProcessor;
