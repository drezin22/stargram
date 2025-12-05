// frontend/src/pages/AuthCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth(); // vamos adicionar isso no AuthContext

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // Faz o login a partir de um token já pronto (Google)
    loginWithToken(token)
      .then(() => {
        navigate("/feed");
      })
      .catch((err) => {
        console.error(err);
        navigate("/login");
      });
  }, [loginWithToken, navigate]);

  return (
    <div
      style={{
        color: "#fff",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
      }}
    >
      Entrando com o Google…
    </div>
  );
}