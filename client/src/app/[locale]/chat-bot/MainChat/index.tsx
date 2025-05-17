import React from "react";

import BodyMainChat from "./Body";
import EnterContent from "./EnterContent";
import HeaderMainChat from "./Header";
import SideNavigation from "./SideNavigation";

export default function MainChat() {
  return (
    <div className="flex h-screen flex-col">
      <HeaderMainChat />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <SideNavigation />

        {/* Main Chat Area */}
        <div className="relative flex-1 h-full overflow-hidden">
          <div className="mx-auto h-full max-w-4xl px-6">
            <BodyMainChat />
            <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-4xl px-6">
              <EnterContent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
