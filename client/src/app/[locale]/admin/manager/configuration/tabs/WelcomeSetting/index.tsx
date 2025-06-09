"use client";

import { Switch } from "@heroui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkle } from "@phosphor-icons/react";
import React, { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { type FieldValues } from "react-hook-form";

import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import InputAddMore from "@/components/common/InputAddMore";
import Textarea from "@/components/common/Textarea";
import { chatbotConfigService } from "@/services/chatbot-config";
import type { WelcomeSettingValidation } from "@/validations";
import { welcomeSettingValidation } from "@/validations";

import { useConfiguration } from "../../ConfigurationContext";

const MAX_TITLE = 50;
const MAX_SUBTITLE = 100;
const MAX_CONVERSATION = 10;
const MAX_CONVERSATION_LENGTH = 100;
const MAX_PLACEHOLDER = 100;

const defaultValues: WelcomeSettingValidation = {
  title: "Ned",
  subtitle: "I am a helpful assistant.",
  conversationStarters: [],
  placeholderText: "Type your question ...",
  autoSuggestions: true,
};

export default function WelcomeSetting() {
  const { setIsDirty, registerSaveFunction, unregisterSaveFunction } =
    useConfiguration();
  const tabKey = useRef(3);

  // Get current config data
  const { data: configData, isLoading } = chatbotConfigService.useGetActiveConfig();
  const updateWelcomeSettings = chatbotConfigService.useUpdateWelcomeSettings();

  // Main form for the entire component
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, dirtyFields },
    watch,
    reset,
  } = useForm<WelcomeSettingValidation>({
    resolver: zodResolver(welcomeSettingValidation),
    defaultValues,
    mode: "onChange",
  });

  // Separate form specifically for InputAddMore
  const inputAddMoreForm = useForm<FieldValues>({
    defaultValues: {
      conversationStarters0: "",
      conversationStarters1: "",
    },
  });

  // Update form when config data loads
  useEffect(() => {
    if (configData) {
      const formValues = {
        title: configData.welcomeSettings.welcomeMessage,
        subtitle: configData.welcomeSettings.welcomeMessage,
        conversationStarters: configData.welcomeSettings.suggestedQuestions || [],
        placeholderText: "Type your question ...",
        autoSuggestions: configData.welcomeSettings.showSuggestedQuestions,
      };
      reset(formValues);
    }
  }, [configData, reset]);

  // Initialize InputAddMore with existing conversationStarters if available
  useEffect(() => {
    const existingStarters = watch("conversationStarters");
    if (existingStarters && existingStarters.length > 0) {
      existingStarters.forEach((starter, index) => {
        if (starter) {
          inputAddMoreForm.setValue(`conversationStarters${index}`, starter);
        }
      });
    }
  }, []);

  const title = watch("title");
  const subtitle = watch("subtitle");
  const conversationStarters = watch("conversationStarters");
  const placeholderText = watch("placeholderText");
  const autoSuggestions = watch("autoSuggestions");

  // Track all fields for changes
  useEffect(() => {
    const hasChanges = isDirty && Object.keys(dirtyFields).length > 0;

    // Update the global dirty state - this is critical for tab switching
    if (hasChanges) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [
    isDirty,
    dirtyFields,
    setIsDirty,
    title,
    subtitle,
    conversationStarters,
    placeholderText,
    autoSuggestions,
  ]);

  const saveConfiguration = async (): Promise<boolean> => {
    try {
      await handleSubmit(async (formData) => {
        const updateData = {
          welcomeSettings: {
            welcomeMessage: formData.title,
            showWelcomeMessage: true,
            autoGreet: true,
            greetingDelay: 1000,
            suggestedQuestions: formData.conversationStarters,
            showSuggestedQuestions: formData.autoSuggestions,
          },
        };

        await updateWelcomeSettings.mutateAsync(updateData);
      })();
      return true;
    } catch (error) {
      console.error("Save failed:", error);
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
        <div className="flex justify-center items-center h-full">
          <div>Loading welcome settings...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      header={
        <div className="flex w-full justify-between">
          <div>
            <div>Welcome Content</div>
            <p className="text-xs">
              Customize how your Copilot greets users and behaves at the start
              of interactions for a smooth user experience.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              color="primary"
              variant="ghost"
              size="sm"
              startContent={<Sparkle size={15} weight="fill" />}
            >
              AI Agent
            </Button>
          </div>
        </div>
      }
      className="scroll h-[calc(100vh-160px)]"
    >
      <form>
        {/* Welcome Content Section */}
        <div>
          <div>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Title"
                  labelPlacement="outside"
                  placeholder="Hi, Now can i help you ?"
                  maxLength={MAX_TITLE}
                  errorMessage={errors.title?.message as string}
                  isInvalid={!!errors.title}
                />
              )}
            />
            <div className="mt-1 flex justify-end text-xs text-gray-400">
              {title?.length || 0}/{MAX_TITLE}
            </div>
          </div>

          {/* Subtitle */}
          <div>
            <Controller
              name="subtitle"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  label="Subtitle"
                  labelPlacement="outside"
                  placeholder="You can ask me anything..."
                  maxLength={MAX_SUBTITLE}
                  errorMessage={errors.subtitle?.message as string}
                  isInvalid={!!errors.subtitle}
                />
              )}
            />
            <div className="mt-1 flex justify-end text-xs text-gray-400">
              {subtitle?.length || 0}/{MAX_SUBTITLE}
            </div>
          </div>

          {/* Placeholder Text */}
          <div>
            <Controller
              name="placeholderText"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Placeholder Text"
                  labelPlacement="outside"
                  placeholder="Type your question ..."
                  maxLength={MAX_PLACEHOLDER}
                  errorMessage={errors.placeholderText?.message as string}
                  isInvalid={!!errors.placeholderText}
                />
              )}
            />
            <div className="mt-1 flex justify-end text-xs text-gray-400">
              {placeholderText?.length || 0}/{MAX_PLACEHOLDER}
            </div>
          </div>

          {/* Auto Suggestions Switch */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Auto Suggestions</div>
              <div className="text-xs text-gray-500">
                Show suggested questions to help users get started
              </div>
            </div>
            <Controller
              name="autoSuggestions"
              control={control}
              render={({ field }) => (
                <Switch
                  isSelected={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Conversation Starters */}
          <div>
            <Controller
              name="conversationStarters"
              control={control}
              render={({ field }) => (
                <InputAddMore
                  label="Conversation Starters"
                  form={inputAddMoreForm}
                  baseName="conversationStarters"
                  onItemsChange={(items) => {
                    field.onChange(items.filter(item => item.trim() !== ""));
                  }}
                  maxItems={MAX_CONVERSATION}
                  maxLength={MAX_CONVERSATION_LENGTH}
                  placeholder="Add a conversation starter..."
                  initialItems={field.value}
                />
              )}
            />
          </div>
        </div>
      </form>
    </Card>
  );
}
