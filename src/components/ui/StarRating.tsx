import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStarRating } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

const sizes = { sm: 12, md: 16, lg: 20 };

export function StarRating({ rating, reviewCount, size = "sm", showCount = true, className }: StarRatingProps) {
  const { full, half, empty } = getStarRating(rating);
  const iconSize = sizes[size];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: full }).map((_, i) => (
          <Star key={`f${i}`} size={iconSize} className="fill-amber-400 text-amber-400" />
        ))}
        {half && (
          <span className="relative inline-block" style={{ width: iconSize, height: iconSize }}>
            <Star size={iconSize} className="text-gray-200 fill-gray-200 absolute inset-0" />
            <span className="absolute inset-0 overflow-hidden w-1/2">
              <Star size={iconSize} className="fill-amber-400 text-amber-400" />
            </span>
          </span>
        )}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`e${i}`} size={iconSize} className="fill-gray-200 text-gray-200" />
        ))}
      </div>
      {showCount && reviewCount !== undefined && (
        <span className={cn(
          "text-gray-500",
          size === "sm" && "text-xs",
          size === "md" && "text-sm",
          size === "lg" && "text-base",
        )}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
