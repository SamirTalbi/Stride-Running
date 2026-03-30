import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "brand" | "success" | "warning" | "error" | "info" | "outline";
  size?: "sm" | "md";
  className?: string;
}

const variants = {
  default: "bg-gray-100 text-gray-700",
  brand: "bg-brand-500 text-white",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  error: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  outline: "border border-gray-300 text-gray-600",
};

const sizes = {
  sm: "text-xs px-2 py-0.5 rounded-md",
  md: "text-sm px-2.5 py-1 rounded-lg",
};

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center font-medium", variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
