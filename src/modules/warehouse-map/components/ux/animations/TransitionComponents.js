/**
 * Fade Transition Component
 * Smooth fade in/out animations for UI elements
 */

import React, { useState, useEffect } from 'react';

export function FadeTransition({
  children,
  show = true,
  duration = 300,
  delay = 0,
  className = '',
  onEnter,
  onExit,
  unmountOnExit = true
}) {
  const [shouldRender, setShouldRender] = useState(show);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId;

    if (show) {
      setShouldRender(true);
      timeoutId = setTimeout(() => {
        setIsVisible(true);
        onEnter?.();
      }, delay);
    } else {
      setIsVisible(false);
      onExit?.();

      if (unmountOnExit) {
        timeoutId = setTimeout(() => {
          setShouldRender(false);
        }, duration);
      }
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [show, delay, duration, onEnter, onExit, unmountOnExit]);

  if (!shouldRender) {
    return null;
  }

  const transitionStyle = {
    opacity: isVisible ? 1 : 0,
    transition: `opacity ${duration}ms ease-in-out`,
  };

  return (
    <div className={className} style={transitionStyle}>
      {children}
    </div>
  );
}

/**
 * Slide Transition Component
 * Slide in/out animations from different directions
 */
export function SlideTransition({
  children,
  show = true,
  direction = 'right', // 'left', 'right', 'up', 'down'
  duration = 300,
  delay = 0,
  distance = 20,
  className = '',
  onEnter,
  onExit,
  unmountOnExit = true
}) {
  const [shouldRender, setShouldRender] = useState(show);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId;

    if (show) {
      setShouldRender(true);
      timeoutId = setTimeout(() => {
        setIsVisible(true);
        onEnter?.();
      }, delay);
    } else {
      setIsVisible(false);
      onExit?.();

      if (unmountOnExit) {
        timeoutId = setTimeout(() => {
          setShouldRender(false);
        }, duration);
      }
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [show, delay, duration, onEnter, onExit, unmountOnExit]);

  if (!shouldRender) {
    return null;
  }

  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case 'left':
          return `translateX(-${distance}px)`;
        case 'right':
          return `translateX(${distance}px)`;
        case 'up':
          return `translateY(-${distance}px)`;
        case 'down':
          return `translateY(${distance}px)`;
        default:
          return `translateX(${distance}px)`;
      }
    }
    return 'translateX(0) translateY(0)';
  };

  const transitionStyle = {
    opacity: isVisible ? 1 : 0,
    transform: getTransform(),
    transition: `all ${duration}ms ease-in-out`,
  };

  return (
    <div className={className} style={transitionStyle}>
      {children}
    </div>
  );
}

/**
 * Scale Transition Component
 * Scale in/out animations for attention-grabbing effects
 */
export function ScaleTransition({
  children,
  show = true,
  duration = 300,
  delay = 0,
  scale = 0.95,
  className = '',
  onEnter,
  onExit,
  unmountOnExit = true
}) {
  const [shouldRender, setShouldRender] = useState(show);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId;

    if (show) {
      setShouldRender(true);
      timeoutId = setTimeout(() => {
        setIsVisible(true);
        onEnter?.();
      }, delay);
    } else {
      setIsVisible(false);
      onExit?.();

      if (unmountOnExit) {
        timeoutId = setTimeout(() => {
          setShouldRender(false);
        }, duration);
      }
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [show, delay, duration, onEnter, onExit, unmountOnExit]);

  if (!shouldRender) {
    return null;
  }

  const transitionStyle = {
    opacity: isVisible ? 1 : 0,
    transform: `scale(${isVisible ? 1 : scale})`,
    transition: `all ${duration}ms ease-in-out`,
  };

  return (
    <div className={className} style={transitionStyle}>
      {children}
    </div>
  );
}

/**
 * Loading Spinner Component
 * Animated loading indicator
 */
export function LoadingSpinner({
  size = 'medium',
  color = 'blue',
  className = ''
}) {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'medium':
        return 'w-6 h-6';
      case 'large':
        return 'w-8 h-8';
      case 'xlarge':
        return 'w-12 h-12';
      default:
        return 'w-6 h-6';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'text-blue-600';
      case 'green':
        return 'text-green-600';
      case 'red':
        return 'text-red-600';
      case 'yellow':
        return 'text-yellow-600';
      case 'purple':
        return 'text-purple-600';
      case 'gray':
        return 'text-gray-600';
      case 'white':
        return 'text-white';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className={`animate-spin ${getSizeClasses()} ${getColorClasses()} ${className}`}>
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

/**
 * Pulse Animation Component
 * Continuous pulse effect for highlighting elements
 */
export function PulseAnimation({
  children,
  color = 'blue',
  intensity = 'medium',
  className = ''
}) {
  const getIntensityClasses = () => {
    switch (intensity) {
      case 'light':
        return 'animate-pulse';
      case 'medium':
        return 'animate-pulse';
      case 'strong':
        return 'animate-pulse';
      default:
        return 'animate-pulse';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100';
      case 'green':
        return 'bg-green-100';
      case 'red':
        return 'bg-red-100';
      case 'yellow':
        return 'bg-yellow-100';
      case 'purple':
        return 'bg-purple-100';
      default:
        return 'bg-blue-100';
    }
  };

  return (
    <div className={`${getIntensityClasses()} ${getColorClasses()} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Bounce Animation Component
 * Attention-grabbing bounce effect
 */
export function BounceAnimation({
  children,
  trigger = false,
  duration = 1000,
  className = ''
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsAnimating(true);
      const timeoutId = setTimeout(() => {
        setIsAnimating(false);
      }, duration);

      return () => clearTimeout(timeoutId);
    }
  }, [trigger, duration]);

  return (
    <div
      className={`${isAnimating ? 'animate-bounce' : ''} ${className}`}
      style={{
        animationDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
}

/**
 * Shimmer Loading Effect
 * Skeleton loading animation for content placeholders
 */
export function ShimmerEffect({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  className = ''
}) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] ${className}`}
      style={{
        width,
        height,
        borderRadius,
        animation: 'shimmer 2s infinite linear'
      }}
    >
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Stagger Animation Container
 * Animates children with staggered delays
 */
export function StaggerContainer({
  children,
  show = true,
  staggerDelay = 100,
  className = ''
}) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <FadeTransition
          key={index}
          show={show}
          delay={index * staggerDelay}
        >
          {child}
        </FadeTransition>
      ))}
    </div>
  );
}

const AnimationComponents = {
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
