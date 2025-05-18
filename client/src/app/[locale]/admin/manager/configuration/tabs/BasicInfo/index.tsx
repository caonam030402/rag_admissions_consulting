import { Textarea } from "@heroui/input";
import { Slider } from "@heroui/slider";
import { Sparkle } from "@phosphor-icons/react";
import React, { useState } from "react";

import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Divider from "@/components/common/Divider";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";

import { useConfiguration } from "../../ConfigurationContext";
import Avatar from "./Avatar";
import Personality from "./Personality";

export default function BasicInfo() {
  const { setIsDirty } = useConfiguration();
  const [formData, setFormData] = useState({
    name: "",
    persona: "I am a helpful assistant.",
    creativityLevel: 0.2,
    modelKey: "0",
  });
  
  const listModel = [
    { key: "0", label: "OpenAI GPT-3.5 Turbo (1 credit/message)" },
    { key: "50", label: "OpenAI GPT-3.5 Turbo (1 credit/message)" },
    { key: "100", label: "OpenAI GPT-3.5 Turbo (1 credit/message)" },
  ];
  
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };
  
  return (
    <Card
      className="h-[calc(100vh-210px)]"
      header={
        <div className="flex w-full justify-between">
          <div>
            <div>Basic Info</div>
            <p className="text-xs">
              Manage your Copilot name, persona, and AI model settings to define
              its core identity and behavior.
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
        <Avatar onChange={() => setIsDirty(true)} />
        <Input
          label="Name"
          labelPlacement="outside"
          placeholder="Enter copilot name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        <Personality onChange={() => setIsDirty(true)} />
        <Textarea
          minRows={20}
          labelPlacement="outside"
          label="Persona"
          placeholder="Enter your description"
          value={formData.persona}
          onChange={(e) => handleChange("persona", e.target.value)}
        >
          Persona
        </Textarea>
        <Slider
          color="foreground"
          value={formData.creativityLevel}
          label="Creativity Level"
          maxValue={1}
          minValue={0}
          showSteps
          size="sm"
          step={0.02}
          onChange={(value) => handleChange("creativityLevel", value)}
        />
        <Select
          label="AI Model"
          labelPlacement="outside"
          selectedKeys={[formData.modelKey]}
          items={listModel}
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys)[0]?.toString() || "0";
            handleChange("modelKey", selectedKey);
          }}
          // eslint-disable-next-line react/no-children-prop
          children={null}
        />
      </div>
    </Card>
  );
}
