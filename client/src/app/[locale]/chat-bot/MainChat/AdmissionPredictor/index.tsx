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
import { ChartLineUp } from "@phosphor-icons/react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import useChatBot from "@/hooks/features/chatbot/useChatBot";
import type { PredictionResult } from "@/types/admissionPredictor";
import type { AdmissionFormData } from "@/validations/admissionPredictorValidation";
import { admissionFormSchema } from "@/validations/admissionPredictorValidation";

// Import components
import { MajorSelectionList } from "./components/MajorSelectionList";
import { PredictionResults } from "./components/PredictionResults";
import { ScoreInputs } from "./components/ScoreInputs";
import { SelectBlock } from "./components/SelectBlock";
import { SelectPriorityZone } from "./components/SelectPriorityZone";
// Import data, types and utils
import { BLOCKS, HISTORICAL_DATA, PRIORITY_ZONES, SUBJECTS } from "./data";
import {
  calculateProbability,
  calculateTotalScore,
  getSuggestion,
} from "./utils";

interface AdmissionPredictorProps {
  onClose: () => void;
}

// Main component
export default function AdmissionPredictor({
  onClose,
}: AdmissionPredictorProps): React.ReactElement {
  const [results, setResults] = useState<PredictionResult[] | null>(null);
  const [selectedBlock, setSelectedBlock] = useState("A00");
  const activeSubjects = BLOCKS[selectedBlock as keyof typeof BLOCKS];
  const { sendMessage } = useChatBot();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    trigger,
  } = useForm<AdmissionFormData>({
    resolver: zodResolver(admissionFormSchema),
    defaultValues: {
      selectedBlock: "A00",
      scores: {
        math: 8,
        literature: 0,
        english: 0,
        physics: 7.5,
        chemistry: 7.5,
        biology: 0,
        history: 0,
        geography: 0,
      },
      priorityZone: "KV3",
      preferences: ["Công nghệ thông tin", "Kỹ thuật phần mềm"],
    },
    mode: "onChange",
  });

  const selectedPreferences = watch("preferences", []);
  const currentBlock = watch("selectedBlock");

  // When block changes, update the UI to show only relevant subjects
  React.useEffect(() => {
    if (currentBlock !== selectedBlock) {
      setSelectedBlock(currentBlock);
      // Reset selected majors when block changes
      setValue("preferences", []);
    }
  }, [currentBlock, selectedBlock, setValue]);

  const availableMajors = Object.keys(HISTORICAL_DATA);

  // Filter majors by selected block
  const filteredMajors = React.useMemo(() => {
    return availableMajors.filter((major) => {
      const majorData = HISTORICAL_DATA[major as keyof typeof HISTORICAL_DATA];
      return majorData.blocks.includes(currentBlock);
    });
  }, [availableMajors, currentBlock]);

  const onFormSubmit = (data: AdmissionFormData) => {
    const predictResults = data.preferences.map((major) => {
      const probability = calculateProbability(
        data.scores,
        data.selectedBlock,
        major,
        data.priorityZone,
      );
      const recentThreshold =
        HISTORICAL_DATA[major as keyof typeof HISTORICAL_DATA]["2023"];
      const suggestion = getSuggestion(probability, major);

      return {
        major,
        probability,
        recentThreshold,
        suggestion,
      };
    });

    // Sort by probability (highest first)
    predictResults.sort((a, b) => b.probability - a.probability);
    setResults(predictResults);
  };

  const handleSendToChat = () => {
    if (!results) return;

    let message = "Kết quả dự đoán khả năng trúng tuyển:\n\n";

    // Add student's information
    const form = getValues();
    const blockSubjects = BLOCKS[form.selectedBlock as keyof typeof BLOCKS];
    const totalScore = calculateTotalScore(form.scores, form.selectedBlock);

    message += `📊 **Thông tin thí sinh**\n`;
    message += `- Khối thi: ${form.selectedBlock} (${blockSubjects.join(", ")})\n`;
    message += `- Điểm các môn: `;

    blockSubjects.forEach((subject, index) => {
      const code = SUBJECTS[subject as keyof typeof SUBJECTS];
      message += `${subject}: ${form.scores[code as keyof typeof form.scores] || 0}${index < blockSubjects.length - 1 ? ", " : ""}`;
    });

    message += `\n- Tổng điểm: ${totalScore} (Chưa cộng điểm ưu tiên)\n`;
    message += `- Khu vực: ${form.priorityZone} (+${PRIORITY_ZONES[form.priorityZone as keyof typeof PRIORITY_ZONES]} điểm)\n\n`;

    // Add prediction results
    results.forEach((result) => {
      message += `🎓 **${result.major}**\n`;
      message += `- Xác suất trúng tuyển: ${result.probability}%\n`;
      message += `- Điểm chuẩn gần đây nhất: ${result.recentThreshold}\n`;
      message += `- Khối thi chấp nhận: ${HISTORICAL_DATA[result.major as keyof typeof HISTORICAL_DATA].blocks.join(", ")}\n`;
      message += `- Nhận xét: ${result.suggestion}\n\n`;
    });

    message +=
      "Bạn có muốn tìm hiểu thêm thông tin về các ngành học này không?";

    sendMessage({ newMessage: message });
    onClose();
  };

  // Handle checkbox changes manually to fix issues with form state
  const handleCheckboxChange = (major: string, checked: boolean) => {
    let updatedPreferences = [...selectedPreferences];

    if (checked) {
      // Add if not already in list and under max limit
      if (
        !updatedPreferences.includes(major) &&
        updatedPreferences.length < 10
      ) {
        updatedPreferences.push(major);
      }
    } else {
      // Remove if in list
      updatedPreferences = updatedPreferences.filter((p) => p !== major);
    }

    setValue("preferences", updatedPreferences);
    trigger("preferences"); // Trigger validation
  };

  return (
    <Modal isOpen onClose={onClose}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <ModalContent className="h-[calc(100vh-10rem)] max-w-2xl">
          <ModalHeader className="flex items-center justify-between border-b p-4">
            <h1 className="text-xl font-semibold">
              Dự đoán khả năng trúng tuyển
            </h1>
          </ModalHeader>

          <ModalBody className="scroll h-[calc(100vh-20rem)] p-6">
            {!results ? (
              <div className="space-y-6">
                <SelectBlock
                  register={register}
                  setValue={setValue}
                  currentBlock={currentBlock}
                  errors={errors}
                  filteredMajors={filteredMajors}
                />

                <div>
                  <label
                    htmlFor="scores-input"
                    className="mb-2 block text-sm font-medium"
                  >
                    Điểm số theo từng môn
                  </label>
                  <ScoreInputs
                    activeSubjects={activeSubjects}
                    register={register}
                    errors={errors.scores}
                  />
                </div>

                <SelectPriorityZone
                  register={register}
                  setValue={setValue}
                  watch={watch}
                />

                <MajorSelectionList
                  filteredMajors={filteredMajors}
                  register={register}
                  currentBlock={currentBlock}
                  errors={errors}
                  selectedPreferences={selectedPreferences}
                  onCheckboxChange={handleCheckboxChange}
                />
              </div>
            ) : (
              <PredictionResults
                results={results}
                currentBlock={currentBlock}
                onBack={() => setResults(null)}
                onSendToChat={handleSendToChat}
              />
            )}
          </ModalBody>

          <ModalFooter className="flex items-center justify-between border-t p-4">
            {results ? (
              <Button
                onPress={() => setResults(null)}
                variant="bordered"
                size="md"
                className="flex items-center gap-1"
              >
                Quay lại
              </Button>
            ) : (
              <div />
            )}

            {!results && (
              <Button
                color="primary"
                type="submit"
                className="flex items-center gap-2"
              >
                <ChartLineUp size={20} />
                Dự đoán
              </Button>
            )}

            {results && (
              <Button
                onPress={handleSendToChat}
                variant="solid"
                color="primary"
                size="md"
                className="flex items-center gap-1"
              >
                Gửi vào chat
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
}
