"use client";

import { cn } from "@/libs/utils";

interface RatingScaleProps {
  value?: number;
  onChange: (value: number) => void;
  name?: string;
  min?: number;
  max?: number;
  labels?: {
    start: string;
    end: string;
  };
  className?: string;
}

export default function RatingScale({
  value,
  onChange,
  name,
  min = 1,
  max = 5,
  labels = { start: "Thấp", end: "Cao" },
  className,
}: RatingScaleProps) {
  const levels = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Labels */}
      <div className="flex items-center justify-between px-2">
        <span className="text-sm font-medium text-gray-600">
          {labels.start}
        </span>
        <span className="text-sm font-medium text-gray-600">{labels.end}</span>
      </div>

      {/* Rating buttons */}
      <div className="flex items-center justify-between gap-2">
        {levels.map((level) => {
          const isSelected = value === level;
          return (
            <button
              key={level}
              type="button"
              className={cn(
                "group relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-200 hover:scale-105",
                isSelected
                  ? "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-200"
                  : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md"
              )}
              onClick={() => onChange(level)}
              aria-label={`Đánh giá ${level} điểm`}
            >
              <span className="text-base font-semibold">{level}</span>

              {/* Tooltip on hover */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 transform opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg">
                  {level} điểm
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
