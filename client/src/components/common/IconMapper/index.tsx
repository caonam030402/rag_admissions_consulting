"use client";

import type { IconProps } from "@phosphor-icons/react";
import {
  ArrowRight,
  GraduationCap,
  Medal,
  Question,
  UserList,
  Wallet,
} from "@phosphor-icons/react";
import React from "react";

const iconMap = {
  wallet: Wallet,
  graduationCap: GraduationCap,
  userList: UserList,
  medal: Medal,
  arrowRight: ArrowRight,
};

type IconName = keyof typeof iconMap;

interface Props extends Omit<IconProps, "ref"> {
  name: IconName | string;
}

export default function IconMapper({ name, ...props }: Props) {
  const IconComponent = iconMap[name as IconName] || Question;
  return <IconComponent {...props} />;
}
