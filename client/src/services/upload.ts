import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import http from "@/utils/http";

interface FileResponse {
  file: {
    id: string;
    path: string;
    url?: string;
  };
}

export const uploadService = {
  // Upload avatar specifically for admin config
  useUploadAvatar: () => {
    return useMutation({
      mutationFn: async (file: File): Promise<string> => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error("Please select an image file");
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("File size must be less than 5MB");
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await http.post<FileResponse>("/v1/files/upload", {
          body: formData,
        });

        return response.payload.file.url || response.payload.file.path;
      },
      onSuccess: () => {
        toast.success("Avatar uploaded successfully");
      },
      onError: (error: any) => {
        console.error("Avatar upload error:", error);
        const message = error.message || "Failed to upload avatar";
        toast.error(message);
      },
    });
  },
};





