// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import AuthCallback from "./pages/AuthCallback"; // ⭐ nova página
import { LanguageProvider } from "./i18n";
import { AuthProvider, useAuth } from "./auth/AuthContext";

function PrivateRoute({ children }) {
  const { logged, loading } = useAuth();
  if (loading) return null; // aqui você pode colocar um spinner se quiser
  return logged ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Login padrão */}
            <Route path="/" element={<Login />} />

            {/* Callback do Google -> NÃO precisa estar logado */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Feed protegido */}
            <Route
              path="/feed"
              element={
                <PrivateRoute>
                  <Feed />
                </PrivateRoute>
              }
            />

            {/* Qualquer rota desconhecida cai pro login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
