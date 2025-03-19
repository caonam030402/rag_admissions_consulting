export const PATH = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  WORKPLACE: "/workplace",
  MESSENGER: "/workplace/messenger",
  GET_STARTED: "/get-started",
  INVITE_WORKSPACE: "/get-started/invite-workspace",
  VERIFY: "/verify",
  FORGOT_PASSWORD: "/forgot-password",
  BASE_DOC: "/workplace/base/doc",
  BASE_HOME: "/workplace/base/home",
};

export const PUBLIC_PAGES = [
  PATH.LOGIN,
  PATH.REGISTER,
  PATH.HOME,
  PATH.WORKPLACE,
  PATH.MESSENGER,
  PATH.GET_STARTED,
  PATH.HOME,
  PATH.INVITE_WORKSPACE,
];

export enum ENameCookie {
  ACCESS_TOKEN = "_next-auth.htshs",
}

