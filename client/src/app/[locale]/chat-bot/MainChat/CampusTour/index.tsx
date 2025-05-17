"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { X } from "@phosphor-icons/react";
import React, { useState } from "react";

import { LocationCard } from "./components/LocationCard";
import { MediaViewer } from "./components/MediaViewer";
import { TourGuide } from "./components/TourGuide";
import { VirtualMap } from "./components/VirtualMap";
import { TOUR_DATA } from "./data";
import { Location } from "./types";

interface CampusTourProps {
  onClose: () => void;
  onSubmit: (message: string) => void;
}

export default function CampusTour({
  onClose,
  onSubmit,
}: CampusTourProps): React.ReactElement {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showingMedia, setShowingMedia] = useState(false);
  const [guideActive, setGuideActive] = useState(false);
  
  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };
  
  const handleGuideToggle = () => {
    setGuideActive(!guideActive);
  };
  
  const handleSendToChat = () => {
    if (!selectedLocation) return;
    
    let message = `Thông tin về ${selectedLocation.name}:\n\n`;
    message += `${selectedLocation.description}\n\n`;
    
    if (selectedLocation.majors && selectedLocation.majors.length > 0) {
      message += "**Các ngành học liên quan:**\n";
      selectedLocation.majors.forEach(major => {
        message += `- ${major.name}: ${major.description}\n`;
      });
    }
    
    message += "\nBạn có câu hỏi gì khác về địa điểm này hoặc muốn tìm hiểu về khu vực khác không?";
    
    onSubmit(message);
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose} size="5xl">
      <ModalContent className="h-[90vh] max-h-[90vh]">
        <ModalHeader className="flex items-center justify-between border-b p-4">
          <h1 className="text-xl font-semibold">
            Tham quan ảo khuôn viên trường
          </h1>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="rounded-full"
          >
            <X size={20} />
          </Button>
        </ModalHeader>

        <ModalBody className="flex flex-col p-0">
          <div className="grid h-full grid-cols-1 md:grid-cols-3">
            {/* Left sidebar - Location list */}
            <div className="border-r md:col-span-1">
              <div className="h-full overflow-y-auto p-4">
                <h2 className="mb-4 text-lg font-medium">Địa điểm tham quan</h2>
                <div className="space-y-2">
                  {TOUR_DATA.locations.map((location) => (
                    <LocationCard
                      key={location.id}
                      location={location}
                      isSelected={selectedLocation?.id === location.id}
                      onSelect={() => handleLocationSelect(location)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Main content area */}
            <div className="relative flex flex-col md:col-span-2">
              {showingMedia ? (
                <MediaViewer
                  media={selectedLocation?.media || []}
                  onClose={() => setShowingMedia(false)}
                />
              ) : (
                <>
                  <div className="h-[60%] overflow-hidden bg-gray-100">
                    <VirtualMap
                      locations={TOUR_DATA.locations}
                      selectedLocation={selectedLocation}
                      onLocationSelect={handleLocationSelect}
                    />
                  </div>
                  <div className="flex h-[40%] flex-col overflow-y-auto p-4">
                    {selectedLocation ? (
                      <>
                        <div className="mb-2 flex items-center justify-between">
                          <h2 className="text-xl font-medium">{selectedLocation.name}</h2>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="light"
                              onClick={() => setShowingMedia(true)}
                              disabled={!selectedLocation.media || selectedLocation.media.length === 0}
                            >
                              Xem hình ảnh/video
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSendToChat}
                            >
                              Gửi vào chat
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-700">{selectedLocation.description}</p>
                        
                        {selectedLocation.majors && selectedLocation.majors.length > 0 && (
                          <div className="mt-4">
                            <h3 className="mb-2 text-lg font-medium">Ngành học liên quan</h3>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              {selectedLocation.majors.map((major) => (
                                <div
                                  key={major.name}
                                  className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
                                >
                                  <h4 className="mb-1 font-medium">{major.name}</h4>
                                  <p className="text-sm text-gray-600">{major.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-center text-gray-500">
                          Chọn một địa điểm trên bản đồ hoặc từ danh sách để xem thông tin chi tiết
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {/* Tour guide floating button */}
              <div className="absolute bottom-4 right-4">
                <Button
                  onClick={handleGuideToggle}
                  className="h-12 w-auto px-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-colors"
                  size="sm"
                >
                  {guideActive ? "Tắt" : "Hướng dẫn"}
                </Button>
              </div>
            </div>
          </div>
        </ModalBody>
        
        {guideActive && (
          <TourGuide 
            currentLocation={selectedLocation}
            onClose={() => setGuideActive(false)}
          />
        )}

        <ModalFooter className="border-t p-4">
          <p className="text-xs text-gray-500">
            Trải nghiệm tham quan ảo khuôn viên trường giúp bạn khám phá không gian học tập và các ngành học trước khi đăng ký. Hình ảnh và thông tin chỉ mang tính chất minh họa.
          </p>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 