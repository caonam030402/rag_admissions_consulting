import React from "react";

import type { Theme } from "@/types/appearance";

interface ThemeThumbnailProps {
  theme: Theme;
  isSelected: boolean;
  onSelect: (themeId: string) => void;
}

export const ThemeThumbnail: React.FC<ThemeThumbnailProps> = ({
  theme,
  isSelected,
  onSelect,
}) => {
  const { colors } = theme;

  return (
    <div
      className={`relative size-24 cursor-pointer overflow-hidden rounded-lg border-2
        ${isSelected ? "border-green-500" : "border-gray-200"}`}
      onClick={() => onSelect(theme.id)}
      style={{ backgroundColor: colors.layoutBackground }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onSelect(theme.id);
        }
      }}
      aria-pressed={isSelected}
    >
      {/* Theme visualization */}
      <div className="absolute inset-0 flex flex-col p-2">
        {/* Header area */}
        <div
          className="mb-1 h-3 w-full rounded"
          style={{ backgroundColor: colors.minimizedBackground }}
        />

        {/* Message bubbles */}
        <div
          className="mb-1 h-2 w-3/4 rounded"
          style={{ backgroundColor: colors.copilotReplyBackground }}
        />
        <div
          className="mb-1 ml-auto h-2 w-1/2 rounded"
          style={{ backgroundColor: colors.userReplyBackground }}
        />

        {/* Input area */}
        <div
          className="mt-auto h-3 w-full rounded"
          style={{ backgroundColor: colors.inputBackground }}
        />

        {/* Accent dot */}
        <div
          className="absolute bottom-2 right-2 size-3 rounded-full"
          style={{ backgroundColor: colors.primaryButton }}
        />
      </div>

      {isSelected && (
        <div className="absolute right-1 top-1 z-10 rounded-full bg-green-500 p-1">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 6L9 17L4 12"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-black/50 py-1 text-center text-xs text-white">
        {theme.name}
      </div>
    </div>
  );
};
