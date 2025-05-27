// Subject mapping
export const SUBJECTS = {
  Toán: "math",
  Văn: "literature",
  Anh: "english",
  Lý: "physics",
  Hóa: "chemistry",
  Sinh: "biology",
  Sử: "history",
  Địa: "geography",
};

// Block types and their subjects
export const BLOCKS = {
  A00: ["Toán", "Lý", "Hóa"],
  A01: ["Toán", "Lý", "Anh"],
  B00: ["Toán", "Hóa", "Sinh"],
  C00: ["Văn", "Sử", "Địa"],
  D01: ["Toán", "Văn", "Anh"],
  D07: ["Toán", "Hóa", "Anh"],
};

// Priority zone points
export const PRIORITY_ZONES = {
  KV1: 0.75,
  "KV2-NT": 0.5,
  KV2: 0.25,
  KV3: 0,
};

// Historical threshold data for majors
export const HISTORICAL_DATA = {
  "Công nghệ thông tin": {
    blocks: ["A00", "A01", "D01"],
    "2023": 26.5,
    "2022": 26.0,
    "2021": 25.5,
  },
  "Kỹ thuật phần mềm": {
    blocks: ["A00", "A01", "D01"],
    "2023": 26.7,
    "2022": 26.2,
    "2021": 25.8,
  },
  "Khoa học máy tính": {
    blocks: ["A00", "A01"],
    "2023": 27.0,
    "2022": 26.5,
    "2021": 26.2,
  },
  "Trí tuệ nhân tạo": {
    blocks: ["A00", "A01"],
    "2023": 27.8,
    "2022": 27.2,
    "2021": 26.8,
  },
  "Quản trị kinh doanh": {
    blocks: ["A00", "A01", "D01", "D07"],
    "2023": 25.5,
    "2022": 25.0,
    "2021": 24.5,
  },
  "Kế toán": {
    blocks: ["A00", "A01", "D01"],
    "2023": 24.8,
    "2022": 24.3,
    "2021": 23.8,
  },
  Marketing: {
    blocks: ["A00", "A01", "D01"],
    "2023": 26.0,
    "2022": 25.5,
    "2021": 25.0,
  },
  "Y khoa": {
    blocks: ["B00", "A00", "D07"],
    "2023": 28.5,
    "2022": 28.0,
    "2021": 27.5,
  },
  "Dược học": {
    blocks: ["B00", "A00", "D07"],
    "2023": 27.8,
    "2022": 27.2,
    "2021": 26.8,
  },
  "Điều dưỡng": {
    blocks: ["B00"],
    "2023": 24.5,
    "2022": 24.0,
    "2021": 23.5,
  },
  Luật: {
    blocks: ["A01", "C00", "D01"],
    "2023": 25.2,
    "2022": 24.8,
    "2021": 24.3,
  },
  "Giáo dục tiểu học": {
    blocks: ["A01", "C00", "D01"],
    "2023": 24.0,
    "2022": 23.5,
    "2021": 23.0,
  },
  "Ngôn ngữ Anh": {
    blocks: ["A01", "D01"],
    "2023": 26.2,
    "2022": 25.8,
    "2021": 25.3,
  },
  "Kiến trúc": {
    blocks: ["A00", "A01", "D01"],
    "2023": 25.8,
    "2022": 25.3,
    "2021": 24.8,
  },
  "Xây dựng": {
    blocks: ["A00", "A01"],
    "2023": 23.5,
    "2022": 23.0,
    "2021": 22.5,
  },
};
