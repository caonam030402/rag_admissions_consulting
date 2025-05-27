import React, { useEffect, useState } from "react";

import RatioGroup from "@/components/common/RadioGroup";
import { personalityOptions } from "@/constants/adminConfig";

interface PersonalityProps {
  onChange?: (value: string) => void;
  value?: string;
}

export default function Personality({ onChange, value }: PersonalityProps) {
  const [personalityValue, setPersonalityValue] = useState(value || "1");

  useEffect(() => {
    if (value !== undefined) {
      setPersonalityValue(value);
    }
  }, [value]);

  const handlePersonalityChange = (key: string) => {
    setPersonalityValue(key);
    onChange?.(key);
  };

  return (
    <div>
      <div className="mb-2 text-sm">Personality</div>
      <RatioGroup
        items={personalityOptions}
        action={handlePersonalityChange}
        defaultValue={personalityValue}
      />
    </div>
  );
}
