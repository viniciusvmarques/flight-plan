import { useNavigate } from "react-router-dom";
import UtcBar from "../components/UtcBar";
import { legalVersions, siteProfile } from "../content/siteProfile";
import { useI18n } from "../i18n/I18nContext.jsx";
import { getLegalContent } from "../i18n/legalContent";

export default function Terms() {
    const nav = useNavigate();
    const { locale, t } = useI18n();
    const copy = getLegalContent(locale);
    const hasLegalIdentity = Boolean(siteProfile.legalName && siteProfile.documentId && siteProfile.cityCountry);

    return (
        <div className="auth-wrap av-shell">
            <UtcBar />
            <div className="legal-card legal-card--wide">
                <div className="legal-back">
                    <button type="button" className="auth-back" onClick={() => nav(-1)}>
                        ← {t("legal.back")}
                    </button>
                </div>
                <div className="legal-meta">
                    <span className="chip">{t("legal.termsTitle")}</span>
                    <span className="chip">{t("legal.version", { version: legalVersions.terms })}</span>
                </div>
                <h1>{t("legal.termsTitle")}</h1>
                <p>{copy.termsIntro}</p>
                <div className="auth-info legal-note">{t("common.operationalDisclaimer")}</div>
                <h2>{t("legal.use")}</h2>
                <ul>
                    {copy.use.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
                <h2>{t("legal.account")}</h2>
                <p>{copy.account}</p>
                <h2>{t("legal.paid")}</h2>
                <p>{copy.paid}</p>
                <p>{t("common.subscriptionDeletionNotice")}</p>
                <p>{t("common.refundSummary")}</p>
                <p>{t("common.refundWindowNotice")}</p>
                <h2>{t("legal.invoice")}</h2>
                <p>{copy.invoiceNotice}</p>
                <p>{t("billing.invoiceNeed", { email: siteProfile.supportEmail })}</p>
                <h2>{t("legal.liability")}</h2>
                <p>{copy.liability}</p>
                <h2>{t("legal.intellectual")}</h2>
                <p>{copy.intellectual}</p>
                <h2>{t("legal.contactIdentity")}</h2>
                {hasLegalIdentity ? (
                    <p>
                        {copy.operationIdentity(
                            siteProfile.legalName,
                            siteProfile.documentId,
                            siteProfile.cityCountry,
                            siteProfile.supportEmail
                        )}
                    </p>
                ) : (
                    <p>
                        {t("common.support")}: <strong>{siteProfile.supportEmail}</strong>.
                    </p>
                )}
                <h2>{t("legal.changes")}</h2>
                <p>{copy.changes}</p>
            </div>
        </div>
    );
}
