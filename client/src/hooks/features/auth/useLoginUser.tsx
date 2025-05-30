import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next-nprogress-bar";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { authCredential } from "@/configs/auth";
import { ETriggerCredentials, PATH } from "@/constants";
import type { IFormTypeAuth, IFormTypeLoginUser } from "@/types/form";
import authValidation from "@/validations/authValidation";

const rules = authValidation.pick({ email: true, password: true });

export default function useLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<IFormTypeAuth>({
    resolver: zodResolver(rules),
  });

  const handleLogin = async (body: IFormTypeLoginUser) => {
    setIsLoading(true);

    const res = await authCredential<IFormTypeLoginUser>({
      trigger: ETriggerCredentials.LOGIN_USER,
      email: body.email,
      password: body.password,
    });

    const error = JSON.parse(res?.error || "{}");
    if (res?.error) {
      Object.keys(error || {}).forEach((key) => {
        toast.error(error?.[key]);
        form.setError(key as keyof IFormTypeLoginUser, {
          message: error?.[key],
        });
      });

      setIsLoading(false);
    } else {
      router.push(PATH.CHATBOT);
    }
  };
  return {
    form,
    isLoading,
    handleLogin,
  };
}
