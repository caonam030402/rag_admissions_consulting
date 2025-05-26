"use client";

import { Star } from "@phosphor-icons/react";

export default function WorkStyleStep() {
  return (
    <div className="space-y-6">
      <div className="mt-8">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="flex size-24 items-center justify-center rounded-full bg-blue-50">
            <div className="text-blue-500">
              <Star weight="fill" size={48} />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-base font-semibold text-gray-800">
              Chúc mừng!
            </h2>
            <p className="text-sm text-gray-500">
              Bạn đã hoàn thành khảo sát. Nhấn nút hoàn tất để xem kết quả.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
