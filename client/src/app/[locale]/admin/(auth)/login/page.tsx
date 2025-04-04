"use client";

import React from "react";

import FormAuth from "@/components/business/FormAuth";
import useLogin from "@/hooks/features/auth/useLogin";

import IntroSection from "./IntroSection";

export default function Login() {
  const { form, isLoading, handleLogin } = useLogin();

  return (
    <section className="flex h-screen text-sm">
      <FormAuth
        form={form}
        isLogin
        isLoading={isLoading}
        handleSubmitMail={handleLogin}
        title="Welcome back!"
        labelAction="Login"
      />
      <IntroSection />
    </section>
  );
}
