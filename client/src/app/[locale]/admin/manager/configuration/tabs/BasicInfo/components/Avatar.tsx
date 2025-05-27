"use client";

import { Camera, X } from "@phosphor-icons/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

import Button from "@/components/common/Button";

interface AvatarProps {
  onChange?: (value: string) => void;
  value?: string;
}

export default function Avatar({ onChange, value }: AvatarProps) {
  const [preview, setPreview] = useState<string | null>(value || null);

  useEffect(() => {
    if (value !== undefined) {
      setPreview(value || null);
    }
  }, [value]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setPreview(imageData);
        onChange?.(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onChange?.("");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <label htmlFor="avatar-upload" className="block">
          <div className="size-24 cursor-pointer overflow-hidden rounded-full border-2 border-warning-400 transition-all hover:border-primary-400 hover:opacity-90">
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
          </div>
        </label>
        {preview && (
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
        <label htmlFor="avatar-upload">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="avatar-upload"
          />
          <Button
            as="span"
            color="primary"
            variant="flat"
            size="sm"
            className="cursor-pointer"
          >
            Upload Avatar
          </Button>
        </label>
      </div>
    </div>
  );
}
