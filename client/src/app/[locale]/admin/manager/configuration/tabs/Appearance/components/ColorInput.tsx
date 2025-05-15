import React from "react";
import Input from "@/components/common/Input";
import { ColorScheme } from "@/types/appearance";

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  colorKey: keyof ColorScheme;
  error?: string;
  validateHexColor: (color: string) => boolean;
}

export const ColorInput: React.FC<ColorInputProps> = ({ 
  label, 
  value, 
  onChange,
  disabled = false,
  error,
  validateHexColor
}) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-sm font-medium">{label}</div>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="#000000"
          isInvalid={!!error}
          className="w-full pr-10"
        />
        <div 
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-gray-300"
          style={{ backgroundColor: validateHexColor(value) ? value : '#ffffff' }}
        >
          <input
            type="color"
            value={validateHexColor(value) ? value : '#ffffff'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={disabled}
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}; 