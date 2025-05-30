import type { AuthValidation } from "@/validations";

type IFormTypeRegister = Pick<
  AuthValidation,
  "email" | "password" | "firstName" | "lastName" | "confirmPassword"
>;

type IFormTypeLoginAdmin = Pick<
  AuthValidation,
  "email" | "password" | "googleCode" | "key"
>;

type IFormTypeLoginUser = Pick<AuthValidation, "email" | "password">;

type IFormTypeAuth = IFormTypeRegister & IFormTypeLogin;
