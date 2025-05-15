"use client";

import { Spacer } from "@heroui/spacer";
import React from "react";

import Button from "@/components/common/Button";
import Tab from "@/components/common/Tab";

import Appearance from "./tabs/Appearance";
import BasicInfo from "./tabs/BasicInfo";
import HumanHandoff from "./tabs/HumanHandoff";
import WelcomeSetting from "./tabs/WelcomeSetting";

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
      content: <WelcomeSetting />,
    },
    {
      title: "Human Handoff",
      key: 4,
      content: <HumanHandoff />,
    },
  ];
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1 text-xl font-bold">Configuration</div>
          <div className="text-sm">
            Adjust your Copilot behavior, appearance, and preferences for
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
