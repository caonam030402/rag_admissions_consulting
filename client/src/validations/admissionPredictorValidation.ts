import { z } from "zod";

export const admissionFormSchema = z.object({
    selectedBlock: z.string().min(1, "Vui lòng chọn khối thi"),
    scores: z.object({
        math: z
            .number()
            .min(0, "Điểm không được âm")
            .max(10, "Điểm tối đa là 10")
            .optional(),
        literature: z
            .number()
            .min(0, "Điểm không được âm")
            .max(10, "Điểm tối đa là 10")
            .optional(),
        english: z
            .number()
            .min(0, "Điểm không được âm")
            .max(10, "Điểm tối đa là 10")
            .optional(),
        physics: z
            .number()
            .min(0, "Điểm không được âm")
            .max(10, "Điểm tối đa là 10")
            .optional(),
        chemistry: z
            .number()
            .min(0, "Điểm không được âm")
            .max(10, "Điểm tối đa là 10")
            .optional(),
        biology: z
            .number()
            .min(0, "Điểm không được âm")
            .max(10, "Điểm tối đa là 10")
            .optional(),
        history: z
            .number()
            .min(0, "Điểm không được âm")
            .max(10, "Điểm tối đa là 10")
            .optional(),
        geography: z
            .number()
            .min(0, "Điểm không được âm")
            .max(10, "Điểm tối đa là 10")
            .optional(),
    }),
    priorityZone: z.enum(["KV1", "KV2-NT", "KV2", "KV3"]),
    preferences: z
        .array(z.string())
        .min(1, "Vui lòng chọn ít nhất một ngành")
        .max(10, "Tối đa 10 ngành"),
});

export type AdmissionFormData = z.infer<typeof admissionFormSchema>;
