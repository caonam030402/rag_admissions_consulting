"use client";

import React from "react";

import FormAuth from "@/components/business/FormAuth";
import useLogin from "@/hooks/features/auth/useLogin";

export default function Login() {
  const { form, isLoading, handleLogin, requiresTwoFactor } = useLogin();

  return (
    <section className="flex h-screen text-sm bg-primary">
      <FormAuth
        form={form}
        isLogin
        isLoading={isLoading}
        handleSubmitMail={handleLogin}
        title="Welcome back!"
        labelAction="Login"
        requiresTwoFactor={requiresTwoFactor}
      />
    </section>
  );
}
