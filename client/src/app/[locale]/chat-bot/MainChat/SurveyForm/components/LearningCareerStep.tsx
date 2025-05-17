"use client";

import { Controller, useFormContext } from "react-hook-form";

import { cn } from "@/libs/utils";

import type { SurveyFormSchema } from "../validates";

const learningStyleOptions = [
  "Học qua thực hành",
  "Học qua quan sát",
  "Học qua lý thuyết",
  "Học qua thảo luận",
];

export default function LearningCareerStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<SurveyFormSchema>();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Phong cách học tập
          </h2>
          <p className="text-sm text-gray-500">
            Chọn phương pháp học tập hiệu quả nhất với bạn
          </p>
        </div>

        <Controller
          name="learningStyle"
          control={control}
          render={({ field }) => (
            <div>
              <div className="flex flex-col gap-3">
                {learningStyleOptions.map((style) => {
                  const isSelected = field.value === style;
                  return (
                    <div
                      key={style}
                      onClick={() => field.onChange(style)}
                      className={cn(
                        "flex cursor-pointer items-center rounded-xl border p-3 transition-all",
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                      )}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          field.onChange(style);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full border",
                            isSelected
                              ? "border-blue-500 p-0.5"
                              : "border-gray-300",
                          )}
                        >
                          {isSelected && (
                            <div className="size-3 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <span className="text-base">{style}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {errors.learningStyle && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.learningStyle.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <div className="space-y-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Mục tiêu nghề nghiệp
          </h2>
          <p className="text-sm text-gray-500">
            Mô tả ngắn gọn mục tiêu nghề nghiệp của bạn
          </p>
        </div>

        <Controller
          name="careerGoals"
          control={control}
          render={({ field }) => (
            <div>
              <textarea
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Ví dụ: Trở thành chuyên gia phân tích dữ liệu, làm việc tại các doanh nghiệp lớn..."
                className="h-32 w-full rounded-xl border border-gray-300 bg-transparent p-3 shadow-none outline-none focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
              />
              {errors.careerGoals && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.careerGoals.message}
                </p>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
}
