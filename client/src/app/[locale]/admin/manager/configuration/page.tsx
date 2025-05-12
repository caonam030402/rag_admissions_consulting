"use client";

import Tab from "@/components/common/Tab";
import React from "react";
import { Spacer } from "@heroui/spacer";
import Button from "@/components/common/Button";
import Appearance from "./tabs/Appearance";
import BasicInfo from "./tabs/BasicInfo";

export default function page() {
  const listTab = [
    {
      title: "Basic Info",
      key: 1,
      content: <BasicInfo />,
    },
    {
      title: "Appearance",
      key: 2,
      content: <Appearance />,
    },
    {
      title: "Welcome Settings",
      key: 3,
      content: <div>Welcome Settings</div>,
    },
    {
      title: "Human Handoff",
      key: 4,
      content: <div>Human Handoff</div>,
    },
  ];
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-bold mb-1">Configuration</div>
          <div className="text-sm">
            Adjust your Copilot's behavior, appearance, and preferences for
            optimal performance.
          </div>
        </div>
        <Button size="md" color="primary">
          Save changes
        </Button>
      </div>
      <Spacer y={2} />
      <Tab listTab={listTab} />
    </div>
  );
}
