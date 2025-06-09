"use client";

import { Switch } from "@heroui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import Card from "@/components/common/Card";
import { chatbotConfigService } from "@/services/chatbot-config";
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
  const { setIsDirty, registerSaveFunction, unregisterSaveFunction } =
    useConfiguration();
  const tabKey = useRef(5); // HumanHandoff tab key is 5

  // Get current config data
  const { data: configData, isLoading } =
    chatbotConfigService.useGetActiveConfig();
  const updateHumanHandoff = chatbotConfigService.useUpdateHumanHandoff();

  const methods = useForm<HumanHandoffFormValues>({
    defaultValues,
    resolver: zodResolver(humanHandoffSchema),
    mode: "all", // Change mode to track all changes
  });

  const { watch, formState, reset } = methods;
  const enabled = watch("enabled");

  // Update form when config data loads
  useEffect(() => {
    if (configData) {
      const config = configData.humanHandoff;

      // Convert working days from string array to boolean array
      const workingDaysArray = [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ];
      const dayMapping = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      config.workingDays?.forEach((day) => {
        const index = dayMapping.indexOf(day);
        if (index !== -1) workingDaysArray[index] = true;
      });

      // Convert working hours from object to array format
      const workingHoursArray = Array(7).fill({ from: "09:00", to: "18:00" });
      if (config.workingHours) {
        dayMapping.forEach((day, index) => {
          const dayHours =
            config.workingHours[day as keyof typeof config.workingHours];
          if (dayHours) {
            workingHoursArray[index] = {
              from: dayHours.start,
              to: dayHours.end,
            };
          }
        });
      }

      const formValues: HumanHandoffFormValues = {
        enabled: config.enabled,
        agentAlias: config.agentAlias || "Agent",
        triggerPattern: config.triggerPattern || "support,help,agent",
        timezone: config.timezone || "Asia/Ho_Chi_Minh",
        workingDays: workingDaysArray,
        workingHours: workingHoursArray,
        timeoutDuration: config.timeoutDuration || 60,
        allowSystemMessages: true, // Keep default value
      };
      reset(formValues);
    }
  }, [configData, reset]);

  // Track form changes to update the global dirty state
  useEffect(() => {
    setIsDirty(formState.isDirty);
  }, [formState.isDirty, setIsDirty, methods]);

  const saveConfiguration = async (): Promise<boolean> => {
    try {
      const formData = methods.getValues();

      // Convert working days from boolean array to string array
      const dayMapping = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const workingDaysStringArray = dayMapping.filter(
        (_, index) => formData.workingDays[index],
      );

      // Convert working hours from array format to object format
      const workingHoursObject: Record<
        string,
        { start: string; end: string; hours?: string }
      > = {};
      dayMapping.forEach((day, index) => {
        if (formData.workingDays[index] && formData.workingHours[index]) {
          const hours = formData.workingHours[index];
          const startTime = new Date(`2000-01-01 ${hours.from}`);
          const endTime = new Date(`2000-01-01 ${hours.to}`);
          const diffMs = endTime.getTime() - startTime.getTime();
          const diffHours = Math.round(diffMs / (1000 * 60 * 60));

          workingHoursObject[day] = {
            start: hours.from,
            end: hours.to,
            hours: `${diffHours} hrs`,
          };
        }
      });

      const updateData = {
        humanHandoff: {
          enabled: formData.enabled,
          agentAlias: formData.agentAlias,
          triggerPattern: formData.triggerPattern,
          timezone: formData.timezone,
          workingDays: workingDaysStringArray,
          workingHours: workingHoursObject,
          timeoutDuration: formData.timeoutDuration,
          showEscalationButton: formData.enabled,
          escalationButtonText: "Contact Support",
          maxWaitTime: Math.round(formData.timeoutDuration / 60), // Convert seconds to minutes
          triggerKeywords: formData.triggerPattern
            .split(",")
            .map((k) => k.trim()),
          agentAvailableMessage: `Hello! ${formData.agentAlias} is here to help you.`,
          agentUnavailableMessage:
            "All agents are currently busy. We'll get back to you soon.",
        },
      };

      await updateHumanHandoff.mutateAsync(updateData);

      // Reset the dirty state after successful save
      methods.reset(methods.getValues());
      setIsDirty(false);

      toast.success("Human handoff settings saved successfully");
      return true;
    } catch (error) {
      console.error("Error saving human handoff settings:", error);
      toast.error("Failed to save human handoff settings");
      return false;
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

  if (isLoading) {
    return (
      <Card className="h-[calc(100vh-210px)]">
        <div className="flex h-full items-center justify-center">
          <div>Loading human handoff settings...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="scroll h-[calc(100vh-160px)]"
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
            <Controller
              name="enabled"
              control={methods.control}
              render={({ field }) => (
                <Switch
                  isSelected={field.value}
                  onValueChange={field.onChange}
                />
              )}
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
              <Controller
                name="allowSystemMessages"
                control={methods.control}
                render={({ field }) => (
                  <Switch
                    isSelected={field.value}
                    onValueChange={field.onChange}
                    isDisabled={!enabled}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </FormProvider>
    </Card>
  );
}
