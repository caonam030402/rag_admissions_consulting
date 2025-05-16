export const PATH = {
  HOME: "/",
  LOGIN: "/admin/login",
  MANAGER: "/admin/manager",
  CHATBOT: "/chat-bot",
  DATASET: "/admin/manager/data-source",
  CONFIGURATION: "/admin/manager/configuration",
  OVERVIEW: "/admin/manager/overview",
  VERIFY: "/admin/verify",
  ACCOUNT_MANAGER: "/admin/manager/account-manager",
};

export const PUBLIC_PAGES = [
  PATH.LOGIN,
  PATH.MANAGER,
  PATH.CHATBOT,
  PATH.HOME,
  PATH.DATASET,
  PATH.CONFIGURATION,
  PATH.OVERVIEW,
  PATH.ACCOUNT_MANAGER,
];

export enum ENameCookie {
  ACCESS_TOKEN = "_next-auth.htshs",
}

export enum ENameLocalS {
  PROFILE = "_next-wq.pf",
  EMAIL = "_next-wq.em",
}
