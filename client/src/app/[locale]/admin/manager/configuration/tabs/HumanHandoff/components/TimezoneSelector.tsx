import { SelectItem } from "@heroui/react";
import { Select } from "@heroui/select";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

import { cn } from "@/libs/utils";
import type { HumanHandoffFormValues } from "@/validations/humanHandoffValidation";

const timezones = [
  { value: "Asia/Kolkata+05:30", label: "Asia/Kolkata+05:30" },
  { value: "UTC+00:00", label: "UTC+00:00" },
  { value: "America/New_York-05:00", label: "America/New_York-05:00" },
  { value: "Europe/London+00:00", label: "Europe/London+00:00" },
  { value: "Europe/Paris+01:00", label: "Europe/Paris+01:00" },
  { value: "Asia/Tokyo+09:00", label: "Asia/Tokyo+09:00" },
];

interface TimezoneSelectorProps {
  disabled?: boolean;
}

export default function TimezoneSelector({ disabled }: TimezoneSelectorProps) {
  const { control } = useFormContext<HumanHandoffFormValues>();

  return (
    <div className="my-4">
      <div className={cn("mb-2 font-medium", disabled && "text-gray-500")}>
        Timezone
      </div>
      <Controller
        name="timezone"
        control={control}
        render={({ field, fieldState }) => (
          <Select
            placeholder="Select Timezone"
            selectedKeys={[field.value]}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0]?.toString();
              if (selected) field.onChange(selected);
            }}
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
            className="w-full"
            isDisabled={disabled}
          >
            {timezones.map((timezone) => (
              <SelectItem key={timezone.value} value={timezone.value}>
                {timezone.label}
              </SelectItem>
            ))}
          </Select>
        )}
      />
    </div>
  );
}
