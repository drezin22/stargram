import React, { useEffect, useMemo, useState } from "react";
import "../styles/login.css";
import { useI18n } from "../i18n";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { t, lang, setLang } = useI18n();
  const { login, register, logged } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [emailOrUser, setEmailOrUser] = useState("");
  const [userName, setUserName] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (logged) navigate("/feed", { replace: true });
  }, [logged, navigate]);

  const imagens = useMemo(() => ["/img/celular2.png", "/img/celular3.png"], []);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    imagens.forEach((src) => {
      const i = new Image();
      i.src = src;
    });
  }, [imagens]);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev === imagens.length - 1 ? 0 : prev + 1));
    }, 5200);
    return () => clearInterval(timer);
  }, [imagens.length]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login({ login: emailOrUser, password: senha });
        navigate("/feed");
      } else {
        if (senha !== confirmSenha) throw new Error("As senhas não conferem.");

        await register({
          email: emailOrUser,
          userName: userName || emailOrUser.split("@")[0],
          password: senha,
        });

        navigate("/feed");
      }
    } catch (err) {
      setStatus(err?.message || "Erro ao autenticar.");
    } finally {
      setLoading(false);
    }
  }

  function toggleMode(e) {
    e.preventDefault();
    setStatus("");
    setSenha("");
    setConfirmSenha("");
    setMode((m) => (m === "login" ? "signup" : "login"));
  }

  return (
    <>
      <main className="login-page">
        <div className="login-phone" aria-label="Mockup de celular">
          <div className="login-screen-slot">
            <img
              src={imagens[0]}
              alt="screen 1"
              className={`login-screen-img tela1 ${index === 0 ? "is-visible" : "is-hidden"}`}
              draggable="false"
            />
            <img
              src={imagens[1]}
              alt="screen 2"
              className={`login-screen-img tela2 ${index === 1 ? "is-visible" : "is-hidden"}`}
              draggable="false"
            />
          </div>
        </div>

        <div className="login-auth-column">
          <div className="login-card">
            <img
              src="/img/logo.png"
              className="login-logo"
              alt="Stargram"
              draggable="false"
            />

            <form onSubmit={handleSubmit}>
              <input
                value={emailOrUser}
                onChange={(e) => setEmailOrUser(e.target.value)}
                placeholder={mode === "login" ? t("placeholders_user") : "E-mail"}
                aria-label="Usuário ou e-mail"
                disabled={loading}
              />

              {mode === "signup" && (
                <input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Nome de usuário"
                  aria-label="Nome de usuário"
                  disabled={loading}
                />
              )}

              <input
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder={t("placeholders_pass")}
                type="password"
                aria-label="Senha"
                disabled={loading}
              />

              {mode === "signup" && (
                <input
                  value={confirmSenha}
                  onChange={(e) => setConfirmSenha(e.target.value)}
                  placeholder="Confirmar senha"
                  type="password"
                  aria-label="Confirmar senha"
                  disabled={loading}
                />
              )}

              <button type="submit" disabled={loading}>
                {loading
                  ? mode === "login"
                    ? "Entrando..."
                    : "Criando conta..."
                  : mode === "login"
                  ? t("btn_login")
                  : "Criar conta"}
              </button>
            </form>

            <a
              className="login-btn-google"
              href="http://localhost:5161/api/auth/google/login"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "http://localhost:5161/api/auth/google/login";
              }}
            >
              <span>Entrar com</span>
              <img
                className="login-google-icon"
                src="/img/logo-google.png"
                alt="Google"
                aria-hidden="true"
              />
            </a>

            {mode === "login" && (
              <a
                className="login-forgot"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/forgot-password");
                }}
              >
                {t("forgot")}
              </a>
            )}

            {status && <div className="login-status">{status}</div>}
          </div>

          <div className="login-cta">
            {mode === "login" ? (
              <p>
                {t("cta_question")}{" "}
                <a href="#" onClick={toggleMode}>
                  {t("cta_signup")}
                </a>
              </p>
            ) : (
              <p>
                Já tem uma conta?{" "}
                <a href="#" onClick={toggleMode}>
                  Entrar
                </a>
              </p>
            )}
          </div>
        </div>
      </main>

      <footer className="login-footer">
        <nav className="login-footer-links" aria-label="Links do rodapé">
          <a href="#">{t("footer.meta")}</a>
          <a href="#">{t("footer.about")}</a>
          <a href="#">{t("footer.blog")}</a>
          <a href="#">{t("footer.careers")}</a>
          <a href="#">{t("footer.help")}</a>
          <a href="#">{t("footer.api")}</a>
          <a href="#">{t("footer.privacy")}</a>
          <a href="#">{t("footer.terms")}</a>
          <a href="#">{t("footer.locations")}</a>
          <a href="#">{t("footer.lite")}</a>
          <a href="#">{t("footer.ai")}</a>
          <a href="#">{t("footer.articles")}</a>
          <a href="#">{t("footer.threads")}</a>
          <a href="#">{t("footer.upload")}</a>
          <a href="#">{t("footer.verified")}</a>
        </nav>

        <div className="login-footer-meta">
          <label className="login-lang">
            <select
              aria-label="Selecionar idioma"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              disabled={loading}
            >
              <option value="pt">Português (Brasil)</option>
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
            </select>
          </label>
          <span className="login-copy">{t("footer.copy")}</span>
        </div>
      </footer>
    </>
  );
}
