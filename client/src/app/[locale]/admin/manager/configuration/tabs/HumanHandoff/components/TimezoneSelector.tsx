import { SelectItem } from "@heroui/react";
import { Select } from "@heroui/select";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

import { cn } from "@/libs/utils";
import type { HumanHandoffFormValues } from "@/validations/humanHandoffValidation";
import { listTimezone } from "@/constants/adminConfig";

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
            {listTimezone.map((timezone) => (
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
