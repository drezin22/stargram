/* eslint react-refresh/only-export-components: off */

// frontend/src/auth/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

// 📌 URL base da API – sem /api aqui
// Definida em frontend/.env.local como:
// VITE_API_URL=http://localhost:5161
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5161";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, userName, email }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega o auth salvo no localStorage ao iniciar
  useEffect(() => {
    const saved = localStorage.getItem("stargram_auth");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed.user);
        setToken(parsed.token);
      } catch {
        // JSON inválido → ignora
      }
    }
    setLoading(false);
  }, []);

  function persistAuth(nextUser, nextToken) {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(
      "stargram_auth",
      JSON.stringify({ user: nextUser, token: nextToken })
    );
  }

  // 📌 Cadastro
  async function register({ email, userName, password }) {
    const res = await fetch(`${API_BASE_URL}/api/Auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, userName, password }),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Erro ao cadastrar.");
    }

    const data = await res.json(); // { id, userName, email, token }
    persistAuth(
      { id: data.id, userName: data.userName, email: data.email },
      data.token
    );
  }

  // 📌 Login
  async function login({ login, password }) {
    const res = await fetch(`${API_BASE_URL}/api/Auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrUserName: login,
        password,
      }),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Usuário ou senha inválidos.");
    }

    const data = await res.json();
    persistAuth(
      { id: data.id, userName: data.userName, email: data.email },
      data.token
    );
  }

  // 📌 Logout
  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("stargram_auth");
  }

  const value = {
    user,
    token,
    loading,
    logged: !!user && !!token,
    login,
    register,
    logout,
    apiBaseUrl: API_BASE_URL,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuth deve ser usado dentro de <AuthProvider />");
  return ctx;
}
