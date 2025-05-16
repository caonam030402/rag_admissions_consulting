"use client";

import React from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import TableList from "@/components/common/Table";
import { useAccountManager } from "./AccountManagerContext";
import SecretCodeCell from "./SecretCodeCell";
import Google2FASwitch from "./Google2FASwitch";
import ActionButtons from "./ActionButtons";
import CreateUserModal from "./CreateUserModal";
import QRCodeDialog from "./QRCodeDialog";

export default function UserTable() {
  const {
    users,
    isLoading,
    searchTerm,
    setSearchTerm,
    showCreateModal,
    setShowCreateModal,
    showQRModal,
  } = useAccountManager();

  // Prepare users data with consistent property formats based on API response
  const userData = React.useMemo(() => {
    if (!users || !Array.isArray(users)) return [];

    return users.map((user) => ({
      ...user,
      // Create a formatted full name from firstName and lastName
      name:
        user.name ||
        (user.firstName || user.lastName
          ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
          : "Unknown"),
      // Handle role format (might be an object with name property)
      role:
        typeof user.role === "object" ? user.role?.name : user.role || "User",
      // Ensure key property for table rows
      key: String(user.id),
    }));
  }, [users]);

  const columns = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "name",
      label: "Full Name",
    },
    {
      key: "role",
      label: "Role",
    },
    {
      key: "secretCode",
      label: "Secret Code",
      render: (user: any) => <SecretCodeCell user={user} />,
    },
    {
      key: "google2faEnabled",
      label: "Google 2FA Status",
      render: (user: any) => <Google2FASwitch user={user} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (user: any) => <ActionButtons user={user} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="w-1/3">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="sm"
            startContent={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            }
          />
        </div>
        <Button color="primary" onClick={() => setShowCreateModal(true)}>
          Create Account
        </Button>
      </div>

      <TableList
        columns={columns}
        data={userData}
        isLoading={isLoading}
        aria-label="User accounts table"
      />

      {showCreateModal && <CreateUserModal />}
      {showQRModal && <QRCodeDialog />}
    </div>
  );
}
