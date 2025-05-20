import { Accordion, AccordionItem, Button } from "@heroui/react";
import { BiAnchor } from "@react-icons/all-files/bi/BiAnchor";
import { BiBraille } from "@react-icons/all-files/bi/BiBraille";
import { BiFile } from "@react-icons/all-files/bi/BiFile";
import { BiLineChart } from "@react-icons/all-files/bi/BiLineChart";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

import { fadeAnimationVariants } from "@/constants/animation";
import { cn } from "@/libs/utils";

const keyAccordion = {
  multiCampus: "0",
  advisorCoordination: "1",
  dataInsights: "2",
  automateWorkflows: "3",
};

const listAccordion = [
  {
    title: "Quản lý tuyển sinh đa cơ sở",
    content:
      "Điều phối hoạt động tuyển sinh giữa nhiều cơ sở đào tạo trên một nền tảng duy nhất",
    value: keyAccordion.multiCampus,
    icon: <BiBraille size={24} />,
    video:
      "https://videos.pexels.com/video-files/3209298/3209298-uhd_2560_1440_25fps.mp4",
  },
  {
    title: "Tối ưu phối hợp tư vấn viên",
    content:
      "AppChatbot giúp kết nối, phân công và theo dõi hiệu quả làm việc của từng tư vấn viên",
    value: keyAccordion.advisorCoordination,
    icon: <BiAnchor size={24} />,
    video:
      "https://videos.pexels.com/video-files/3209298/3209298-uhd_2560_1440_25fps.mp4",
  },
  {
    title: "Phân tích dữ liệu tuyển sinh",
    content:
      "Tổng hợp, thống kê và hiển thị báo cáo tuyển sinh theo thời gian thực",
    value: keyAccordion.dataInsights,
    icon: <BiLineChart size={24} />,
    video:
      "https://videos.pexels.com/video-files/3209298/3209298-uhd_2560_1440_25fps.mp4",
  },
  {
    title: "Tự động hóa quy trình tuyển sinh",
    content:
      "Số hóa quy trình tư vấn, gửi thông báo, nhắc lịch, quản lý tài liệu và khảo sát đánh giá",
    value: keyAccordion.automateWorkflows,
    icon: <BiFile size={24} />,
    video: "https://framerusercontent.com/assets/SLjzS4z4yUlLpaFu3F7Gv348o.mp4",
  },
];

export default function CommunicationTool() {
  const [selectKey, setSelectKey] = React.useState<string>("0");

  const videoActive = listAccordion.find(
    (item) => item.value === selectKey,
  )?.video;

  return (
    <div className="flex flex-col items-center pb-10 text-center">
      <div className="text-3xl font-semibold">
        AppChatbot –{" "}
        <span className="text-primary">Nền tảng số hóa tuyển sinh</span> toàn
        diện
      </div>
      <div className="my-3 text-base text-gray-800">
        AppChatbot hỗ trợ các trường đại học và trung tâm giáo dục tự động hóa
        hoạt động tuyển sinh, <br />
        từ tư vấn, quản lý đội ngũ, thống kê báo cáo đến giao tiếp cá nhân hóa
        với thí sinh.
      </div>
      <div className="mt-4 flex gap-10">
        <div className="flex w-2/5 flex-col items-start gap-5">
          <Accordion
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys as Set<string>)[0];
              setSelectKey(selectedKey?.toString() || "0");
            }}
            selectedKeys={[selectKey]}
            variant="light"
          >
            {listAccordion.map((item, index) => {
              const isActive = selectKey === item.value;
              return (
                <AccordionItem
                  classNames={{
                    base: "bg-transparent border-none",
                    content: "pl-9 text-start pt-0 text-gray-500",
                    title: cn("text-[16px] font-semibold", {
                      "text-primary": isActive,
                    }),
                  }}
                  key={index}
                  title={
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {item.title}
                    </div>
                  }
                >
                  {item.content}
                </AccordionItem>
              );
            })}
          </Accordion>
          <Button color="primary" size="lg">
            Dùng thử miễn phí
          </Button>
        </div>
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.video
              key={videoActive}
              variants={fadeAnimationVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5 }}
              muted
              className="size-full rounded-3xl object-cover"
              src={videoActive}
              autoPlay
              loop
            />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
