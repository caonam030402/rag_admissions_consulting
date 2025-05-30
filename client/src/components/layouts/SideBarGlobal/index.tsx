/* eslint-disable jsx-a11y/no-static-element-interactions */

"use client";

import Link from "next/link";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import Logo from "@/components/common/Logo";
import { PATH } from "@/constants";
import { cn } from "@/libs/utils";
import { selectIsCollapsed } from "@/stores/setting/selectors";
import { setIsCollapsedSideBar } from "@/stores/setting/slice";

import useResize from "./hooks/useResize";
import ListItemSideBar from "./ListItemSideBar";

export default function SideBarGlobal() {
  const dispatch = useDispatch();
  const minWidth = 150;
  const minWidthCollapse = 70;
  const isCollapsedSideBar = useSelector(selectIsCollapsed);

  const checkHandleCollapse = (sidebarWidth: number, setSidebarWidth: any) => {
    if (sidebarWidth < minWidth + 10) {
      setSidebarWidth(minWidthCollapse);
      dispatch(setIsCollapsedSideBar(true));
    } else {
      dispatch(setIsCollapsedSideBar(false));
    }
  };
  const { sidebarWidth, handleMouseDown } = useResize({
    setAction: checkHandleCollapse,
    minWidth,
  });

  const isBetweenStyle = isCollapsedSideBar ? "flex flex-col items-center" : "";

  return (
    <div className="flex h-screen border-r">
      <div
        style={{ width: sidebarWidth }}
        className={cn("flex h-full w-[230px] flex-col justify-between p-3", {
          "px-1": isCollapsedSideBar,
        })}
      >
        <div className={cn("w-full space-y-6", isBetweenStyle)}>
          <Link href={PATH.HOME}>
            <div className="px-2 py-3">
              <Logo />
            </div>
          </Link>
          <ListItemSideBar />
        </div>
      </div>
      <div
        // cursor-col-resize
        // className="w-[2px]"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}
