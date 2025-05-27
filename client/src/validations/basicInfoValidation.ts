import { z } from "zod";

// Form validation schema for basic info settings
export const basicInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  persona: z.string().min(1, "Persona is required"),
  creativityLevel: z.number().min(0).max(1),
  modelKey: z.string(),
  avatar: z.string().optional(),
  personality: z.string().optional(),
});

// Default values for form initialization
export const defaultBasicInfoValues = {
  name: "Ned",
  persona: "I am a helpful assistant.",
  creativityLevel: 0.2,
  modelKey: "0",
  avatar: "https://i.pravatar.cc/150?img=1",
  personality: "1", // Default to Professional
};

// Type for form values
export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;
