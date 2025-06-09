import * as z from "zod";

export const humanHandoffSchema = z.object({
  enabled: z.boolean().default(false),
  agentAlias: z.string().max(100, "Maximum 100 characters allowed"),
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
  timeoutDuration: z.number().min(30).max(300).default(60),
  allowSystemMessages: z.boolean().default(true),
});

export type HumanHandoffFormValues = z.infer<typeof humanHandoffSchema>;

export const defaultValues: HumanHandoffFormValues = {
  enabled: false,
  agentAlias: "Agent",
  triggerPattern: "support,help,agent",
  timezone: "Asia/Ho_Chi_Minh",
  workingDays: [false, true, true, true, true, true, false], // Sun to Sat
  workingHours: Array(7).fill({ from: "09:00", to: "18:00" }),
  timeoutDuration: 60,
  allowSystemMessages: true,
};
