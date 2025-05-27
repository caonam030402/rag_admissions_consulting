"use client";

import { Badge, Card, CardBody, Chip } from "@heroui/react";
import {
  Airplane,
  Briefcase,
  ChartBar,
  CheckCircle,
  ClipboardText,
  Code,
  Flask,
  Gear,
  GraduationCap,
  Heart,
  Lightbulb,
  Megaphone,
  Microphone,
  PaintBrush,
  Palette,
  Star,
  Trophy,
  Users,
} from "@phosphor-icons/react";
import { Controller, useFormContext } from "react-hook-form";

import type { SurveyFormSchema } from "../validates";

const interestOptions = [
  { value: "Công nghệ", icon: <Code size={20} />, color: "primary" },
  { value: "Kinh doanh", icon: <Briefcase size={20} />, color: "success" },
  { value: "Nghệ thuật", icon: <Palette size={20} />, color: "primary" },
  { value: "Khoa học", icon: <Flask size={20} />, color: "warning" },
  { value: "Y tế", icon: <Heart size={20} />, color: "danger" },
  { value: "Giáo dục", icon: <GraduationCap size={20} />, color: "primary" },
  { value: "Truyền thông", icon: <Megaphone size={20} />, color: "success" },
  { value: "Du lịch", icon: <Airplane size={20} />, color: "primary" },
  { value: "Thể thao", icon: <Trophy size={20} />, color: "warning" },
];

const skillOptions = [
  { value: "Lập trình", icon: <Code size={20} />, color: "primary" },
  {
    value: "Phân tích dữ liệu",
    icon: <ChartBar size={20} />,
    color: "success",
  },
  { value: "Thiết kế", icon: <PaintBrush size={20} />, color: "danger" },
  { value: "Quản lý", icon: <Users size={20} />, color: "warning" },
  { value: "Giao tiếp", icon: <Microphone size={20} />, color: "danger" },
  {
    value: "Giải quyết vấn đề",
    icon: <Lightbulb size={20} />,
    color: "primary",
  },
  { value: "Sáng tạo", icon: <Palette size={20} />, color: "success" },
  { value: "Tổ chức", icon: <ClipboardText size={20} />, color: "primary" },
  { value: "Thuyết trình", icon: <Microphone size={20} />, color: "warning" },
];

export default function InterestsSkillsStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<SurveyFormSchema>();

  return (
    <div className="space-y-8">
      {/* Interests Section */}
      <Card className="shadow-lg">
        <CardBody className="p-6">
          <div className="mb-4">
            <div className="mb-1 flex items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Sở thích của bạn
                </h3>
                <p className="text-sm text-gray-600">
                  Chọn những lĩnh vực bạn quan tâm (tối thiểu 1)
                </p>
              </div>
            </div>
          </div>

          <Controller
            name="interests"
            control={control}
            render={({ field }) => (
              <div className="space-y-4" data-field="interests">
                <div className="flex flex-wrap gap-3">
                  {interestOptions.map((interest) => {
                    const isSelected =
                      field.value?.includes(interest.value) || false;
                    return (
                      <Chip
                        className="cursor-pointer border-none"
                        key={interest.value}
                        variant={isSelected ? "solid" : "faded"}
                        color={isSelected ? (interest.color as any) : "default"}
                        startContent={interest.icon}
                        onClick={() => {
                          const newValue = isSelected
                            ? field.value.filter((i) => i !== interest.value)
                            : [...(field.value || []), interest.value];
                          field.onChange(newValue);
                        }}
                      >
                        {interest.value}
                      </Chip>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between rounded-lg bg-pink-50 p-3">
                  <div className="flex items-center gap-2">
                    <Badge content={field.value?.length || 0} color="primary">
                      <Star size={20} className="text-pink-500" weight="fill" />
                    </Badge>
                    <span className="text-sm font-medium text-gray-700">
                      Đã chọn {field.value?.length || 0} sở thích
                    </span>
                  </div>
                  {(field.value?.length || 0) >= 2 && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle size={16} weight="fill" />
                      <span className="text-sm font-medium">Tuyệt vời!</span>
                    </div>
                  )}
                </div>

                {errors.interests && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="flex items-center gap-2 text-sm text-red-600">
                      <span>⚠️</span>
                      {errors.interests.message}
                    </p>
                  </div>
                )}
              </div>
            )}
          />
        </CardBody>
      </Card>

      {/* Skills Section */}
      <Card className="shadow-lg">
        <CardBody className="p-6">
          <div className="mb-4">
            <div className="mb-1 flex items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Kỹ năng của bạn
                </h3>
                <p className="text-sm text-gray-600">
                  Chọn những kỹ năng bạn tự tin (tối thiểu 1)
                </p>
              </div>
            </div>
          </div>

          <Controller
            name="skills"
            control={control}
            render={({ field }) => (
              <div className="space-y-4" data-field="skills">
                <div className="flex flex-wrap gap-3">
                  {skillOptions.map((skill) => {
                    const isSelected =
                      field.value?.includes(skill.value) || false;
                    return (
                      <Chip
                        className="cursor-pointer border-none"
                        key={skill.value}
                        variant={isSelected ? "solid" : "faded"}
                        color={isSelected ? (skill.color as any) : "default"}
                        startContent={skill.icon}
                        onClick={() => {
                          const newValue = isSelected
                            ? field.value.filter((s) => s !== skill.value)
                            : [...(field.value || []), skill.value];
                          field.onChange(newValue);
                        }}
                      >
                        {skill.value}
                      </Chip>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                  <div className="flex items-center gap-2">
                    <Badge content={field.value?.length || 0} color="primary">
                      <Gear size={20} className="text-blue-500" weight="fill" />
                    </Badge>
                    <span className="text-sm font-medium text-gray-700">
                      Đã chọn {field.value?.length || 0} kỹ năng
                    </span>
                  </div>
                  {(field.value?.length || 0) >= 2 && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle size={16} weight="fill" />
                      <span className="text-sm font-medium">Hoàn hảo!</span>
                    </div>
                  )}
                </div>

                {errors.skills && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="flex items-center gap-2 text-sm text-red-600">
                      <span>⚠️</span>
                      {errors.skills.message}
                    </p>
                  </div>
                )}
              </div>
            )}
          />
        </CardBody>
      </Card>

      {/* Tips Card */}
      <Card className="from-blue-50 to-purple-50 border border-blue-200 bg-gradient-to-r">
        <CardBody className="p-6">
          <div className="flex items-start gap-3">
            <div>
              <h4 className="mb-1 font-semibold text-blue-900">💡 Mẹo nhỏ</h4>
              <p className="text-sm text-blue-800">
                Hãy chọn những sở thích và kỹ năng thực sự phù hợp với bạn. Điều
                này sẽ giúp chúng tôi đưa ra lời khuyên chính xác hơn về ngành
                học.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
