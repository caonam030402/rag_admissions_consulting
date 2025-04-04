import React from "react";

import Faq from "../Faq";

export default function IntroChat() {
  return (
    <div className="mx-auto flex h-full w-2/5 flex-col items-center justify-center">
      <h1 className="mt-10 text-3xl font-bold">👋 Xin Chào</h1>
      <div className="mt-7 text-center">
        Chào mừng bạn đến với [Tên Trường Đại Học]! 🎓 Tôi là trợ lý tuyển sinh,
        sẵn sàng hỗ trợ bạn về chương trình đào tạo, hồ sơ nhập học và học bổng.
        Hãy hỏi tôi bất cứ điều gì! 🚀
      </div>
      <Faq />
    </div>
  );
}
