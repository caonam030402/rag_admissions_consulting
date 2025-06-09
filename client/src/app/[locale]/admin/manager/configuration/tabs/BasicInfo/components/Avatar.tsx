"use client";

import { Camera, Upload, X } from "@phosphor-icons/react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

import Button from "@/components/common/Button";
import { uploadService } from "@/services/upload";

interface AvatarProps {
  onChange?: (value: string) => void;
  value?: string;
}

export default function Avatar({ onChange, value }: AvatarProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAvatar = uploadService.useUploadAvatar();

  useEffect(() => {
    if (value !== undefined) {
      setPreview(value || null);
    }
  }, [value]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Show preview immediately for better UX
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file and get URL
      const avatarUrl = await uploadAvatar.mutateAsync(file);
      
      // Update with actual uploaded URL
      onChange?.(avatarUrl);
      setPreview(avatarUrl);
    } catch (error) {
      console.error("Upload failed:", error);
      // Revert preview if upload failed
      setPreview(value || null);
    }

    // Clear file input
    event.target.value = "";
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onChange?.("");
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div 
          className="size-24 cursor-pointer overflow-hidden rounded-full border-2 border-warning-400 transition-all hover:border-primary-400 hover:opacity-90"
          onClick={handleUploadClick}
        >
          {preview ? (
            <Image
              src={preview}
              alt="Avatar preview"
              width={96}
              height={96}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-default-100">
              <Camera size={32} className="text-default-400" />
            </div>
          )}
          
          {/* Upload overlay when uploading */}
          {uploadAvatar.isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
              <Upload size={20} className="text-white animate-pulse" />
            </div>
          )}
        </div>
        
        {preview && !uploadAvatar.isPending && (
          <Button
            isIconOnly
            size="xxs"
            color="danger"
            className="absolute right-0 top-0"
            onPress={handleRemoveImage}
          >
            <X size={16} />
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        <Button
          color="primary"
          variant="flat"
          size="sm"
          onPress={handleUploadClick}
          isLoading={uploadAvatar.isPending}
          className="cursor-pointer"
        >
          {uploadAvatar.isPending ? "Uploading..." : "Upload Avatar"}
        </Button>
      </div>
    </div>
  );
}
