// src/shared/components/ui/Button.jsx
import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  onClick,
  disabled = false,
  fullWidth = false,
  className = "",
  type = "button",
}) => {
  const baseStyles = "font-medium rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2";

  const variants = {
    primary: "bg-secondary-500 text-white hover:bg-secondary-600 active:scale-95 disabled:bg-neutral-300",
    secondary: "bg-warning-400 text-white hover:bg-warning-500 active:scale-95",
    dark: "bg-black text-white hover:opacity-90 active:scale-95",
    outline: "border-2 border-secondary-500 text-secondary-600 hover:bg-secondary-50",
    ghost: "text-neutral-700 hover:bg-neutral-100",
    danger: "bg-danger-500 text-white hover:bg-danger-600",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${disabled ? "cursor-not-allowed opacity-50" : ""}
        ${className}
      `}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
