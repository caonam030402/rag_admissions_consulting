import { Input } from "@heroui/input";
import React from "react";
import toast from "react-hot-toast";

import Button from "@/components/common/Button";
import { InfiniteMovingCards } from "@/components/common/InfiniteMoving";
import { ENameLocalS } from "@/constants";
import useNavigate from "@/hooks/navigate";
import { setLocalStorage } from "@/utils/clientStorage";

const images = [
  "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c3R1ZGVudHN8ZW58MHx8MHx8fDA%3D",
  "https://plus.unsplash.com/premium_photo-1679547202572-bb3a34c54130?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c3R1ZGVudHN8ZW58MHx8MHx8fDA%3D",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8c3R1ZGVudHN8ZW58MHx8MHx8fDA%3D",
  "https://images.unsplash.com/photo-1549057446-9f5c6ac91a04?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHN0dWRlbnRzfGVufDB8fDB8fHww",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHN0dWRlbnRzfGVufDB8fDB8fHww",
  "https://plus.unsplash.com/premium_photo-1683887034146-c79058dbdcb1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHN0dWRlbnRzfGVufDB8fDB8fHww",
];

export default function Introduce() {
  const emailRef = React.useRef<HTMLInputElement>(null);
  const { navigate } = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    const email = emailRef.current?.value;

    if (!email || email.trim() === "") {
      toast.error("Vui lòng nhập email để tiếp tục");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Vui lòng nhập đúng định dạng email");
      return;
    }

    setLocalStorage({
      key: ENameLocalS.EMAIL,
      value: email,
    });

    navigate({ customUrl: "/chat-bot" });

    toast.success("Email đã được gửi thành công");
    setLoading(false);
  };

  return (
    <div className="relative flex h-auto w-full flex-col items-center bg-black">
      <div className="flex w-full flex-col gap-3 py-4 opacity-30">
        <InfiniteMovingCards
          pauseOnHover={false}
          items={images}
          direction="right"
          speed="slow"
        />
        <InfiniteMovingCards
          pauseOnHover={false}
          items={images}
          direction="left"
          speed="slow"
        />
        <InfiniteMovingCards
          pauseOnHover={false}
          items={images}
          direction="right"
          speed="slow"
        />
      </div>

      <div className="absolute flex size-full items-center justify-center">
        <form onSubmit={handleSubmit} className="text-center">
          <p className="mb-2 text-6xl font-bold text-white">
            Trợ lý tuyển sinh <span className="text-primary">DAD</span>
          </p>
          <p className="mx-auto w-3/5 py-3 text-white">
            là nền tảng hỗ trợ tư vấn và giải đáp thông tin tuyển sinh nhanh chóng, chính xác cho thí sinh và phụ huynh, giúp kết nối hiệu quả giữa nhà trường và người học
          </p>
          <Input
            ref={emailRef}
            classNames={{
              inputWrapper: "pr-1",
            }}
            placeholder="Vui lòng nhập email để tiếp tục chat"
            size="lg"
            className="mx-auto mt-4 w-3/5"
            endContent={
              <Button isLoading={loading} type="submit" color="primary">
                Chat ngay
              </Button>
            }
          />
        </form>
      </div>
    </div>
  );
}
