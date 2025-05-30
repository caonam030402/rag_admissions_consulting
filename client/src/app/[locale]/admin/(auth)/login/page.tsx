"use client";

import React from "react";

import FormAuthAdmin from "@/components/business/FormAuthAdmin";
import useLoginAdmin from "@/hooks/features/auth/useLoginAdmin";

export default function Login() {
  const { form, isLoading, handleLogin, requiresTwoFactor } = useLoginAdmin();

  return (
    <section className="flex h-screen bg-primary text-sm">
      <FormAuthAdmin
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
