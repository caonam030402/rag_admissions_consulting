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
    title: "Product",
    link: "/",
  },
  {
    title: "Solutions",
    link: "/",
  },
  {
    title: "Blog",
    link: "/",
  },
  {
    title: "Trust",
    link: "/",
  },
  {
    title: "Pricing",
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
      <NavbarContent className="hidden gap-9 sm:flex" justify="start">
        {listNav.map((nav) => {
          return (
            <Link
              className="text-[15px] font-medium text-gray-800"
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
          Sign Up
        </Button>
      </NavbarContent>
    </Navbar>
  );
}
