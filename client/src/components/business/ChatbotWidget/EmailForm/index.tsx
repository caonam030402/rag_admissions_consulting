import { CaretDown } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";

import Button from "@/components/common/Button";
import { ENameLocalS } from "@/constants";
import { ActorType } from "@/enums/systemChat";
import useChatBot from "@/hooks/features/chatbot/useChatBot";

import type { IEmailFormData } from "../types";

interface IProps {
  showEmailForm: boolean;
  setShowEmailForm: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function EmailForm({ showEmailForm, setShowEmailForm }: IProps) {
  const { sendMessage } = useChatBot();
  const [emailData, setEmailData] = useState<IEmailFormData>({
    email: "",
    agreed: false,
  });

  const handleEmailSubmit = () => {
    if (emailData.email && emailData.agreed) {
      setShowEmailForm(false);
      localStorage.setItem(ENameLocalS.EMAIL, emailData.email);
      sendMessage({
        newMessage: "Hello, how can I help you? 😊",
        role: ActorType.Bot,
      });
    }
  };

  return (
    <div className="">
      <AnimatePresence>
        {showEmailForm && (
          <div className="size-full bg-primary">
            <motion.div
              className="absolute bottom-0 z-10 size-full bg-black/15"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Email Form Content */}
              <div className="absolute bottom-0 rounded-t-3xl bg-white p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-base font-semibold text-gray-800">
                        Vui lòng để lại email
                      </h4>
                      <Button
                        onPress={() => {
                          setShowEmailForm(false);
                        }}
                        variant="light"
                        size="xxs"
                        isIconOnly
                      >
                        <CaretDown size={20} />
                      </Button>
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
                        <span className="text-green-500">✓</span>
                        <input
                          type="email"
                          placeholder="Enter your email..."
                          value={emailData.email}
                          onChange={(e) =>
                            setEmailData({
                              ...emailData,
                              email: e.target.value,
                            })
                          }
                          className="flex-1 text-sm outline-none placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label
                      htmlFor="gdpr-checkbox"
                      className="flex items-start gap-3 text-sm text-gray-600"
                    >
                      <input
                        id="gdpr-checkbox"
                        type="checkbox"
                        checked={emailData.agreed}
                        onChange={(e) =>
                          setEmailData({
                            ...emailData,
                            agreed: e.target.checked,
                          })
                        }
                        className="mt-0.5 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs leading-relaxed">
                        Lưu ý: Email của bạn sẽ được lưu trữ và sử dụng để liên
                        hệ với bạn.
                      </span>
                    </label>
                  </div>

                  <Button
                    className="w-full bg-blue-500 py-3 font-semibold text-white"
                    onClick={handleEmailSubmit}
                    isDisabled={!emailData.email || !emailData.agreed}
                  >
                    Send
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
