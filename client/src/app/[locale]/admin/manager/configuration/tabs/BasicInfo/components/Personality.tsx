import React from "react";

import RatioGroup from "@/components/common/RadioGroup";
import { personalityOptions } from "@/constants/adminConfig";

interface PersonalityProps {
  onChange?: (value: string) => void;
  value?: string;
}

export default function Personality({ onChange, value }: PersonalityProps) {
  const handlePersonalityChange = (key: string) => {
    onChange?.(key);
  };

  return (
    <div>
      <div className="mb-2 text-sm">Personality</div>
      <RatioGroup
        items={personalityOptions}
        action={handlePersonalityChange}
        defaultValue={value || "professional"}
      />
    </div>
  );
}
