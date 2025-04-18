"use client";

import type { OverlayPlacement } from "@heroui/aria-utils";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@heroui/react";
import React from "react";

import User from "@/components/common/User";
import { userMenuOptions } from "@/constants/setting";
import useIsClient from "@/hooks/useIsClient";

import AccountHeader from "./AccountHeader";

export interface IProps {
  info?: {
    name?: string | null | undefined;
    email?: string | null | undefined;
    avatar?: string;
  };
  placement?: OverlayPlacement;
  menuOptions?: IMenuUserOption[];
  onlyAvatar?: boolean;
}

export default function UserSetting({
  info,
  placement = "left-start",
  menuOptions = userMenuOptions,
  onlyAvatar = false,
}: IProps) {
  const isClient = useIsClient();

  return (
    isClient && (
      <Dropdown placement={placement}>
        <DropdownTrigger>
          <div>
            <User
              shape="circle"
              onlyAvatar={onlyAvatar}
              info={{
                name: info?.name,
                email: info?.email,
                avatar:
                  info?.avatar ||
                  "https://i.pravatar.cc/150?u=a04258a2462d826712d",
              }}
            />
          </div>
        </DropdownTrigger>
        <DropdownMenu
          className="w-[20vw]"
          variant="faded"
          aria-label="Dropdown menu with "
        >
          <DropdownSection aria-label="Profile & Actions">
            <DropdownItem key="profile" isReadOnly>
              <AccountHeader info={info} />
            </DropdownItem>
          </DropdownSection>
          {
            menuOptions.map((item, index) => (
              <DropdownSection
                key={item.id}
                title={item.title}
                showDivider={index !== userMenuOptions.length - 1}
              >
                {item.children!.map((child) => (
                  <DropdownItem
                    key={child.id}
                    onPress={() => child.action?.()}
                    startContent={<span>{child.icon}</span>}
                  >
                    {child.title}
                  </DropdownItem>
                ))}
              </DropdownSection>
            )) as any
          }
        </DropdownMenu>
      </Dropdown>
    )
  );
}
