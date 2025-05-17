import { Tooltip } from "@heroui/react";
import React, { useEffect, useRef, useState } from "react";

import type { VirtualMapProps } from "../types";

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 1000;

// Function to get color based on location type
const getTypeColor = (type: string) => {
  switch (type) {
    case "academic":
      return "#3b82f6"; // blue
    case "facility":
      return "#10b981"; // green
    case "housing":
      return "#f59e0b"; // yellow
    case "recreation":
      return "#8b5cf6"; // purple
    default:
      return "#6b7280"; // gray
  }
};

export const VirtualMap: React.FC<VirtualMapProps> = ({
  locations,
  selectedLocation,
  onLocationSelect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate scale to fit the map in the container
  useEffect(() => {
    if (mapContainerRef.current) {
      const containerWidth = mapContainerRef.current.clientWidth;
      const containerHeight = mapContainerRef.current.clientHeight;
      const scaleX = containerWidth / MAP_WIDTH;
      const scaleY = containerHeight / MAP_HEIGHT;
      const calculatedScale = Math.min(scaleX, scaleY) * 0.95;
      setIsLoading(false);
    }
  }, [mapContainerRef]);

  return (
    <div
      ref={mapContainerRef}
      className="relative size-full overflow-hidden bg-white"
    >
      {isLoading ? (
        <div className="flex size-full items-center justify-center">
          <p className="text-gray-500">Đang tải bản đồ...</p>
        </div>
      ) : (
        <>
          {/* Map background image */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')",
              backgroundPosition: "center",
              backgroundSize: "cover",
              opacity: 0.3,
              filter: "blur(2px)",
            }}
          />

          {/* Campus overlay */}
          <div className="absolute inset-0 bg-white opacity-50" />

          {/* Map labels and paths */}
          <svg
            className="absolute inset-0 size-full"
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Add paths connecting buildings */}
            <path
              d="M350 400 L600 250 L200 600 L750 700 L450 850"
              stroke="#d1d5db"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Draw location points */}
            {locations.map((location) => {
              const { id, name, coordinates, type } = location;
              const { x, y } = coordinates;
              const color = getTypeColor(type);
              const isSelected = selectedLocation?.id === id;
              const size = isSelected ? 30 : 25;

              return (
                <g
                  key={id}
                  onClick={() => onLocationSelect(location)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Shadow */}
                  <circle
                    cx={x * 10}
                    cy={y * 10}
                    r={size + 2}
                    fill="rgba(0,0,0,0.2)"
                    opacity="0.5"
                  />
                  {/* Main circle */}
                  <circle
                    cx={x * 10}
                    cy={y * 10}
                    r={size}
                    fill={color}
                    stroke={isSelected ? "#ffffff" : "transparent"}
                    strokeWidth={isSelected ? 4 : 0}
                  />
                  {/* Pulse animation for selected location */}
                  {isSelected && (
                    <>
                      <circle
                        cx={x * 10}
                        cy={y * 10}
                        r={size + 10}
                        fill="transparent"
                        stroke={color}
                        strokeWidth="2"
                        opacity="0.6"
                        className="animate-ping-slow"
                      />
                      <circle
                        cx={x * 10}
                        cy={y * 10}
                        r={size + 20}
                        fill="transparent"
                        stroke={color}
                        strokeWidth="1"
                        opacity="0.3"
                        className="animate-ping-slow animation-delay-500"
                      />
                    </>
                  )}
                  {/* Location name */}
                  <text
                    x={x * 10}
                    y={y * 10 + size + 15}
                    textAnchor="middle"
                    fill="#1f2937"
                    fontSize="13"
                    fontWeight="500"
                    className="pointer-events-none"
                    style={{
                      textShadow:
                        "0px 0px 4px rgba(255,255,255,1), 0px 0px 4px rgba(255,255,255,1)",
                    }}
                  >
                    {name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Map legend */}
          <div className="absolute bottom-4 left-4 rounded-lg bg-white bg-opacity-80 p-2 shadow-md">
            <div className="text-xs font-medium">Chú thích:</div>
            <div className="mt-1 flex flex-col gap-1 text-xs">
              <div className="flex items-center gap-1">
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: getTypeColor("academic") }}
                />
                <span>Học thuật</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: getTypeColor("facility") }}
                />
                <span>Tiện ích</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: getTypeColor("housing") }}
                />
                <span>Ký túc xá</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: getTypeColor("recreation") }}
                />
                <span>Giải trí</span>
              </div>
            </div>
          </div>

          {/* Help text */}
          {!selectedLocation && (
            <Tooltip content="Nhấp vào một vị trí trên bản đồ để xem thông tin chi tiết">
              <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
                <div className="rounded-lg bg-blue-100 px-4 py-2 text-sm text-blue-800">
                  Nhấp vào một vị trí trên bản đồ để xem thông tin chi tiết
                </div>
              </div>
            </Tooltip>
          )}
        </>
      )}
    </div>
  );
};
