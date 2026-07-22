import { useNavigate } from "react-router-dom";
import UtcBar from "../components/UtcBar";
import { legalVersions, siteProfile } from "../content/siteProfile";
import { useI18n } from "../i18n/I18nContext.jsx";
import { getLegalContent } from "../i18n/legalContent";

export default function Privacy() {
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
                    <span className="chip">{t("legal.privacyTitle")}</span>
                    <span className="chip">{t("legal.version", { version: legalVersions.privacy })}</span>
                </div>
                <h1>{t("legal.privacyTitle")}</h1>
                <p>{copy.privacyIntro}</p>
                <h2>{t("legal.dataCollected")}</h2>
                <ul>
                    {copy.data.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
                <h2>{t("legal.use")}</h2>
                <p>{copy.usePrivacy}</p>
                <h2>{t("legal.storage")}</h2>
                <p>{copy.storage}</p>
                <p>{t("common.dataRetentionNotice")}</p>
                <h2>{t("legal.sharing")}</h2>
                <p>{copy.sharing}</p>
                <h2>{t("legal.rights")}</h2>
                <p>{copy.rights}</p>
                <h2>{t("legal.controller")}</h2>
                {hasLegalIdentity ? (
                    <p>{copy.controllerIdentity(siteProfile.legalName, siteProfile.documentId, siteProfile.cityCountry)}</p>
                ) : (
                    <p>{copy.privacyRequests(siteProfile.privacyEmail)}</p>
                )}
                <div className="auth-info legal-note">{copy.companyNotice}</div>
            </div>
        </div>
    );
}
