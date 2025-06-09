"use client";

import React from "react";

import HeaderDsh from "@/components/layouts/HeaderDsb";
import SideBarGlobal from "@/components/layouts/SideBarGlobal";

interface Props {
  children: React.ReactNode;
}

export default function layout({ children }: Props) {
  return (
    <div className="from-gray-50 via-white to-gray-100 flex min-h-screen bg-gradient-to-br">
      <SideBarGlobal />
      <div className="w-full">
        <HeaderDsh />
        <div className="scroll h-[calc(100vh-75px)] w-full px-5 pt-3">
          <div className="mx-auto ">{children}</div>
        </div>
      </div>
    </div>
  );
}
