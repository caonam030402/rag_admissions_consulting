import React from "react";

export default function IsTyping() {
  return (
    <div className="flex items-center gap-2 p-1">
      <div className="size-2 animate-bounce rounded-full bg-blue-400" />
      <div className="size-2 animate-bounce rounded-full bg-blue-500 delay-100" />
      <div className="size-2 animate-bounce rounded-full bg-blue-600 delay-200" />
    </div>
  );
}
