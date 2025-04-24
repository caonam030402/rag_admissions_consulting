"use client";

import { Star } from "@phosphor-icons/react";
import React, { useState } from "react";

export interface SurveyFormData {
  interests: string[];
  skills: string[];
  workStyle: string;
  careerGoals: string;
  personality: string[];
  strengths: string[];
  weaknesses: string[];
  workEnvironment: string[];
  stressLevel: number;
  learningStyle: string;
}

interface SurveyFormProps {
  onSubmit: (data: SurveyFormData) => void;
  onClose: () => void;
}

export default function SurveyForm({ onSubmit, onClose }: SurveyFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const [formData, setFormData] = useState<SurveyFormData>({
    interests: [],
    skills: [],
    workStyle: "",
    careerGoals: "",
    personality: [],
    strengths: [],
    weaknesses: [],
    workEnvironment: [],
    stressLevel: 3,
    learningStyle: "",
  });

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

  const workEnvironmentOptions = [
    "Văn phòng truyền thống",
    "Làm việc từ xa",
    "Môi trường năng động",
    "Môi trường sáng tạo",
    "Startup",
    "Doanh nghiệp lớn",
  ];

  const learningStyleOptions = [
    "Học qua thực hành",
    "Học qua quan sát",
    "Học qua lý thuyết",
    "Học qua thảo luận",
  ];

  const handleArrayChange = (field: keyof SurveyFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter((item) => item !== value)
        : [...(prev[field] as string[]), value],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onSubmit(formData);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block font-medium">Sở thích của bạn</label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    className={`rounded-full px-4 py-2 transition-all ${formData.interests.includes(interest) ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                    onClick={() => handleArrayChange("interests", interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block font-medium">Kỹ năng của bạn</label>
              <div className="flex flex-wrap gap-2">
                {skillOptions.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    className={`rounded-full px-4 py-2 transition-all ${formData.skills.includes(skill) ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                    onClick={() => handleArrayChange("skills", skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block font-medium">
                Tính cách của bạn
              </label>
              <div className="flex flex-wrap gap-2">
                {personalityOptions.map((trait) => (
                  <button
                    key={trait}
                    type="button"
                    className={`rounded-full px-4 py-2 transition-all ${formData.personality.includes(trait) ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                    onClick={() => handleArrayChange("personality", trait)}
                  >
                    {trait}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Điểm mạnh của bạn
              </label>
              <div className="flex flex-wrap gap-2">
                {strengthOptions.map((strength) => (
                  <button
                    key={strength}
                    type="button"
                    className={`rounded-full px-4 py-2 transition-all ${formData.strengths.includes(strength) ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                    onClick={() => handleArrayChange("strengths", strength)}
                  >
                    {strength}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block font-medium">Điểm yếu của bạn</label>
              <div className="flex flex-wrap gap-2">
                {weaknessOptions.map((weakness) => (
                  <button
                    key={weakness}
                    type="button"
                    className={`rounded-full px-4 py-2 transition-all ${formData.weaknesses.includes(weakness) ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                    onClick={() => handleArrayChange("weaknesses", weakness)}
                  >
                    {weakness}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block font-medium">
                Môi trường làm việc mong muốn
              </label>
              <div className="flex flex-wrap gap-2">
                {workEnvironmentOptions.map((env) => (
                  <button
                    key={env}
                    type="button"
                    className={`rounded-full px-4 py-2 transition-all ${formData.workEnvironment.includes(env) ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                    onClick={() => handleArrayChange("workEnvironment", env)}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Khả năng chịu áp lực
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    className="group relative"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, stressLevel: level }))
                    }
                  >
                    <Star
                      size={32}
                      weight={
                        level <= formData.stressLevel ? "fill" : "regular"
                      }
                      className={`transition-colors ${level <= formData.stressLevel ? "text-yellow-400" : "text-gray-300 group-hover:text-gray-400"}`}
                    />
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs opacity-0 transition-opacity group-hover:opacity-100">
                      {level === 1
                        ? "Rất thấp"
                        : level === 2
                          ? "Thấp"
                          : level === 3
                            ? "Trung bình"
                            : level === 4
                              ? "Cao"
                              : "Rất cao"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block font-medium">
                Phong cách học tập
              </label>
              <select
                className="w-full rounded-lg border p-2 transition-colors focus:border-blue-500 focus:outline-none"
                value={formData.learningStyle}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    learningStyle: e.target.value,
                  }))
                }
              >
                <option value="">Chọn phong cách học tập</option>
                {learningStyleOptions.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Mục tiêu nghề nghiệp
              </label>
              <textarea
                className="w-full rounded-lg border p-2 transition-colors focus:border-blue-500 focus:outline-none"
                rows={4}
                value={formData.careerGoals}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    careerGoals: e.target.value,
                  }))
                }
                placeholder="Mô tả mục tiêu nghề nghiệp của bạn"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Xác nhận thông tin</h3>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Sở thích</h4>
                  <p className="text-sm text-gray-600">
                    {formData.interests.join(", ")}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Kỹ năng</h4>
                  <p className="text-sm text-gray-600">
                    {formData.skills.join(", ")}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Tính cách</h4>
                  <p className="text-sm text-gray-600">
                    {formData.personality.join(", ")}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Điểm mạnh</h4>
                  <p className="text-sm text-gray-600">
                    {formData.strengths.join(", ")}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Điểm yếu</h4>
                  <p className="text-sm text-gray-600">
                    {formData.weaknesses.join(", ")}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Môi trường làm việc</h4>
                  <p className="text-sm text-gray-600">
                    {formData.workEnvironment.join(", ")}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Khả năng chịu áp lực</h4>
                  <p className="text-sm text-gray-600">
                    {formData.stressLevel === 1
                      ? "Rất thấp"
                      : formData.stressLevel === 2
                        ? "Thấp"
                        : formData.stressLevel === 3
                          ? "Trung bình"
                          : formData.stressLevel === 4
                            ? "Cao"
                            : "Rất cao"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Phong cách học tập</h4>
                  <p className="text-sm text-gray-600">
                    {formData.learningStyle}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-medium">Mục tiêu nghề nghiệp</h4>
                <p className="text-sm text-gray-600">{formData.careerGoals}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-[800px] max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Khảo sát nghề nghiệp</h2>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full transition-colors ${index + 1 <= currentStep ? "bg-blue-500" : "bg-gray-200"}`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStepContent()}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 transition-colors hover:bg-gray-100"
            >
              Hủy
            </button>
            <div className="flex gap-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="rounded-lg border px-4 py-2 transition-colors hover:bg-gray-100"
                >
                  Quay lại
                </button>
              )}
              <button
                type="submit"
                className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
              >
                {currentStep === totalSteps ? "Hoàn thành" : "Tiếp tục"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
