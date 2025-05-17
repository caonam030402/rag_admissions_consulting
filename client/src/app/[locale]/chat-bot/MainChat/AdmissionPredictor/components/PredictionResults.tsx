import { Button } from "@heroui/react";
import { ArrowLeft, PaperPlaneTilt } from "@phosphor-icons/react";
import React from "react";

import { BLOCKS, HISTORICAL_DATA } from "../data";
import type { PredictionResultsProps } from "@/types/admissionPredictor";
import { getColorClass } from "../utils";

export const PredictionResults: React.FC<PredictionResultsProps> = ({
  results,
  currentBlock,
  onBack,
  onSendToChat,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Kết quả dự đoán</h2>
        <div className="flex gap-2">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Quay lại
          </Button>
          <Button
            onClick={onSendToChat}
            variant="solid"
            size="sm"
            className="flex items-center gap-1"
          >
            <PaperPlaneTilt size={16} />
            Gửi vào chat
          </Button>
        </div>
      </div>
      
      <div>
        <p className="mb-2 text-sm text-gray-600">
          Khối thi: <span className="font-medium">{currentBlock}</span> (
          {BLOCKS[currentBlock as keyof typeof BLOCKS].join(", ")})
        </p>
        
        <div className="space-y-3">
          {results.map((result) => {
            const colorClass = getColorClass(result.probability);
            
            return (
              <div 
                key={result.major}
                className={`rounded-lg border p-3 ${colorClass.border}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium">{result.major}</h3>
                  <div className="flex items-center gap-2">
                    <div className="text-right text-sm font-semibold">
                      {HISTORICAL_DATA[result.major as keyof typeof HISTORICAL_DATA]["2023"]}
                      <span className="ml-1 text-xs text-gray-500">
                        điểm 2023
                      </span>
                    </div>
                    <div 
                      className={`flex size-10 items-center justify-center rounded-full ${colorClass.bg} text-white`}
                    >
                      {result.probability}%
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-sm">{result.suggestion}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 