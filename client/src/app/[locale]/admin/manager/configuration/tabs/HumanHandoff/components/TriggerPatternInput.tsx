import React from "react";
import { Controller, useFormContext } from "react-hook-form";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import type { HumanHandoffFormValues } from "@/validations/humanHandoffValidation";
import Textarea from "@/components/common/Textarea";

interface TriggerPatternInputProps {
  disabled?: boolean;
}

export default function TriggerPatternInput({
  disabled,
}: TriggerPatternInputProps) {
  const { control, setValue } = useFormContext<HumanHandoffFormValues>();

  const handleReset = () => {
    setValue("triggerPattern", "123123123");
  };

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
