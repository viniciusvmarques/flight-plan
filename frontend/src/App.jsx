import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import CancellationPolicy from "./pages/CancellationPolicy";
import Profile from "./pages/Profile";
import Billing from "./pages/Billing";
import Exams from "./pages/Exams";

import RequireAuth from "./auth/RequireAuth";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cancellation-policy" element={<CancellationPolicy />} />
            <Route
                path="/simulados"
                element={
                    <RequireAuth>
                        <Exams />
                    </RequireAuth>
                }
            />

            <Route path="/account" element={<Navigate to="/perfil" replace />} />

            {/* Minha Conta */}
            <Route
                path="/profile"
                element={
                    <RequireAuth>
                        <Profile />
                    </RequireAuth>
                }
            />

            {/* compat: rota antiga em PT */}
            <Route
                path="/perfil"
                element={
                    <RequireAuth>
                        <Profile />
                    </RequireAuth>
                }
            />

            {/* Assinatura */}
            <Route
                path="/assinatura"
                element={
                    <RequireAuth>
                        <Billing />
                    </RequireAuth>
                }
            />

            {/* compat: rotas antigas */}
            <Route path="/subscription" element={<Navigate to="/assinatura" replace />} />
            <Route path="/billing" element={<Navigate to="/assinatura" replace />} />
            <Route path="/exams" element={<Navigate to="/simulados" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
