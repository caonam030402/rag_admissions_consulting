import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/assets/images/logo.png"
      alt="logo"
      width={500}
      height={500}
      className="size-8"
    />
  );
}
