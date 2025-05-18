import { z } from "zod";

import { validateHexColor } from "@/utils/colorValidator";

// Validation schema for color fields
export const colorValidator = z
  .string()
  .min(1, "Color is required")
  .refine(validateHexColor, {
    message: "Please enter a valid hex color code",
  });

// Form validation schema for appearance settings
export const appearanceSchema = z.object({
  theme: z.string().min(1, "Theme selection is required"),
  font: z.string().min(1, "Font selection is required"),
  colors: z.object({
    layoutBackground: colorValidator,
    minimizedBackground: colorValidator,
    inputBackground: colorValidator,
    inputFontColor: colorValidator,
    primaryButton: colorValidator,
    borderColor: colorValidator,
    copilotReplyBackground: colorValidator,
    copilotFontColor: colorValidator,
    userReplyBackground: colorValidator,
    userFontColor: colorValidator,
  }),
});

// Default values for form initialization
export const defaultAppearanceValues = {
  theme: "cosmic-chills",
  font: "Lato",
  colors: {
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
  },
};

// Type for form values
export type AppearanceFormValues = z.infer<typeof appearanceSchema>;
