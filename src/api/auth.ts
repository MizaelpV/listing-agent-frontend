import client from "./client";

export const authApi = {
  getLoginUrl: () => `${client.defaults.baseURL}/auth/login`,
};
