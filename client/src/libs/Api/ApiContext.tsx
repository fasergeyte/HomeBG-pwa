import { jwtDecode } from "jwt-decode";

import { configure } from "axios-hooks";
import Axios from "axios";
import { AuthProvider } from "@bisham/react-jwt-auth";
import { PropsWithChildren } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const axios = Axios.create({
  baseURL: import.meta.env.API_URL,
});

configure({ axios });

export function ApiProvider({ children }: PropsWithChildren) {
  return (
    <AuthProvider
      axiosInstance={axios}
      defaultValue={{
        accessToken: localStorage.getItem("accessToken") ?? undefined,
      }}
      getAccessToken={async () => {
        return {
          accessToken: localStorage.getItem("accessToken") ?? undefined,
        };
      }}
      onSignOut={() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userName");
      }}
      onSignIn={(token) => {
        const parsed = jwtDecode<{ name: string }>(token);
        localStorage.setItem("userName", parsed.name);
        localStorage.setItem("accessToken", token);
      }}
    >
      {children}
    </AuthProvider>
  );
}
