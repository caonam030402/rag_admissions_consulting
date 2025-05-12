import { cn } from "@/libs/utils";
import { Listbox, ListboxItem } from "@heroui/react";
import { Key, useState } from "react";

interface Props {
  items: {
    key: string;
    label: string;
  }[];
  action: (key: Key) => void;
}

export default function ListBox({ items, action }: Props) {
  const [key, setKey] = useState<Key>();
  return (
    <div className="flex">
      <Listbox
        classNames={{
          list: "flex flex-row gap-3",
        }}
        aria-label="Actions"
        onAction={(key) => {
          setKey(key);
          action(key);
        }}
        shouldHighlightOnFocus={false}
        autoFocus={false}
        shouldFocusWrap={false}
      >
        {items.map((item) => (
          <ListboxItem
            className={cn("border p-2 w-auto ", {
              "bg-primary-300": item.key == key,
            })}
            key={item.key}
          >
            {item.label}
          </ListboxItem>
        ))}
      </Listbox>
    </div>
  );
}
