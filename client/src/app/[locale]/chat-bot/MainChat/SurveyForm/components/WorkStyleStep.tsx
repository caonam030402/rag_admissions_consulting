"use client";

import { Star } from "@phosphor-icons/react";
import { Controller, useFormContext } from "react-hook-form";

import { cn } from "@/libs/utils";

import type { SurveyFormSchema } from "../validates";

const workStyleOptions = [
  "Làm việc độc lập",
  "Làm việc nhóm",
  "Kết hợp cả hai",
];

export default function WorkStyleStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<SurveyFormSchema>();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Phong cách làm việc
          </h2>
          <p className="text-sm text-gray-500">
            Bạn thích làm việc như thế nào?
          </p>
        </div>

        <Controller
          name="workStyle"
          control={control}
          render={({ field }) => (
            <div>
              <div className="flex flex-col gap-3">
                {workStyleOptions.map((style) => {
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
              {errors.workStyle && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.workStyle.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <div className="mt-8">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="flex size-24 items-center justify-center rounded-full bg-blue-50">
            <div className="text-blue-500">
              <Star weight="fill" size={48} />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">Chúc mừng!</h2>
            <p className="text-sm text-gray-500">
              Bạn đã hoàn thành khảo sát. Nhấn nút hoàn tất để xem kết quả.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
