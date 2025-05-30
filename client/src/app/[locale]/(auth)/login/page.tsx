"use client";

import { Link } from "@heroui/link";
import React from "react";

import FormAuthUser from "@/components/business/FormAuthUser";
import { PATH } from "@/constants/common";
import useLoginUser from "@/hooks/features/auth/useLoginUser";

import IntroSection from "./IntroSection";

export default function Login() {
  const { form, isLoading, handleLogin } = useLoginUser();

  return (
    <section className="flex h-screen text-sm">
      <FormAuthUser
        form={form}
        isLogin
        isLoading={isLoading}
        handleSubmitMail={handleLogin}
        title="Login to your account"
        labelAction="Login"
        description={
          <div className="text-sm text-default-500">
            <span> If you don&apos;t have an account, </span>
            <Link size="sm" href={PATH.REGISTER_USER}>
              Register
            </Link>
          </div>
        }
      />
      <IntroSection />
    </section>
  );
}
