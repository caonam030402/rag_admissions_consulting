import { Textarea } from "@heroui/input";
import { Slider } from "@heroui/slider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkle } from "@phosphor-icons/react";
import React, { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";

import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Divider from "@/components/common/Divider";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import { listModel } from "@/constants/adminConfig";
import { chatbotConfigService } from "@/services/chatbot-config";
import { ModelType } from "@/types/chatbot-config.types";
import type { PersonalityType } from "@/types/chatbot-config.types";
import {
  basicInfoSchema,
  defaultBasicInfoValues,
} from "@/validations/basicInfoValidation";

import { useConfiguration } from "../../ConfigurationContext";
import Avatar from "./components/Avatar";
import Personality from "./components/Personality";

// Map model keys to ModelType enum (updated to match backend)
const modelKeyToModelType: Record<string, ModelType> = {
  "gemini-pro": ModelType.GEMINI_PRO,
  "gemini-flash": ModelType.GEMINI_FLASH,
  "gpt-4": ModelType.GPT_4,
  "gpt-3.5-turbo": ModelType.GPT_3_5_TURBO,
  "ollama": ModelType.OLLAMA,
};

const modelTypeToKey: Record<ModelType, string> = {
  [ModelType.GEMINI_PRO]: "gemini-pro",
  [ModelType.GEMINI_FLASH]: "gemini-flash",
  [ModelType.GPT_4]: "gpt-4",
  [ModelType.GPT_3_5_TURBO]: "gpt-3.5-turbo",
  [ModelType.OLLAMA]: "ollama",
};

export default function BasicInfo() {
  const { setIsDirty, registerSaveFunction, unregisterSaveFunction } =
    useConfiguration();
  const tabKey = useRef(1);

  // Get current config data
  const { data: configData, isLoading } = chatbotConfigService.useGetActiveConfig();
  const updateBasicInfo = chatbotConfigService.useUpdateBasicInfo();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: defaultBasicInfoValues,
  });

  // Update form when config data loads
  useEffect(() => {
    if (configData) {
      console.log("Loading config data:", configData);
      const formValues = {
        avatar: configData.personality.avatar || "",
        name: configData.personality.name,
        personality: configData.personality.personality,
        persona: configData.personality.persona,
        creativityLevel: configData.personality.creativityLevel,
        modelKey:
          modelTypeToKey[configData.llmConfig.defaultModel] || "gemini-pro",
      };
      console.log("Setting form values:", formValues);
      reset(formValues);
    }
  }, [configData, reset]);

  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  const saveConfiguration = async (): Promise<boolean> => {
    try {
      await handleSubmit(async (formData) => {
        const updateData = {
          personality: {
            name: formData.name,
            persona: formData.persona,
            personality: formData.personality as PersonalityType,
            avatar: formData.avatar,
            creativityLevel: formData.creativityLevel,
          },
          llmConfig: {
            defaultModel: modelKeyToModelType[formData.modelKey],
            temperature: formData.creativityLevel, // Use creativity level as temperature
          },
        };

        await updateBasicInfo.mutateAsync(updateData);
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
          <div>Loading configuration...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="h-[calc(100vh-210px)]"
      header={
        <div className="flex w-full justify-between">
          <div>
            <div>Basic Info</div>
            <p className="text-xs">
              Manage your Copilot name, persona, and AI model settings to define
              its core identity and behavior.
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
    >
      <Divider className="mt-0 pt-0" />
      <div className="space-y-8">
        <Controller
          name="avatar"
          control={control}
          render={({ field }) => (
            <Avatar
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
                setIsDirty(true);
              }}
            />
          )}
        />
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              label="Name"
              labelPlacement="outside"
              placeholder="Enter copilot name"
              value={field.value}
              onChange={field.onChange}
              errorMessage={errors.name?.message}
            />
          )}
        />
        <Controller
          name="personality"
          control={control}
          render={({ field }) => (
            <Personality
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
                setIsDirty(true);
              }}
            />
          )}
        />
        <Controller
          name="persona"
          control={control}
          render={({ field }) => (
            <Textarea
              minRows={20}
              labelPlacement="outside"
              label="Persona"
              placeholder="Enter your description"
              value={field.value}
              onChange={field.onChange}
              errorMessage={errors.persona?.message}
            >
              Persona
            </Textarea>
          )}
        />
        <Controller
          name="creativityLevel"
          control={control}
          render={({ field }) => (
            <Slider
              color="foreground"
              value={field.value}
              label="Creativity Level"
              maxValue={1}
              minValue={0}
              showSteps
              size="sm"
              step={0.02}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name="modelKey"
          control={control}
          render={({ field }) => (
            <Select
              label="AI Model"
              labelPlacement="outside"
              selectedKeys={[field.value]}
              items={listModel}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0]?.toString() || "gemini-pro";
                field.onChange(selectedKey);
              }}
              // eslint-disable-next-line react/no-children-prop
              children={null}
            />
          )}
        />
      </div>
    </Card>
  );
}
