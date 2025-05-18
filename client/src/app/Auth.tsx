import { useAuth } from "@bisham/react-jwt-auth";
import { paths, UrlParams } from "@libs/Routing";
import { useEffect } from "react";
import { useParams, Navigate } from "react-router";

export function Auth() {
  const { token } = useParams<UrlParams<"auth">>();
  const { signIn } = useAuth();

  useEffect(() => {
    if (token) {
      signIn(token);
    }
  }, [signIn, token]);

  return <Navigate to={paths.home.getUrl()} replace={true} />;
}
