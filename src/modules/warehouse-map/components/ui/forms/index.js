/**
 * UI Forms Index
 * Central export for all form components
 */

// Import all form modules
import { LocationForm } from './LocationForm';
import { InventoryForm } from './InventoryForm';

// Re-export all modules
export { LocationForm } from './LocationForm';
export { InventoryForm } from './InventoryForm';

// Combined export for easy import
export const FormComponents = {
  LocationForm,
  InventoryForm
};

export default FormComponents;
