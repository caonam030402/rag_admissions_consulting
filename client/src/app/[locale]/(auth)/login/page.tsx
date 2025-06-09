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
        title="Đăng nhập vào tài khoản"
        labelAction="Đăng nhập"
        description={
          <div className="text-sm text-default-500">
            <span> Nếu bạn chưa có tài khoản, </span>
            <Link size="sm" href={PATH.REGISTER_USER}>
              Đăng ký
            </Link>
          </div>
        }
      />
      <IntroSection />
    </section>
  );
}
