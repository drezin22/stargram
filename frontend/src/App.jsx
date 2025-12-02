import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import { LanguageProvider } from "./i18n";
import { AuthProvider, useAuth } from "./auth/AuthContext";

function PrivateRoute({ children }) {
  const { logged, loading } = useAuth();
  if (loading) return null; // ou spinner
  return logged ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/feed"
              element={
                <PrivateRoute>
                  <Feed />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
