import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { authCredential } from "@/configs/auth";
import { ETriggerCredentials } from "@/constants";
import type { IFormTypeAuth, IFormTypeLogin } from "@/types/form";
import authValidation from "@/validations/authValidation";

const rules = authValidation.pick({
  email: true,
  password: true,
  googleCode: true,
  key: true,
});

export default function useLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<IFormTypeAuth>({
    resolver: zodResolver(rules),
  });

  const handleLogin = async (body: IFormTypeLogin) => {
    setIsLoading(true);

    const res = await authCredential<IFormTypeLogin>({
      trigger: ETriggerCredentials.LOGIN,
      email: body.email,
      password: body.password,
      googleCode: body.googleCode,
      key: body.key,
    });

    const error = JSON.parse(res?.error || "{}");
    if (res?.error) {
      Object.keys(error || {}).forEach((key) => {
        toast.error(error?.[key]);
        form.setError(key as keyof IFormTypeLogin, {
          message: error?.[key],
        });
      });

      setIsLoading(false);
    } else {
      toast.success("Login successfully !");
      setIsLoading(false);
    }
  };
  return {
    form,
    isLoading,
    handleLogin,
  };
}
