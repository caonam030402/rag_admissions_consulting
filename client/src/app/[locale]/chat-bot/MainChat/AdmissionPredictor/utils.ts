import { BLOCKS, HISTORICAL_DATA, PRIORITY_ZONES, SUBJECTS } from "./data";
import type { AdmissionFormData } from "./index";

export const calculateTotalScore = (
  scores: AdmissionFormData["scores"],
  blockType: string,
): number => {
  const subjects = BLOCKS[blockType as keyof typeof BLOCKS];

  let total = 0;
  subjects.forEach((subject) => {
    const code = SUBJECTS[subject as keyof typeof SUBJECTS];
    total += scores[code as keyof typeof scores] || 0;
  });

  return total;
};

export const calculateProbability = (
  scores: AdmissionFormData["scores"],
  blockType: string,
  major: string,
  zone: keyof typeof PRIORITY_ZONES,
): number => {
  const bonusPoints = PRIORITY_ZONES[zone];
  const totalScore = calculateTotalScore(scores, blockType) + bonusPoints;
  const threshold2023 =
    HISTORICAL_DATA[major as keyof typeof HISTORICAL_DATA]["2023"];

  // Simple probability calculation
  if (totalScore >= threshold2023 + 1) return 95;
  if (totalScore >= threshold2023 + 0.5) return 85;
  if (totalScore >= threshold2023) return 75;
  if (totalScore >= threshold2023 - 0.5) return 50;
  if (totalScore >= threshold2023 - 1) return 30;
  if (totalScore >= threshold2023 - 1.5) return 15;
  return 5;
};

export const getSuggestion = (probability: number, major: string): string => {
  if (probability >= 75) {
    return `Bạn có khả năng cao trúng tuyển ngành ${major}.`;
  }
  if (probability >= 50) {
    return `Bạn có cơ hội trúng tuyển ngành ${major}, nhưng nên cân nhắc thêm các lựa chọn khác.`;
  }
  if (probability >= 30) {
    return `Ngành ${major} có điểm chuẩn cao hơn so với điểm của bạn. Nên cân nhắc đặt ở nguyện vọng thấp hơn.`;
  }
  return `Khả năng trúng tuyển ngành ${major} thấp. Nên cân nhắc các ngành có điểm chuẩn thấp hơn.`;
};

export const getColorClass = (probability: number) => {
  if (probability >= 75)
    return {
      border: "border-green-200 bg-green-50",
      bg: "bg-green-500",
    };
  if (probability >= 50)
    return {
      border: "border-blue-200 bg-blue-50",
      bg: "bg-blue-500",
    };
  if (probability >= 30)
    return {
      border: "border-yellow-200 bg-yellow-50",
      bg: "bg-yellow-500",
    };
  return {
    border: "border-red-200 bg-red-50",
    bg: "bg-red-500",
  };
};
