import Image from "next/image";

interface IProps {
  isOnlyIcon?: boolean;
  size?: "small" | "medium" | "large";
}

export default function Logo({ isOnlyIcon = false, size = "small" }: IProps) {
  const sizeClass =
    size === "small" ? "size-8" : size === "medium" ? "size-10" : "size-12";
  return (
    <div className="flex gap-2">
      <Image
        src="/assets/images/logo.png"
        alt="logo"
        width={500}
        height={500}
        className={sizeClass}
      />
      {!isOnlyIcon && <div className="text-xl font-bold">ChatBot IUH</div>}
    </div>
  );
}
