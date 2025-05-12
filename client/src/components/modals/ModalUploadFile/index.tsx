import React, { useCallback, useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button,
  Progress,
} from "@heroui/react";
import { Upload, File, X, Warning } from "@phosphor-icons/react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

interface IProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onUpload?: (files: File[]) => Promise<any>;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string[];
}

export default function ModalUploadFile({
  isOpen,
  onOpenChange,
  onUpload,
  maxFileSize = 5, // default to 5MB
  acceptedFileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "text/plain",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/markdown",
    "text/html",
    "application/json",
  ],
}: IProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasFileSizeError, setHasFileSizeError] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);
      setHasFileSizeError(false);
      
      // Check if any files were rejected due to size
      if (rejectedFiles.length > 0) {
        const sizeErrorFiles = rejectedFiles.filter(
          file => file.errors?.some((e: { code: string }) => e.code === 'file-too-large')
        );
        
        if (sizeErrorFiles.length > 0) {
          const errorMessage = `${sizeErrorFiles.length} file(s) exceed the maximum size of ${maxFileSize}MB`;
          setError(errorMessage);
          setHasFileSizeError(true);
          
          // Show toast notification
          toast.error(errorMessage, {
            duration: 5000,
          });
          
          // If there are no valid files, return early
          if (acceptedFiles.length === 0) {
            return;
          }
        }
      }
      
      // Continue with accepted files
      setFiles(acceptedFiles);
    },
    [maxFileSize]
  );

  // Create accept object format for react-dropzone
  const acceptFormat = acceptedFileTypes.reduce((acc, type) => {
    acc[type] = [];
    return acc;
  }, {} as Record<string, string[]>);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptFormat,
    maxSize: maxFileSize * 1024 * 1024,
    multiple: true,
    preventDropOnDocument: true
  });

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    
    // Clear error if no files left
    if (newFiles.length === 0) {
      setError(null);
      setHasFileSizeError(false);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    try {
      setUploading(true);
      setUploadProgress(0);
      
      // ALWAYS simulate progress to ensure the UI updates
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            // Don't auto-complete, wait for actual completion
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      // Actual upload
      if (onUpload) {
        await onUpload(files);
      } else {
        // If no upload function, simulate a delay
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Complete the progress
      clearInterval(interval);
      setUploadProgress(100);
      
      // Show success toast
      toast.success(`Successfully uploaded ${files.length} file(s)`, {
        duration: 3000,
      });
      
      // Close modal after upload
      setTimeout(() => {
        setUploading(false);
        setFiles([]);
        onOpenChange();
      }, 1000);
    } catch (error) {
      const errorMessage = "Upload failed. Please try again.";
      setError(errorMessage);
      setUploading(false);
      setUploadProgress(0);
      
      // Show error toast
      toast.error(errorMessage, {
        duration: 5000,
      });
    }
  };

  const getFileTypeDisplay = () => {
    const types = [
      { ext: "PDF", mime: "application/pdf" },
      { ext: "DOC", mime: "application/msword" },
      { ext: "DOCX", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
      { ext: "EXCEL", mime: ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] },
      { ext: "CSV", mime: "text/csv" },
      { ext: "TEXT", mime: "text/plain" },
      { ext: "PPT", mime: ["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"] },
      { ext: "MARKDOWN", mime: "text/markdown" },
      { ext: "HTML", mime: "text/html" },
      { ext: "JSON", mime: "application/json" },
    ];

    const supportedTypes = types
      .filter(type => {
        if (Array.isArray(type.mime)) {
          return type.mime.some(m => acceptedFileTypes.includes(m));
        }
        return acceptedFileTypes.includes(type.mime);
      })
      .map(type => type.ext);

    return supportedTypes.join(", ");
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{ base: "max-w-[600px]" }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="mt-4">
              <div className="text-xl">Upload Files</div>
            </ModalHeader>
            <ModalBody>
              {!uploading ? (
                <>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
                      isDragActive ? "border-primary-500 bg-primary-50" : hasFileSizeError ? "border-danger-500 bg-danger-50" : "border-default-300"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-2 py-8">
                      <Upload size={36} className={`${hasFileSizeError ? "text-danger-500" : "text-default-400"}`} />
                      <p className="text-center text-lg font-medium mt-2">
                        Drag and Upload files here
                      </p>
                      <p className="text-center text-sm text-default-500">
                        Upload {getFileTypeDisplay()} types to expand your data. Max file size upto {maxFileSize} MB.
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 bg-danger-50 border border-danger-200 rounded-md flex items-start gap-2">
                      <Warning size={20} className="text-danger-500 mt-0.5 flex-shrink-0" />
                      <div className="text-danger-700 text-sm">{error}</div>
                    </div>
                  )}

                  {files.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Selected Files:</p>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {files.map((file, index) => (
                          <div
                            key={`${file.name}-${index}`}
                            className="flex items-center justify-between p-2 bg-default-50 rounded-md"
                          >
                            <div className="flex items-center gap-2">
                              <File size={20} />
                              <span className="text-sm truncate max-w-[300px]">
                                {file.name}
                              </span>
                              <span className="text-xs text-default-400">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <Button
                              isIconOnly
                              variant="light"
                              size="sm"
                              onClick={() => handleRemoveFile(index)}
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-10">
                  <p className="text-center font-medium mb-6">Uploading {files.length} file{files.length > 1 ? 's' : ''}...</p>
                  <div className="w-full mb-2">
                    <Progress 
                      size="md"
                      radius="sm"
                      value={uploadProgress} 
                      color="primary"
                      showValueLabel={true}
                      className="w-full"
                      label="Upload Progress"
                    />
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button 
                color="default" 
                variant="flat" 
                onPress={onOpenChange}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                color={hasFileSizeError ? "danger" : "primary"}
                startContent={<Upload size={18} />}
                onPress={handleUpload}
                disabled={files.length === 0 || uploading}
                isLoading={uploading}
              >
                Upload
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
} 