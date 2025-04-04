import { ArrowRight } from "@phosphor-icons/react";
import React from "react";

import Card from "@/components/common/Card";
import IconMapper from "@/components/common/IconMapper";

const listFAQ = [
  {
    title: "Học phí tại trường là bao nhiêu?",
    desc: "Học phí tùy ngành học, xem chi tiết trên website.",
    iconName: "wallet",
  },
  {
    title: "Trường có những ngành đào tạo nào?",
    desc: "Trường đào tạo đa ngành, xem danh sách trên website.",
    iconName: "graduationCap",
  },
  {
    title: "Làm thế nào để đăng ký xét tuyển?",
    desc: "Đăng ký online qua cổng tuyển sinh hoặc nộp trực tiếp.",
    iconName: "userList",
  },
  {
    title: "Trường có hỗ trợ học bổng không?",
    desc: "Có nhiều học bổng cho sinh viên giỏi và khó khăn.",
    iconName: "medal",
  },
];

export default function Faq() {
  return (
    <>
      <div className="mb-3 mt-7 flex w-full items-center justify-between text-sm opacity-80">
        <span>Câu hỏi thường gặp:</span>
        <ArrowRight />
      </div>
      <div className="grid w-full grid-cols-2 gap-3">
        {listFAQ.map((item, index) => (
          <div key={index}>
            <Card>
              <div className="flex gap-2">
                <div className="mt-1">
                  <IconMapper name={item.iconName} size={20} />
                </div>
                <div>
                  <div className="font-bold">{item.title}</div>
                  <div className="color-contract-light mt-1 text-sm">
                    {item.desc}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </>
  );
}
