import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandMark from "../components/Brandmark";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { api } from "../services/apiClient";
import { getStoredLocale, useI18n } from "../i18n/I18nContext.jsx";

export default function ForgotPassword() {
    const nav = useNavigate();
    const { t } = useI18n();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);

    const canSubmit = useMemo(() => email.trim().length > 3, [email]);

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        if (!canSubmit) return;
        try {
            setLoading(true);
            await api("/auth/forgot-password", {
                method: "POST",
                body: { email: email.trim(), locale: getStoredLocale() },
                auth: false,
            });
            setDone(true);
        } catch (err) {
            setError(err?.message || "Não foi possível enviar o pedido.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-wrap">
            <div className="auth-card" role="region" aria-label={t("auth.forgotTitle")}>
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
                    <h1>{t("auth.forgotTitle")}</h1>
                    <p>{t("auth.forgotCaption")}</p>

                    {done ? (
                        <div className="auth-success">
                            Se existir uma conta com esse e-mail, você receberá instruções em alguns minutos. Verifique também o spam.
                            {import.meta.env.DEV && (
                                <div className="auth-info auth-info--inline">
                                    <strong>Ambiente dev:</strong> sem SMTP no servidor, o link de redefinição é impresso no{" "}
                                    <strong>terminal do backend</strong>.
                                </div>
                            )}
                        </div>
                    ) : (
                        <form className="auth-form" onSubmit={onSubmit}>
                            <label>
                                <span>{t("auth.email")}</span>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seuemail@exemplo.com"
                                    type="email"
                                    autoComplete="email"
                                    required
                                />
                            </label>

                            {error && <div className="auth-error">⚠ {error}</div>}

                            <button className="btn-primary" type="submit" disabled={loading || !canSubmit}>
                                {loading ? t("auth.sending") : t("auth.sendReset")}
                            </button>
                        </form>
                    )}

                    <div className="auth-links auth-links--compact">
                        <Link to="/login">{t("auth.loginButton")}</Link>
                        <Link to="/register">{t("auth.createAccount")}</Link>
                    </div>

                    <div className="auth-hint">Por segurança, não informamos se o e-mail está cadastrado.</div>
                </div>
            </div>
        </div>
    );
}
