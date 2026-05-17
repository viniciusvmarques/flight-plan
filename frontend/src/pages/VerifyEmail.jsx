import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import BrandMark from "../components/Brandmark";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { api } from "../services/apiClient";
import { getStoredLocale, useI18n } from "../i18n/I18nContext.jsx";

export default function VerifyEmail() {
    const nav = useNavigate();
    const { t } = useI18n();
    const location = useLocation();
    const [params] = useSearchParams();
    const token = params.get("token") || "";
    const initialEmail = params.get("email") || location.state?.email || "";

    const [email, setEmail] = useState(initialEmail);
    const [loading, setLoading] = useState(!!token);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const canResend = useMemo(() => email.trim().length > 3, [email]);

    useEffect(() => {
        if (!token) return;
        let cancelled = false;

        async function verify() {
            try {
                setLoading(true);
                setError("");
                const response = await api("/auth/verify-email", {
                    method: "POST",
                    body: { token, locale: getStoredLocale() },
                    auth: false,
                });
                if (cancelled) return;
                setSuccess(response?.message || "E-mail confirmado com sucesso.");
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || "Não foi possível confirmar o e-mail.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        verify();
        return () => {
            cancelled = true;
        };
    }, [token]);

    async function handleResend(event) {
        event.preventDefault();
        if (!canResend) return;
        try {
            setResending(true);
            setError("");
            const response = await api("/auth/resend-verification", {
                method: "POST",
                body: { email: email.trim(), locale: getStoredLocale() },
                auth: false,
            });
            setSuccess(response?.message || "Se existir uma conta pendente, enviaremos um novo link.");
        } catch (err) {
            setError(err?.message || "Não foi possível reenviar agora.");
        } finally {
            setResending(false);
        }
    }

    return (
        <div className="auth-wrap">
            <div className="auth-card" role="region" aria-label={t("auth.verifyTitle")}>
                <div className="auth-head">
                    <button type="button" className="auth-back" onClick={() => nav("/login")}>
                        ← {t("auth.back")}
                    </button>
                    <div className="auth-brand" onClick={() => nav("/")} role="button" tabIndex={0}>
                        <BrandMark size={46} />
                    </div>
                    <LanguageSwitcher compact />
                </div>

                <div className="auth-body">
                    <h1>{t("auth.verifyTitle")}</h1>
                    <p>{t("auth.verifyCaption")}</p>

                    {loading ? <div className="auth-info">{t("auth.verifyCaption")}</div> : null}
                    {success ? <div className="auth-success auth-banner">{success}</div> : null}
                    {error ? <div className="auth-error">⚠ {error}</div> : null}

                    {!token || error ? (
                        <form className="auth-form" onSubmit={handleResend}>
                            <label>
                                <span>{t("auth.email")}</span>
                                <input
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="seuemail@exemplo.com"
                                    type="email"
                                    autoComplete="email"
                                    required
                                />
                            </label>

                            <button className="btn-primary" type="submit" disabled={resending || !canResend}>
                                {resending ? t("auth.sending") : t("auth.resendVerification")}
                            </button>
                        </form>
                    ) : null}

                    <div className="auth-links auth-links--compact">
                        <Link to="/login">{t("auth.goLogin")}</Link>
                        <Link to="/register">{t("auth.createAccount")}</Link>
                    </div>

                    <div className="auth-hint">
                        Verifique também a pasta de spam se o e-mail não aparecer rapidamente.
                    </div>
                </div>
            </div>
        </div>
    );
}
