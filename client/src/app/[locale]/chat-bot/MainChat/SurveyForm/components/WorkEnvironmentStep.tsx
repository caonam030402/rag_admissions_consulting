"use client";

import { Controller, useFormContext } from "react-hook-form";

import { cn } from "@/libs/utils";

import type { SurveyFormSchema } from "../validates";

const workEnvironmentOptions = [
  "Văn phòng truyền thống",
  "Làm việc từ xa",
  "Môi trường năng động",
  "Môi trường sáng tạo",
  "Startup",
  "Doanh nghiệp lớn",
];

export default function WorkEnvironmentStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<SurveyFormSchema>();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Môi trường làm việc mong muốn
          </h2>
          <p className="text-sm text-gray-500">
            Bạn thích làm việc trong môi trường nào?
          </p>
        </div>

        <Controller
          name="workEnvironment"
          control={control}
          render={({ field }) => (
            <div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {workEnvironmentOptions.map((env) => {
                  const isSelected = field.value?.includes(env) || false;
                  return (
                    <div
                      key={env}
                      onClick={() => {
                        const newValue = isSelected
                          ? field.value.filter((e) => e !== env)
                          : [...(field.value || []), env];
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
                      onKeyDown={(evt) => {
                        if (evt.key === "Enter" || evt.key === " ") {
                          evt.preventDefault();
                          const newValue = isSelected
                            ? field.value.filter((e) => e !== env)
                            : [...(field.value || []), env];
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
                      <span>{env}</span>
                    </div>
                  );
                })}
              </div>
              {errors.workEnvironment && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.workEnvironment.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Khả năng chịu áp lực
          </h2>
          <p className="text-sm text-gray-500">
            Đánh giá khả năng làm việc dưới áp lực của bạn
          </p>
        </div>

        <Controller
          name="stressLevel"
          control={control}
          render={({ field }) => (
            <div>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="font-medium text-gray-600">Thấp</span>
                  <span className="font-medium text-gray-600">Cao</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={cn(
                        "relative flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all",
                        field.value === level
                          ? "border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-200"
                          : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50",
                      )}
                      onClick={() => field.onChange(level)}
                    >
                      <span className="text-lg font-semibold">{level}</span>
                    </button>
                  ))}
                </div>
              </div>
              {errors.stressLevel && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.stressLevel.message}
                </p>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
}
