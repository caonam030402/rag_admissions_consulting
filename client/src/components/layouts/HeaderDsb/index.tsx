import { Navbar, NavbarBrand, NavbarContent } from "@heroui/react";

import UserSetting from "@/components/business/UserSetting";
import { userService } from "@/services/user";
import { renderFullName } from "@/utils/helpers";

export default function HeaderDsh() {
  const {user} = userService.useProfile()
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
        {/* <HumanHandoffNotification /> */}
        <UserSetting
          onlyAvatar={false}
          info={{
            email: user?.email,
            name: renderFullName(user?.firstName, user?.lastName),
            avatar: user?.avatar,
          }}
        />
      </NavbarContent>
    </Navbar>
  );
}
