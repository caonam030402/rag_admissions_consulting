import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { authCredential } from "@/configs/auth";
import { ETriggerCredentials, PATH } from "@/constants";
import type { IFormTypeAuth, IFormTypeLogin } from "@/types/form";
import authValidation from "@/validations/authValidation";
import useJump from "@/hooks/useJump";

const rules = authValidation.pick({
  email: true,
  password: true,
  googleCode: true,
  key: true,
});

export default function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userPassword, setUserPassword] = useState<string>("");
  const { handleJump } = useJump();

  const form = useForm<IFormTypeAuth>({
    resolver: zodResolver(rules),
  });

  const handleLogin = async (body: IFormTypeLogin) => {
    setIsLoading(true);

    // Create login data with possible OTP code
    const loginCredentials = {
      trigger: ETriggerCredentials.LOGIN,
      email: requiresTwoFactor ? userEmail : body.email,
      password: requiresTwoFactor ? userPassword : body.password,
      key: body.key,
      googleCode: body.googleCode, // Keep for form validation
      // Add otpCode for 2FA if we have the googleCode field
      ...(body.googleCode ? { otpCode: body.googleCode } : {}),
    };

    const res = await authCredential<IFormTypeLogin>(loginCredentials);

    const error = JSON.parse(res?.error || "{}");
    if (res?.error) {
      Object.keys(error || {}).forEach((key) => {
        toast.error(error?.[key]);
        form.setError(key as keyof IFormTypeLogin, {
          message: error?.[key],
        });
      });

      setIsLoading(false);
    } else if (res?.requiresTwoFactor) {
      // Store credentials for when user enters 2FA code
      setRequiresTwoFactor(true);
      setUserEmail(body.email);
      setUserPassword(body.password);
      toast.success("Please enter your Google Authenticator code");
      setIsLoading(false);
    } else {
      toast.success("Login successfully!");
      handleJump({
        url: PATH.OVERVIEW,
      });

      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    handleLogin,
    requiresTwoFactor,
  };
}
