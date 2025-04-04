"use client";

import { Share } from "@phosphor-icons/react";
import React from "react";

import Button from "@/components/common/Button";

export default function HeaderMainChat() {
  return (
    <div className="flex items-center justify-between border-b p-3">
      <div className="font-bold">Trợ lý tuyển sinh</div>
      <div>
        <Button size="sm" startContent={<Share size={15} />}>
          Share
        </Button>
      </div>
    </div>
  );
}
