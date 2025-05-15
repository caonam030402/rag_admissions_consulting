"use client";

import React from "react";

import HeaderDsh from "@/components/layouts/HeaderDsb";
import SideBarGlobal from "@/components/layouts/SideBarGlobal";

interface Props {
  children: React.ReactNode;
}

export default function layout({ children }: Props) {
  return (
    <div className="flex">
      <SideBarGlobal />
      <div className="w-full">
        <HeaderDsh />
        <div className="h-[calc(100vh-65px)] w-full rounded-md bg-[#f2f0f0] p-3">
          {children}
        </div>
      </div>
    </div>
  );
}
