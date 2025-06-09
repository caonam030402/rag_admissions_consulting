export const listContent = [
  "Tư vấn tuyển sinh toàn diện",
  "Thông tin chi tiết về các trường đại học",
  "Hỗ trợ chọn ngành học phù hợp",
  "Tư vấn hồ sơ và thủ tục xét tuyển",
  "Cập nhật thông tin tuyển sinh mới nhất",
];

export const listIcons = [
  {
    name: "Tư vấn",
    icon: "GraduationCap",
    color: "#3370FF",
    description: "Tư vấn chuyên nghiệp về lựa chọn ngành học và trường đại học"
  },
  {
    name: "Trường ĐH",
    icon: "Buildings",
    color: "#FFBC00",
    description: "Cơ sở dữ liệu toàn diện về các trường đại học"
  },
  {
    name: "Hồ sơ",
    icon: "FileText",
    color: "#00D6B9",
    description: "Hướng dẫn chuẩn bị hồ sơ xét tuyển hoàn chỉnh"
  },
  {
    name: "Lịch",
    icon: "Calendar",
    color: "#F97802",
    description: "Theo dõi lịch tuyển sinh và thời hạn nộp hồ sơ"
  },
  {
    name: "Chat AI",
    icon: "Robot",
    color: "#FF6B6B",
    description: "Trợ lý AI hỗ trợ tư vấn 24/7"
  },
];

export enum STEP_FORM_AUTH {
  FORM_AUTH = "form-auth",
  VERIFY_CODE = "verify",
}
