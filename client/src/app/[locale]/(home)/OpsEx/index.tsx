import { Tab, Tabs } from "@heroui/react";
import { BiAnalyse } from "@react-icons/all-files/bi/BiAnalyse";
import { BiBorderOuter } from "@react-icons/all-files/bi/BiBorderOuter";
import { BiChat } from "@react-icons/all-files/bi/BiChat";
import { BiDevices } from "@react-icons/all-files/bi/BiDevices";
import { BiGift } from "@react-icons/all-files/bi/BiGift";
import { BiHomeSmile } from "@react-icons/all-files/bi/BiHomeSmile";
import { BiLineChart } from "@react-icons/all-files/bi/BiLineChart";
import { IoIosGlobe } from "@react-icons/all-files/io/IoIosGlobe";
import { RiMouseLine } from "@react-icons/all-files/ri/RiMouseLine";
import React from "react";

import Content from "./Content";

export const listTab = [
  {
    label: "Tất cả ngành học",
    value: "all",
    content: {
      subImage:
        "https://cdn.pixabay.com/photo/2024/06/28/18/47/laptop-8859951_1280.jpg",
      image:
        "https://framerusercontent.com/images/532NmGeE4Q8pzrDtAlUj61iAgE.png",
      list: [
        {
          icon: <IoIosGlobe size={25} />,
          content:
            "Tư vấn tuyển sinh đa ngôn ngữ, hỗ trợ thí sinh trong nước và quốc tế",
        },
        {
          icon: <BiDevices size={24} />,
          content: "Quản lý chiến dịch tuyển sinh mọi lúc, mọi nơi",
        },
        {
          icon: <BiAnalyse size={24} />,
          content:
            "Tự động hóa duyệt hồ sơ, gửi thông tin ngành học và cập nhật tiến độ",
        },
      ],
    },
  },
  {
    label: "Công nghệ thông tin",
    value: "it",
    content: {
      subImage:
        "https://framerusercontent.com/images/0sqX5PjLupfj5dti6Bm5oIjnbmE.png?scale-down-to=512",
      image:
        "https://framerusercontent.com/images/dCu3eWiYtmMDXlMYO4K2lkYrUA.png?scale-down-to=512",
      list: [
        {
          icon: <IoIosGlobe size={25} />,
          content:
            "Hỗ trợ tư vấn ngành IT với hệ thống gợi ý tự động và phân tích sở thích",
        },
        {
          icon: <RiMouseLine size={24} />,
          content: "Thống kê lượng quan tâm và phân tích xu hướng chọn ngành",
        },
        {
          icon: <BiBorderOuter size={24} />,
          content:
            "Tích hợp nhiều nền tảng: chatbot, video call, live chat và tài liệu ngành học",
        },
      ],
    },
  },
  {
    label: "Khối Kinh tế",
    value: "business",
    content: {
      subImage:
        "https://framerusercontent.com/images/GSs5sT9MFj9f5MOUpZufYHXFcnU.png?scale-down-to=512",
      image:
        "https://framerusercontent.com/images/EmUAB9ANiRyy4eNyIwNcZAn68.png?scale-down-to=512",
      list: [
        {
          icon: <BiChat size={24} />,
          content:
            "Tăng hiệu quả tư vấn tuyển sinh khối Kinh tế với chatbot theo thời gian thực",
        },
        {
          icon: <BiHomeSmile size={24} />,
          content:
            "Số hóa quy trình đăng ký ngành học, học bổng và hoạt động ngoại khóa",
        },
        {
          icon: <BiLineChart size={24} />,
          content:
            "Theo dõi lượt quan tâm và tỉ lệ chuyển đổi đăng ký từng ngành",
        },
      ],
    },
  },
  {
    label: "Du học & Liên kết quốc tế",
    value: "intl",
    content: {
      subImage:
        "https://framerusercontent.com/images/bdyS8waIsPzVit1fY6LAtHqNaBA.jpg",
      image:
        "https://framerusercontent.com/images/f4ueCeNewXNf0kS9TIiFy65b0.png?scale-down-to=512",
      list: [
        {
          icon: <BiChat size={24} />,
          content:
            "Hỗ trợ kết nối giữa học sinh và trung tâm tư vấn du học qua chat an toàn",
        },
        {
          icon: <BiHomeSmile size={24} />,
          content:
            "Tự động gửi checklist hồ sơ, lịch phỏng vấn và hướng dẫn visa",
        },
        {
          icon: <BiGift size={24} />,
          content:
            "Thiết lập quy trình xét học bổng, chương trình trao đổi, và ưu đãi học phí",
        },
      ],
    },
  },
];

export default function OpsEx() {
  return (
    <div className="container mx-auto my-16 w-full text-center">
      <div className="text-3xl font-semibold">
        Lập kế hoạch, kết nối, hỗ trợ và theo dõi
      </div>
      <p className="mt-4 text-base text-gray-500">
        AppChatbot giúp các trường học và trung tâm đào tạo nâng cao hiệu quả
        tuyển sinh bằng cách cung cấp công cụ tư vấn tự động, quản lý quy trình
        đăng ký và phân tích dữ liệu hành vi thí sinh một cách toàn diện.
      </p>
      <Tabs color="primary" aria-label="Tabs sizes" className="mt-7" size="lg">
        {listTab.map((tab) => (
          <Tab key={tab.value} title={tab.label}>
            <Content tab={tab} />
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}
