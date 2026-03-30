"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "white";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants = {
  primary:
    "bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-sm hover:shadow-md focus-visible:ring-brand-500",
  secondary:
    "bg-dark-100 hover:bg-dark-200 active:bg-dark-300 text-white shadow-sm focus-visible:ring-dark-100",
  outline:
    "border-2 border-current text-brand-500 hover:bg-brand-500 hover:text-white hover:border-brand-500 focus-visible:ring-brand-500",
  ghost:
    "hover:bg-gray-100 text-gray-700 active:bg-gray-200 focus-visible:ring-gray-300",
  destructive:
    "bg-red-500 hover:bg-red-600 text-white focus-visible:ring-red-500",
  white:
    "bg-white hover:bg-gray-50 text-gray-900 shadow-sm hover:shadow-md focus-visible:ring-gray-300",
};

const sizes = {
  xs: "h-7 px-3 text-xs rounded-md gap-1",
  sm: "h-9 px-4 text-sm rounded-lg gap-1.5",
  md: "h-11 px-5 text-sm rounded-lg gap-2",
  lg: "h-12 px-7 text-base rounded-xl gap-2",
  xl: "h-14 px-8 text-base rounded-xl gap-2 font-semibold",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium",
          "transition-all duration-200 ease-smooth",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          "select-none cursor-pointer",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
