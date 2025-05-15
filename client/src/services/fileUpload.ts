import axios from "axios";

/**
 * Uploads files to the server
 * @param files Files to upload
 * @param endpoint API endpoint for file upload
 * @param onProgress Optional callback to track upload progress
 * @returns Promise resolving to the server response
 */
export const uploadFiles = async (
  files: File[],
  endpoint: string = "/api/upload",
  onProgress?: (progress: number) => void,
): Promise<any> => {
  const formData = new FormData();

  // Append files to form data
  files.forEach((file, index) => {
    formData.append(`file${index}`, file);
  });

  try {
    const response = await axios.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(progress);
        }
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error;
  }
};

/**
 * Validates file before upload
 * @param file File to validate
 * @param maxSizeMB Maximum file size in MB
 * @param acceptedTypes Array of accepted MIME types
 * @returns Object containing validation result and error message
 */
export const validateFile = (
  file: File,
  maxSizeMB: number = 5,
  acceptedTypes: string[] = [],
): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      valid: false,
      error: `File size exceeds the maximum limit of ${maxSizeMB}MB`,
    };
  }

  // Check file type if specified
  if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not supported. Accepted types: ${acceptedTypes.join(", ")}`,
    };
  }

  return { valid: true };
};
