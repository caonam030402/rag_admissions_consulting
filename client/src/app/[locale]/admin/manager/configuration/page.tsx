"use client";

import { Tab as TabItem, Tabs } from "@heroui/react";
import React, { useCallback } from "react";

import { ChatWidget } from "@/components/business/ChatbotWidget/ChatWidget";
import Button from "@/components/common/Button";

import UnsavedChangesModal from "./components/UnsavedChangesModal";
import {
  ConfigurationProvider,
  useConfiguration,
} from "./ConfigurationContext";
import Appearance from "./tabs/Appearance";
import BasicInfo from "./tabs/BasicInfo";
import ContactInfo from "./tabs/ContactInfo";
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
          height: "h-[calc(100vh-160px)]",
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
    {
      title: "Contact Info",
      key: 3,
      content: (
        <LayoutWithChatWidget>
          <ContactInfo />
        </LayoutWithChatWidget>
      ),
    },
    {
      title: "Welcome Setting",
      key: 4,
      content: (
        <LayoutWithChatWidget>
          <WelcomeSetting />
        </LayoutWithChatWidget>
      ),
    },
    {
      title: "Human Handoff",
      key: 5,
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

  const currentTab = listTab.find((tab) => tab.key === currentTabKey);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1">
          <Tabs
            classNames={{
              tabList:
                "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full",
              tab: "max-w-fit px-0 h-10",
            }}
            variant="underlined"
            onSelectionChange={(key) => handleTabChange(Number(key))}
            selectedKey={String(currentTabKey)}
          >
            {listTab.map((item) => (
              <TabItem key={item.key} title={item.title} />
            ))}
          </Tabs>
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

      {currentTab && <div>{currentTab.content}</div>}

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
