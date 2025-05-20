import {
  ChartPieSlice,
  Database,
  SlidersHorizontal,
  Users,
} from "@phosphor-icons/react";
import React from "react";

import { PATH } from "@/constants";

import SectionSideBar from "./SectionSideBar";

export const listSidebarItems = [
  {
    id: "0",
    title: "Overview",
    href: PATH.OVERVIEW,
    icon: <ChartPieSlice size={25} />,
    children: [],
  },
  {
    id: "2",
    title: "Configuration",
    href: PATH.CONFIGURATION,
    icon: <SlidersHorizontal size={25} />,
    children: [],
  },
  {
    id: "1",
    title: "Datasets",
    href: PATH.DATASET,
    icon: <Database size={25} />,
    children: [],
  },
  {
    id: "3",
    title: "Account Manager",
    href: PATH.ACCOUNT_MANAGER,
    icon: <Users size={25} />,
    children: [],
  },
];

export default function ListItemSideBar() {
  return (
    <div className="w-full space-y-2">
      {listSidebarItems.map((item) => (
        <SectionSideBar key={item.id} item={item} />
      ))}
    </div>
  );
}
