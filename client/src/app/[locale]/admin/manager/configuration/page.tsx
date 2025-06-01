"use client";

import { Spacer } from "@heroui/spacer";
import React, { useCallback } from "react";

import { ChatWidget } from "@/components/business/ChatbotWidget/ChatWidget";
import Button from "@/components/common/Button";
import Tab from "@/components/common/Tab";

import UnsavedChangesModal from "./components/UnsavedChangesModal";
import {
  ConfigurationProvider,
  useConfiguration,
} from "./ConfigurationContext";
import Appearance from "./tabs/Appearance";
import BasicInfo from "./tabs/BasicInfo";
import HumanHandoff from "./tabs/HumanHandoff";
import WelcomeSetting from "./tabs/WelcomeSetting";

const LayoutWithChatWidget = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  return (
    <div className="flex gap-5">
      <div className="flex-1">{children}</div>
      <ChatWidget
        isOpen
        activeTab="chat"
        handleTabSwitch={() => {}}
        isOnScreen={false}
        styles={{
          shadow: "shadow-none",
          height: "h-[75vh]",
        }}
        isTransition={false}
      />
    </div>
  );
};

function ConfigurationContent() {
  const { handleTabChange, saveChanges, isDirty, currentTabKey } =
    useConfiguration();

  const listTab = [
    {
      title: "Basic Info",
      key: 1,
      content: (
        <LayoutWithChatWidget>
          <BasicInfo />
        </LayoutWithChatWidget>
      ),
    },
    {
      title: "Appearance",
      key: 2,
      content: (
        <LayoutWithChatWidget>
          <Appearance />
        </LayoutWithChatWidget>
      ),
    },
    // {
    //   title: "Welcome Settings",
    //   key: 3,
    //   content: (
    //     <LayoutWithChatWidget>
    //       <WelcomeSetting />
    //     </LayoutWithChatWidget>
    //   ),
    // },
    {
      title: "Human Handoff",
      key: 4,
      content: (
        <LayoutWithChatWidget>
          <HumanHandoff />
        </LayoutWithChatWidget>
      ),
    },
  ];

  const handleSave = useCallback(async () => {
    await saveChanges();
  }, [saveChanges]);

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
        <Button
          size="md"
          color="primary"
          onClick={handleSave}
          disabled={!isDirty}
        >
          Save changes
        </Button>
      </div>
      <Spacer y={2} />
      <Tab
        listTab={listTab}
        onSelectionChange={(key) => handleTabChange(Number(key))}
        selectedKey={String(currentTabKey)}
      />
      <UnsavedChangesModal />
    </div>
  );
}

export default function ConfigurationPage() {
  return (
    <ConfigurationProvider>
      <ConfigurationContent />
    </ConfigurationProvider>
  );
}
