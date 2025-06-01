import type { SurveyFormData } from "@/app/[locale]/chat-bot/MainChat/SurveyForm";

export const isClient = typeof window !== "undefined";

export const isEmpty = (content: string) => {
  const hasNoContent = !content.trim();
  const isEmptyParagraph = /<p>\s*<\/p>/.test(content);
  const isLineBreakOnly = /<br\s*\/?>/.test(content);

  return hasNoContent || isEmptyParagraph || isLineBreakOnly;
};

export const formatSurveyData = (data: SurveyFormData) => {
  return `
Hãy cho tôi biết nghề nghiệp nào phù hợp với dữ liệu khảo sát sau:

- Sở thích (Interests):
  - ${data.interests.join("\n  - ")}

- Kỹ năng (Skills):
  - ${data.skills.join("\n  - ")}

- Phong cách làm việc (Work Style): ${data.workStyle || "Không rõ"}

- Mục tiêu nghề nghiệp (Career Goals): ${data.careerGoals}

- Tính cách (Personality): ${data.personality.length ? data.personality.join(", ") : "Không có dữ liệu"}

- Thế mạnh (Strengths):
  - ${data.strengths.join("\n  - ")}

- Điểm yếu (Weaknesses):
  - ${data.weaknesses.join("\n  - ")}

- Môi trường làm việc mong muốn (Work Environment):
  - ${data.workEnvironment.join("\n  - ")}

- Mức độ căng thẳng (Stress Level): ${data.stressLevel}

- Phong cách học tập (Learning Style): ${data.learningStyle}
`.trim();
};
