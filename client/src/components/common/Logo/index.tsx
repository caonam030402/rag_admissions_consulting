import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex gap-2">
      <Image
        src="/assets/images/logo.png"
        alt="logo"
        width={500}
        height={500}
        className="size-8"
      />
      <div className="text-xl font-bold">ChatBot IUH</div>
    </div>
  );
}
