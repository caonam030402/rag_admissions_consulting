export const PATH = {
  HOME: "/",
  LOGIN_ADMIN: "/admin/login",
  LOGIN_USER: "/login",
  REGISTER_USER: "/register",
  MANAGER: "/admin/manager",
  CHATBOT: "/chat-bot",
  DATASET: "/admin/manager/data-source",
  CONFIGURATION: "/admin/manager/configuration",
  OVERVIEW: "/admin/manager/overview",
  ANALYTICS: "/admin/manager/analytics",
  VERIFY: "/verify",
  VERIFY_ADMIN: "/admin/verify",
  ACCOUNT_MANAGER: "/admin/manager/account-manager",
  HUMAN_SUPPORT: "/admin/manager/human-support",
};

export const PUBLIC_PAGES = [
  PATH.HOME,
  PATH.LOGIN_ADMIN,
  PATH.LOGIN_USER,
  PATH.REGISTER_USER,
  PATH.CHATBOT,
  PATH.VERIFY,
  PATH.VERIFY_ADMIN,
  // ❌ Admin routes removed from public pages - they should be protected!
  // PATH.MANAGER,
  // PATH.DATASET,
  // PATH.CONFIGURATION,
  // PATH.OVERVIEW,
  // PATH.ACCOUNT_MANAGER,
];

// Role-based route configurations
export const ROLE_ROUTES = {
  ADMIN_DEFAULT: PATH.OVERVIEW,
  USER_DEFAULT: PATH.CHATBOT,
  ADMIN_LOGIN: PATH.LOGIN_ADMIN,
  USER_LOGIN: PATH.LOGIN_USER,
};

export enum ENameCookie {
  ACCESS_TOKEN = "_next-auth.htshs",
}

export enum ENameLocalS {
  PROFILE = "_next-wq.pf",
  EMAIL = "_next-wq.em",
  USER_ID = "_next-wq.uid",
  GUEST_ID = "_next-wq.gid",
  CURRENT_CONVERSATION_ID = "_next-wq.ccid",
}

export const TRIGGER_CONTACT_CABINET = "Chat ngay cán bộ tư vấn?";
