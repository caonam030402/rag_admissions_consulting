"use client";

import { Controller, useFormContext } from "react-hook-form";

import { cn } from "@/libs/utils";

import type { SurveyFormSchema } from "../validates";

const personalityOptions = [
  "Hướng ngoại",
  "Hướng nội",
  "Cẩn thận",
  "Sáng tạo",
  "Quyết đoán",
  "Linh hoạt",
];

const strengthOptions = [
  "Tư duy phân tích",
  "Khả năng lãnh đạo",
  "Sáng tạo",
  "Kỹ năng giao tiếp",
  "Quản lý thời gian",
  "Làm việc nhóm",
];

const weaknessOptions = [
  "Thiếu kinh nghiệm",
  "Khó nói không",
  "Lo lắng khi thuyết trình",
  "Thiếu kiên nhẫn",
  "Quá cầu toàn",
];

export default function PersonalityTraitsStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<SurveyFormSchema>();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Tính cách của bạn
          </h2>
          <p className="text-sm text-gray-500">
            Chọn những đặc điểm tính cách phù hợp với bạn
          </p>
        </div>

        <Controller
          name="personality"
          control={control}
          render={({ field }) => (
            <div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {personalityOptions.map((trait) => {
                  const isSelected = field.value?.includes(trait) || false;
                  return (
                    <div
                      key={trait}
                      onClick={() => {
                        const newValue = isSelected
                          ? field.value.filter((t) => t !== trait)
                          : [...(field.value || []), trait];
                        field.onChange(newValue);
                      }}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-xl border p-3 transition-all",
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                      )}
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          const newValue = isSelected
                            ? field.value.filter((t) => t !== trait)
                            : [...(field.value || []), trait];
                          field.onChange(newValue);
                        }
                      }}
                    >
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded border",
                          isSelected
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300",
                        )}
                      >
                        {isSelected && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            fill="white"
                            className="size-3"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.739a.75.75 0 0 1 1.04-.208Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span>{trait}</span>
                    </div>
                  );
                })}
              </div>
              {errors.personality && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.personality.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <div className="space-y-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Điểm mạnh của bạn
          </h2>
          <p className="text-sm text-gray-500">
            Chọn những điểm mạnh nổi bật của bạn
          </p>
        </div>

        <Controller
          name="strengths"
          control={control}
          render={({ field }) => (
            <div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {strengthOptions.map((strength) => {
                  const isSelected = field.value?.includes(strength) || false;
                  return (
                    <div
                      key={strength}
                      onClick={() => {
                        const newValue = isSelected
                          ? field.value.filter((s) => s !== strength)
                          : [...(field.value || []), strength];
                        field.onChange(newValue);
                      }}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-xl border p-3 transition-all",
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                      )}
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          const newValue = isSelected
                            ? field.value.filter((s) => s !== strength)
                            : [...(field.value || []), strength];
                          field.onChange(newValue);
                        }
                      }}
                    >
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded border",
                          isSelected
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300",
                        )}
                      >
                        {isSelected && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            fill="white"
                            className="size-3"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.739a.75.75 0 0 1 1.04-.208Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span>{strength}</span>
                    </div>
                  );
                })}
              </div>
              {errors.strengths && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.strengths.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <div className="space-y-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Điểm yếu của bạn
          </h2>
          <p className="text-sm text-gray-500">
            Chọn những điểm bạn cần cải thiện
          </p>
        </div>

        <Controller
          name="weaknesses"
          control={control}
          render={({ field }) => (
            <div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {weaknessOptions.map((weakness) => {
                  const isSelected = field.value?.includes(weakness) || false;
                  return (
                    <div
                      key={weakness}
                      onClick={() => {
                        const newValue = isSelected
                          ? field.value.filter((w) => w !== weakness)
                          : [...(field.value || []), weakness];
                        field.onChange(newValue);
                      }}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-xl border p-3 transition-all",
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                      )}
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          const newValue = isSelected
                            ? field.value.filter((w) => w !== weakness)
                            : [...(field.value || []), weakness];
                          field.onChange(newValue);
                        }
                      }}
                    >
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded border",
                          isSelected
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300",
                        )}
                      >
                        {isSelected && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            fill="white"
                            className="size-3"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.739a.75.75 0 0 1 1.04-.208Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span>{weakness}</span>
                    </div>
                  );
                })}
              </div>
              {errors.weaknesses && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.weaknesses.message}
                </p>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
}
