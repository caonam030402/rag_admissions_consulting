import { Checkbox } from "@heroui/react";
import React from "react";

import { HISTORICAL_DATA } from "../data";
import { MajorSelectionProps } from "@/types/admissionPredictor";

export const MajorSelectionList: React.FC<MajorSelectionProps> = ({
  filteredMajors,
  currentBlock,
  errors,
  selectedPreferences,
  onCheckboxChange,
}) => {
  return (
    <div>
      <label
        id="majors-label"
        className="mb-2 flex justify-between text-sm font-medium"
      >
        <span>Ngành học mong muốn</span>
        <span
          className={`text-xs ${selectedPreferences.length >= 10 ? "font-semibold text-red-500" : "text-gray-500"}`}
        >
          Đã chọn: {selectedPreferences.length}/10
        </span>
      </label>
      <div
        className={`scroll max-h-[calc(100vh-43rem)] rounded-md border ${errors?.preferences ? "border-red-400" : "border-gray-200"} p-2`}
        aria-labelledby="majors-label"
      >
        {filteredMajors.length > 0 ? (
          filteredMajors.map((major) => {
            const isSelected = selectedPreferences.includes(major);
            const isMaxSelected =
              selectedPreferences.length >= 10 && !isSelected;

            return (
              <div
                key={major}
                className={`mb-1 flex items-center rounded-md p-1 ${isSelected ? "bg-blue-50" : ""} hover:bg-gray-50`}
              >
                <Checkbox
                  id={`major-${major}`}
                  color="primary"
                  value={major}
                  isSelected={isSelected}
                  isDisabled={isMaxSelected}
                  onValueChange={(checked) => onCheckboxChange(major, checked)}
                />
                <label
                  htmlFor={`major-${major}`}
                  className={`ml-2 flex-1 text-sm ${isMaxSelected ? "text-gray-400" : ""} cursor-pointer`}
                  onClick={() => onCheckboxChange(major, !isSelected)}
                >
                  {major}
                  <span className="ml-2 text-xs text-gray-500">
                    (
                    {
                      HISTORICAL_DATA[major as keyof typeof HISTORICAL_DATA][
                        "2023"
                      ]
                    }
                    )
                  </span>
                </label>
              </div>
            );
          })
        ) : (
          <p className="py-4 text-center text-gray-500">
            Không có ngành nào phù hợp với khối {currentBlock}
          </p>
        )}
      </div>
      {errors?.preferences && (
        <p className="mt-1 text-sm text-red-500">
          {errors.preferences.message}
        </p>
      )}
    </div>
  );
};
