import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import BrandMark from "../components/Brandmark";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { api } from "../services/apiClient";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function ResetPassword() {
    const nav = useNavigate();
    const { t } = useI18n();
    const [params] = useSearchParams();
    const token = params.get("token") || "";

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [hint, setHint] = useState("");

    useEffect(() => {
        if (!token) {
            setHint(
                "Use o link completo enviado por e-mail. Em desenvolvimento, copie a URL exibida no terminal do backend."
            );
        } else {
            setHint("");
        }
    }, [token]);

    const canSubmit = useMemo(() => password.length >= 6 && password === confirm, [password, confirm]);

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        if (!token) {
            setError("Link incompleto. Abra o endereço que veio no e-mail ou no terminal do backend.");
            return;
        }
        if (!canSubmit) return;
        try {
            setLoading(true);
            await api("/auth/reset-password", {
                method: "POST",
                body: { token, password },
                auth: false,
            });
            nav("/login", { replace: true, state: { resetOk: true } });
        } catch (err) {
            setError(err?.message || "Não foi possível redefinir a senha.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-wrap">
            <div className="auth-card" role="region" aria-label={t("auth.resetTitle")}>
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
                    <h1>{t("auth.resetTitle")}</h1>
                    <p>{t("auth.resetCaption")}</p>

                    {hint && <div className="auth-info">{hint}</div>}

                    <form className="auth-form" onSubmit={onSubmit}>
                        <label>
                            <span>{t("auth.newPassword")}</span>
                            <input
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                autoComplete="new-password"
                                minLength={6}
                                required
                            />
                        </label>
                        <label>
                            <span>{t("auth.confirmPassword")}</span>
                            <input
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                type="password"
                                autoComplete="new-password"
                                minLength={6}
                                required
                            />
                        </label>

                        {error && <div className="auth-error">⚠ {error}</div>}

                        <button className="btn-primary" type="submit" disabled={loading || !canSubmit}>
                            {loading ? t("common.loading") : t("auth.updatePassword")}
                        </button>
                    </form>

                    <div className="auth-links auth-links--compact">
                        <Link to="/login">{t("auth.goLogin")}</Link>
                        <Link to="/forgot">{t("auth.sendReset")}</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
