import { Radio, RadioGroup } from "@heroui/react";
import React, { useEffect } from "react";

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

  // Update selected value when defaultValue changes
  useEffect(() => {
    if (defaultValue !== undefined) {
      setSelected(defaultValue);
    }
  }, [defaultValue]);

  const handleValueChange = (value: string) => {
    setSelected(value);
    action(value);
  };

  return (
    <div className="flex">
      <RadioGroup
        className="flex-row"
        classNames={{
          wrapper: "flex flex-row gap-8",
        }}
        value={selected}
        onValueChange={handleValueChange}
      >
        {items.map((item) => (
          <Radio
            key={item.value}
            classNames={{
              hiddenInput: "hidden",
              label: "text-sm",
            }}
            value={item.value}
          >
            {item.title}
          </Radio>
        ))}
      </RadioGroup>
    </div>
  );
}
