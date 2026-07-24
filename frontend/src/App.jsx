import { lazy, Suspense } from "react";
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
import ResumosAviacao from "./pages/ResumosAviacao";
import SeoLanding from "./pages/SeoLanding";
import ExamResultShare from "./pages/ExamResultShare";
import RequireAuth from "./auth/RequireAuth";

const MODELO_SLUGS = [
    "modelo",
    "modelo-a-plus",
    "modelo-b",
    "modelo-c",
    "modelo-d",
    "modelo-e",
    "modelo-f",
    "modelo-g",
    "modelo-h",
    "modelo-i",
];

/** Maquetes só em localhost (`npm run dev`). Em produção → home. */
const modeloLabPages = import.meta.env.DEV
    ? {
          modelo: lazy(() => import("./pages/ModeloLab")),
          "modelo-a-plus": lazy(() => import("./pages/ModeloLabAPlus")),
          "modelo-b": lazy(() => import("./pages/ModeloLabB")),
          "modelo-c": lazy(() => import("./pages/ModeloLabC")),
          "modelo-d": lazy(() => import("./pages/ModeloLabD")),
          "modelo-e": lazy(() => import("./pages/ModeloLabE")),
          "modelo-f": lazy(() => import("./pages/ModeloLabF")),
          "modelo-g": lazy(() => import("./pages/ModeloLabG")),
          "modelo-h": lazy(() => import("./pages/ModeloLabH")),
          "modelo-i": lazy(() => import("./pages/ModeloLabI")),
      }
    : null;

export default function App() {
    return (
        <>
            <GoogleAnalyticsTracker />
            <Routes>
                <Route path="/" element={<HomeEntry />} />
                <Route path="/briefing" element={<HomeEntry />} />

                {MODELO_SLUGS.map((slug) => {
                    const Page = modeloLabPages?.[slug];
                    return (
                        <Route
                            key={slug}
                            path={`/${slug}`}
                            element={
                                Page ? (
                                    <Suspense fallback={null}>
                                        <Page />
                                    </Suspense>
                                ) : (
                                    <Navigate to="/" replace />
                                )
                            }
                        />
                    );
                })}

                <Route path="/weather" element={<Weather />} />
                <Route path="/empregos" element={<Navigate to="/" replace />} />
                <Route path="/jobs" element={<Navigate to="/" replace />} />
                <Route path="/resumos" element={<ResumosAviacao />} />
                <Route path="/summaries" element={<Navigate to="/resumos" replace />} />
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
                <Route
                    path="/profile"
                    element={
                        <RequireAuth>
                            <Profile />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/perfil"
                    element={
                        <RequireAuth>
                            <Profile />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/assinatura"
                    element={
                        <RequireAuth>
                            <Billing />
                        </RequireAuth>
                    }
                />
                <Route path="/subscription" element={<Navigate to="/assinatura" replace />} />
                <Route path="/billing" element={<Navigate to="/assinatura" replace />} />
                <Route path="/exams" element={<Navigate to="/simulados" replace />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}
