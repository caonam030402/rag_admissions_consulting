"use client";

import { cn } from "@/libs/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({
  currentStep,
  totalSteps,
}: StepIndicatorProps) {
  // Helper function to determine step color
  const getStepColor = (index: number) => {
    if (index + 1 === currentStep) return "bg-blue-600";
    if (index + 1 < currentStep) return "bg-blue-400";
    return "bg-gray-200";
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-2 px-4">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-2 flex-1 rounded-full transition-all",
              getStepColor(index),
            )}
          />
        ))}
      </div>
      {/* <p className="mt-2 text-center text-xs text-gray-500">
        Bước {currentStep} / {totalSteps}
      </p> */}
    </div>
  );
}
