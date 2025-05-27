"use client";

import React from "react";

import Card from "@/components/common/Card";

import { AccountManagerProvider, UserTable } from "./components";

export default function AccountManager() {
  return (
    <AccountManagerProvider>
      <div className="flex flex-col gap-4">
        <Card
          header={
            <div>
              <h2 className="text-xl font-bold">Account Management</h2>
              <p className="text-sm text-gray-500">
                Manage all user accounts and their authentication settings
              </p>
            </div>
          }
        >
          <UserTable />
        </Card>
      </div>
    </AccountManagerProvider>
  );
}
