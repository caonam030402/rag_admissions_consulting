import { Tab as TabItem, Tabs, type TabsProps } from "@heroui/react";
import React from "react";

interface IProps extends TabsProps {
  listTab: {
    title: string;
    key: number | string;
    content: React.ReactNode;
  }[];
}
export default function Tab({ listTab, ...props }: IProps) {
  return (
    <Tabs
      classNames={{
        tabList:
          "gap-6 w-full relative rounded-none p-0 border-b border-divider",
        cursor: "w-full ",
        tab: "max-w-fit px-0 h-10",
      }}
      variant="underlined"
      {...props}
    >
      {listTab.map((item) => (
        <TabItem key={item.key} title={item.title}>
          {item.content}
        </TabItem>
      ))}
    </Tabs>
  );
}
