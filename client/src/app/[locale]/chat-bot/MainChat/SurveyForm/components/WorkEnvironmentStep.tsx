"use client";

import { Controller, useFormContext } from "react-hook-form";

import type { SurveyFormSchema } from "../validates";
import CheckboxGroup from "./CheckboxGroup";
import RatingScale from "./RatingScale";

const workEnvironmentOptions = [
  "Văn phòng truyền thống",
  "Làm việc từ xa",
  "Môi trường năng động",
  "Môi trường sáng tạo",
  "Startup",
  "Doanh nghiệp lớn",
];

const workStyleOptions = [
  "Làm việc độc lập",
  "Làm việc nhóm",
  "Kết hợp cả hai",
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
          <h2 className="text-base font-semibold text-gray-800">
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
            <div data-field="workEnvironment">
              <CheckboxGroup
                options={workEnvironmentOptions}
                value={field.value || []}
                onChange={field.onChange}
                name="workEnvironment"
              />
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
          <h2 className="text-base font-semibold text-gray-800">
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
            <div data-field="stressLevel">
              <RatingScale
                value={field.value}
                onChange={field.onChange}
                name="stressLevel"
                labels={{ start: "Thấp", end: "Cao" }}
              />
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
