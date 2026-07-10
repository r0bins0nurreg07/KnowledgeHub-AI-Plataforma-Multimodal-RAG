import { useEffect, useState } from "react";
import { Navigate, Outlet, useOutletContext } from "react-router-dom";
import { clearToken, getCurrentUser, getToken, type UserResponse } from "../api/client";
import Spinner from "./Spinner";

interface AuthContext {
  user: UserResponse;
}

export function useAuthUser() {
  return useOutletContext<AuthContext>();
}

export default function RequireAuth() {
  const [status, setStatus] = useState<"checking" | "authenticated" | "unauthenticated">("checking");
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setStatus("unauthenticated");
      return;
    }

    getCurrentUser(token)
      .then((currentUser) => {
        setUser(currentUser);
        setStatus("authenticated");
      })
      .catch(() => {
        clearToken();
        setStatus("unauthenticated");
      });
  }, []);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Spinner />
          Cargando...
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet context={{ user } satisfies AuthContext} />;
}
