import { Card, CardBody, Chip } from "@heroui/react";
import {
  Buildings,
  GameController,
  GraduationCap,
  House,
  MapPin,
} from "@phosphor-icons/react";
import React from "react";

import type { LocationCardProps } from "../types";

// Icon components for different location types
const LocationIcon: React.FC<{
  type: string;
  className?: string;
}> = ({ type, className = "size-5" }) => {
  switch (type) {
    case "academic":
      return <GraduationCap className={className} weight="fill" />;
    case "facility":
      return <Buildings className={className} weight="fill" />;
    case "housing":
      return <House className={className} weight="fill" />;
    case "recreation":
      return <GameController className={className} weight="fill" />;
    default:
      return <MapPin className={className} weight="fill" />;
  }
};

// Get colors for location types
const getTypeConfig = (type: string) => {
  switch (type) {
    case "academic":
      return {
        color: "primary" as const,
        label: "Học thuật",
        iconColor: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      };
    case "facility":
      return {
        color: "success" as const,
        label: "Tiện ích",
        iconColor: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      };
    case "housing":
      return {
        color: "warning" as const,
        label: "Ký túc xá",
        iconColor: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
      };
    case "recreation":
      return {
        color: "secondary" as const,
        label: "Giải trí",
        iconColor: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
      };
    default:
      return {
        color: "default" as const,
        label: "Khác",
        iconColor: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
      };
  }
};

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  isSelected,
  onSelect,
}) => {
  const config = getTypeConfig(location.type);

  return (
    <Card
      isPressable
      onPress={onSelect}
      className={`w-full cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
        isSelected
          ? `${config.bgColor} ${config.borderColor} border-2 shadow-lg`
          : "border-gray-200 hover:shadow-md"
      }`}
    >
      <CardBody className="p-3">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`flex size-10 items-center justify-center rounded-xl ${
              isSelected ? config.bgColor : "bg-gray-100"
            }`}
          >
            <LocationIcon
              type={location.type}
              className={`size-5 ${isSelected ? config.iconColor : "text-gray-600"}`}
            />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`text-sm font-semibold leading-tight ${
                  isSelected ? "text-gray-900" : "text-gray-800"
                }`}
              >
                {location.name}
              </h3>
              <Chip
                size="sm"
                variant={isSelected ? "solid" : "flat"}
                color={config.color}
                className="shrink-0"
              >
                {config.label}
              </Chip>
            </div>

            {/* Description */}
            <p
              className={`mt-1 line-clamp-2 text-xs leading-relaxed ${
                isSelected ? "text-gray-700" : "text-gray-600"
              }`}
            >
              {location.description}
            </p>

            {/* Majors */}
            {location.majors && location.majors.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {location.majors.slice(0, 2).map((major) => (
                  <span
                    key={major.name}
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      isSelected
                        ? "bg-white/80 text-gray-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {major.name}
                  </span>
                ))}
                {location.majors.length > 2 && (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      isSelected
                        ? "bg-white/60 text-gray-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    +{location.majors.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
