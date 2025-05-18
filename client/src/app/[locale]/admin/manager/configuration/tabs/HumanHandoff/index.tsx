"use client";

import { Switch } from "@heroui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import {
  defaultValues,
  type HumanHandoffFormValues,
  humanHandoffSchema,
} from "@/validations/humanHandoffValidation";

import { useConfiguration } from "../../ConfigurationContext";
import AgentAliasInput from "./components/AgentAliasInput";
import TimezoneSelector from "./components/TimezoneSelector";
import TriggerPatternInput from "./components/TriggerPatternInput";
import WorkingDaysSelector from "./components/WorkingDaysSelector";
import WorkingHoursSelector from "./components/WorkingHoursSelector";

export default function HumanHandoff() {
  const { setIsDirty, registerSaveFunction, unregisterSaveFunction } = useConfiguration();
  const tabKey = useRef(4); // HumanHandoff tab key is 4

  const methods = useForm<HumanHandoffFormValues>({
    defaultValues,
    resolver: zodResolver(humanHandoffSchema),
    mode: "onChange",
  });

  const { watch, setValue, formState } = methods;
  const enabled = watch("enabled");
  const allowSystemMessages = watch("allowSystemMessages");

  // Track form changes to update the global dirty state
  useEffect(() => {
    setIsDirty(formState.isDirty);
  }, [formState.isDirty, setIsDirty]);

  const saveConfiguration = async () => {
    try {
      // Here you would implement the save logic
      // For example:
      // await saveHumanHandoffSettings(methods.getValues());
      
      // Reset the dirty state after successful save
      methods.reset(methods.getValues());
      setIsDirty(false);
      
      toast.success("Human handoff settings saved successfully");
      return true; // Return success
    } catch (error) {
      console.error("Error saving human handoff settings:", error);
      toast.error("Failed to save human handoff settings");
      return false; // Return failure
    }
  };
  
  // Register the save function when component mounts
  useEffect(() => {
    registerSaveFunction(tabKey.current, saveConfiguration);
    
    // Unregister when component unmounts
    return () => {
      unregisterSaveFunction(tabKey.current);
    };
  }, [registerSaveFunction, unregisterSaveFunction]);

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
          <div className="flex items-center gap-3">
            <Switch
              isSelected={enabled}
              onValueChange={(value) => setValue("enabled", value)}
            />
          </div>
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
