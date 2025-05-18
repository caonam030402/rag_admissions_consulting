import { z } from "zod";

// Form validation schema for basic info settings
export const basicInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  persona: z.string().min(1, "Persona is required"),
  creativityLevel: z.number().min(0).max(1),
  modelKey: z.string(),
});

// Default values for form initialization
export const defaultBasicInfoValues = {
  name: "",
  persona: "I am a helpful assistant.",
  creativityLevel: 0.2,
  modelKey: "0",
};

// Type for form values
export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>; 