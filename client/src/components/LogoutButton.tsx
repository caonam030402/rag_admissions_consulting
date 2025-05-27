"use client";

import { useCallback } from "react";

import { signOut } from "@/configs/auth/action";
import { authService } from "@/services/auth";

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const handleLogout = useCallback(async () => {
    try {
      // Gọi API logout từ client side trước
      await authService.logout();
      // Sau đó gọi server action để clear cookie và session
      await signOut();
    } catch (error) {
      // Ngay cả khi API call thất bại, vẫn tiếp tục logout
      console.error("Logout API error:", error);
      await signOut();
    }
  }, []);

  return (
    <button className={className} onClick={handleLogout}>
      {children || "Đăng xuất"}
    </button>
  );
}
