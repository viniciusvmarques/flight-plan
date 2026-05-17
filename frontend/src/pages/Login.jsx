import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import BrandMark from "../components/Brandmark";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetBanner, setResetBanner] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  useEffect(() => {
    if (location.state?.resetOk) setResetBanner(true);
  }, [location.state]);

  const canSubmit = useMemo(() => email.trim() && password.trim(), [email, password]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setUnverifiedEmail("");
    if (!canSubmit) return;

    try {
      setLoading(true);
      await login({ email, password });
      nav("/");
    } catch (err) {
      if (err?.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(err?.email || email);
      }
      setError(err?.message || "Falha ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card" role="region" aria-label={t("auth.loginTitle")}>
        <div className="auth-head">
          <button type="button" className="auth-back" onClick={() => nav(-1)}>
            ← {t("auth.back")}
          </button>
          <div className="auth-brand" onClick={() => nav("/")} role="button" tabIndex={0}>
            <BrandMark size={46} />
          </div>
          <LanguageSwitcher compact />
        </div>

        <div className="auth-body">
          <h1>{t("auth.loginTitle")}</h1>
          <p>{t("auth.loginCaption")}</p>

          {resetBanner && (
            <div className="auth-success auth-banner">
              {t("auth.resetSuccess")}
            </div>
          )}

          <form onSubmit={onSubmit} className="auth-form">
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

            <label>
              <span>{t("auth.password")}</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>

            {error && <div className="auth-error">⚠ {error}</div>}

            {unverifiedEmail ? (
              <div className="auth-info">
                {t("auth.verifyCaption")}{" "}
                <Link to="/verify-email" state={{ email: unverifiedEmail }}>
                  {t("auth.resendVerification")}
                </Link>
              </div>
            ) : null}

            <button className="btn-primary" disabled={loading || !canSubmit}>
              {loading ? t("auth.loggingIn") : t("auth.loginButton")}
            </button>

            <div className="auth-links">
              <button type="button" className="btn-ghost" onClick={() => nav("/forgot")}
                title="Recuperar senha">
                {t("auth.forgotPassword")}
              </button>
              <Link to="/register">{t("auth.createAccount")}</Link>
            </div>
          </form>

          <div className="auth-hint">Login com e-mail e senha (backend Prisma + Postgres).</div>
        </div>
      </div>

    </div>
  );
}
