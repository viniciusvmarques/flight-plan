import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import App from "./App";
import "./styles/global.css";
import "./styles/typography.css";
import "./styles/mq-wordmark.css";
import "./styles/app-layout.css";
import "./styles/auth-pages.css";
import "./styles/ux-polish.css";
import "./styles/experience.css";
import "./styles/exam-reading.css";
import "./styles/mobile-overrides.css";
import "./styles/experience-spacing.css";
import "./ui/notify.css";
import { AuthProvider } from "./auth/AuthContext";
import { NotifyProvider } from "./ui/NotifyContext.jsx";
import { I18nProvider } from "./i18n/I18nContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <I18nProvider>
                <NotifyProvider>
                    <AuthProvider>
                        <App />
                    </AuthProvider>
                </NotifyProvider>
            </I18nProvider>
        </BrowserRouter>
    </React.StrictMode>
);
