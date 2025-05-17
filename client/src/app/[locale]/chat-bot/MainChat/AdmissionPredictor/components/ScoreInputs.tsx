import { Input } from "@heroui/react";
import React from "react";

import type { ScoreInputsProps } from "@/types/admissionPredictor";

import { SUBJECTS } from "../data";

export const ScoreInputs: React.FC<ScoreInputsProps> = ({
  activeSubjects,
  register,
  errors,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {activeSubjects.map((subject) => {
        const subjectKey = SUBJECTS[subject as keyof typeof SUBJECTS];
        // Cast the field name to satisfy TypeScript
        const fieldName = `scores.${subjectKey}` as const;
        const error = errors?.[subjectKey];

        return (
          <div
            key={subject}
            className="flex flex-col gap-1 rounded-lg border border-gray-200 p-3"
          >
            <div className="flex items-center gap-3">
              <Input
                type="number"
                step="0.01"
                id={`score-${subjectKey}`}
                {...register(fieldName, {
                  valueAsNumber: true,
                  required: "Điểm là bắt buộc",
                  min: { value: 0, message: "Điểm không được âm" },
                  max: { value: 10, message: "Điểm tối đa là 10" },
                })}
                className={`w-full rounded-md border ${error ? "border-red-400" : "border-gray-200"} p-2 text-center`}
                aria-invalid={!!error}
                aria-describedby={error ? `${subject}-error` : undefined}
              />
              <label
                htmlFor={`score-${subjectKey}`}
                className="w-12 text-sm font-medium"
              >
                {subject}
              </label>
            </div>
            {error && (
              <p 
                id={`${subject}-error`} 
                className="text-xs text-red-500"
              >
                {error.message}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}; 