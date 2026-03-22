/**
 * Core Libraries Index
 * Central export for all core warehouse management libraries
 */

// Import all modules
import { WarehouseEngine } from './WarehouseEngine';
import { DataManager } from './DataManager';
import { WarehouseStateProvider, useWarehouseState, selectors, WAREHOUSE_ACTIONS } from './StateManager';

// Re-export all modules
export { WarehouseEngine } from './WarehouseEngine';
export { DataManager } from './DataManager';
export { WarehouseStateProvider, useWarehouseState, selectors, WAREHOUSE_ACTIONS } from './StateManager';

// Combined export for easy import
export const CoreLibs = {
  WarehouseEngine,
  DataManager,
  WarehouseStateProvider,
  useWarehouseState,
  selectors,
  WAREHOUSE_ACTIONS
};

export default CoreLibs;
