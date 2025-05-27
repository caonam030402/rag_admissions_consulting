import type { InputProps } from "@heroui/input";
import { Input as InputUI } from "@heroui/input";
import React, { forwardRef } from "react";

interface IProps extends InputProps {
  children?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, IProps>(
  ({ children, ...props }, ref) => {
    return (
      <InputUI classNames={{ inputWrapper: "border" }} ref={ref} {...props}>
        {children}
      </InputUI>
    );
  },
);

Input.displayName = "Input";

export default Input;
