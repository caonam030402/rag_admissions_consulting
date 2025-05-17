import React from "react";

import type { LocationCardProps } from "../types";

// Icon components for different location types
const LocationIcon: React.FC<{ type: string }> = ({ type }) => {
  const getIcon = () => {
    switch (type) {
      case "academic":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        );
      case "facility":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        );
      case "housing":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        );
      case "recreation":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        );
    }
  };

  return getIcon();
};

// Get color based on location type
const getTypeColor = (type: string) => {
  switch (type) {
    case "academic":
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        icon: "text-blue-600",
      };
    case "facility":
      return {
        bg: "bg-green-50",
        border: "border-green-200",
        icon: "text-green-600",
      };
    case "housing":
      return {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        icon: "text-yellow-600",
      };
    case "recreation":
      return {
        bg: "bg-purple-50",
        border: "border-purple-200",
        icon: "text-purple-600",
      };
    default:
      return {
        bg: "bg-gray-50",
        border: "border-gray-200",
        icon: "text-gray-600",
      };
  }
};

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  isSelected,
  onSelect,
}) => {
  const { type } = location;
  const colorClass = getTypeColor(type);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border p-3 text-left transition hover:shadow-md
        ${isSelected ? `${colorClass.bg} ${colorClass.border}` : "border-gray-200 hover:bg-gray-50"}`}
    >
      <div className="flex items-center gap-3">
        <div className={`rounded-full p-1 ${colorClass.bg} ${colorClass.icon}`}>
          <LocationIcon type={type} />
        </div>
        <div>
          <h3 className="text-sm font-medium">{location.name}</h3>
          <p className="line-clamp-1 text-xs text-gray-500">
            {location.description.substring(0, 60)}
            {location.description.length > 60 ? "..." : ""}
          </p>

          {location.majors && location.majors.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {location.majors
                .map((major) => (
                  <span
                    key={major.name}
                    className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700"
                  >
                    {major.name}
                  </span>
                ))
                .slice(0, 2)}
              {location.majors.length > 2 && (
                <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700">
                  +{location.majors.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};
