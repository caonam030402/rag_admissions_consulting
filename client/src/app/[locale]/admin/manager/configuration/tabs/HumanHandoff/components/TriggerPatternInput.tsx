import React from "react";
import { Controller, useFormContext } from "react-hook-form";

import Textarea from "@/components/common/Textarea";
import type { HumanHandoffFormValues } from "@/validations/humanHandoffValidation";

interface TriggerPatternInputProps {
  disabled?: boolean;
}

export default function TriggerPatternInput({
  disabled,
}: TriggerPatternInputProps) {
  const { control } = useFormContext<HumanHandoffFormValues>();

  return (
    <div className="my-4">
      <Controller
        name="triggerPattern"
        control={control}
        render={({ field, fieldState }) => (
          <Textarea
            label="Trigger Pattern"
            labelPlacement="outside"
            value={field.value}
            onChange={field.onChange}
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
            placeholder="Enter trigger pattern"
            isDisabled={disabled}
          />
        )}
      />
    </div>
  );
}
