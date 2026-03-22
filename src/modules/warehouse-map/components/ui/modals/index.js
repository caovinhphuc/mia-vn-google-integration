/**
 * UI Modals Index
 * Central export for all modal components
 */

// Import all modal modules
import { Modal } from './Modal';
import { LocationDetailsModal } from './LocationDetailsModal';

// Re-export all modules
export { Modal } from './Modal';
export { LocationDetailsModal } from './LocationDetailsModal';

// Combined export for easy import
export const ModalComponents = {
  Modal,
  LocationDetailsModal
};

export default ModalComponents;
