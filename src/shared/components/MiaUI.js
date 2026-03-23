import * as LucideIcons from "lucide-react";
import logger from "../../utils/logger";
import { useMiaDesignSystem } from "../hooks/useMiaDesignSystem";

// ==================== MIA UI COMPONENTS ====================
// Thư viện components UI đồng nhất cho Warehouse Management System

// ==================== BUTTON COMPONENT ====================
export const MiaButton = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  type = "button",
  icon,
  iconPosition = "left",
  fullWidth = false,
  loading = false,
  ...props
}) => {
  const { getComponentClasses, icons } = useMiaDesignSystem();

  const IconComponent = icon && LucideIcons[icon];
  const LoadingIcon = LucideIcons[icons.refresh];

  const classes = `${getComponentClasses.button(
    variant,
    size,
    disabled || loading
  )} ${fullWidth ? "w-full" : ""}`;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <LoadingIcon size={16} className="animate-spin mr-2" />}
      {!loading && IconComponent && iconPosition === "left" && (
        <IconComponent size={16} className="mr-2" />
      )}
      {children}
      {!loading && IconComponent && iconPosition === "right" && (
        <IconComponent size={16} className="ml-2" />
      )}
    </button>
  );
};

// ==================== CARD COMPONENT ====================
export const MiaCard = ({
  children,
  variant = "default",
  padding = "md",
  className = "",
  ...props
}) => {
  const { getComponentClasses } = useMiaDesignSystem();

  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const classes = `${getComponentClasses.card(variant)} ${paddingClasses[padding]} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// ==================== BADGE COMPONENT ====================
export const MiaBadge = ({ children, variant = "default", icon, ...props }) => {
  const { getComponentClasses } = useMiaDesignSystem();
  const IconComponent = icon && LucideIcons[icon];

  const classes = getComponentClasses.badge(variant);

  return (
    <span className={classes} {...props}>
      {IconComponent && <IconComponent size={12} className="mr-1" />}
      {children}
    </span>
  );
};

// ==================== INPUT COMPONENT ====================
export const MiaInput = ({
  label,
  error,
  helperText,
  icon,
  iconPosition = "left",
  className = "",
  ...props
}) => {
  const { getComponentClasses } = useMiaDesignSystem();
  const IconComponent = icon && LucideIcons[icon];

  const inputClasses = `${getComponentClasses.input(!!error)} px-3 py-2 ${
    IconComponent ? (iconPosition === "left" ? "pl-10" : "pr-10") : ""
  } ${className}`;

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium">{label}</label>}
      <div className="relative">
        {IconComponent && iconPosition === "left" && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconComponent size={16} className="text-gray-400" />
          </div>
        )}
        <input className={inputClasses} {...props} />
        {IconComponent && iconPosition === "right" && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <IconComponent size={16} className="text-gray-400" />
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};

// ==================== SELECT COMPONENT ====================
export const MiaSelect = ({ label, options = [], error, helperText, placeholder, ...props }) => {
  const { getComponentClasses } = useMiaDesignSystem();

  const selectClasses = `${getComponentClasses.input(!!error)} px-3 py-2`;

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium">{label}</label>}
      <select className={selectClasses} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};

// ==================== AVATAR COMPONENT ====================
export const MiaAvatar = ({
  src,
  alt,
  name,
  size = "md",
  variant = "circular",
  fallbackIcon = "User",
  ...props
}) => {
  const FallbackIcon = LucideIcons[fallbackIcon];

  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
    "2xl": "w-20 h-20 text-2xl",
  };

  const variantClasses = {
    circular: "rounded-full",
    rounded: "rounded-lg",
    square: "rounded-none",
  };

  const baseClasses = `${sizeClasses[size]} ${variantClasses[variant]} flex items-center justify-center font-medium overflow-hidden`;

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (src) {
    return <img src={src} alt={alt || name} className={`${baseClasses} object-cover`} {...props} />;
  }

  if (name) {
    return (
      <div className={`${baseClasses} bg-blue-500 text-white`} {...props}>
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div className={`${baseClasses} bg-gray-300 text-gray-600`} {...props}>
      <FallbackIcon size={size === "xs" ? 12 : size === "sm" ? 16 : 20} />
    </div>
  );
};

// ==================== LOADING COMPONENT ====================
export const MiaLoading = ({ size = "md", text, variant = "spinner", ...props }) => {
  const SpinnerIcon = LucideIcons.Loader2;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  if (variant === "spinner") {
    return (
      <div className="flex items-center justify-center space-x-2" {...props}>
        <SpinnerIcon className={`${sizeClasses[size]} animate-spin`} />
        {text && <span className="text-sm">{text}</span>}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className="flex items-center justify-center space-x-1" {...props}>
        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
        <div
          className="w-2 h-2 bg-current rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-2 h-2 bg-current rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
        {text && <span className="text-sm ml-2">{text}</span>}
      </div>
    );
  }

  return null;
};

// ==================== ICON COMPONENT ====================
export const MiaIcon = ({ name, size = 16, className = "", ...props }) => {
  const IconComponent = LucideIcons[name];

  if (!IconComponent) {
    logger.warn(`Icon "${name}" not found in Lucide React`);
    return null;
  }

  return <IconComponent size={size} className={className} {...props} />;
};

// ==================== STATUS INDICATOR COMPONENT ====================
export const MiaStatusIndicator = ({ status, text, size = "sm", showText = true, ...props }) => {
  const { labels } = useMiaDesignSystem();

  const statusLabels = {
    active: labels.status.active,
    inactive: labels.status.inactive,
    pending: labels.status.pending,
    completed: labels.status.completed,
    processing: labels.status.processing,
    cancelled: labels.status.cancelled,
    success: labels.status.completed,
    warning: labels.status.pending,
    error: labels.status.cancelled,
  };

  const statusColors = {
    active: "bg-green-500",
    inactive: "bg-gray-400",
    pending: "bg-yellow-500",
    completed: "bg-green-500",
    processing: "bg-blue-500",
    cancelled: "bg-red-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  };

  const sizeClasses = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div className="flex items-center space-x-2" {...props}>
      <div
        className={`${sizeClasses[size]} ${statusColors[status] || "bg-gray-400"} rounded-full`}
      ></div>
      {showText && <span className="text-sm">{text || statusLabels[status] || status}</span>}
    </div>
  );
};

// Export all components
const MiaUIComponents = {
  MiaButton,
  MiaCard,
  MiaBadge,
  MiaInput,
  MiaSelect,
  MiaAvatar,
  MiaLoading,
  MiaIcon,
  MiaStatusIndicator,
};

export default MiaUIComponents;
