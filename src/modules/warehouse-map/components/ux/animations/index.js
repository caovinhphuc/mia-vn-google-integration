/**
 * UX Animations Index
 * Central export for all animation components
 */

// Import all animation modules
import AnimationComponents, {
  FadeTransition,
  SlideTransition,
  ScaleTransition,
  LoadingSpinner,
  PulseAnimation,
  BounceAnimation,
  ShimmerEffect,
  StaggerContainer
} from './TransitionComponents';

// Re-export all modules
export {
  FadeTransition,
  SlideTransition,
  ScaleTransition,
  LoadingSpinner,
  PulseAnimation,
  BounceAnimation,
  ShimmerEffect,
  StaggerContainer
} from './TransitionComponents';

// Combined export for easy import
export const AnimationLibs = {
  FadeTransition,
  SlideTransition,
  ScaleTransition,
  LoadingSpinner,
  PulseAnimation,
  BounceAnimation,
  ShimmerEffect,
  StaggerContainer
};

export default AnimationComponents;
