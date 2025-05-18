import { zodResolver } from "@hookform/resolvers/zod";
import { PencilSimple } from "@phosphor-icons/react";
import React, { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";

import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Select from "@/components/common/Select";
import { fontOptions } from "@/constants/adminConfig";
import { predefinedThemes } from "@/data/themes";
import type { ColorScheme } from "@/types/appearance";
import { validateHexColor } from "@/utils/colorValidator";
import {
  type AppearanceFormValues,
  appearanceSchema,
  defaultAppearanceValues,
} from "@/validations/appearanceValidation";

import { useConfiguration } from "../../ConfigurationContext";
import { ColorInput } from "./components/ColorInput";
import { ThemeThumbnail } from "./components/ThemeThumbnail";

export default function Appearance() {
  const { setIsDirty, registerSaveFunction, unregisterSaveFunction } =
    useConfiguration();
  const tabKey = useRef(2);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: defaultAppearanceValues,
  });

  const selectedTheme = watch("theme");
  const colors = watch("colors");
  const [isEditing, setIsEditing] = React.useState(false);

  // Track changes to mark the form as dirty
  useEffect(() => {
    setIsDirty(isDirty || isEditing);
  }, [isDirty, isEditing, setIsDirty]);

  // Function to handle color change
  const handleColorChange = (key: keyof ColorScheme, value: string) => {
    setValue(`colors.${key}`, value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // Function to save configuration to server
  const saveConfiguration = async () => {
    handleSubmit(async (formData) => {
      console.log(formData);
    })();
  };

  // Register the save function when component mounts
  useEffect(() => {
    registerSaveFunction(tabKey.current, saveConfiguration);

    // Unregister when component unmounts
    return () => {
      unregisterSaveFunction(tabKey.current);
    };
  }, [registerSaveFunction, unregisterSaveFunction]);

  // Handle theme selection
  const handleThemeSelect = (themeId: string) => {
    setValue("theme", themeId, { shouldDirty: true });
    setIsEditing(false);

    // Update colors with the selected theme's colors if not custom
    if (themeId !== "custom") {
      const selectedThemeColors = predefinedThemes.find(
        (theme) => theme.id === themeId,
      )?.colors;

      if (selectedThemeColors) {
        Object.entries(selectedThemeColors).forEach(([key, value]) => {
          setValue(`colors.${key as keyof ColorScheme}`, value, {
            shouldDirty: true,
          });
        });
      }
    }
  };

  // Determine if color inputs should be disabled
  const isColorInputDisabled = selectedTheme !== "custom" && !isEditing;

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // Renders a section of color inputs
  const renderColorSection = (
    title: string,
    colorInputs: Array<{ label: string; key: keyof ColorScheme }>,
  ) => {
    return (
      <div>
        <h3 className="mb-3 font-medium">{title}</h3>
        <div className="grid grid-cols-2 gap-4">
          {colorInputs.map((input) => (
            <ColorInput
              key={input.key}
              label={input.label}
              value={colors[input.key]}
              onChange={(value) => handleColorChange(input.key, value)}
              disabled={isColorInputDisabled}
              error={errors.colors?.[input.key]?.message}
              validateHexColor={validateHexColor}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card
      className="h-[calc(100vh-210px)] overflow-y-auto"
      header={
        <div className="flex w-full justify-between">
          <div>
            <div>Copilot Appearance</div>
            <p className="text-xs">
              Select from predefined or custom options to personalize your
              Copilot&apos;s theme.
            </p>
          </div>
          <div className="flex gap-2">
            {selectedTheme !== "custom" && (
              <Button
                color="default"
                variant="ghost"
                size="sm"
                startContent={<PencilSimple size={15} />}
                onClick={toggleEditMode}
                disabled={isSubmitting}
              >
                {isEditing ? "Cancel Edit" : "Edit Theme"}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Theme Selection */}
        <div className="mt-4 flex flex-wrap gap-4">
          {predefinedThemes.map((theme) => (
            <ThemeThumbnail
              key={theme.id}
              theme={theme}
              isSelected={selectedTheme === theme.id}
              onSelect={handleThemeSelect}
            />
          ))}
        </div>

        {/* Layout Settings */}
        {renderColorSection("Layout", [
          { label: "Layout Background", key: "layoutBackground" },
          { label: "Minimized Background Color", key: "minimizedBackground" },
        ])}

        {/* Action Elements */}
        {renderColorSection("Action Elements", [
          { label: "Input Background", key: "inputBackground" },
          { label: "Input Font Color", key: "inputFontColor" },
          { label: "Primary Button", key: "primaryButton" },
          { label: "Border Color", key: "borderColor" },
        ])}

        {/* Messages */}
        {renderColorSection("Messages", [
          { label: "Copilot Reply Background", key: "copilotReplyBackground" },
          { label: "Copilot Font Color", key: "copilotFontColor" },
          { label: "User Reply Background", key: "userReplyBackground" },
          { label: "User Font Color", key: "userFontColor" },
        ])}

        {/* Font Settings */}
        <div>
          <h3 className="mb-2 font-medium">Font</h3>
          <p className="mb-2 text-xs">Text style for the copilot interface.</p>
          <Controller
            name="font"
            control={control}
            render={({ field }) => (
              <Select
                items={fontOptions}
                selectedKeys={[field.value]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  if (selected) {
                    field.onChange(selected);
                  }
                }}
                isDisabled={isColorInputDisabled}
                className="w-full"
              >
                {fontOptions.map((font) => (
                  <div key={font.key}>{font.label}</div>
                ))}
              </Select>
            )}
          />
        </div>
      </div>
    </Card>
  );
}
