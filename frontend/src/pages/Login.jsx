// src/pages/Login.jsx
import React, { useEffect, useMemo, useState } from "react";
import "../styles/login.css";
import { useI18n } from "../I18n"; // importa o i18n

export default function Login() {
  const { t, lang, setLang } = useI18n(); // pega tradução + idioma

  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Telas do mock do celular
  const imagens = useMemo(
    () => ["/img/celular2.png", "/img/celular3.png"],
    []
  );
  const [index, setIndex] = useState(0);

  // preload para evitar flicker
  useEffect(() => {
    imagens.forEach((src) => {
      const i = new Image();
      i.src = src;
    });
  }, [imagens]);

  // cross-fade (~5.2s)
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev === imagens.length - 1 ? 0 : prev + 1));
    }, 5200);
    return () => clearInterval(timer);
  }, [imagens.length]);

  function handleSubmit(e) {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    // Por enquanto só simula…
    setTimeout(() => {
      if (mode === "login") {
        setStatus(t("msg_login_demo"));      // <-- traduzido
      } else {
        setStatus(t("msg_signup_demo"));     // <-- traduzido
      }
      setLoading(false);
    }, 600);
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
      <main className="content">
        {/* Mock do celular */}
        <div className="phone" aria-label="Mockup de celular">
          <div className="screen-slot">
            <img
              src={imagens[0]}
              alt="screen 1"
              className={`screen-img tela1 ${
                index === 0 ? "is-visible" : "is-hidden"
              }`}
              draggable="false"
            />
            <img
              src={imagens[1]}
              alt="screen 2"
              className={`screen-img tela2 ${
                index === 1 ? "is-visible" : "is-hidden"
              }`}
              draggable="false"
            />
          </div>
        </div>

        {/* Coluna de autenticação */}
        <div className="auth-column">
          <div className="container-formulario">
            <img
              src="/img/logo.png"
              className="logo"
              alt={t("brand")}
              draggable="false"
            />

            <form onSubmit={handleSubmit}>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("placeholders_user")}
                aria-label={t("placeholders_user")}
                disabled={loading}
              />
              <input
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder={t("placeholders_pass")}
                type="password"
                aria-label={t("placeholders_pass")}
                disabled={loading}
              />

              {mode === "signup" && (
                <input
                  value={confirmSenha}
                  onChange={(e) => setConfirmSenha(e.target.value)}
                  placeholder={t("placeholders_pass_confirm")}
                  type="password"
                  aria-label={t("placeholders_pass_confirm")}
                  disabled={loading}
                />
              )}

              <button type="submit" disabled={loading}>
                {loading
                  ? mode === "login"
                    ? t("btn_login_loading")
                    : t("btn_signup_loading")
                  : mode === "login"
                  ? t("btn_login")
                  : t("btn_signup")}
              </button>
            </form>

            <a
              className="login-google"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("Aqui depois vamos ligar o botão do Google 😉");
              }}
            >
              {t("login_google")}
            </a>

            {mode === "login" && (
              <a
                className="esqueceu-senha"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Depois ligamos o fluxo de 'Esqueceu a senha'.");
                }}
              >
                {t("forgot")}
              </a>
            )}

            {status && (
              <div
                style={{
                  textAlign: "center",
                  marginTop: 8,
                  fontSize: 12,
                  color: "#333",
                }}
              >
                {status}
              </div>
            )}
          </div>

          {/* CTA alternável */}
          <div className="cta-signup inline">
            {mode === "login" ? (
              <p>
                {t("cta_question")}{" "}
                <a href="#" onClick={toggleMode}>
                  {t("cta_signup")}
                </a>
              </p>
            ) : (
              <p>
                {t("cta_have_account")}{" "}
                <a href="#" onClick={toggleMode}>
                  {t("btn_login")}
                </a>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="site-footer">
        <nav className="footer-links" aria-label="Links do rodapé">
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

        <div className="footer-meta">
          <label className="lang">
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
          <span className="copy">{t("footer.copy")}</span>
        </div>
      </footer>
    </>
  );
}
