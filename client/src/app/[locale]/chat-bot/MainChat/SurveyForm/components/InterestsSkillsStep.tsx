"use client";

import { Controller, useFormContext } from "react-hook-form";

import { cn } from "@/libs/utils";

import type { SurveyFormSchema } from "../validates";

const interestOptions = [
  "Công nghệ",
  "Kinh doanh",
  "Nghệ thuật",
  "Khoa học",
  "Y tế",
  "Giáo dục",
  "Truyền thông",
  "Du lịch",
  "Thể thao",
];

const skillOptions = [
  "Lập trình",
  "Phân tích dữ liệu",
  "Thiết kế",
  "Quản lý",
  "Giao tiếp",
  "Giải quyết vấn đề",
  "Sáng tạo",
  "Tổ chức",
  "Thuyết trình",
];

export default function InterestsSkillsStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<SurveyFormSchema>();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Sở thích của bạn
          </h2>
          <p className="text-sm text-gray-500">
            Chọn những lĩnh vực bạn đang quan tâm
          </p>
        </div>

        <Controller
          name="interests"
          control={control}
          render={({ field }) => (
            <div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {interestOptions.map((interest) => {
                  const isSelected = field.value?.includes(interest) || false;
                  return (
                    <div
                      key={interest}
                      onClick={() => {
                        const newValue = isSelected
                          ? field.value.filter((i) => i !== interest)
                          : [...(field.value || []), interest];
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
                            ? field.value.filter((i) => i !== interest)
                            : [...(field.value || []), interest];
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
                      <span>{interest}</span>
                    </div>
                  );
                })}
              </div>
              {errors.interests && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.interests.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <div className="space-y-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Kỹ năng của bạn
          </h2>
          <p className="text-sm text-gray-500">
            Chọn những kỹ năng bạn tự tin nhất
          </p>
        </div>

        <Controller
          name="skills"
          control={control}
          render={({ field }) => (
            <div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {skillOptions.map((skill) => {
                  const isSelected = field.value?.includes(skill) || false;
                  return (
                    <div
                      key={skill}
                      onClick={() => {
                        const newValue = isSelected
                          ? field.value.filter((s) => s !== skill)
                          : [...(field.value || []), skill];
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
                            ? field.value.filter((s) => s !== skill)
                            : [...(field.value || []), skill];
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
                      <span>{skill}</span>
                    </div>
                  );
                })}
              </div>
              {errors.skills && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.skills.message}
                </p>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
}
