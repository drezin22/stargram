import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/resetpassword.css";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();

  const [senha, setSenha] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (senha !== confirm) {
      setStatus({ type: "error", message: "As senhas não conferem." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5161/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: senha }),
      });

      const txt = await res.text();
      if (!res.ok) throw new Error(txt);

      navigate("/login");
    } catch {
      setStatus({ type: "error", message: "Token inválido ou expirado." });
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <main className="reset-page">
        <section className="reset-card">
          <p className="reset-invalid">Token inválido.</p>
          <button className="reset-linkBtn" onClick={() => navigate("/login")}>
            Voltar para o login
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="reset-page">
      <section className="reset-card">
        <img
          src="/img/logo.png"
          className="reset-logo"
          alt="Stargram"
          draggable="false"
        />

        <h1 className="reset-title">Nova senha</h1>
        <p className="reset-subtitle">
          Crie uma nova senha para sua conta.
        </p>

        <form className="reset-form" onSubmit={handleSubmit}>
          <label className="reset-label">Nova senha</label>
          <input
            type="password"
            placeholder="Nova senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            disabled={loading}
            required
          />

          <label className="reset-label">Confirmar senha</label>
          <input
            type="password"
            placeholder="Confirmar senha"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={loading}
            required
          />

          <button className="reset-btn" type="submit" disabled={loading}>
            {loading ? (
              <span className="reset-btnLoading">
                <span className="reset-spinner" />
                Salvando...
              </span>
            ) : (
              "Redefinir senha"
            )}
          </button>
        </form>

        {status.message && (
          <div className={`reset-status ${status.type}`}>
            {status.message}
          </div>
        )}
      </section>
    </main>
  );
}
