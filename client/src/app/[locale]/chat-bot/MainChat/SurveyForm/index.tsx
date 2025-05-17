"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import InterestsSkillsStep from "./components/InterestsSkillsStep";
import LearningCareerStep from "./components/LearningCareerStep";
import PersonalityTraitsStep from "./components/PersonalityTraitsStep";
import StepIndicator from "./components/StepIndicator";
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
    // Pass the form data to the parent component
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

  return (
    <Modal isOpen onClose={onClose}>
      <ModalContent className="max-w-2xl">
        <ModalHeader className="flex items-center justify-between border-b p-4">
          <h1 className="text-xl font-semibold">Khảo sát chọn ngành</h1>
        </ModalHeader>

        <FormProvider {...methods}>
          <form>
            <ModalBody className="scroll h-[calc(100vh-20rem)] p-6">
              <StepIndicator
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
              <div className="mt-6">{steps[currentStep - 1]}</div>
            </ModalBody>

            <ModalFooter className="flex items-center justify-between border-t p-4">
              <Button
                onClick={goToPreviousStep}
                variant="ghost"
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Trở lại
              </Button>
              <Button
                onClick={goToNextStep}
                className="flex items-center gap-2"
              >
                {currentStep < totalSteps ? (
                  <>
                    Tiếp tục
                    <ArrowRight size={16} />
                  </>
                ) : (
                  "Hoàn thành"
                )}
              </Button>
            </ModalFooter>
          </form>
        </FormProvider>
      </ModalContent>
    </Modal>
  );
}
