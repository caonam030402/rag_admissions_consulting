import Image from "next/image";

interface IProps {
  isOnlyIcon?: boolean;
}

export default function Logo({ isOnlyIcon = false }: IProps) {
  return (
    <div className="flex gap-2">
      <Image
        src="/assets/images/logo.png"
        alt="logo"
        width={500}
        height={500}
        className="size-8"
      />
      {!isOnlyIcon && <div className="text-xl font-bold">ChatBot IUH</div>}
    </div>
  );
}
