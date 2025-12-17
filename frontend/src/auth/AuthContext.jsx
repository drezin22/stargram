import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);
const API_URL = "http://localhost:5161";

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function buildUserFromClaims(claims) {
  if (!claims) return null;

  const id =
    claims.sub ||
    claims.nameid ||
    claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

  const userName =
    claims.userName ||
    claims.unique_name ||
    claims.name ||
    claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];

  const email =
    claims.email ||
    claims.upn ||
    claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];

  const avatarUrl = claims.avatarUrl || claims.picture || null;

  return {
    id: id ? Number(id) : id,
    userName,
    email,
    avatarUrl,
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("stargram_token") || "");
  const [user, setUser] = useState(null);

  const logged = !!token;

  // persiste token
  useEffect(() => {
    if (token) localStorage.setItem("stargram_token", token);
    else localStorage.removeItem("stargram_token");
  }, [token]);

  // monta user a partir do token
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    const claims = parseJwt(token);
    const u = buildUserFromClaims(claims);
    setUser(u);
  }, [token]);

  async function login({ login, password }) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Erro ao autenticar.");
    }

    const data = await res.json();
    setToken(data.token);
    return data;
  }

  async function register({ email, userName, password }) {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, userName, password }),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Erro ao cadastrar.");
    }

    const data = await res.json();
    if (data?.token) setToken(data.token);
    return data;
  }

  async function loginWithToken(jwt) {
    setToken(jwt);
    return true;
  }

  function logout() {
    setToken("");
    setUser(null);
    localStorage.removeItem("stargram_token"); // ✅ garante limpeza
  }

  const value = useMemo(
    () => ({ token, user, logged, login, register, loginWithToken, logout }),
    [token, user, logged]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
