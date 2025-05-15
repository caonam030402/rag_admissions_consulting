import type { SelectProps } from "@heroui/react";
import { Select as SelectUI, SelectItem } from "@heroui/react";
import React, { forwardRef } from "react";

interface IProps extends SelectProps {
  items: Array<{
    label: string;
    key: string;
  }>;
}

const Select = forwardRef<HTMLInputElement, IProps>(({ ...props }, ref) => {
  return (
    <SelectUI ref={ref as any} {...props}>
      {props.items.map((item) => (
        <SelectItem key={item.key}>{item.label}</SelectItem>
      ))}
    </SelectUI>
  );
});

Select.displayName = "Select";

export default Select;
