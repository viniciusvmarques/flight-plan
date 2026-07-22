import { useNavigate } from "react-router-dom";
import UtcBar from "../components/UtcBar";
import { legalVersions, siteProfile } from "../content/siteProfile";
import { useI18n } from "../i18n/I18nContext.jsx";
import { getLegalContent } from "../i18n/legalContent";

export default function CancellationPolicy() {
    const nav = useNavigate();
    const { locale, t } = useI18n();
    const copy = getLegalContent(locale);

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
                    <span className="chip">{t("common.cancellationPolicy")}</span>
                    <span className="chip">{t("legal.version", { version: legalVersions.cancellation })}</span>
                </div>

                <h1>{t("legal.cancellationTitle")}</h1>
                <p>{copy.cancellationIntro}</p>

                <h2>{t("legal.planTrial")}</h2>
                <p>{copy.planTrial(siteProfile.trialLabel)}</p>

                <h2>{t("legal.recurring")}</h2>
                <p>{copy.recurring}</p>

                <h2>{t("legal.cancellation")}</h2>
                <ul>
                    {copy.cancellationItems.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>

                <h2>{t("legal.accountDeletion")}</h2>
                <p>{t("common.subscriptionDeletionNotice")}</p>

                <h2>{t("legal.paymentFailures")}</h2>
                <p>{copy.paymentFailures}</p>

                <h2>{t("legal.refund")}</h2>
                <p>{t("common.refundSummary")}</p>
                <p>{t("common.refundWindowNotice")}</p>
                <ul>
                    {copy.refundItems.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>

                <h2>{t("legal.commercialContact")}</h2>
                <p>{copy.commercialContact(siteProfile.supportEmail)}</p>

                <div className="auth-info legal-note">{copy.commercialNote}</div>
            </div>
        </div>
    );
}
