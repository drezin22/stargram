import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      navigate("/login");
      return;
    }

    loginWithToken(token)
      .then(() => navigate("/feed"))
      .catch(() => navigate("/login"));
  }, [navigate, loginWithToken]);

  return <p>Entrando com o Google…</p>;
}
