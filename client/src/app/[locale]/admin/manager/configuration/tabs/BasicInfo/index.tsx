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
import {
  basicInfoSchema,
  defaultBasicInfoValues,
} from "@/validations/basicInfoValidation";

import { useConfiguration } from "../../ConfigurationContext";
import Avatar from "./components/Avatar";
import Personality from "./components/Personality";

export default function BasicInfo() {
  const { setIsDirty, registerSaveFunction, unregisterSaveFunction } =
    useConfiguration();
  const tabKey = useRef(1);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: defaultBasicInfoValues,
  });

  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  const saveConfiguration = async (): Promise<boolean> => {
    try {
      await handleSubmit(async (formData) => {
        console.log(formData);
        // Actual API call would go here
      })();
      return true; // Return true after successful save
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
                const selectedKey = Array.from(keys)[0]?.toString() || "0";
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
