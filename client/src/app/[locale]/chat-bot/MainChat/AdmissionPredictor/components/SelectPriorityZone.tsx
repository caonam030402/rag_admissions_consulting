import { Select, SelectItem } from "@heroui/react";
import React from "react";

import type { PriorityZoneProps } from "@/types/admissionPredictor";

import { PRIORITY_ZONES } from "../data";

export const SelectPriorityZone: React.FC<PriorityZoneProps> = ({
  setValue,
  watch,
}) => {
  const currentZone = watch("priorityZone");

  return (
    <div>
      <label
        className="mb-2 block text-sm font-medium"
        id="priority-zone-label"
      >
        Khu vực ưu tiên
      </label>
      <Select
        aria-labelledby="priority-zone-label"
        items={Object.entries(PRIORITY_ZONES).map(([zone, point]) => ({
          key: zone,
          label: `${zone} (+${point} điểm)`,
        }))}
        onChange={(e) => {
          if (e.target.value) {
            setValue(
              "priorityZone",
              e.target.value as "KV1" | "KV2-NT" | "KV2" | "KV3",
            );
          }
        }}
        defaultSelectedKeys={[currentZone]}
        className="w-full"
        classNames={{
          trigger: "h-10 border border-gray-200 bg-white",
        }}
      >
        {(zone) => <SelectItem key={zone.key}>{zone.label}</SelectItem>}
      </Select>
    </div>
  );
};
