import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import { Sparkle } from "@phosphor-icons/react";
import React from "react";

export default function Appearance() {
  const listModel = [
    { key: "0", label: "OpenAI GPT-3.5 Turbo (1 credit/message)" },
    { key: "50", label: "OpenAI GPT-3.5 Turbo (1 credit/message)" },
    { key: "100", label: "OpenAI GPT-3.5 Turbo (1 credit/message)" },
  ];
  return (
    <Card
      className="h-[calc(100vh-210px)]"
      header={
        <div className="flex justify-between w-full">
          <div>
            <div>Basic Info</div>
            <p className="text-xs">
              Manage your Copilot's name, persona, and AI model settings to
              define its core identity and behavior.
            </p>
          </div>
          <Button
            color="primary"
            variant="ghost"
            size="sm"
            startContent={<Sparkle size={15} weight="fill" />}
          >
            AI Agent
          </Button>
        </div>
      }
    >
      <div></div>
    </Card>
  );
}
