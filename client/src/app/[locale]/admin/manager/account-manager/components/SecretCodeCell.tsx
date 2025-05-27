"use client";

import { Button } from "@heroui/button";
import React, { useState } from "react";

import { useAccountManager } from "./AccountManagerContext";

interface SecretCodeCellProps {
  user: {
    id: number;
    // The API might use different property names for secret code
    secretCode?: string;
    secret?: string;
    twoFactorSecret?: string;
  };
}

export default function SecretCodeCell({ user }: SecretCodeCellProps) {
  const { replaceSecretCode, setQRCodeData, setShowQRModal } =
    useAccountManager();
  const [isLoading, setIsLoading] = useState(false);

  // Try to get the secret code from different possible property names
  const secretCode =
    user.secretCode || user.secret || user.twoFactorSecret || "";

  // Function to mask the secret code, showing only first 4 and last 3 characters
  const maskSecretCode = (code: string) => {
    if (!code) return "Not set";

    const firstFour = code.substring(0, 4);
    const lastThree = code.substring(code.length - 3);
    return `${firstFour}***${lastThree}`;
  };

  const handleReplaceClick = async () => {
    try {
      setIsLoading(true);
      const result = await replaceSecretCode(user.id);

      // Show QR Code modal with new secret code
      setQRCodeData(result);
      setShowQRModal(true);
    } catch (error) {
      console.error("Failed to replace secret code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="font-mono">{maskSecretCode(secretCode)}</span>
      <Button
        size="sm"
        variant="flat"
        color="primary"
        isLoading={isLoading}
        onClick={handleReplaceClick}
      >
        Replace
      </Button>
    </div>
  );
}
