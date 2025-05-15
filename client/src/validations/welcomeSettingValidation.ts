import { z } from "zod";

import { messageValidation } from "@/constants/message";

export const welcomeSettingValidation = z.object({
  title: z
    .string({ message: messageValidation({ field: "Title" }).isRequired })
    .max(50, { message: messageValidation({ max: 50 }).maxCharacters }),
  subtitle: z
    .string({ message: messageValidation({ field: "Subtitle" }).isRequired })
    .max(100, { message: messageValidation({ max: 100 }).maxCharacters }),
  conversationStarters: z
    .array(
      z
        .string()
        .max(100, { message: messageValidation({ max: 100 }).maxCharacters }),
    )
    .max(10, { message: "You can add up to 10 conversation starters only." }),
  placeholderText: z
    .string({
      message: messageValidation({ field: "Placeholder Text" }).isRequired,
    })
    .max(100, { message: messageValidation({ max: 100 }).maxCharacters }),
  autoSuggestions: z.boolean({
    message: messageValidation({ field: "Auto Suggestions" }).isRequired,
  }),
});

export type WelcomeSettingValidation = z.infer<typeof welcomeSettingValidation>;
