import logger from "../../../../utils/logger";
/**
 * DataManager - Centralized data management system
 * Handles data persistence, caching, and synchronization
 */

export class DataManager {
  constructor(config = {}) {
    this.config = {
      storageType: 'localStorage', // localStorage, sessionStorage, indexedDB
      autoSync: true,
      syncInterval: 30000, // 30 seconds
      compression: false,
      encryption: false,
      ...config
    };

    this.cache = new Map();
    this.syncQueue = [];
    this.isOnline = navigator.onLine;

    this.initialize();
  }

  /**
   * Initialize data manager
   */
  initialize() {
    this.setupEventListeners();
    this.loadFromStorage();

    if (this.config.autoSync) {
      this.startAutoSync();
    }

    logger.info('[DataManager] Initialized with config:', this.config);
  }

  /**
   * Setup event listeners for online/offline detection
   */
  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Storage Operations
   */
  save(key, data, options = {}) {
    try {
      const timestamp = Date.now();
      const dataPacket = {
        data,
        timestamp,
        version: '1.0',
        metadata: options.metadata || {}
      };

      // Cache the data
      this.cache.set(key, dataPacket);

      // Save to persistent storage
      this.saveToStorage(key, dataPacket);

      logger.info('[DataManager] Saved data for key:', key);
      return true;
    } catch (error) {
      logger.error('[DataManager] Error saving data:', error);
      return false;
    }
  }

  load(key, defaultValue = null) {
    try {
      // Try cache first
      if (this.cache.has(key)) {
        const packet = this.cache.get(key);
        logger.info('[DataManager] Loaded from cache:', key);
        return packet.data;
      }

      // Try persistent storage
      const packet = this.loadFromStorage(key);
      if (packet) {
        this.cache.set(key, packet);
        logger.info('[DataManager] Loaded from storage:', key);
        return packet.data;
      }

      logger.info('[DataManager] No data found for key:', key);
      return defaultValue;
    } catch (error) {
      logger.error('[DataManager] Error loading data:', error);
      return defaultValue;
    }
  }

  remove(key) {
    try {
      this.cache.delete(key);
      this.removeFromStorage(key);
      logger.info('[DataManager] Removed data for key:', key);
      return true;
    } catch (error) {
      logger.error('[DataManager] Error removing data:', error);
      return false;
    }
  }

  /**
   * Batch Operations
   */
  saveBatch(dataMap) {
    const results = {};
    for (const [key, data] of dataMap) {
      results[key] = this.save(key, data);
    }
    return results;
  }

  loadBatch(keys) {
    const results = {};
    for (const key of keys) {
      results[key] = this.load(key);
    }
    return results;
  }

  /**
   * Storage Implementation
   */
  saveToStorage(key, dataPacket) {
    // TODO: Implement different storage types
    switch (this.config.storageType) {
      case 'localStorage':
        localStorage.setItem(`warehouse_${key}`, JSON.stringify(dataPacket));
        break;
      case 'sessionStorage':
        sessionStorage.setItem(`warehouse_${key}`, JSON.stringify(dataPacket));
        break;
      case 'indexedDB':
        // TODO: Implement IndexedDB
        logger.info('[DataManager] IndexedDB not implemented yet');
        break;
      default:
        logger.warn('[DataManager] Unknown storage type:', this.config.storageType);
    }
  }

  loadFromStorage(key) {
    try {
      switch (this.config.storageType) {
        case 'localStorage':
          const data = localStorage.getItem(`warehouse_${key}`);
          return data ? JSON.parse(data) : null;
        case 'sessionStorage':
          const sessionData = sessionStorage.getItem(`warehouse_${key}`);
          return sessionData ? JSON.parse(sessionData) : null;
        case 'indexedDB':
          // TODO: Implement IndexedDB
          logger.info('[DataManager] IndexedDB not implemented yet');
          return null;
        default:
          logger.warn('[DataManager] Unknown storage type:', this.config.storageType);
          return null;
      }
    } catch (error) {
      logger.error('[DataManager] Error loading from storage:', error);
      return null;
    }
  }

  removeFromStorage(key) {
    switch (this.config.storageType) {
      case 'localStorage':
        localStorage.removeItem(`warehouse_${key}`);
        break;
      case 'sessionStorage':
        sessionStorage.removeItem(`warehouse_${key}`);
        break;
      case 'indexedDB':
        // TODO: Implement IndexedDB
        logger.info('[DataManager] IndexedDB not implemented yet');
        break;
      default:
        logger.warn('[DataManager] Unknown storage type for removal:', this.config.storageType);
        break;
    }
  }

  /**
   * Synchronization
   */
  addToSyncQueue(operation) {
    this.syncQueue.push({
      ...operation,
      timestamp: Date.now(),
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
  }

  processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    logger.info('[DataManager] Processing sync queue:', this.syncQueue.length, 'items');
    // TODO: Implement actual sync logic
    this.syncQueue = [];
  }

  startAutoSync() {
    setInterval(() => {
      this.processSyncQueue();
    }, this.config.syncInterval);
  }

  /**
   * Cache Management
   */
  clearCache() {
    this.cache.clear();
    logger.info('[DataManager] Cache cleared');
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Import/Export
   */
  exportAll() {
    const data = {};
    for (const [key, packet] of this.cache) {
      data[key] = packet;
    }
    return data;
  }

  importAll(data) {
    for (const [key, packet] of Object.entries(data)) {
      this.cache.set(key, packet);
      this.saveToStorage(key, packet);
    }
    logger.info('[DataManager] Imported data for', Object.keys(data).length, 'keys');
  }
}

export default DataManager;
