"use client";

import React from "react";

import SideBarGlobal from "@/components/layouts/SideBarGlobal";
import Header from "@/components/layouts/Header";
import HeaderDsh from "@/components/layouts/HeaderDsb";

interface Props {
  children: React.ReactNode;
}

export default function layout({ children }: Props) {
  return (
    <div className="flex">
      <SideBarGlobal />
      <div className="w-full">
        <HeaderDsh />
        <div className="ml-[0.5px] py-1 pr-1">
          <div className=" size-full rounded-md p-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
