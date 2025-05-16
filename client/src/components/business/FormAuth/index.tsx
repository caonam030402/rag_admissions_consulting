import { Button } from "@heroui/button";
import {
  CheckCircle,
  CheckSquare,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  Lock,
} from "@phosphor-icons/react";
import React, { useState } from "react";
import { type UseFormReturn } from "react-hook-form";

import Input from "@/components/common/Input";
import Logo from "@/components/common/Logo";
import type { IFormTypeAuth } from "@/types/form";
import { Card } from "@heroui/card";
import useNavigate from "@/hooks/navigate";

interface IProps {
  handleSubmitMail: (data: any) => void;
  isLoading: boolean;
  form: UseFormReturn<IFormTypeAuth, any, undefined>;
  title?: string;
  labelAction?: string;
  description?: React.ReactNode;
  isLogin?: boolean;
}

export default function FormSignUp({
  handleSubmitMail,
  isLoading,
  form,
  title = "Create account",
  labelAction = "Sign in",
  description,
}: IProps) {
  const [isVisiblePassWord, setIsVisiblePassWord] = useState(false);

  const {
    formState: { errors },
    register,
    handleSubmit,
  } = form;

  const toggleVisibilityPassword = () =>
    setIsVisiblePassWord(!isVisiblePassWord);

  const onSubmit = handleSubmit((data) => {
    handleSubmitMail(data);
  });

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center">
      <Card shadow="sm" className="w-full max-w-[450px] space-y-9 p-10">
        <form
          onSubmit={onSubmit}
          className="flex w-full flex-col items-center space-y-8"
        >
          <div className="flex items-center gap-2">
            <Logo isOnlyIcon />
            <h1 className="text-center text-2xl font-bold">{title}</h1>
          </div>
          <Input
            size="md"
            placeholder="Name@work.com"
            errorMessage={errors.email?.message}
            isInvalid={!!errors.email?.message}
            type="email"
            startContent={
              <EnvelopeSimple className="pointer-events-none shrink-0 text-xl text-default-400" />
            }
            {...form.register("email")}
          />
          <Input
            size="md"
            errorMessage={errors.password?.message}
            placeholder="Password"
            isInvalid={!!errors.password?.message}
            startContent={
              <Lock className="pointer-events-none shrink-0 text-xl text-default-400" />
            }
            endContent={
              <button
                className="focus:outline-none"
                type="button"
                onClick={toggleVisibilityPassword}
                aria-label="toggle password visibility"
              >
                {isVisiblePassWord ? (
                  <EyeSlash className="pointer-events-none text-xl text-default-400" />
                ) : (
                  <Eye className="pointer-events-none text-xl text-default-400" />
                )}
              </button>
            }
            type={isVisiblePassWord ? "text" : "password"}
            {...register("password")}
          />
          <Input
            size="md"
            placeholder="Google code key"
            errorMessage={errors.googleCode?.message}
            isInvalid={!!errors.googleCode?.message}
            startContent={
              <CheckSquare className="pointer-events-none shrink-0 text-xl text-default-400" />
            }
            {...form.register("googleCode")}
          />
          <Input
            size="md"
            placeholder="Key university"
            errorMessage={errors.key?.message}
            isInvalid={!!errors.key?.message}
            startContent={
              <CheckCircle className="pointer-events-none shrink-0 text-xl text-default-400" />
            }
            {...form.register("key")}
          />
          <Button
            isLoading={isLoading}
            type="submit"
            size="md"
            className="w-full"
            color="primary"
          >
            {labelAction}
          </Button>
        </form>
        {description}
      </Card>
    </div>
  );
}
