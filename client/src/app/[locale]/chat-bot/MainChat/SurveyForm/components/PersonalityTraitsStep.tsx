"use client";

import { Controller, useFormContext } from "react-hook-form";

import type { SurveyFormSchema } from "../validates";
import CheckboxGroup from "./CheckboxGroup";

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
          <h2 className="text-base font-semibold text-gray-800">
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
            <div data-field="personality">
              <CheckboxGroup
                options={personalityOptions}
                value={field.value || []}
                onChange={field.onChange}
                name="personality"
              />
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
          <h2 className="text-base font-semibold text-gray-800">
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
            <div data-field="strengths">
              <CheckboxGroup
                options={strengthOptions}
                value={field.value || []}
                onChange={field.onChange}
                name="strengths"
              />
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
          <h2 className="text-base font-semibold text-gray-800">
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
            <div data-field="weaknesses">
              <CheckboxGroup
                options={weaknessOptions}
                value={field.value || []}
                onChange={field.onChange}
                name="weaknesses"
              />
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
