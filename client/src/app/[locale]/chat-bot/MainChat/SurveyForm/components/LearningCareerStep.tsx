"use client";

import { Controller, useFormContext } from "react-hook-form";

import Textarea from "@/components/common/Textarea";

import type { SurveyFormSchema } from "../validates";
import RadioGroup from "./RadioGroup";

const learningStyleOptions = [
  "Học qua thực hành",
  "Học qua quan sát",
  "Học qua lý thuyết",
  "Học qua thảo luận",
];

const workStyleOptions = [
  "Làm việc độc lập",
  "Làm việc nhóm",
  "Kết hợp cả hai",
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
          <h2 className="text-base font-semibold text-gray-800">
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
            <div data-field="learningStyle">
              <RadioGroup
                options={learningStyleOptions}
                value={field.value}
                onChange={field.onChange}
                name="learningStyle"
              />
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
          <h2 className="text-base font-semibold text-gray-800">
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
            <div data-field="workStyle">
              <RadioGroup
                options={workStyleOptions}
                value={field.value}
                onChange={field.onChange}
                name="workStyle"
              />
              {errors.workStyle && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.workStyle.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <div className="space-y-4">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-800">
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
            <div data-field="careerGoals">
              <Textarea
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Ví dụ: Trở thành chuyên gia phân tích dữ liệu, làm việc tại các doanh nghiệp lớn..."
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
