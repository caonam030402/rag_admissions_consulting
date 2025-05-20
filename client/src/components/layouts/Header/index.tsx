import {
  Button,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
} from "@heroui/react";

import Logo from "@/components/common/Logo";
import { PATH } from "@/constants/common";

const listNav = [
  {
    title: "Trang chủ",
    link: "/",
  },
  {
    title: "Tuyển sinh",
    link: "/",
  },
  {
    title: "Giới thiệu",
    link: "/",
  },
  {
    title: "Tin tức",
    link: "/",
  },
  {
    title: "Liên hệ",
    link: "/",
  },
];

export default function Header() {
  return (
    <Navbar maxWidth="xl">
      <NavbarBrand>
        <Link href={PATH.HOME}>
          <Logo />
        </Link>
      </NavbarBrand>
      <NavbarContent className="hidden gap-6 sm:flex" justify="start">
        {listNav.map((nav) => {
          return (
            <Link
              className="text-[14px] font-medium text-gray-800"
              href={nav.link}
              key={nav.title}
            >
              {nav.title}
            </Link>
          );
        })}
      </NavbarContent>
      <NavbarContent justify="end">
        <Button as={Link} color="primary">
          Liên hệ trực tiếp
        </Button>
      </NavbarContent>
    </Navbar>
  );
}
