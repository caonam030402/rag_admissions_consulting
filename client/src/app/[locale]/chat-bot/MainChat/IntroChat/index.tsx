import React from "react";
import { Card, CardBody } from "@heroui/react";

import Faq from "../Faq";

export default function IntroChat() {
  return (
    <div className="mx-auto flex h-full flex-col items-center justify-center max-w-2xl">
      {/* Welcome Message */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
          <div className="text-3xl">🎓</div>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Chào mừng bạn đến với
        </h1>
        <p className="text-xl text-gray-600">
          <span className="text-blue-600 font-semibold">
            Trợ lý Tuyển sinh AI
          </span>
        </p>
        <p className="text-base text-gray-500 mt-2">
          Tôi sẵn sàng hỗ trợ bạn về thông tin tuyển sinh, ngành học và học bổng
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
        <Card className="bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all cursor-pointer">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-lg">📚</span>
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

        <Card className="bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all cursor-pointer">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-lg">💰</span>
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

        <Card className="bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all cursor-pointer">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 text-lg">🏆</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Học bổng</h3>
                <p className="text-sm text-gray-600">Cơ hội nhận học bổng</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all cursor-pointer">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600 text-lg">📊</span>
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
