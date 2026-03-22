/**
 * Main Libraries Index
 * Central export for all warehouse map libraries
 */

// Import all library modules
import { CoreLibs } from './core';
import { VisualizationLibs } from './visualization';
import { ChartLibs } from './charts';
import { DataProcessingLibs } from './data-processing';

// Re-export all libraries
export * from './core';
export * from './visualization';
export * from './charts';
export * from './data-processing';

// Combined export for easy import
export const WarehouseMapLibs = {
  Core: CoreLibs,
  Visualization: VisualizationLibs,
  Charts: ChartLibs,
  DataProcessing: DataProcessingLibs
};

export default WarehouseMapLibs;
