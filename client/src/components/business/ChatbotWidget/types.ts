import type { Dispatch, SetStateAction } from "react";

export interface IEmailFormData {
    email: string;
    agreed: boolean;
}

export type TabTypeChatbotWidget = "home" | "chat";

export interface IChatbotWidgetProps {
    onTabChange: (tab: TabTypeChatbotWidget) => void;
}

export interface IMainChatProps {
    checkEmailHasSaved: () => boolean;
    handleTabSwitch: (tab: TabTypeChatbotWidget) => void;
}

export interface IEmailFormProps {
    showEmailForm: boolean;
    setShowEmailForm: Dispatch<SetStateAction<boolean>>;
}
