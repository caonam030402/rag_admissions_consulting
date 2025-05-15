import React from "react";
import { Theme } from "@/types/appearance";

interface ThemeThumbnailProps {
  theme: Theme;
  isSelected: boolean;
  onSelect: (themeId: string) => void;
}

export const ThemeThumbnail: React.FC<ThemeThumbnailProps> = ({ 
  theme,
  isSelected,
  onSelect
}) => {
  const colors = theme.colors;
  
  return (
    <div 
      className={`w-24 h-24 rounded-lg border-2 cursor-pointer relative overflow-hidden
        ${isSelected ? 'border-green-500' : 'border-gray-200'}`}
      onClick={() => onSelect(theme.id)}
      style={{ backgroundColor: colors.layoutBackground }}
    >
      {/* Theme visualization */}
      <div className="absolute inset-0 p-2 flex flex-col">
        {/* Header area */}
        <div className="w-full h-3 rounded mb-1" style={{ backgroundColor: colors.minimizedBackground }}></div>
        
        {/* Message bubbles */}
        <div className="w-3/4 h-2 rounded mb-1" style={{ backgroundColor: colors.copilotReplyBackground }}></div>
        <div className="w-1/2 h-2 rounded ml-auto mb-1" style={{ backgroundColor: colors.userReplyBackground }}></div>
        
        {/* Input area */}
        <div className="w-full h-3 rounded mt-auto" style={{ backgroundColor: colors.inputBackground }}></div>
        
        {/* Accent dot */}
        <div 
          className="absolute bottom-2 right-2 w-3 h-3 rounded-full"
          style={{ backgroundColor: colors.primaryButton }}
        ></div>
      </div>
      
      {isSelected && (
        <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1 z-10">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 text-center">
        {theme.name}
      </div>
    </div>
  );
}; 