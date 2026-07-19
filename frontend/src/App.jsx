import { Routes, Route, Navigate } from "react-router-dom";

import GoogleAnalyticsTracker from "./components/GoogleAnalyticsTracker";
import HomeEntry from "./pages/HomeEntry";
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
import Weather from "./pages/Weather";
import Tools from "./pages/Tools";
import FlightComputer from "./pages/FlightComputer";
import Quiz from "./pages/Quiz";
import SeoLanding from "./pages/SeoLanding";
import ExamResultShare from "./pages/ExamResultShare";
import ModeloLab from "./pages/ModeloLab";
import ModeloLabAPlus from "./pages/ModeloLabAPlus";
import ModeloLabB from "./pages/ModeloLabB";
import ModeloLabC from "./pages/ModeloLabC";
import ModeloLabD from "./pages/ModeloLabD";
import ModeloLabE from "./pages/ModeloLabE";
import ModeloLabF from "./pages/ModeloLabF";
import ModeloLabG from "./pages/ModeloLabG";
import ModeloLabH from "./pages/ModeloLabH";
import ModeloLabI from "./pages/ModeloLabI";

import RequireAuth from "./auth/RequireAuth";

export default function App() {
    return (
        <>
            <GoogleAnalyticsTracker />
            <Routes>
            <Route path="/" element={<HomeEntry />} />
            <Route path="/briefing" element={<HomeEntry />} />
            <Route path="/modelo" element={<ModeloLab />} />
            <Route path="/modelo-a-plus" element={<ModeloLabAPlus />} />
            <Route path="/modelo-b" element={<ModeloLabB />} />
            <Route path="/modelo-c" element={<ModeloLabC />} />
            <Route path="/modelo-d" element={<ModeloLabD />} />
            <Route path="/modelo-e" element={<ModeloLabE />} />
            <Route path="/modelo-f" element={<ModeloLabF />} />
            <Route path="/modelo-g" element={<ModeloLabG />} />
            <Route path="/modelo-h" element={<ModeloLabH />} />
            <Route path="/modelo-i" element={<ModeloLabI />} />
            <Route path="/weather" element={<Weather />} />
            <Route
                path="/tools"
                element={
                    <RequireAuth>
                        <Tools />
                    </RequireAuth>
                }
            />
            <Route
                path="/computador"
                element={
                    <RequireAuth>
                        <FlightComputer />
                    </RequireAuth>
                }
            />
            <Route path="/flight-computer" element={<Navigate to="/computador" replace />} />
            <Route
                path="/quiz"
                element={
                    <RequireAuth>
                        <Quiz />
                    </RequireAuth>
                }
            />
            <Route path="/metar-decoder" element={<SeoLanding pageKey="metar" />} />
            <Route path="/flight-planning" element={<SeoLanding pageKey="planning" />} />
            <Route path="/piloto-privado" element={<SeoLanding pageKey="pp" />} />
            <Route path="/comissario" element={<SeoLanding pageKey="cms" />} />
            <Route path="/result/share" element={<ExamResultShare />} />

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
        </>
    );
}
