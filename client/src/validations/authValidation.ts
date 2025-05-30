import { z } from "zod";

import { messageValidation } from "@/constants/message";

// eslint-disable-next-line prefer-regex-literals
const passwordValidation = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
);

const authValidationAdmin = z.object({
  email: z
    .string({ message: messageValidation({ field: "email" }).isRequired })
    .min(6, { message: messageValidation({ min: 6 }).minCharacters })
    .email({ message: messageValidation({ field: "email" }).isValid }),
  password: z
    .string({ message: messageValidation({ field: "password" }).isRequired })
    .max(20)
    .regex(passwordValidation, {
      message: messageValidation({ field: "password" }).passwordRule,
    }),
  key: z
    .string({
      message: messageValidation({ field: "key" }).isRequired,
    })
    .regex(/^UDA$/, {
      message: "Sai tên hệ thống",
    }),
  googleCode: z.string({
    message: messageValidation({ field: "googleCode" }).isRequired,
  }),
  firstName: z
    .string({ message: messageValidation({ field: "firstName" }).isRequired })
    .min(1, { message: messageValidation({ min: 3 }).minCharacters })
    .max(10, {
      message: messageValidation({ max: 10 }).maxCharacters,
    }),
  lastName: z
    .string({ message: messageValidation({ field: "lastName" }).isRequired })
    .min(1, { message: messageValidation({ min: 3 }).minCharacters })
    .max(10, {
      message: messageValidation({ max: 10 }).maxCharacters,
    }),
  confirmPassword: z.string({
    message: messageValidation({ field: "confirmPassword" }).isRequired,
  }),
});

export default authValidationAdmin;

export type AuthValidationAdmin = z.infer<typeof authValidationAdmin>;
