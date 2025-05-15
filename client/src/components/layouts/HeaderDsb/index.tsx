import { Navbar, NavbarBrand, NavbarContent } from "@heroui/react";

import UserSetting from "@/components/business/UserSetting";

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

export default function HeaderDsh() {
  return (
    <Navbar isBordered maxWidth="full">
      <NavbarBrand />
      <NavbarContent className="hidden gap-9 sm:flex" justify="start">
        {/* {listNav.map((nav) => {
          return (
            <Link
              className="text-[15px] font-medium text-gray-800"
              href={nav.link}
              key={nav.title}
            >
              {nav.title}
            </Link>
          );
        })} */}
      </NavbarContent>
      <NavbarContent justify="end">
        <UserSetting
          onlyAvatar={false}
          info={{
            email: "caonam030402@gmail.com",
            name: "caonam03042",
          }}
        />
      </NavbarContent>
    </Navbar>
  );
}
