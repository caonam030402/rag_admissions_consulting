import { z } from "zod";
import { messageValidation } from "@/constants/message";

export const createUserSchema = z.object({
  email: z
    .string({ message: messageValidation({ field: "email" }).isRequired })
    .min(1, { message: messageValidation({ field: "email" }).isRequired })
    .email({ message: messageValidation({ field: "email" }).isValid }),

  firstName: z
    .string({ message: messageValidation({ field: "firstName" }).isRequired })
    .min(1, { message: messageValidation({ field: "firstName" }).isRequired }),

  lastName: z
    .string({ message: messageValidation({ field: "lastName" }).isRequired })
    .min(1, { message: messageValidation({ field: "lastName" }).isRequired }),

  password: z
    .string({ message: messageValidation({ field: "password" }).isRequired })
    .min(8, { message: "Password must be at least 8 characters" }),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const defaultValues: CreateUserFormValues = {
  email: "",
  firstName: "",
  lastName: "",
  password: "",
};
