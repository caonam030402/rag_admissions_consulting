import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Divider from "@/components/common/Divider";
import Input from "@/components/common/Input";
import { Sparkle } from "@phosphor-icons/react";
import Personality from "./Personality";
import React from "react";
import { Textarea } from "@heroui/input";
import { Slider } from "@heroui/slider";
import Select from "@/components/common/Select";
import Avatar from "./Avatar";

export default function BasicInfo() {
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
      <Divider className="mt-0 pt-0" />
      <div className="space-y-8">
        <Avatar />
        <Input
          label="Name"
          labelPlacement="outside"
          placeholder="Enter copilot name"
        />
        <Personality />
        <Textarea
          minRows={20}
          labelPlacement="outside"
          label="Persona"
          placeholder="Enter your description"
          defaultValue="I am a helpful assistant."
        >
          Persona
        </Textarea>
        <Slider
          color="foreground"
          defaultValue={0.2}
          label="Creativity Level"
          maxValue={1}
          minValue={0}
          showSteps={true}
          size="sm"
          step={0.02}
        />
        <Select
          label="AI Model"
          labelPlacement="outside"
          defaultSelectedKeys="0"
          items={listModel}
          children={null}
        />
      </div>
    </Card>
  );
}
