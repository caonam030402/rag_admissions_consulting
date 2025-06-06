"use client";

import { GraduationCap, RocketLaunch, Sparkle } from "@phosphor-icons/react";
import React from "react";

export default function WelcomeSection() {
  return (
    <div className="space-y-3">
      {/* Main welcome card */}
      <div className="rounded-lg bg-blue-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
            <GraduationCap size={18} weight="fill" className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold">Chào mừng bạn!</h2>
            <p className="text-sm text-blue-100">Hệ thống tư vấn tuyển sinh AI</p>
          </div>
        </div>
      </div>

      
    </div>
  );
}
