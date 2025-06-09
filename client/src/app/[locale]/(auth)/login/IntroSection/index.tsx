/* eslint-disable jsx-a11y/media-has-caption */
import React from "react";

import Logo from "@/components/common/Logo";

export default function IntroSection() {
  return (
    <div className="h-full w-1/2 bg-[url('https://lf-scm-us.feishucdn.com/larksuite/global_registration_web/static/image/left-bg.cc3d00d0.png')] bg-cover p-10 2xl:w-[30%]">
      <Logo />
      <div className="flex h-[90%] flex-col items-center justify-center text-center">
        <div className="h-[300px] w-[90%] overflow-hidden rounded-3xl border-[15px] border-white">
          <img
            className="size-full rounded-md object-cover"
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            alt="Hệ thống tư vấn tuyển sinh thông minh"
          />
        </div>
        <div className="mt-10 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold">
            Hệ thống tư vấn tuyển sinh thông minh
          </div>
          <p className="mt-4 w-3/5 text-base">
            Kết nối thí sinh với trường đại học, tư vấn ngành học và hỗ trợ
            thông tin tuyển sinh toàn diện.
          </p>
        </div>
      </div>
    </div>
  );
}
