import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext.jsx";

export function isUsageLimitError(error) {
  const msg = String(error?.message || error || "");
  return msg.includes("Limite gratuito") || msg.includes("USAGE_LIMIT") || msg.includes("assinaturas PRO");
}

export function parseUsageLimitFromResponse(data) {
  if (!data || typeof data !== "object") return null;
  if (data.code === "USAGE_LIMIT") return data;
  return null;
}

export default function UsageLimitModal({ open, feature, onClose }) {
  const nav = useNavigate();
  const { t } = useI18n();
  if (!open) return null;

  return (
    <div className="usage-limit-backdrop" role="presentation" onClick={onClose}>
      <div
        className="usage-limit-modal"
        role="dialog"
        aria-labelledby="usage-limit-title"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="usage-limit-kicker">{t("usage.limitKicker")}</span>
        <h2 id="usage-limit-title">{t("usage.limitTitle")}</h2>
        <p>{t("usage.limitCopy", { feature: t(`usage.feature.${feature || "default"}`) })}</p>
        <div className="usage-limit-actions">
          <button type="button" className="primary" onClick={() => nav("/assinatura")}>
            {t("usage.upgradeCta")}
          </button>
          <button type="button" className="secondary" onClick={() => nav("/register")}>
            {t("usage.registerCta")}
          </button>
          <button type="button" className="secondary" onClick={onClose}>
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
