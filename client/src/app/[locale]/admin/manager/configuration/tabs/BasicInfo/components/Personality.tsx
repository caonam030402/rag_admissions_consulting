import React from "react";

import RatioGroup from "@/components/common/RadioGroup";

interface PersonalityProps {
  onChange?: () => void;
}

export default function Personality({ onChange }: PersonalityProps) {
  const personality = [
    { title: "Professional 🧐", value: "1" },
    { title: "Sassy 🤪", value: "2" },
    { title: "Empathetic 🥺", value: "3" },
    { title: "Formal 🤓", value: "4" },
    { title: "Humorous 😉", value: "5" },
    { title: "Friendly 😚", value: "6" },
  ];
  
  const handlePersonalityChange = (key: string) => {
    console.log(key);
    onChange?.();
  };

  return (
    <div>
      <div className="mb-2 text-sm">Personality</div>
      <RatioGroup items={personality} action={handlePersonalityChange} />
    </div>
  );
}
