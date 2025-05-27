import type { TourData } from "./types";

export const TOUR_DATA: TourData = {
  university: {
    name: "Đại học Quốc gia",
    description:
      "Một trong những đại học hàng đầu Việt Nam với cơ sở vật chất hiện đại và chất lượng đào tạo xuất sắc.",
    logo: "/images/university-logo.png",
  },
  locations: [
    {
      id: "lib-main",
      name: "Thư viện Trung tâm",
      description:
        "Thư viện hiện đại với hơn 200,000 đầu sách và tài liệu số, cùng hàng trăm chỗ ngồi học tập, khu vực thảo luận nhóm và phòng nghiên cứu.",
      type: "facility",
      coordinates: { x: 35, y: 40 },
      media: [
        {
          id: "lib-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          title: "Khu vực đọc chính",
          description:
            "Không gian yên tĩnh với ánh sáng tự nhiên và chỗ ngồi thoải mái.",
        },
        {
          id: "lib-2",
          type: "image",
          url: "https://images.unsplash.com/photo-1568667256549-094345857637?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          title: "Khu vực máy tính",
          description:
            "Trang bị hơn 50 máy tính hiện đại cho sinh viên nghiên cứu.",
        },
        {
          id: "lib-3",
          type: "video",
          url: "https://example.com/videos/library-tour.mp4",
          thumbnail:
            "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          title: "Tour thư viện",
          description: "Khám phá các không gian và dịch vụ của thư viện.",
        },
      ],
      facilities: [
        "Phòng đọc 24/7",
        "Khu vực thảo luận nhóm",
        "Máy in và photocopy",
        "Kho sách điện tử",
      ],
    },
    {
      id: "cs-building",
      name: "Tòa nhà Khoa học Máy tính",
      description:
        "Tòa nhà hiện đại với các phòng lab máy tính tiên tiến, phòng thực hành AI, phòng seminar và không gian làm việc cho sinh viên.",
      type: "academic",
      coordinates: { x: 60, y: 25 },
      media: [
        {
          id: "cs-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          title: "Phòng thí nghiệm máy tính",
          description:
            "Trang bị hơn 100 máy tính hiệu năng cao cho các môn học lập trình.",
        },
        {
          id: "cs-2",
          type: "360",
          url: "https://example.com/360/cs-lab.jpg",
          title: "Phòng lab AI",
          description: "Trải nghiệm 360 độ phòng thí nghiệm trí tuệ nhân tạo.",
        },
      ],
      majors: [
        {
          name: "Khoa học Máy tính",
          description:
            "Chương trình đào tạo toàn diện về lập trình, cấu trúc dữ liệu, thuật toán và kỹ thuật phần mềm.",
          highlightPoints: [
            "Cơ hội thực tập tại các công ty công nghệ hàng đầu",
            "Đội ngũ giảng viên có nhiều kinh nghiệm trong lĩnh vực",
            "Phòng lab hiện đại",
          ],
        },
        {
          name: "Trí tuệ Nhân tạo",
          description:
            "Chương trình chuyên sâu về machine learning, deep learning và các ứng dụng AI trong thực tế.",
          highlightPoints: [
            "Hợp tác với các dự án nghiên cứu quốc tế",
            "Máy chủ GPU hiệu năng cao",
            "Cơ hội tham gia các cuộc thi AI toàn cầu",
          ],
        },
        {
          name: "An ninh mạng",
          description:
            "Đào tạo về bảo mật hệ thống, mạng máy tính, mã hóa và phòng chống tấn công mạng.",
          highlightPoints: [
            "Phòng lab mô phỏng tấn công mạng",
            "Giảng viên có chứng chỉ bảo mật quốc tế",
            "Thực hành trên các hệ thống thực tế",
          ],
        },
      ],
      people: [
        {
          name: "TS. Nguyễn Văn A",
          role: "Trưởng khoa",
          quote:
            "Chúng tôi luôn đặt sinh viên vào trung tâm của mọi hoạt động đào tạo.",
          image: "/images/people/nguyen-van-a.jpg",
        },
      ],
    },
    {
      id: "business-school",
      name: "Trường Kinh tế & Quản trị",
      description:
        "Cơ sở đào tạo hiện đại với các phòng học thông minh, trung tâm mô phỏng kinh doanh và không gian làm việc nhóm sáng tạo.",
      type: "academic",
      coordinates: { x: 20, y: 60 },
      media: [
        {
          id: "bs-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          title: "Phòng học thông minh",
          description: "Trang bị bảng tương tác và hệ thống học tập hiện đại.",
        },
        {
          id: "bs-2",
          type: "video",
          url: "https://example.com/videos/business-event.mp4",
          thumbnail:
            "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          title: "Sự kiện giao lưu doanh nghiệp",
          description: "Sinh viên gặp gỡ các nhà tuyển dụng tiềm năng.",
        },
      ],
      majors: [
        {
          name: "Quản trị Kinh doanh",
          description:
            "Chương trình đào tạo toàn diện về quản lý, marketing, tài chính và chiến lược kinh doanh.",
          highlightPoints: [
            "Thực tập tại các công ty hàng đầu",
            "Chương trình trao đổi sinh viên quốc tế",
            "Các dự án thực tế với doanh nghiệp",
          ],
        },
        {
          name: "Tài chính - Ngân hàng",
          description:
            "Chương trình đào tạo về phân tích tài chính, đầu tư, quản lý rủi ro và hoạt động ngân hàng.",
          highlightPoints: [
            "Phòng lab mô phỏng thị trường chứng khoán",
            "Giảng viên có kinh nghiệm trong ngành",
            "Cơ hội thực tập tại các ngân hàng và công ty tài chính",
          ],
        },
      ],
    },
    {
      id: "dorm-a",
      name: "Khu Ký túc xá A",
      description:
        "Khu ký túc xá hiện đại với đầy đủ tiện nghi cho sinh viên, bao gồm phòng ở tiện nghi, khu vực sinh hoạt chung và các dịch vụ hỗ trợ.",
      type: "housing",
      coordinates: { x: 75, y: 70 },
      media: [
        {
          id: "dorm-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          title: "Phòng ở sinh viên",
          description:
            "Phòng ở tiêu chuẩn dành cho 4 sinh viên với đầy đủ tiện nghi.",
        },
        {
          id: "dorm-2",
          type: "image",
          url: "https://images.unsplash.com/photo-1543071220-6ee5bf71a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          title: "Khu vực sinh hoạt chung",
          description: "Không gian thư giãn và giao lưu cho sinh viên.",
        },
      ],
      facilities: [
        "Phòng tập gym",
        "Canteen",
        "Phòng giặt",
        "Phòng học chung 24/7",
        "WiFi tốc độ cao",
      ],
    },
    {
      id: "sports-center",
      name: "Trung tâm Thể thao",
      description:
        "Trung tâm thể thao đa năng với các sân bóng đá, bóng rổ, bể bơi và phòng tập đa chức năng.",
      type: "recreation",
      coordinates: { x: 45, y: 85 },
      media: [
        {
          id: "sports-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          title: "Sân bóng đá",
          description:
            "Sân bóng đá tiêu chuẩn với mặt cỏ nhân tạo chất lượng cao.",
        },
        {
          id: "sports-2",
          type: "image",
          url: "https://images.unsplash.com/photo-1522898467493-49726bf28798?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          title: "Bể bơi",
          description: "Bể bơi trong nhà 25m với 8 làn bơi.",
        },
      ],
    },
  ],
  guides: [
    {
      id: "guide-1",
      name: "Minh Anh",
      avatar: "/images/guides/minh-anh.jpg",
      role: "Sinh viên năm 3 ngành CNTT",
      personality: "Năng động, hài hước",
      voiceId: "vietnamese-female-1",
    },
    {
      id: "guide-2",
      name: "Thầy Hoàng",
      avatar: "/images/guides/thay-hoang.jpg",
      role: "Giảng viên Khoa Kinh tế",
      personality: "Chuyên nghiệp, tận tình",
      voiceId: "vietnamese-male-1",
    },
  ],
};
