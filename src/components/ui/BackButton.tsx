"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  label?: string;
  className?: string;
}

export function BackButton({ label = "Retour", className }: BackButtonProps) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium text-gray-500",
        "hover:text-brand-500 transition-colors duration-150",
        className
      )}
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}
