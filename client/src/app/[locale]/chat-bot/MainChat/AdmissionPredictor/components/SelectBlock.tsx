import { Select, SelectItem } from "@heroui/react";
import React from "react";

import type { BlockSelectProps } from "@/types/admissionPredictor";

import { BLOCKS } from "../data";

export const SelectBlock: React.FC<BlockSelectProps> = ({
  setValue,
  currentBlock,
  errors,
  filteredMajors,
}) => {
  return (
    <div>
      <label
        className="mb-2 block text-sm font-medium"
        id="block-label"
      >
        Khối thi
      </label>
      <Select
        aria-labelledby="block-label"
        items={Object.keys(BLOCKS).map((block) => ({
          key: block,
          label: `${block} - ${BLOCKS[block as keyof typeof BLOCKS].join(", ")}`,
        }))}
        onChange={(e) => {
          if (e.target.value) {
            setValue("selectedBlock", e.target.value);
          }
        }}
        defaultSelectedKeys={[currentBlock]}
        className={`w-full ${errors?.selectedBlock ? "border-red-400" : ""}`}
        classNames={{
          trigger: "h-10 border border-gray-200 bg-white",
        }}
      >
        {(block) => (
          <SelectItem key={block.key}>{block.label}</SelectItem>
        )}
      </Select>
      {errors?.selectedBlock && (
        <p className="mt-1 text-xs text-red-500">
          {errors.selectedBlock.message}
        </p>
      )}
      <p className="mt-1 text-xs text-blue-600">
        {filteredMajors.length} ngành học phù hợp với khối{" "}
        {currentBlock}
      </p>
    </div>
  );
}; 