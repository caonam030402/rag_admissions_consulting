"use client";

import { Switch } from "@heroui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import Card from "@/components/common/Card";
import {
  defaultValues,
  humanHandoffSchema,
  type HumanHandoffFormValues,
} from "@/validations/humanHandoffValidation";

import AgentAliasInput from "./components/AgentAliasInput";
import TimezoneSelector from "./components/TimezoneSelector";
import TriggerPatternInput from "./components/TriggerPatternInput";
import WorkingDaysSelector from "./components/WorkingDaysSelector";
import WorkingHoursSelector from "./components/WorkingHoursSelector";

interface HumanHandoffProps {
  onFormChange?: (isDirty: boolean) => void;
}

export default function HumanHandoff({ onFormChange }: HumanHandoffProps) {
  const methods = useForm<HumanHandoffFormValues>({
    defaultValues,
    resolver: zodResolver(humanHandoffSchema),
    mode: "onChange",
  });

  const { watch, setValue } = methods;
  const enabled = watch("enabled");
  const allowSystemMessages = watch("allowSystemMessages");

  // Notify parent component about form changes
  useEffect(() => {
    const subscription = methods.watch(() => {
      if (onFormChange) {
        onFormChange(methods.formState.isDirty);
      }
    });
    return () => subscription.unsubscribe();
  }, [methods, onFormChange]);

  return (
    <Card
      className="h-[calc(100vh-210px)] overflow-y-auto"
      header={
        <div className="flex w-full items-center justify-between">
          <div>
            <div>Human Handoff Settings</div>
            <p className="text-xs">
              Enable seamless transitions from automated Copilot responses to
              live agents for better user support.
            </p>
          </div>
          <Switch
            isSelected={enabled}
            onValueChange={(value) => setValue("enabled", value)}
          />
        </div>
      }
    >
      <FormProvider {...methods}>
        <div className="space-y-6">
          <AgentAliasInput disabled={!enabled} />

          <TriggerPatternInput disabled={!enabled} />

          <TimezoneSelector disabled={!enabled} />

          <WorkingDaysSelector disabled={!enabled} />

          <WorkingHoursSelector disabled={!enabled} />

          <div>
            <div className="flex w-full items-center justify-between">
              <div>
                <div className="mb-1 text-sm font-medium">
                  Allow System Messages
                </div>
                <p className="text-xs text-gray-500">
                  When enabled, users will see system messages such as agent
                  requested, agent joined, call started, and more.
                </p>
              </div>
              <Switch
                isSelected={allowSystemMessages}
                onValueChange={(value) =>
                  setValue("allowSystemMessages", value)
                }
                isDisabled={!enabled}
              />
            </div>
          </div>
        </div>
      </FormProvider>
    </Card>
  );
}
