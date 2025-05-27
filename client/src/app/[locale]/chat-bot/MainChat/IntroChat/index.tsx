import { Card, CardBody } from "@heroui/react";
import React from "react";

import Faq from "../Faq";

export default function IntroChat() {
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center">
      {/* Welcome Message */}
      <div className="mb-8 text-center">
        <div className="from-blue-400 to-purple-500 mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-gradient-to-br">
          <div className="text-3xl">🎓</div>
        </div>
        <h1 className="mb-4 text-4xl font-bold text-gray-800">
          Chào mừng bạn đến với
        </h1>
        <p className="text-xl text-gray-600">
          <span className="font-semibold text-blue-600">
            Trợ lý Tuyển sinh AI
          </span>
        </p>
        <p className="mt-2 text-base text-gray-500">
          Tôi sẵn sàng hỗ trợ bạn về thông tin tuyển sinh, ngành học và học bổng
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="mb-8 grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="cursor-pointer border border-white/20 bg-white/60 backdrop-blur-sm transition-all hover:bg-white/80">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                <span className="text-lg text-blue-600">📚</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Ngành học</h3>
                <p className="text-sm text-gray-600">
                  Tìm hiểu các chương trình đào tạo
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="cursor-pointer border border-white/20 bg-white/60 backdrop-blur-sm transition-all hover:bg-white/80">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                <span className="text-lg text-green-600">💰</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Học phí</h3>
                <p className="text-sm text-gray-600">
                  Thông tin chi phí học tập
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="cursor-pointer border border-white/20 bg-white/60 backdrop-blur-sm transition-all hover:bg-white/80">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
                <span className="text-lg text-purple-600">🏆</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Học bổng</h3>
                <p className="text-sm text-gray-600">Cơ hội nhận học bổng</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="cursor-pointer border border-white/20 bg-white/60 backdrop-blur-sm transition-all hover:bg-white/80">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-orange-100">
                <span className="text-lg text-orange-600">📊</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Điểm chuẩn</h3>
                <p className="text-sm text-gray-600">Thống kê tuyển sinh</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Faq />
    </div>
  );
}
