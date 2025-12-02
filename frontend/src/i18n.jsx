/* ./i18n.jsx */
/* eslint react-refresh/only-export-components: off */

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";

const LANG_STORAGE_KEY = "lang";

const translations = {
  pt: {
    brand: "Stargram",
    placeholders_user: "E-mail",
    placeholders_pass: "Senha",
    placeholders_pass_confirm: "Confirmar senha",
    btn_login: "Entrar",
    btn_signup: "Criar conta",
    btn_login_loading: "Entrando...",
    btn_signup_loading: "Criando conta...",
    login_google: "Entrar com Google",
    forgot: "Esqueceu a senha?",
    cta_question: "Não tem uma conta?",
    cta_signup: "Cadastre-se",
    cta_have_account: "Já tem uma conta?",
    msg_login_demo: "Login de exemplo (backend ainda não ligado).",
    msg_signup_demo: "Cadastro de exemplo (backend ainda não ligado).",
    footer: {
      meta: "Meta",
      about: "Sobre",
      blog: "Blog",
      careers: "Carreiras",
      help: "Ajuda",
      api: "API",
      privacy: "Privacidade",
      terms: "Termos",
      locations: "Localizações",
      lite: "Stargram Lite",
      ai: "IA Stargram",
      articles: "Artigos",
      threads: "Threads",
      upload: "Upload de contatos",
      verified: "Verificado",
      copy: "© 2025 Stargram",
    },
  },

  en: {
    brand: "Stargram",
    placeholders_user: "Email",
    placeholders_pass: "Password",
    placeholders_pass_confirm: "Confirm password",
    btn_login: "Log in",
    btn_signup: "Sign up",
    btn_login_loading: "Logging in...",
    btn_signup_loading: "Creating account...",
    login_google: "Sign in with Google",
    forgot: "Forgot password?",
    cta_question: "Don’t have an account?",
    cta_signup: "Sign up",
    cta_have_account: "Already have an account?",
    msg_login_demo: "Demo login (backend not connected yet).",
    msg_signup_demo: "Demo signup (backend not connected yet).",
    footer: {
      meta: "Meta",
      about: "About",
      blog: "Blog",
      careers: "Careers",
      help: "Help",
      api: "API",
      privacy: "Privacy",
      terms: "Terms",
      locations: "Locations",
      lite: "Stargram Lite",
      ai: "Stargram AI",
      articles: "Articles",
      threads: "Threads",
      upload: "Upload contacts",
      verified: "Verified",
      copy: "© 2025 Stargram",
    },
  },

  es: {
    brand: "Stargram",
    placeholders_user: "Correo electrónico",
    placeholders_pass: "Contraseña",
    placeholders_pass_confirm: "Confirmar contraseña",
    btn_login: "Iniciar sesión",
    btn_signup: "Crear cuenta",
    btn_login_loading: "Iniciando sesión...",
    btn_signup_loading: "Creando cuenta...",
    login_google: "Entrar con Google",
    forgot: "¿Olvidaste tu contraseña?",
    cta_question: "¿No tienes una cuenta?",
    cta_signup: "Regístrate",
    cta_have_account: "¿Ya tienes una cuenta?",
    msg_login_demo: "Inicio de sesión de ejemplo (backend aún no conectado).",
    msg_signup_demo: "Registro de ejemplo (backend aún não conectado).",
    footer: {
      meta: "Meta",
      about: "Acerca de",
      blog: "Blog",
      careers: "Carreras",
      help: "Ayuda",
      api: "API",
      privacy: "Privacidad",
      terms: "Términos",
      locations: "Ubicaciones",
      lite: "Stargram Lite",
      ai: "IA Stargram",
      articles: "Artículos",
      threads: "Threads",
      upload: "Subida de contactos",
      verified: "Verificado",
      copy: "© 2025 Stargram",
    },
  },

  fr: {
    brand: "Stargram",
    placeholders_user: "E-mail",
    placeholders_pass: "Mot de passe",
    placeholders_pass_confirm: "Confirmer le mot de passe",
    btn_login: "Se connecter",
    btn_signup: "Créer un compte",
    btn_login_loading: "Connexion...",
    btn_signup_loading: "Création du compte...",
    login_google: "Se connecter avec Google",
    forgot: "Mot de passe oublié ?",
    cta_question: "Vous n’avez pas de compte ?",
    cta_signup: "Inscrivez-vous",
    cta_have_account: "Vous avez déjà un compte ?",
    msg_login_demo: "Connexion de démonstration (backend non connecté).",
    msg_signup_demo: "Inscription de démonstration (backend non connecté).",
    footer: {
      meta: "Meta",
      about: "À propos",
      blog: "Blog",
      careers: "Carrières",
      help: "Aide",
      api: "API",
      privacy: "Confidentialité",
      terms: "Conditions",
      locations: "Lieux",
      lite: "Stargram Lite",
      ai: "IA Stargram",
      articles: "Articles",
      threads: "Threads",
      upload: "Importer des contacts",
      verified: "Vérifié",
      copy: "© 2025 Stargram",
    },
  },

  de: {
    brand: "Stargram",
    placeholders_user: "E-Mail",
    placeholders_pass: "Passwort",
    placeholders_pass_confirm: "Passwort bestätigen",
    btn_login: "Anmelden",
    btn_signup: "Konto erstellen",
    btn_login_loading: "Anmeldung...",
    btn_signup_loading: "Konto wird erstellt...",
    login_google: "Mit Google anmelden",
    forgot: "Passwort vergessen?",
    cta_question: "Du hast kein Konto?",
    cta_signup: "Registrieren",
    cta_have_account: "Du hast bereits ein Konto?",
    msg_login_demo: "Demo-Anmeldung (Backend noch nicht verbunden).",
    msg_signup_demo: "Demo-Registrierung (Backend noch nicht verbunden).",
    footer: {
      meta: "Meta",
      about: "Über uns",
      blog: "Blog",
      careers: "Karriere",
      help: "Hilfe",
      api: "API",
      privacy: "Datenschutz",
      terms: "Nutzungsbedingungen",
      locations: "Standorte",
      lite: "Stargram Lite",
      ai: "Stargram KI",
      articles: "Artikel",
      threads: "Threads",
      upload: "Kontakte hochladen",
      verified: "Verifiziert",
      copy: "© 2025 Stargram",
    },
  },

  it: {
    brand: "Stargram",
    placeholders_user: "E-mail",
    placeholders_pass: "Password",
    placeholders_pass_confirm: "Conferma password",
    btn_login: "Accedi",
    btn_signup: "Crea account",
    btn_login_loading: "Accesso in corso...",
    btn_signup_loading: "Creazione account...",
    login_google: "Accedi con Google",
    forgot: "Hai dimenticato la password?",
    cta_question: "Non hai un account?",
    cta_signup: "Registrati",
    cta_have_account: "Hai già un account?",
    msg_login_demo: "Accesso di esempio (backend non ancora collegato).",
    msg_signup_demo: "Registrazione di esempio (backend non ancora collegato).",
    footer: {
      meta: "Meta",
      about: "Informazioni",
      blog: "Blog",
      careers: "Carriere",
      help: "Aiuto",
      api: "API",
      privacy: "Privacy",
      terms: "Termini",
      locations: "Sedi",
      lite: "Stargram Lite",
      ai: "IA Stargram",
      articles: "Articoli",
      threads: "Threads",
      upload: "Carica contatti",
      verified: "Verificato",
      copy: "© 2025 Stargram",
    },
  },
};

const I18nContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return saved || "pt";
  });

  useEffect(() => {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  }, [lang]);

  const t = useMemo(() => {
    const table = translations[lang] || translations.pt;
    return (key) => {
      const parts = key.split(".");
      let cur = table;
      for (const p of parts) {
        cur = cur?.[p];
        if (cur === undefined) break;
      }
      if (cur === undefined) {
        const def = translations.pt;
        let curDef = def;
        for (const p of parts) {
          curDef = curDef?.[p];
          if (curDef === undefined) break;
        }
        return curDef ?? key;
      }
      return cur;
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <LanguageProvider />");
  return ctx;
}
