import React from "react";

import BodyMainChat from "./Body";
import EnterContent from "./EnterContent";
import HeaderMainChat from "./Header";

export default function MainChat() {
  return (
    <div className="flex h-screen flex-col">
      <HeaderMainChat />
      <div className="relative mx-auto h-full w-1/2">
        <BodyMainChat />
        <div className="absolute bottom-0 w-full">
          <EnterContent />
        </div>
      </div>
    </div>
  );
}
