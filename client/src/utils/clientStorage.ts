import { isClient } from "./common";

export const setLocalStorage = ({
  key,
  value,
}: {
  key: string;
  value: unknown;
}) => {
  return value && isClient && localStorage.setItem(key, JSON.stringify(value));
};
export const getLocalStorage = ({ key }: { key: string }) => {
  if (!isClient) return null;

  try {
    const value = localStorage.getItem(key);
    if (!value) return null;

    // Kiểm tra nếu value không phải là JSON hợp lệ
    if (typeof value === "string" && value.trim() === "") return null;

    return JSON.parse(value);
  } catch (error) {
    console.warn(`Failed to parse localStorage value for key "${key}":`, error);
    console.warn("Raw value:", localStorage.getItem(key));

    // Xóa giá trị không hợp lệ khỏi localStorage
    localStorage.removeItem(key);
    return null;
  }
};

export const clearLocalStorage = ({ key }: { key: string }) => {
  isClient && localStorage.removeItem(key);
};
