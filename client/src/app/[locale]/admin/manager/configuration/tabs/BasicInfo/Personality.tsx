import ListBox from "@/components/common/ListBox";
import RatioGroup from "@/components/common/RadioGroup";
import React from "react";

export default function Personality() {
  const personality = [
    { title: "Professional 🧐", value: "1" },
    { title: "Sassy 🤪", value: "2" },
    { title: "Empathetic 🥺", value: "3" },
    { title: "Formal 🤓", value: "4" },
    { title: "Humorous 😉", value: "5" },
    { title: "Friendly 😚", value: "6" },
  ];
  return (
    <div>
      <div className="text-sm mb-2">Personality</div>
      <RatioGroup items={personality} action={(key) => console.log(key)} />
    </div>
  );
}
