import type { TextAreaProps } from "@heroui/input";
import { Textarea as TextareaUI } from "@heroui/input";
import React, { forwardRef } from "react";

interface IProps extends TextAreaProps {
  children?: React.ReactNode;
}

const Textarea = forwardRef<HTMLInputElement, IProps>(
  ({ children, ...props }, ref) => {
    return (
      <TextareaUI
        classNames={{ inputWrapper: "border" }}
        ref={ref as any}
        {...props}
      >
        {children}
      </TextareaUI>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
