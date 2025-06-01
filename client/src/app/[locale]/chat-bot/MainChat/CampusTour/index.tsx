"use client";

import {
  Button,
  Card,
  CardBody,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import { ChatCircle, Eye, MapPin, X } from "@phosphor-icons/react";
import React, { useState } from "react";

import { LocationCard } from "./components/LocationCard";
import { MediaViewer } from "./components/MediaViewer";
import { TourGuide } from "./components/TourGuide";
import { VirtualMap } from "./components/VirtualMap";
import { TOUR_DATA } from "./data";
import type { Location } from "./types";

interface CampusTourProps {
  onClose: () => void;
  onSubmit: (message: string) => void;
}

export default function CampusTour({
  onClose,
  onSubmit,
}: CampusTourProps): React.ReactElement {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
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
      selectedLocation.majors.forEach((major) => {
        message += `- ${major.name}: ${major.description}\n`;
      });
    }

    message +=
      "\nBạn có câu hỏi gì khác về địa điểm này hoặc muốn tìm hiểu về khu vực khác không?";

    onSubmit(message);
    onClose();
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "academic":
        return "Học thuật";
      case "facility":
        return "Tiện ích";
      case "housing":
        return "Ký túc xá";
      case "recreation":
        return "Giải trí";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "academic":
        return "primary";
      case "facility":
        return "success";
      case "housing":
        return "warning";
      case "recreation":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="5xl"
      classNames={{
        base: "max-h-[95vh]",
        wrapper: "items-center justify-center",
      }}
    >
      <ModalContent className="h-[90vh] max-w-7xl">
        <ModalHeader className="from-blue-50 to-purple-50 flex items-center justify-between border-b bg-gradient-to-r px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="from-blue-500 to-purple-500 flex size-10 items-center justify-center rounded-xl bg-gradient-to-r text-white">
              <MapPin size={20} weight="fill" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Tham quan ảo khuôn viên trường
              </h1>
              <p className="text-sm text-gray-600">
                Khám phá không gian học tập và sinh hoạt
              </p>
            </div>
          </div>
          <Button
            isIconOnly
            variant="light"
            onPress={onClose}
            className="rounded-full text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </Button>
        </ModalHeader>

        <ModalBody className="p-0">
          <div className="flex h-full">
            {/* Left sidebar - Location list */}
            <div className="w-80 border-r bg-gray-50/50">
              <div className="flex h-full flex-col">
                <div className="border-b bg-white px-4 py-3">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-gray-800">
                    <MapPin size={16} />
                    Địa điểm tham quan
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    {TOUR_DATA.locations.length} địa điểm
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-3">
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
            </div>

            {/* Main content area */}
            <div className="relative flex flex-1 flex-col">
              {showingMedia ? (
                <MediaViewer
                  media={selectedLocation?.media || []}
                  onClose={() => setShowingMedia(false)}
                />
              ) : (
                <>
                  {/* Map area */}
                  <div className="relative h-3/5 bg-gray-50">
                    <VirtualMap
                      locations={TOUR_DATA.locations}
                      selectedLocation={selectedLocation}
                      onLocationSelect={handleLocationSelect}
                    />
                    {!selectedLocation && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                        <Card className="w-80">
                          <CardBody className="text-center">
                            <MapPin
                              size={32}
                              className="mx-auto mb-2 text-gray-400"
                            />
                            <p className="text-sm font-medium text-gray-600">
                              Nhấp vào một vị trí trên bản đồ để xem thông tin
                              chi tiết
                            </p>
                          </CardBody>
                        </Card>
                      </div>
                    )}
                  </div>

                  {/* Details area */}
                  <div className="flex h-2/5 flex-col bg-white">
                    {selectedLocation ? (
                      <div className="flex h-full flex-col">
                        {/* Header */}
                        <div className="from-gray-50 to-blue-50 border-b bg-gradient-to-r px-6 py-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-gray-900">
                                  {selectedLocation.name}
                                </h2>
                                <Chip
                                  color={
                                    getTypeColor(selectedLocation.type) as any
                                  }
                                  size="sm"
                                  variant="flat"
                                >
                                  {getTypeLabel(selectedLocation.type)}
                                </Chip>
                              </div>
                              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                {selectedLocation.description}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="flat"
                                color="primary"
                                startContent={<Eye size={16} />}
                                onPress={() => setShowingMedia(true)}
                                isDisabled={
                                  !selectedLocation.media ||
                                  selectedLocation.media.length === 0
                                }
                              >
                                Xem hình ảnh
                              </Button>
                              <Button
                                size="sm"
                                color="primary"
                                startContent={<ChatCircle size={16} />}
                                onPress={handleSendToChat}
                              >
                                Gửi vào chat
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                          {selectedLocation.majors &&
                            selectedLocation.majors.length > 0 && (
                              <div>
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
                                  🎓 Ngành học liên quan
                                </h3>
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                  {selectedLocation.majors.map((major) => (
                                    <Card
                                      key={major.name}
                                      className="border-l-4 border-l-blue-500"
                                    >
                                      <CardBody className="p-4">
                                        <h4 className="mb-2 font-semibold text-gray-900">
                                          {major.name}
                                        </h4>
                                        <p className="text-sm leading-relaxed text-gray-600">
                                          {major.description}
                                        </p>
                                      </CardBody>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <MapPin
                            size={48}
                            className="mx-auto mb-4 text-gray-300"
                          />
                          <p className="text-lg font-medium text-gray-500">
                            Chọn một địa điểm để xem thông tin
                          </p>
                          <p className="mt-1 text-sm text-gray-400">
                            Bạn có thể nhấp vào bản đồ hoặc chọn từ danh sách
                            bên trái
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Tour guide floating button */}
              <div className="absolute bottom-6 right-6">
                <Button
                  onPress={handleGuideToggle}
                  className="from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 h-12 rounded-full bg-gradient-to-r px-6 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                  startContent={
                    <div className="rounded-full bg-white/20 p-1">👋</div>
                  }
                >
                  {guideActive ? "Đóng hướng dẫn" : "Hướng dẫn viên"}
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
      </ModalContent>
    </Modal>
  );
}
