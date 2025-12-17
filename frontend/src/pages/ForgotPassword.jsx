import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/forgotpassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" }); // success | error
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const emailTrimmed = useMemo(() => email.trim(), [email]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!emailTrimmed) return;

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch("http://localhost:5161/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrimmed }),
      });

      if (!res.ok) throw new Error();

      setStatus({
        type: "success",
        message:
          "Se o e-mail existir, enviaremos um link de redefinição. Verifique também sua caixa de spam.",
      });
    } catch {
      setStatus({
        type: "error",
        message: "Não foi possível solicitar a recuperação. Tente novamente em instantes.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="forgot-page">
      <div className="forgot-shell">
        <section className="forgot-card" aria-label="Recuperação de senha">
          <img
            src="/img/logo.png"
            className="forgot-logo"
            alt="Stargram"
            draggable="false"
          />

          <h1 className="forgot-title">Esqueceu sua senha?</h1>
          <p className="forgot-subtitle">
            Informe seu e-mail para receber um link de redefinição.
          </p>

          <form className="forgot-form" onSubmit={handleSubmit}>
            <label className="forgot-label" htmlFor="email">
              E-mail
            </label>

            <div className="forgot-inputWrap">
              <span className="forgot-inputIcon" aria-hidden="true">
                ✉
              </span>

              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <button
              className="forgot-btn"
              type="submit"
              disabled={loading || !emailTrimmed}
            >
              {loading ? (
                <span className="forgot-btnLoading">
                  <span className="forgot-spinner" aria-hidden="true" />
                  Enviando...
                </span>
              ) : (
                "Enviar link"
              )}
            </button>
          </form>

          {status.message && (
            <div className={`forgot-status ${status.type}`} role="status">
              {status.message}
            </div>
          )}

          <div className="forgot-divider">
            <span />
            <small>ou</small>
            <span />
          </div>

          <button
            type="button"
            className="forgot-linkBtn"
            onClick={() => navigate("/login")}
          >
            Voltar para o login
          </button>
        </section>
      </div>
    </main>
  );
}
