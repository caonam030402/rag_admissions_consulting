import { Button } from "@heroui/react";
import { ArrowLeft, ArrowRight, X } from "@phosphor-icons/react";
import React, { useState } from "react";

import type { MediaViewerProps } from "../types";

export const MediaViewer: React.FC<MediaViewerProps> = ({ media, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Prevent showing an empty viewer
  if (!media || media.length === 0) {
    return null;
  }

  const currentMedia = media[currentIndex];

  // Safety check for currentMedia
  if (!currentMedia) {
    return (
      <div className="flex size-full items-center justify-center bg-black">
        <p className="text-white">Unable to display media content.</p>
      </div>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  // Render different media types
  const renderMedia = () => {
    switch (currentMedia.type) {
      case "image":
        return (
          <div className="flex h-full w-full items-center justify-center">
            <img
              src={currentMedia.url}
              alt={currentMedia.title}
              className="max-h-[calc(100vh-200px)] w-auto max-w-full rounded-lg object-contain"
            />
          </div>
        );
      case "video":
        return (
          <div className="flex h-full w-full items-center justify-center">
            <video
              src={currentMedia.url}
              controls
              className="max-h-[calc(100vh-200px)] w-auto max-w-full rounded-lg"
              poster={currentMedia.thumbnail}
            >
              <track kind="captions" src="" label="Vietnamese" />
              Trình duyệt của bạn không hỗ trợ xem video.
            </video>
          </div>
        );
      case "360":
        return (
          <div className="flex h-full w-full items-center justify-center overflow-hidden">
            <div className="max-w-md rounded-lg bg-gray-100 p-6 text-center">
              <p className="mb-4 text-lg font-medium">Trải nghiệm 360°</p>
              <p className="mb-4 text-gray-600">
                Đây là nơi hiển thị hình ảnh/video 360 độ. Trong môi trường thực
                tế, bạn có thể sử dụng thư viện như Pannellum hoặc A-Frame để
                hiển thị nội dung 360 độ.
              </p>
              <img
                src={currentMedia.url}
                alt={currentMedia.title}
                className="mx-auto max-h-[250px] w-auto max-w-full rounded-lg"
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="flex h-full items-center justify-center text-gray-500">
            Không thể hiển thị nội dung này.
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 flex h-full w-full flex-col overflow-hidden bg-black bg-opacity-90">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-medium text-white">{currentMedia.title}</h2>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="rounded-full text-white"
        >
          <X size={20} />
        </Button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
        {media.length > 1 && (
          <>
            <Button
              onClick={handlePrevious}
              variant="ghost"
              className="absolute left-4 z-10 size-12 rounded-full bg-black bg-opacity-30 text-white hover:bg-opacity-50"
            >
              <ArrowLeft size={24} />
            </Button>
            <Button
              onClick={handleNext}
              variant="ghost"
              className="absolute right-4 z-10 size-12 rounded-full bg-black bg-opacity-30 text-white hover:bg-opacity-50"
            >
              <ArrowRight size={24} />
            </Button>
          </>
        )}

        <div className="flex h-full w-full items-center justify-center overflow-hidden">
          {renderMedia()}
        </div>
      </div>

      {currentMedia.description && (
        <div className="p-4 text-sm text-white">
          <p>{currentMedia.description}</p>
        </div>
      )}

      {/* Thumbnail navigation */}
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-4">
          {media.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`shrink-0 overflow-hidden rounded border-2 
                ${currentIndex === index ? "border-blue-500" : "border-transparent"}`}
            >
              <img
                src={
                  item.type === "video" ? item.thumbnail || item.url : item.url
                }
                alt={`Thumbnail ${index + 1}`}
                className="h-16 w-24 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
