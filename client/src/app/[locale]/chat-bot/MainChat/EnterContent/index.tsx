"use client";

import {
  ArrowsOutSimple,
  Eraser,
  Image,
  Microphone,
  PaperPlaneRight,
} from "@phosphor-icons/react";
import React from "react";

import Button from "@/components/common/Button";

const listUtil = [
  {
    icon: <Image size={20} />,
    action: () => {
      console.log("1");
    },
  },
  {
    icon: <Microphone size={20} />,
    action: () => {
      console.log("1");
    },
  },
];

const listAction = [
  {
    icon: <Eraser size={20} />,
    action: () => {
      console.log("1");
    },
  },
  {
    icon: <ArrowsOutSimple size={20} />,
    action: () => {
      console.log("1");
    },
  },
];

export default function EnterContent() {
  return (
    <div className="border-t p-5">
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          {listUtil.map((item, index) => {
            return (
              <Button variant="light" size="sm" isIconOnly key={index}>
                {item.icon}
              </Button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {listAction.map((item, index) => {
            return (
              <Button variant="light" size="sm" isIconOnly key={index}>
                {item.icon}
              </Button>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex items-center">
        <textarea
          placeholder="Nhập câu hỏi của bạn ở đây..."
          className="min-h-[40px] w-full resize-none overflow-y-auto bg-transparent p-2 text-sm outline-none"
        />
        <Button color="primary" size="sm" endContent={<PaperPlaneRight />}>
          Gửi
        </Button>
      </div>
    </div>
  );
}
