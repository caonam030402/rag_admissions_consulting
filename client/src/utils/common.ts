import type { SurveyFormData } from "@/app/[locale]/chat-bot/MainChat/SurveyForm";

export const isClient = typeof window !== "undefined";

export const isEmpty = (content: string) => {
  const hasNoContent = !content.trim();
  const isEmptyParagraph = /<p>\s*<\/p>/.test(content);
  const isLineBreakOnly = /<br\s*\/?>/.test(content);

  return hasNoContent || isEmptyParagraph || isLineBreakOnly;
};

export const formatSurveyData = (data: SurveyFormData) => {
  return `**🎯 KHẢO SÁT CHỌN NGHỀ NGHIỆP**

Vui lòng phân tích profile và đề xuất nghề nghiệp phù hợp:

**━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━**

**👤 THÔNG TIN CÁ NHÂN**
▸ Sở thích: ${data.interests.join(" • ")}
▸ Kỹ năng: ${data.skills.join(" • ")}  
▸ Tính cách: ${data.personality.join(" • ")}

**⚡ NĂNG LỰC & ĐIỂM YẾU**
▸ Thế mạnh: ${data.strengths.join(" • ")}
▸ Cần cải thiện: ${data.weaknesses.join(" • ")}

**🏢 MÔI TRƯỜNG LÀM VIỆC**
▸ Phong cách: ${data.workStyle}
▸ Môi trường: ${data.workEnvironment.join(" • ")}
▸ Khả năng chịu áp lực: ${data.stressLevel}/5 ⭐

**📈 PHÁT TRIỂN & MỤC TIÊU**
▸ Cách học: ${data.learningStyle}
▸ Mục tiêu: ${data.careerGoals}

**━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━**

**YÊU CẦU PHÂN TÍCH:**
✓ Top 5 nghề nghiệp phù hợp (theo thứ tự ưu tiên)
✓ Lý do phù hợp cho từng nghề  
✓ Lộ trình phát triển cụ thể
✓ Khuyến nghị cải thiện điểm yếu`.trim();
};
