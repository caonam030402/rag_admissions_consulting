import {
  AddressBookTabs,
  CalendarDots,
  Database,
  SquaresFour,
  VideoConference,
} from "@phosphor-icons/react";
import React from "react";

import SectionSideBar from "./SectionSideBar";

export const listSidebarItems = [
  {
    id: "1",
    title: "Datasets",
    href: "/admin/manager/data-set",
    icon: <Database size={25} />,
    children: [],
  },
  {
    id: "2",
    title: "Meetings",
    href: "/workplace/meetings",
    icon: <VideoConference size={25} />,
    children: [],
  },
  {
    id: "3",
    title: "Calendar",
    href: "/workplace/groups",
    icon: <CalendarDots size={25} />,
    children: [],
  },
  {
    id: "6",
    title: "Contact",
    href: "/workplace/settings",
    icon: <AddressBookTabs size={25} />,
    children: [],
  },
  {
    id: "8",
    title: "Workplace",
    href: "/workplace/settings",
    icon: <SquaresFour size={25} />,
    children: [
      {
        id: "5",
        title: "Contacts",
        href: "workplace/settings",
        icon: <SquaresFour size={25} />,
        children: [],
      },
      {
        id: "6",
        title: "Favor",
        href: "/workplace/settings",
        icon: <SquaresFour size={25} />,
        children: [],
      },
    ],
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
