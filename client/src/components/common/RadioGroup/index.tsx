import { Radio, RadioGroup } from "@heroui/react";
import React from "react";
import Button from "../Button";

interface Props {
  items: {
    value: string;
    title: string;
  }[];
  action: (key: string) => void;
  defaultValue?: string;
}

export default function RatioGroup({ items, action, defaultValue }: Props) {
  const [selected, setSelected] = React.useState(defaultValue);
  return (
    <div className="flex">
      <RadioGroup
        className="flex-row"
        classNames={{
          wrapper: "flex flex-row gap-8",
        }}
        value={selected}
        onValueChange={setSelected}
      >
        {items.map((item) => (
          <Radio
            classNames={{
              hiddenInput: "hidden",
              label: "text-sm",
            }}
            value={item.value}
            onChange={() => action(item.value)}
          >
            {item.title}
          </Radio>
        ))}
      </RadioGroup>
    </div>
  );
}
