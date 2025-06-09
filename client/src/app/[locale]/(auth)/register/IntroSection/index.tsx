import React from "react";

import { FaCheck } from "@react-icons/all-files/fa/FaCheck";
import {
  Buildings,
  Calendar,
  CurrencyCircleDollar,
  FileText,
  GraduationCap,
  Robot,
} from "@phosphor-icons/react";

import Divider from "@/components/common/Divider";
import Logo from "@/components/common/Logo";

import { listContent, listIcons } from "../constant";

export default function IntroSection() {
  return (
    <div className="h-full w-1/2 bg-[url('https://lf-scm-us.feishucdn.com/larksuite/global_registration_web/static/image/left-bg.cc3d00d0.png')] bg-cover p-10 2xl:w-[30%]">
      <Logo />
      <div className="flex h-[90%] flex-col items-center justify-center p-6 text-center">
        
        <div className="mt-5 text-xl font-bold">
          <h1>Chào mừng đến với</h1>
          <h1>Hệ thống tư vấn tuyển sinh</h1>
        </div>
        <Divider className="my-10 h-[0.5px] bg-primary" />
        <div className="w-full text-left">
          <span className="font-bold text-primary">Miễn phí</span> tư vấn và{" "}
          <span className="font-bold text-primary">hỗ trợ</span>
          <div>
            {" "}
            Sẵn sàng hỗ trợ bạn mọi lúc – Không ràng buộc, không thủ tục rườm rà
          </div>
        </div>
        <div className="my-5 w-full space-y-4">
          {listContent.map((item, index) => (
            <div className="my-2 flex items-center gap-2" key={index}>
              <FaCheck className="text-green-500" />
              <div className="text-left">{item}</div>
            </div>
          ))}
        </div>
        <div className="flex w-full justify-between">
          {listIcons?.map((item, index) => {
            const getIcon = (iconName: string) => {
              switch (iconName) {
                case "GraduationCap":
                  return <GraduationCap size={40} style={{ color: item.color }} />;
                case "Buildings":
                  return <Buildings size={40} style={{ color: item.color }} />;
                case "FileText":
                  return <FileText size={40} style={{ color: item.color }} />;
                case "CurrencyCircleDollar":
                  return <CurrencyCircleDollar size={40} style={{ color: item.color }} />;
                case "Calendar":
                  return <Calendar size={40} style={{ color: item.color }} />;
                case "Robot":
                  return <Robot size={40} style={{ color: item.color }} />;
                default:
                  return <GraduationCap size={40} style={{ color: item.color }} />;
              }
            };

            return (
              <div className="my-2 flex flex-col items-center" key={index}>
                <div className="flex h-[50px] w-[50px] items-center justify-center">
                  {getIcon(item.icon)}
                </div>
                <div className="text-center text-xs mt-2">{item.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
