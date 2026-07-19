import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { legalVersions } from "../content/siteProfile";
import { getStoredLocale, useI18n } from "../i18n/I18nContext.jsx";
import { trackSignupConversion } from "../lib/googleAds.js";
import { getApiBase } from "../services/apiClient";

const API = getApiBase();
const ENV_GOOGLE_CLIENT_ID = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();

function loadScript(id, src) {
  if (document.getElementById(id)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
    document.head.appendChild(script);
  });
}

export default function SocialAuthButtons({
  mode = "login",
  agree = true,
  onSuccess,
  onError,
  disabled = false,
}) {
  const { loginWithOAuth } = useAuth();
  const { t } = useI18n();
  const [config, setConfig] = useState(null);
  const [busy, setBusy] = useState(false);
  const [appleReady, setAppleReady] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const googleBtnRef = useRef(null);

  const googleClientId = ENV_GOOGLE_CLIENT_ID || config?.googleClientId || "";

  useEffect(() => {
    fetch(`${API}/auth/oauth/config`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setConfig(data))
      .catch(() => null);
  }, []);

  const finishOAuth = useCallback(
    async ({ provider, idToken }) => {
      if (mode === "register" && !agree) {
        onError?.(new Error(t("auth.oauthConsentRequired")));
        return;
      }

      setBusy(true);
      try {
        const result = await loginWithOAuth({
          provider,
          idToken,
          accepted: mode === "register" ? agree : true,
          consentVersions: legalVersions,
          locale: getStoredLocale(),
        });
        if (result?.isNew) trackSignupConversion();
        onSuccess?.(result);
      } catch (err) {
        onError?.(err);
      } finally {
        setBusy(false);
      }
    },
    [agree, loginWithOAuth, mode, onError, onSuccess, t]
  );

  useEffect(() => {
    if (!config?.google || !googleClientId) return;
    let cancelled = false;

    loadScript("google-gsi", "https://accounts.google.com/gsi/client")
      .then(() => {
        if (cancelled || !window.google?.accounts?.id || !googleBtnRef.current) return;
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (!response?.credential) {
              onError?.(new Error(t("auth.oauthFailed")));
              return;
            }
            finishOAuth({ provider: "google", idToken: response.credential });
          },
        });
        googleBtnRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "filled_black",
          size: "large",
          shape: "pill",
          text: mode === "register" ? "signup_with" : "continue_with",
          width: Math.min(googleBtnRef.current.offsetWidth || 320, 400),
          locale: getStoredLocale() === "en" ? "en" : getStoredLocale() === "es" ? "es" : "pt",
        });
        setGoogleReady(true);
      })
      .catch(() => setGoogleReady(false));

    return () => {
      cancelled = true;
    };
  }, [config?.google, finishOAuth, googleClientId, mode, onError, t]);

  useEffect(() => {
    if (!config?.apple || !config?.appleClientId) return;
    loadScript("apple-auth-js", "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js")
      .then(() => {
        window.AppleID.auth.init({
          clientId: config.appleClientId,
          scope: "name email",
          redirectURI: window.location.origin,
          usePopup: true,
        });
        setAppleReady(true);
      })
      .catch(() => setAppleReady(false));
  }, [config?.apple, config?.appleClientId]);

  async function onAppleClick() {
    if (disabled || busy || !appleReady) return;
    try {
      const response = await window.AppleID.auth.signIn();
      const idToken = response?.authorization?.id_token;
      if (!idToken) throw new Error(t("auth.oauthFailed"));
      await finishOAuth({ provider: "apple", idToken });
    } catch (err) {
      if (err?.error === "popup_closed_by_user") return;
      onError?.(err instanceof Error ? err : new Error(t("auth.oauthFailed")));
    }
  }

  const showGoogle = Boolean(config?.google && googleClientId);
  const showApple = Boolean(config?.apple && appleReady);
  if (!showGoogle && !showApple) return null;

  return (
    <div className="auth-social">
      <div className="auth-social-divider">
        <span>{t("auth.orContinueWith")}</span>
      </div>

      <div className="auth-social-buttons">
        {showGoogle ? (
          <div
            className={`auth-social-google${disabled || busy ? " auth-social-google--disabled" : ""}`}
            ref={googleBtnRef}
            aria-hidden={!googleReady}
          />
        ) : null}

        {showApple ? (
          <button
            type="button"
            className="auth-social-apple"
            onClick={onAppleClick}
            disabled={disabled || busy}
          >
            <span aria-hidden="true"></span>
            {t("auth.continueApple")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
