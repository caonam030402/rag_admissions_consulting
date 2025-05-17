import { button, Button } from "@heroui/react";
import { Play, Stop, X } from "@phosphor-icons/react";
import React, { useEffect, useState } from "react";

import { TOUR_DATA } from "../data";
import type { TourGuideProps } from "../types";

export const TourGuide: React.FC<TourGuideProps> = ({
  currentLocation,
  onClose,
}) => {
  // Ensure guides array has at least one item before accessing
  const [selectedGuide, setSelectedGuide] = useState(
    TOUR_DATA.guides[0] || {
      id: "default",
      name: "Hướng dẫn viên",
      role: "Tour guide",
      avatar: "",
      voiceId: "default",
    },
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");
  
  // Generate audio transcript based on location
  useEffect(() => {
    if (currentLocation) {
      // In a real implementation, this would be generated dynamically or fetched from an API
      const locationTranscript = `
        Xin chào, tôi là ${selectedGuide.name}, ${selectedGuide.role}. 
        
        Hiện tại bạn đang tham quan ${currentLocation.name}. ${currentLocation.description}
        
        ${
          currentLocation.majors && currentLocation.majors.length > 0
            ? `Nơi đây là trung tâm đào tạo của ${currentLocation.majors.length} ngành học: ${currentLocation.majors.map((m) => m.name).join(", ")}.`
            : ""
        }
          
        ${
          currentLocation.facilities && currentLocation.facilities.length > 0
            ? `Các tiện ích bao gồm: ${currentLocation.facilities.join(", ")}.`
            : ""
        }
          
        ${
          currentLocation.people && currentLocation.people.length > 0
            ? `Một trong những người đáng chú ý ở đây là ${currentLocation.people[0]?.name || ""}, ${currentLocation.people[0]?.role || ""}.`
            : ""
        }
          
        Hãy khám phá khu vực này và nếu bạn có bất kỳ câu hỏi nào, đừng ngại hỏi tôi!
      `.trim().replace(/\s+/g, ' ');
      
      setTranscript(locationTranscript);
    } else {
      setTranscript("Vui lòng chọn một địa điểm để tôi giới thiệu chi tiết.");
    }
  }, [currentLocation, selectedGuide]);
  
  const handlePlayAudio = () => {
    // In a real implementation, this would trigger text-to-speech
    setIsPlaying(!isPlaying);
    
    // Simulate audio playback timing
    if (!isPlaying) {
      // Start playing - in real app, would use Web Speech API or similar
      console.log(
        "Would start playing audio with voice ID:",
        selectedGuide.voiceId
      );
      
      // For demo, we'll just toggle back after 5 seconds
      setTimeout(() => {
        setIsPlaying(false);
      }, 5000);
    } else {
      // Stop playing
      console.log("Stop audio playback");
    }
  };

  return (
    <div className="absolute bottom-20 right-4 w-80 rounded-lg border bg-white shadow-lg">
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="text-base font-medium">Hướng dẫn viên ảo</h3>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="rounded-full"
        >
          <X size={16} />
        </Button>
      </div>
      
      <div className="p-3">
        <div className="flex items-center gap-3">
          {/* Guide selection */}
          <div className="relative">
            <img
              src={selectedGuide.avatar || "https://via.placeholder.com/48"}
              alt={selectedGuide.name}
              className="size-12 rounded-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <select
                value={selectedGuide.id}
                onChange={(e) => {
                  const newGuide = TOUR_DATA.guides.find((g) => g.id === e.target.value);
                  if (newGuide) setSelectedGuide(newGuide);
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="Chọn hướng dẫn viên"
              >
                {TOUR_DATA.guides.map((guide) => (
                  <option key={guide.id} value={guide.id}>
                    {guide.name} - {guide.role}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium">{selectedGuide.name}</p>
            <p className="text-xs text-gray-600">{selectedGuide.role}</p>
          </div>
          
          <div className="ml-auto">
            <Button
              onClick={handlePlayAudio}
              disabled={!currentLocation}
              size="sm"
              className={`h-10 w-10 rounded-full ${isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}`}
            >
              {isPlaying ? <Stop size={18} /> : <Play size={18} />}
            </Button>
          </div>
        </div>
        
        <div className="mt-3">
          <p
            className={`text-sm ${currentLocation ? "text-gray-800" : "italic text-gray-500"}`}
          >
            {isPlaying ? (
              <span className="inline-flex items-center">
                <span className="mr-2 inline-block size-2 animate-pulse rounded-full bg-blue-500" />
                Đang phát...
              </span>
            ) : (
              transcript
            )}
          </p>
        </div>
      </div>
      
      {currentLocation && (
        <div className="border-t p-3">
          <p className="mb-2 text-xs font-medium">Câu hỏi gợi ý:</p>
          <div className="space-y-1.5">
            <button type="button" className="block w-full rounded-md bg-gray-100 px-3 py-1.5 text-left text-xs hover:bg-gray-200">
              Ngành học nào phổ biến ở {currentLocation.name}?
            </button>
            <button type="button" className="block w-full rounded-md bg-gray-100 px-3 py-1.5 text-left text-xs hover:bg-gray-200">
              Cơ hội việc làm sau khi tốt nghiệp?
            </button>
            <button
              type="button"
              className="block w-full rounded-md bg-gray-100 px-3 py-1.5 text-left text-xs hover:bg-gray-200"
            >
              Các hoạt động ngoại khóa tại đây?
            </button>
          </div>
        </div>
      )}
    </div>
  );
}