import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Select from "@/components/common/Select";
import { PencilSimple } from "@phosphor-icons/react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { ColorInput } from "./components/ColorInput";
import { ThemeThumbnail } from "./components/ThemeThumbnail";
import { predefinedThemes } from "@/data/themes";
import { ColorScheme } from "@/types/appearance";
import { validateHexColor } from "@/utils/colorValidator";

// Font options for the select component
const fontOptions = [
  { key: "Lato", label: "Lato" },
  { key: "Inter", label: "Inter" },
  { key: "Roboto", label: "Roboto" },
  { key: "Open Sans", label: "Open Sans" },
  { key: "Montserrat", label: "Montserrat" },
];

export default function Appearance() {
  const [selectedTheme, setSelectedTheme] = useState<string>("cosmic-chills");
  const [customColors, setCustomColors] = useState<ColorScheme>({
    layoutBackground: "#0a0e18",
    minimizedBackground: "#ffffff",
    inputBackground: "#212121",
    inputFontColor: "#fff9f5",
    primaryButton: "#7a5af5",
    borderColor: "#363636",
    copilotReplyBackground: "#141822",
    copilotFontColor: "#d5d5d5",
    userReplyBackground: "#1b1b1b",
    userFontColor: "#ffffff",
  });
  const [selectedFont, setSelectedFont] = useState<string>("Lato");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [colorErrors, setColorErrors] = useState<Record<string, string>>({});

  // Function to handle color change
  const handleColorChange = (key: keyof ColorScheme, value: string) => {
    setCustomColors((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Validate color and set error
    if (!validateHexColor(value)) {
      setColorErrors(prev => ({
        ...prev,
        [key]: "Please enter a valid hex color code."
      }));
    } else {
      setColorErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  // Function to save configuration to server
  const saveConfiguration = async () => {
    // Check if there are any validation errors
    if (Object.keys(colorErrors).length > 0) {
      toast.error('Please fix the color format errors before saving');
      return;
    }

    try {
      setIsLoading(true);
      const currentTheme = selectedTheme === "custom" 
        ? customColors 
        : predefinedThemes.find(theme => theme.id === selectedTheme)?.colors || customColors;

      const config = {
        appearance: {
          theme: selectedTheme,
          colors: currentTheme,
          font: selectedFont
        }
      };

      // Send to server API
      const response = await fetch('/api/configuration/appearance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      toast.success('Appearance settings saved successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle theme selection
  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    setIsEditing(false);
    setColorErrors({});
    
    // Update customColors with the selected theme's colors if not custom
    if (themeId !== "custom") {
      const selectedThemeColors = predefinedThemes.find(theme => theme.id === themeId)?.colors;
      if (selectedThemeColors) {
        setCustomColors(selectedThemeColors);
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
  const renderColorSection = (title: string, colorInputs: Array<{label: string, key: keyof ColorScheme}>) => {
    return (
      <div>
        <h3 className="font-medium mb-3">{title}</h3>
        <div className="grid grid-cols-2 gap-4">
          {colorInputs.map(input => (
            <ColorInput 
              key={input.key}
              label={input.label} 
              value={customColors[input.key]} 
              onChange={(value) => handleColorChange(input.key, value)} 
              disabled={isColorInputDisabled}
              colorKey={input.key}
              error={colorErrors[input.key]}
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
        <div className="flex justify-between w-full">
          <div>
            <div>Copilot Appearance</div>
            <p className="text-xs">
              Select from predefined or custom options to personalize your Copilot's theme.
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
                disabled={isLoading}
              >
                {isEditing ? 'Cancel Edit' : 'Edit Theme'}
              </Button>
            )}
            <Button
              color="primary"
              variant="solid"
              size="sm"
              onClick={saveConfiguration}
              disabled={isLoading || Object.keys(colorErrors).length > 0}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Theme Selection */}
        <div className="flex flex-wrap gap-4 mt-4">
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
          { label: "Minimized Background Color", key: "minimizedBackground" }
        ])}

        {/* Action Elements */}
        {renderColorSection("Action Elements", [
          { label: "Input Background", key: "inputBackground" },
          { label: "Input Font Color", key: "inputFontColor" },
          { label: "Primary Button", key: "primaryButton" },
          { label: "Border Color", key: "borderColor" }
        ])}

        {/* Messages */}
        {renderColorSection("Messages", [
          { label: "Copilot Reply Background", key: "copilotReplyBackground" },
          { label: "Copilot Font Color", key: "copilotFontColor" },
          { label: "User Reply Background", key: "userReplyBackground" },
          { label: "User Font Color", key: "userFontColor" }
        ])}

        {/* Font Settings */}
        <div>
          <h3 className="font-medium mb-2">Font</h3>
          <p className="text-xs mb-2">Text style for the copilot interface.</p>
          <Select 
            items={fontOptions}
            selectedKeys={[selectedFont]}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              if (selected) {
                setSelectedFont(selected);
              }
            }}
            isDisabled={isColorInputDisabled}
            className="w-full"
          >
            {fontOptions.map(font => (
              <React.Fragment key={font.key}>
                {font.label}
              </React.Fragment>
            ))}
          </Select>
        </div>
      </div>
    </Card>
  );
}
