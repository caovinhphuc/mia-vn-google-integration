// Warehouse Map Constants
export const WAREHOUSE_CONFIG = {
  ZONES: ['A', 'B', 'C', 'D'],
  FLOORS: [1, 2, 3],
  GRID_SIZE: {
    ROWS: 10,
    COLS: 15
  },
  LOCATION_STATUS: {
    AVAILABLE: 'available',
    OCCUPIED: 'occupied',
    MAINTENANCE: 'maintenance',
    RESERVED: 'reserved'
  },
  ITEM_CATEGORIES: {
    ELECTRONICS: 'electronics',
    CLOTHING: 'clothing',
    FOOD: 'food',
    BOOKS: 'books',
    FURNITURE: 'furniture',
    TOOLS: 'tools'
  },
  STOCK_STATUS: {
    IN_STOCK: 'in-stock',
    LOW_STOCK: 'low-stock',
    OUT_OF_STOCK: 'out-of-stock'
  }
};

export const UI_COLORS = {
  PRIMARY: '#2c5aa0',
  SECONDARY: '#f8f9fa',
  SUCCESS: '#28a745',
  WARNING: '#ffc107',
  DANGER: '#dc3545',
  INFO: '#17a2b8',
  LIGHT: '#ffffff',
  DARK: '#343a40'
};

export const STATUS_COLORS = {
  [WAREHOUSE_CONFIG.LOCATION_STATUS.AVAILABLE]: '#28a745',
  [WAREHOUSE_CONFIG.LOCATION_STATUS.OCCUPIED]: '#dc3545',
  [WAREHOUSE_CONFIG.LOCATION_STATUS.MAINTENANCE]: '#ffc107',
  [WAREHOUSE_CONFIG.LOCATION_STATUS.RESERVED]: '#17a2b8'
};

export const ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500
};
