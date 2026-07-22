import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import BrandMark from "../components/Brandmark";
import LanguageSwitcher from "../components/LanguageSwitcher";
import SocialAuthButtons from "../components/SocialAuthButtons";
import UtcBar from "../components/UtcBar";
import { getStoredLocale, useI18n } from "../i18n/I18nContext.jsx";
import { trackSignupConversion } from "../lib/googleAds.js";

export default function Register() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [homeCity, setHomeCity] = useState("");
  const [isPilot, setIsPilot] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nextPath = useMemo(() => {
    const raw = searchParams.get("next") || "";
    if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
    return "/";
  }, [searchParams]);

  const canSubmit = useMemo(() => {
    return email.trim() && password.length >= 6 && password === confirm && agree;
  }, [email, password, confirm, agree]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!canSubmit) return;

    try {
      setLoading(true);
            const response = await register({
                email,
                password,
                accepted: agree,
                locale: getStoredLocale(),
                firstName,
                lastName,
                homeCity,
                isPilot,
            });
            trackSignupConversion();
            nav("/verify-email", {
                replace: true,
                state: { email: response?.email || email, next: nextPath },
            });
    } catch (err) {
      setError(err?.message || t("auth.registerFailed"));
    } finally {
      setLoading(false);
    }
  }

  const whyBullets = [
    ...(t("plannerGate.bullets") || "").split("|").filter(Boolean).slice(0, 3),
    t("billing.featureBriefings"),
  ];

  return (
    <div className="auth-wrap av-shell">
      <UtcBar />
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
              <p>{t("plannerGate.copy")}</p>
            </div>

            <SocialAuthButtons
              mode="register"
              agree={agree}
              disabled={loading}
              onSuccess={() => nav(nextPath, { replace: true })}
              onError={(err) => setError(err?.message || t("auth.oauthFailed"))}
            />

            <form onSubmit={onSubmit} className="auth-form">
              <div className="auth-form-row">
                <label>
                  <span>{t("auth.firstName")}</span>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t("auth.firstNamePlaceholder")}
                    type="text"
                    autoComplete="given-name"
                  />
                </label>
                <label>
                  <span>{t("auth.lastName")}</span>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t("auth.lastNamePlaceholder")}
                    type="text"
                    autoComplete="family-name"
                  />
                </label>
              </div>

              <label>
                <span>{t("auth.homeCity")}</span>
                <input
                  value={homeCity}
                  onChange={(e) => setHomeCity(e.target.value)}
                  placeholder={t("auth.homeCityPlaceholder")}
                  type="text"
                  autoComplete="address-level2"
                />
              </label>

              <label className="auth-check">
                <input type="checkbox" checked={isPilot} onChange={(e) => setIsPilot(e.target.checked)} />
                <span>{t("auth.isPilot")}</span>
              </label>

              <label>
                <span>{t("auth.email")}</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("auth.emailPlaceholder")}
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
                  placeholder={t("auth.passwordPlaceholder")}
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
                  placeholder={t("auth.confirmPasswordPlaceholder")}
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

              <div className="auth-hint">{t("auth.registerVerifyHint")}</div>
            </form>
          </div>

          <div className="auth-pane auth-pane--soft auth-pane--chart">
            <div className="auth-chart-hero" aria-hidden="true">
              <img src="/marquisa-chart-art.svg" alt="" />
            </div>
            <h2>{t("auth.registerWhyTitle")}</h2>
            <ul className="auth-copy-list">
              {whyBullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="auth-chip-row">
              <span className="chip">{t("auth.chipBriefing")}</span>
              <span className="chip">{t("auth.chipPlanning")}</span>
              <span className="chip">{t("auth.chipHistory")}</span>
            </div>
            <p className="muted">{t("auth.registerWhyHint")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
