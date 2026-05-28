import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import BrandMark from "../components/Brandmark";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { getStoredLocale, useI18n } from "../i18n/I18nContext.jsx";
import { trackSignupConversion } from "../lib/googleAds.js";

export default function Register() {
  const nav = useNavigate();
  const { register } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return email.trim() && password.length >= 6 && password === confirm && agree;
  }, [email, password, confirm, agree]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!canSubmit) return;

    try {
      setLoading(true);
            const response = await register({ email, password, accepted: agree, locale: getStoredLocale() });
            trackSignupConversion();
            nav("/verify-email", {
                replace: true,
                state: { email: response?.email || email },
            });
    } catch (err) {
      setError(err?.message || "Falha ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card auth-card--wide" role="region" aria-label={t("auth.registerTitle")}>
        <div className="auth-head">
          <button type="button" className="auth-back" onClick={() => nav(-1)}>
            ← {t("auth.back")}
          </button>
          <div className="auth-brand" onClick={() => nav("/")} role="button" tabIndex={0}>
            <BrandMark size={46} />
          </div>
          <LanguageSwitcher compact />
        </div>

        <div className="auth-body auth-grid">
          <div className="auth-pane">
            <div>
              <h1>{t("auth.registerTitle")}</h1>
              <p>{t("auth.registerCaption")}</p>
            </div>

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
                  placeholder="mín. 6 caracteres"
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </label>

              <label>
                <span>{t("auth.confirmPassword")}</span>
                <input
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="repita a senha"
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </label>

              <label className="auth-check">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span>
                  {t("auth.acceptTerms")} <Link to="/terms">{t("common.terms")}</Link> · <Link to="/privacy">{t("common.privacy")}</Link>
                </span>
              </label>

              {error && <div className="auth-error">⚠ {error}</div>}

              <button className="btn-primary" disabled={loading || !canSubmit}>
                {loading ? t("auth.creating") : t("auth.registerButton")}
              </button>

              <div className="auth-links auth-links--start">
                <Link to="/login">{t("auth.alreadyHaveAccount")} • {t("auth.loginButton")}</Link>
              </div>

              <div className="auth-hint">Após o cadastro, enviaremos um link para ativar sua conta.</div>
            </form>
          </div>

          <div className="auth-pane auth-pane--soft">
            <h2>Por que criar conta?</h2>
            <ul className="auth-copy-list">
              <li>{t("billing.featureBriefings")}</li>
              <li>{t("billing.featureFavorites")}</li>
              <li>{t("billing.featureHistory")}</li>
              <li>{t("billing.featureFuture")}</li>
            </ul>
            <div className="auth-chip-row">
              <span className="chip">Briefing</span>
              <span className="chip">Planejamento</span>
              <span className="chip">Histórico</span>
            </div>
            <p className="muted">Sem spam. Você controla seus dados.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
