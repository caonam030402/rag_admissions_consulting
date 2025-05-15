import React from "react";
import { Controller, useFormContext } from "react-hook-form";

import Input from "@/components/common/Input";
import type { HumanHandoffFormValues } from "@/validations/humanHandoffValidation";

interface AgentAliasInputProps {
  disabled?: boolean;
}

export default function AgentAliasInput({ disabled }: AgentAliasInputProps) {
  const { control } = useFormContext<HumanHandoffFormValues>();
  const maxLength = 20;

  return (
    <div className="my-4">
      <Controller
        name="agentAlias"
        control={control}
        render={({ field, fieldState }) => (
          <div>
            <Input
              label="Agent Alias"
              labelPlacement="outside"
              value={field.value}
              onChange={field.onChange}
              isInvalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              maxLength={maxLength}
              isDisabled={disabled}
            />
            <div className="mt-1 text-right text-xs text-gray-500">
              {field.value.length} / {maxLength}
            </div>
          </div>
        )}
      />
    </div>
  );
}
