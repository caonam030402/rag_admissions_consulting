import { z } from "zod";

export const surveyFormSchema = z.object({
  interests: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một sở thích"),
  skills: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một kỹ năng"),
  workStyle: z.string().min(1, "Vui lòng chọn phong cách làm việc"),
  careerGoals: z
    .string()
    .min(10, "Vui lòng nhập mục tiêu nghề nghiệp (ít nhất 10 ký tự)"),
  personality: z
    .array(z.string())
    .min(1, "Vui lòng chọn ít nhất một đặc điểm tính cách"),
  strengths: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một điểm mạnh"),
  weaknesses: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một điểm yếu"),
  workEnvironment: z
    .array(z.string())
    .min(1, "Vui lòng chọn ít nhất một môi trường làm việc"),
  stressLevel: z.number().min(1).max(5),
  learningStyle: z.string().min(1, "Vui lòng chọn phong cách học tập"),
});

export type SurveyFormSchema = z.infer<typeof surveyFormSchema>;

export const stepValidationMap = {
  1: z.object({
    interests: surveyFormSchema.shape.interests,
    skills: surveyFormSchema.shape.skills,
  }),
  2: z.object({
    personality: surveyFormSchema.shape.personality,
    strengths: surveyFormSchema.shape.strengths,
    weaknesses: surveyFormSchema.shape.weaknesses,
  }),
  3: z.object({
    workEnvironment: surveyFormSchema.shape.workEnvironment,
    stressLevel: surveyFormSchema.shape.stressLevel,
  }),
  4: z.object({
    learningStyle: surveyFormSchema.shape.learningStyle,
    careerGoals: surveyFormSchema.shape.careerGoals,
  }),
  5: z.object({
    workStyle: surveyFormSchema.shape.workStyle,
  }),
};
