import { CaretLeft, DotsThreeVertical } from "@phosphor-icons/react";
import React from "react";

import Button from "@/components/common/Button";

export default function Header({
  handleTabSwitch,
}: {
  handleTabSwitch: (tab: "home" | "chat") => void;
}) {
  return (
    <div className="relative flex items-center justify-between bg-primary p-4 text-white">
      <div className="flex items-center gap-2">
        <Button
          variant="light"
          className="text-white"
          onPress={() => handleTabSwitch("home")}
          isIconOnly
          size="xxs"
        >
          <CaretLeft size={17} weight="bold" />
        </Button>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 text-sm font-bold ">
        Trợ lý Tuyển sinh AI
      </div>
      <DotsThreeVertical size={24} weight="bold" />
    </div>
  );
}
