"use client";

import React from "react";

import FormAuth from "@/components/business/FormAuth";
import Card from "@/components/common/Card";
import InfiniteGrid from "@/components/common/InfiniteGrid";
import useLogin from "@/hooks/features/auth/useLogin";

export default function Login() {
  const { form, isLoading, handleLogin } = useLogin();
  const images = [
    "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c3R1ZGVudHN8ZW58MHx8MHx8fDA%3D",
    "https://plus.unsplash.com/premium_photo-1679547202572-bb3a34c54130?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c3R1ZGVudHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8c3R1ZGVudHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1549057446-9f5c6ac91a04?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHN0dWRlbnRzfGVufDB8fDB8fHww",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHN0dWRlbnRzfGVufDB8fDB8fHww",
    "https://plus.unsplash.com/premium_photo-1683887034146-c79058dbdcb1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHN0dWRlbnRzfGVufDB8fDB8fHww",
  ];
  return (
    <div className="flex h-screen items-center justify-center bg-black text-sm">
      <div className="opacity-30">
        <InfiniteGrid images={images} />
      </div>

      <Card
        classNames={{
          base: "h-auto w-[22vw] bg-white/80",
          body: "h-auto px-5 py-10",
        }}
      >
        <FormAuth
          form={form}
          isLogin
          isLoading={isLoading}
          handleSubmitMail={handleLogin}
          title="Welcome back!"
          labelAction="Login"
        />
      </Card>
    </div>
  );
}
