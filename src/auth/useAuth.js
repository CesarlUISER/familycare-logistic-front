import React from "react";
import client from "../api/client";

export function useAuth() {
  const [token, setToken] = React.useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  });
  const [loading, setLoading] = React.useState(false);

  const isAuthenticated = Boolean(token);

  // Al cargar, si hay token, valida sesión con /auth/me
  React.useEffect(() => {
    async function bootstrap() {
      const tk = localStorage.getItem("token");
      if (!tk) return;
      try {
        const { data } = await client.get("/auth/me");
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch {
        // token inválido
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken("");
        setUser(null);
      }
    }
    bootstrap();
  }, []);

  async function login({ email, password }) {
    setLoading(true);
    try {
      const { data } = await client.post("/auth/login", { email, password }); // { token, user }
      if (!data?.token) throw new Error("Respuesta inválida del servidor");

      localStorage.setItem("token", data.token);
      setToken(data.token);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      }

      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: err?.response?.data?.message || err.message || "Error al iniciar sesión",
      };
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
  }

  return { isAuthenticated, token, user, loading, login, logout };
}
