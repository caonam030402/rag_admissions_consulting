import React from "react";

import BodyMainChat from "./Body";
import EnterContent from "./EnterContent";
import HeaderMainChat from "./Header";
import SideNavigation from "./SideNavigation";

export default function MainChat() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Sidebar Navigation */}
      <SideNavigation />

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        <HeaderMainChat />
        <div className="relative flex-1 overflow-hidden">
          <div className="mx-auto h-full max-w-4xl px-6">
            <BodyMainChat />
            <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-4xl px-6 pb-6">
              <EnterContent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
