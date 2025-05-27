"use client";

import { cn } from "@/libs/utils";

interface RadioGroupProps {
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  name?: string;
  className?: string;
}

export default function RadioGroup({
  options,
  value,
  onChange,
  name,
  className,
}: RadioGroupProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {options.map((option) => {
        const isSelected = value === option;
        return (
          <div
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "flex cursor-pointer items-center rounded-xl border p-3 transition-all",
              isSelected
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            )}
            role="radio"
            aria-checked={isSelected}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChange(option);
              }
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border",
                  isSelected ? "border-blue-500 p-0.5" : "border-gray-300"
                )}
              >
                {isSelected && (
                  <div className="size-3 rounded-full bg-blue-500" />
                )}
              </div>
              <span className="text-sm">{option}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
