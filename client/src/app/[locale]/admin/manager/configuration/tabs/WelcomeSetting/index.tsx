"use client";

import { Switch } from "@heroui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkle } from "@phosphor-icons/react";
import React from "react";
import { Controller, useForm } from "react-hook-form";

import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import InputAddMore from "@/components/common/InputAddMore";
import Textarea from "@/components/common/Textarea";
import type { WelcomeSettingValidation } from "@/validations";
import { welcomeSettingValidation } from "@/validations";

const MAX_TITLE = 50;
const MAX_SUBTITLE = 100;
const MAX_CONVERSATION = 10;
const MAX_CONVERSATION_LENGTH = 100;
const MAX_PLACEHOLDER = 100;

const defaultValues: WelcomeSettingValidation = {
  title: "",
  subtitle: "",
  conversationStarters: [],
  placeholderText: "",
  autoSuggestions: true,
};

export default function WelcomeSetting() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<WelcomeSettingValidation>({
    resolver: zodResolver(welcomeSettingValidation),
    defaultValues,
    mode: "onChange",
  });

  const title = watch("title");
  const subtitle = watch("subtitle");
  const conversationStarters = watch("conversationStarters");
  const placeholderText = watch("placeholderText");
  //   const autoSuggestions = watch("autoSuggestions");

  const onSubmit = (data: WelcomeSettingValidation) => {
    // TODO: Save logic here
    // e.g. await api.saveWelcomeSettings(data)
    alert(`Saved!\n${JSON.stringify(data, null, 2)}`);
  };

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
          <Button
            color="primary"
            variant="ghost"
            size="sm"
            startContent={<Sparkle size={15} weight="fill" />}
          >
            AI Agent
          </Button>
        </div>
      }
      className="h-[calc(100vh-210px)]"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
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

          {/* Conversation Starters */}
          <div className="mb-4">
            <div className="mb-2 block text-sm">Conversation Starters</div>
            <Controller
              name="conversationStarters"
              control={control}
              render={({ field }) => (
                <InputAddMore
                  name="conversationStarters"
                  max={MAX_CONVERSATION}
                  form={{
                    ...field,
                    control,
                    formState: { errors },
                    getValues: () => conversationStarters,
                    setError: (name, error) => {},
                    clearErrors: (name) => {},
                    unregister: (name) => {},
                  }}
                  rules={{
                    maxLength: {
                      value: MAX_CONVERSATION_LENGTH,
                      message: `Max ${MAX_CONVERSATION_LENGTH} characters`,
                    },
                  }}
                />
              )}
            />
          </div>

          {/* Auto Suggestions */}
          <div className="flex items-center gap-2">
            <Controller
              name="autoSuggestions"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  color="primary"
                />
              )}
            />
            <span className="font-semibold">Auto Suggestions</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Dynamic follow-up questions or suggestions will appear after each
            Copilot response. Each set of reply suggestions will consume 1
            message credit.
          </div>
        </div>
      </form>
    </Card>
  );
}
