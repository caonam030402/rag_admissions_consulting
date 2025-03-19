export const PATH = {
  HOME: "/",
  LOGIN: "/admin/login",
  MANAGER: "/admin/manager",
};

export const PUBLIC_PAGES = [PATH.LOGIN, PATH.MANAGER];

export enum ENameCookie {
  ACCESS_TOKEN = "_next-auth.htshs",
}

export enum ENameLocalS {
  PROFILE = "_next-wq.pf",
}