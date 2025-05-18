"use client";

import { Switch } from "@heroui/switch";
import React, { useState } from "react";

import { useAccountManager } from "./AccountManagerContext";

interface Google2FASwitchProps {
  user: {
    id: number;
    // The API might use a different property name for this feature
    google2faEnabled?: boolean;
    twoFactorEnabled?: boolean;
    isTwoFactorEnabled?: boolean;
  };
}

export default function Google2FASwitch({ user }: Google2FASwitchProps) {
  const { toggleGoogle2FA } = useAccountManager();

  // Try to get the 2FA status from different possible property names
  const initialStatus =
    user.google2faEnabled ??
    user.twoFactorEnabled ??
    user.isTwoFactorEnabled ??
    false;

  const [isEnabled, setIsEnabled] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (value: boolean) => {
    try {
      setIsLoading(true);
      await toggleGoogle2FA(user.id, value);
      setIsEnabled(value);
    } catch (error) {
      console.error("Failed to toggle 2FA status:", error);
      // Revert the state if API call fails
      setIsEnabled(!value);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center">
      <Switch
        isSelected={isEnabled}
        onValueChange={handleToggle}
        isDisabled={isLoading}
        size="sm"
        color="primary"
      />
      <span className="ml-2">{isEnabled ? "Enabled" : "Disabled"}</span>
    </div>
  );
}
