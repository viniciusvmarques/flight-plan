import { useNavigate } from "react-router-dom";
import { legalVersions, siteProfile } from "../content/siteProfile";
import { useI18n } from "../i18n/I18nContext.jsx";
import { getLegalContent } from "../i18n/legalContent";

export default function CancellationPolicy() {
    const nav = useNavigate();
    const { locale, t } = useI18n();
    const copy = getLegalContent(locale);

    return (
        <div className="auth-wrap">
            <div className="legal-card legal-card--wide">
                <div className="legal-back">
                    <button type="button" className="auth-back" onClick={() => nav(-1)}>
                        ← Voltar
                    </button>
                </div>

                <div className="legal-meta">
                    <span className="chip">{t("common.cancellationPolicy")}</span>
                    <span className="chip">{t("legal.version", { version: legalVersions.cancellation })}</span>
                </div>

                <h1>{t("legal.cancellationTitle")}</h1>
                <p>{copy.cancellationIntro}</p>

                <h2>{t("legal.planTrial")}</h2>
                <p>
                    {locale === "en"
                        ? `The Pro plan is sold with recurring billing and an initial promotional condition of ${siteProfile.trialLabel}, subject to payment-platform rules and the current commercial policy.`
                        : locale === "es"
                          ? `El plan Pro se comercializa con cobro recurrente y una condición promocional inicial de ${siteProfile.trialLabel}, sujeta a las reglas de la plataforma de pago y la política comercial vigente.`
                          : `O plano Pro é comercializado em cobrança recorrente, com condição promocional inicial de ${siteProfile.trialLabel}, sujeita às regras da plataforma de pagamento e à política comercial vigente.`}
                </p>

                <h2>{t("legal.recurring")}</h2>
                <p>
                    {locale === "en"
                        ? "When subscribing to Pro, the subscription renews automatically at the end of each cycle unless cancelled beforehand in the subscription area or billing portal."
                        : locale === "es"
                          ? "Al contratar Pro, la suscripción se renueva automáticamente al final de cada ciclo salvo cancelación previa en el área de suscripción o portal de cobro."
                          : "Ao contratar o plano Pro, a assinatura é renovada automaticamente ao fim de cada ciclo, salvo cancelamento prévio realizado pelo próprio usuário na área de assinatura ou no portal da cobrança."}
                </p>

                <h2>{t("legal.cancellation")}</h2>
                <ul>
                    {copy.cancellationItems.map((item) => <li key={item}>{item}</li>)}
                </ul>

                <h2>{t("legal.accountDeletion")}</h2>
                <p>{t("common.subscriptionDeletionNotice")}</p>

                <h2>{t("legal.paymentFailures")}</h2>
                <p>
                    {locale === "en"
                        ? "If payment fails, the subscription may become pending or past due. Premium resources may be restricted until the payment is resolved."
                        : locale === "es"
                          ? "En caso de falla de pago, la suscripción puede quedar pendiente o vencida. Los recursos premium pueden restringirse hasta la regularización."
                          : "Em caso de falha de cobrança, a assinatura pode entrar em estado pendente ou vencido. Nessa situação, recursos premium podem ser restringidos até a regularização financeira."}
                </p>

                <h2>{t("legal.refund")}</h2>
                <p>{t("common.refundSummary")}</p>
                <p>{t("common.refundWindowNotice")}</p>
                <ul>
                    {copy.refundItems.map((item) => <li key={item}>{item}</li>)}
                </ul>

                <h2>{t("legal.commercialContact")}</h2>
                <p>
                    Para pedidos de suporte comercial, cancelamento, exercício de direitos do consumidor ou dúvidas sobre cobrança, utilize o canal {siteProfile.supportEmail}.
                </p>

                <div className="auth-info legal-note">
                    Cancelamentos, dúvidas comerciais e tratativas relacionadas à assinatura são centralizados pelo canal oficial de suporte.
                </div>
            </div>
        </div>
    );
}
