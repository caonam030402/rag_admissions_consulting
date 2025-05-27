"use client";

import { cn } from "@/libs/utils";

interface CheckboxGroupProps {
  options: string[];
  value?: string[];
  onChange: (value: string[]) => void;
  name?: string;
  className?: string;
  gridCols?: "1" | "2";
}

export default function CheckboxGroup({
  options,
  value = [],
  onChange,
  name,
  className,
  gridCols = "2",
}: CheckboxGroupProps) {
  const handleToggle = (option: string) => {
    const isSelected = value.includes(option);
    const newValue = isSelected
      ? value.filter((item) => item !== option)
      : [...value, option];
    onChange(newValue);
  };

  return (
    <div
      className={cn(
        "grid gap-3",
        gridCols === "2" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1",
        className,
      )}
    >
      {options.map((option) => {
        const isSelected = value.includes(option);
        return (
          <div
            key={option}
            onClick={() => handleToggle(option)}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-xl border p-3 transition-all",
              isSelected
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
            )}
            role="checkbox"
            aria-checked={isSelected}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleToggle(option);
              }
            }}
          >
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded border",
                isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300",
              )}
            >
              {isSelected && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="white"
                  className="size-3"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.739a.75.75 0 0 1 1.04-.208Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span className="text-sm">{option}</span>
          </div>
        );
      })}
    </div>
  );
}
