"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

import { userService } from "@/services/user";
import type { CreateUserFormValues } from "@/validations/userValidation";

interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
  secretCode?: string;
  google2faEnabled?: boolean;
}

interface AccountManagerContextType {
  users: User[];
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  createUser: (userData: CreateUserFormValues) => Promise<any>;
  deleteUser: (userId: number) => Promise<void>;
  resetPassword: (userId: number) => Promise<void>;
  toggleGoogle2FA: (userId: number, enabled: boolean) => Promise<void>;
  replaceSecretCode: (
    userId: number,
  ) => Promise<{ secretCode: string; qrCodeUrl: string }>;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
  showQRModal: boolean;
  setShowQRModal: (show: boolean) => void;
  qrCodeData: { secretCode: string; qrCodeUrl: string } | null;
  setQRCodeData: (
    data: { secretCode: string; qrCodeUrl: string } | null,
  ) => void;
}

const AccountManagerContext = createContext<
  AccountManagerContextType | undefined
>(undefined);

export function AccountManagerProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeData, setQRCodeData] = useState<{
    secretCode: string;
    qrCodeUrl: string;
  } | null>(null);

  // Use the service hooks for API operations
  const { data, isLoading, error } = userService.useGetUsers(searchTerm);
  const createUserMutation = userService.useCreateUser();
  const deleteUserMutation = userService.useDeleteUser();
  const resetPasswordMutation = userService.useResetPassword();
  const toggleGoogle2FAMutation = userService.useToggle2FA();
  const replaceSecretCodeMutation = userService.useReplaceSecretCode();

  const value = useMemo(
    () => ({
      users: data?.data || [],
      isLoading,
      error: error as Error | null,
      searchTerm,
      setSearchTerm,
      createUser: async (userData: CreateUserFormValues) => {
        const result = await createUserMutation.mutateAsync(userData);
        setQRCodeData({
          secretCode: result.secretCode,
          qrCodeUrl: result.qrCodeUrl,
        });
        setShowQRModal(true);
        return result;
      },
      deleteUser: (userId: number) => deleteUserMutation.mutateAsync(userId),
      resetPassword: (userId: number) =>
        resetPasswordMutation.mutateAsync(userId),
      toggleGoogle2FA: (userId: number, enabled: boolean) =>
        toggleGoogle2FAMutation.mutateAsync({ userId, enabled }),
      replaceSecretCode: async (userId: number) => {
        const result = await replaceSecretCodeMutation.mutateAsync(userId);
        return result;
      },
      selectedUser,
      setSelectedUser,
      showCreateModal,
      setShowCreateModal,
      showQRModal,
      setShowQRModal,
      qrCodeData,
      setQRCodeData,
    }),
    [
      data,
      isLoading,
      error,
      searchTerm,
      createUserMutation,
      deleteUserMutation,
      resetPasswordMutation,
      toggleGoogle2FAMutation,
      replaceSecretCodeMutation,
      selectedUser,
      showCreateModal,
      showQRModal,
      qrCodeData,
    ],
  );

  return (
    <AccountManagerContext.Provider value={value}>
      {children}
    </AccountManagerContext.Provider>
  );
}

export function useAccountManager() {
  const context = useContext(AccountManagerContext);
  if (context === undefined) {
    throw new Error(
      "useAccountManager must be used within an AccountManagerProvider",
    );
  }
  return context;
}
