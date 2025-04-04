import React from "react";

import BodyMainChat from "./Body";
import EnterContent from "./EnterContent";
import HeaderMainChat from "./Header";

export default function MainChat() {
  return (
    <div className="flex h-screen flex-col">
      <HeaderMainChat />
      <BodyMainChat />
      <EnterContent />
    </div>
  );
}
