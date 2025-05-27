import * as z from "zod";

export const humanHandoffSchema = z.object({
  enabled: z.boolean().default(false),
  agentAlias: z.string().max(20, "Maximum 20 characters allowed"),
  triggerPattern: z.string().min(1, "Trigger pattern is required"),
  timezone: z.string().min(1, "Timezone is required"),
  workingDays: z.array(z.boolean()).length(7),
  workingHours: z
    .array(
      z.object({
        from: z.string(),
        to: z.string(),
      }),
    )
    .length(7),
  allowSystemMessages: z.boolean().default(true),
});

export type HumanHandoffFormValues = z.infer<typeof humanHandoffSchema>;

export const defaultValues: HumanHandoffFormValues = {
  enabled: false,
  agentAlias: "Agent",
  triggerPattern: "123123123",
  timezone: "Asia/Kolkata+05:30",
  workingDays: [false, true, true, true, true, true, false], // Sun to Sat
  workingHours: Array(7).fill({ from: "09:00", to: "18:00" }),
  allowSystemMessages: true,
};
