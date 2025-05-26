"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
  Card,
  CardBody,
  Divider,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Sparkle,
  X,
  CheckCircle,
} from "@phosphor-icons/react";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import InterestsSkillsStep from "./components/InterestsSkillsStep";
import LearningCareerStep from "./components/LearningCareerStep";
import PersonalityTraitsStep from "./components/PersonalityTraitsStep";
import WorkEnvironmentStep from "./components/WorkEnvironmentStep";
import WorkStyleStep from "./components/WorkStyleStep";
import type { SurveyFormSchema } from "./validates";
import { surveyFormSchema } from "./validates";

// Export SurveyFormSchema type for use in other files
export type { SurveyFormSchema as SurveyFormData };

interface SurveyFormProps {
  onSubmit: (data: SurveyFormSchema) => void;
  onClose: () => void;
}

const stepInfo = [
  {
    title: "Sở thích & Kỹ năng",
    description: "Khám phá những gì bạn yêu thích và giỏi nhất",
    icon: "💝",
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "Tính cách & Điểm mạnh",
    description: "Tìm hiểu về bản thân và điểm mạnh của bạn",
    icon: "🌟",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Môi trường làm việc",
    description: "Môi trường nào giúp bạn phát huy tối đa năng lực",
    icon: "🏢",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Phong cách học tập",
    description: "Cách bạn học hỏi và phát triển bản thân",
    icon: "📚",
    color: "from-purple-500 to-violet-500",
  },
  {
    title: "Phong cách làm việc",
    description: "Cách làm việc hiệu quả nhất với bạn",
    icon: "⚡",
    color: "from-orange-500 to-amber-500",
  },
];

export default function SurveyForm({ onSubmit, onClose }: SurveyFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const methods = useForm<SurveyFormSchema>({
    resolver: zodResolver(surveyFormSchema),
    mode: "onChange",
    defaultValues: {
      interests: [],
      skills: [],
      personality: [],
      strengths: [],
      weaknesses: [],
      workEnvironment: [],
      stressLevel: 3,
      learningStyle: "",
      careerGoals: "",
      workStyle: "",
    },
  });

  const { handleSubmit, trigger } = methods;

  const handleFormSubmit = async (data: SurveyFormSchema) => {
    onSubmit(data);
  };

  const steps = [
    <InterestsSkillsStep key="interests" />,
    <PersonalityTraitsStep key="personality" />,
    <WorkEnvironmentStep key="environment" />,
    <LearningCareerStep key="learning" />,
    <WorkStyleStep key="workstyle" />,
  ];

  const goToNextStep = async () => {
    let fieldsToValidate: (keyof SurveyFormSchema)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["interests", "skills"];
        break;
      case 2:
        fieldsToValidate = ["personality", "strengths", "weaknesses"];
        break;
      case 3:
        fieldsToValidate = ["workEnvironment", "stressLevel"];
        break;
      case 4:
        fieldsToValidate = ["learningStyle", "careerGoals"];
        break;
      case 5:
        fieldsToValidate = ["workStyle"];
        break;
      default:
        fieldsToValidate = [];
    }

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1);
      } else {
        await handleSubmit(handleFormSubmit)();
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const progressValue = (currentStep / totalSteps) * 100;
  const currentStepInfo = stepInfo[currentStep - 1] || {
    title: "Khảo sát",
    description: "Hoàn thành khảo sát",
    icon: "📝",
    color: "from-blue-500 to-purple-500",
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
    >
      <ModalContent className="w-full max-w-3xl border border-white/20 shadow-2xl">
        {/* Header */}
        <ModalHeader>
          <div className="w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
              <div className="flex items-center gap-3 sm:gap-4 flex-1">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${currentStepInfo.color} flex items-center justify-center text-xl sm:text-2xl shadow-lg flex-shrink-0`}
                >
                  {currentStepInfo.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-gray-900 mb-1">
                    Khảo sát chọn ngành
                  </h1>
                  <p className="text-sm text-gray-600">
                    Tìm ngành học phù hợp với bạn trong 5 phút
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs font-semibold text-gray-700">
                    Bước {currentStep} / {totalSteps}
                  </span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: currentStep - 1 }).map((_, i) => (
                      <CheckCircle
                        key={i}
                        size={16}
                        className="text-green-500"
                        weight="fill"
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                  {Math.round(progressValue)}% hoàn thành
                </span>
              </div>

              <Progress
                value={progressValue}
                className="w-full"
                size="md"
                classNames={{
                  base: "max-w-full",
                  track: "bg-gray-200/50",
                  indicator: `bg-gradient-to-r ${currentStepInfo.color}`,
                }}
              />
            </div>
          </div>
        </ModalHeader>

        <FormProvider {...methods}>
          <form>
            <ModalBody className="p-4 sm:p-6 lg:p-8 flex-1 scroll h-[60vh]">
              <div
                key={currentStep}
                className="animate-in slide-in-from-right-5 duration-300"
              >
                {steps[currentStep - 1]}
              </div>
            </ModalBody>

            <ModalFooter>
              <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
                <Button
                  onPress={goToPreviousStep}
                  variant="faded"
                  disabled={currentStep === 1}
                  size="md"
                >
                  Trở lại
                </Button>

                <Button
                  onPress={goToNextStep}
                  color="primary"
                  variant="solid"
                  size="md"
                >
                  {currentStep < totalSteps ? "Tiếp tục" : "Hoàn thành"}
                </Button>
              </div>
            </ModalFooter>
          </form>
        </FormProvider>
      </ModalContent>
    </Modal>
  );
}
