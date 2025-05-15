import { Checkbox } from "@heroui/checkbox";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

import { cn } from "@/libs/utils";
import type { HumanHandoffFormValues } from "@/validations/humanHandoffValidation";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface WorkingDaysSelectorProps {
  disabled?: boolean;
}

export default function WorkingDaysSelector({
  disabled,
}: WorkingDaysSelectorProps) {
  const { control } = useFormContext<HumanHandoffFormValues>();

  return (
    <div className="my-4">
      <div
        className={cn("mb-2 font-medium text-sm", disabled && "text-gray-500")}
      >
        Select Working Days
      </div>
      <div className="flex flex-wrap gap-3">
        {days.map((day, index) => (
          <Controller
            key={day}
            name={`workingDays.${index}`}
            control={control}
            render={({ field }) => (
              <Checkbox
                isSelected={field.value}
                onValueChange={field.onChange}
                color="primary"
                isDisabled={disabled}
              >
                <div className="text-sm">{day}</div>
              </Checkbox>
            )}
          />
        ))}
      </div>
    </div>
  );
}
