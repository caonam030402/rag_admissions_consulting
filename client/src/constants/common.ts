export const PATH = {
  HOME: "/",
  LOGIN: "/admin/login",
  MANAGER: "/admin/manager",
  CHATBOT: "/chat-bot",
};

export const PUBLIC_PAGES = [PATH.LOGIN, PATH.MANAGER, PATH.CHATBOT, PATH.HOME];

export enum ENameCookie {
  ACCESS_TOKEN = "_next-auth.htshs",
}

export enum ENameLocalS {
  PROFILE = "_next-wq.pf",
  EMAIL = "_next-wq.em",
}
