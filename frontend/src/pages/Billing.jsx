import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Card from "../components/Card";
import AppFooter from "../components/AppFooter";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../auth/AuthContext";
import { apiGet, apiPost } from "../services/apiClient";
import { siteProfile } from "../content/siteProfile";
import { getStoredLocale, useI18n } from "../i18n/I18nContext.jsx";
import { trackPurchaseConversion } from "../lib/googleAds.js";

export default function Billing() {
    const nav = useNavigate();
    const { user, token, refreshMe } = useAuth();
    const [searchParams] = useSearchParams();
    const { t, localizedPrice, locale } = useI18n();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [status, setStatus] = useState(null);
    const [creating, setCreating] = useState(false);
    const [acceptedCommercialTerms, setAcceptedCommercialTerms] = useState(false);

    const email = useMemo(() => user?.email || "", [user]);

    async function refresh() {
        setError("");
        setLoading(true);
        try {
            const res = await apiGet("/me", token);
            const u = res?.user;
            const plan = String(u?.plan || "FREE").toUpperCase();
            const planStatus = String(u?.planStatus || "").toLowerCase();
            setStatus({
                plan,
                planStatus,
                active: plan === "PRO" && ["active", "trialing", "demo"].includes(planStatus || "active"),
                trialing: planStatus === "trialing" || planStatus === "demo",
                renews: !!u?.currentPeriodEnd,
                currentPeriodEnd: u?.currentPeriodEnd || null,
                trialEndsAt: u?.trialEndsAt || null,
                cancelAtPeriodEnd: !!u?.cancelAtPeriodEnd,
                canceledAt: u?.canceledAt || null,
            });
            await refreshMe();
        } catch (e) {
            setError(e?.message || "Erro ao carregar status");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (searchParams.get("checkout") !== "success") return;
        trackPurchaseConversion(19.9, "BRL");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    async function startCheckout() {
        setError("");
        if (!acceptedCommercialTerms) {
            setError(t("billing.acceptError"));
            return;
        }
        setCreating(true);
        try {
            const res = await apiPost("/api/stripe/checkout", { locale: getStoredLocale() }, token);
            if (res?.demo) {
                setError(t("billing.localStripeDemo"));
                return;
            }
            if (res?.url) window.location.href = res.url;
            else throw new Error(t("billing.checkoutUrlMissing"));
        } catch (e) {
            setError(e?.message || "Falha ao iniciar checkout");
        } finally {
            setCreating(false);
        }
    }

    async function openPortal() {
        setError("");
        try {
            const res = await apiPost("/api/stripe/portal", {}, token);
            if (res?.url) window.location.href = res.url;
            else throw new Error(t("billing.portalMissing"));
        } catch (e) {
            setError(e?.message || "Falha ao abrir portal");
        }
    }

    const checkoutState = searchParams.get("checkout");
    const checkoutBanner =
        checkoutState === "success"
            ? t("billing.checkoutSuccess")
            : checkoutState === "cancel"
              ? t("billing.checkoutCancel")
              : "";

    function formatDate(value) {
        if (!value) return "—";
        try {
            return new Date(value).toLocaleDateString(locale);
        } catch {
            return "—";
        }
    }

    function humanStatusLabel() {
        const current = String(status?.planStatus || "").toLowerCase();
        if (current === "active") return t("billing.activeStatus");
        if (current === "trialing" || current === "demo") return t("billing.trialStatus");
        if (current === "past_due") return t("billing.pastDueStatus");
        if (current === "canceled") return t("billing.canceledStatus");
        return status?.plan === "PRO" ? t("billing.proStatus") : t("billing.freeStatus");
    }

    const isProActive = !!status?.active;
    const planLead = loading
        ? t("billing.loadingLead")
        : isProActive
          ? status?.trialing
              ? status?.trialEndsAt
                  ? t("billing.trialLeadUntil", { date: formatDate(status.trialEndsAt) })
                  : t("billing.trialLead", { date: "" })
              : t("billing.activeLead")
          : status?.planStatus === "past_due"
            ? t("billing.paymentRegularize")
            : t("billing.freeLead");
    const renewalLead = status?.cancelAtPeriodEnd
        ? status?.currentPeriodEnd
            ? t("billing.cancelScheduledUntil", { date: formatDate(status.currentPeriodEnd) })
            : t("billing.cancelScheduledLead", { date: "" })
        : status?.currentPeriodEnd
          ? t("billing.nextCycle", { date: formatDate(status.currentPeriodEnd) })
          : t("billing.noCycle");

    return (
        <div className="main-shell">
            <AppHeader
                kicker={t("billing.kicker")}
                title={t("billing.title")}
                subtitle={t("billing.subtitle")}
            />

            <div className="main-scroll">
                <div className="page-shell">
                    <section className="page-hero">
                        <div className="page-hero-head">
                            <div className="page-hero-copy">
                                <span className="page-eyebrow">{t("billing.heroEyebrow")}</span>
                                <h1 className="page-title">{t("billing.heroTitle")}</h1>
                                <p className="page-caption">
                                    {t("billing.heroCaption")} {t("billing.examsHeroAddOn")}
                                </p>
                            </div>

                            <div className="page-actions">
                                <button className="secondary" type="button" onClick={() => nav("/perfil")}>
                                    {t("billing.myAccount")}
                                </button>
                                <button className="secondary" type="button" onClick={() => nav("/")}>
                                    Dashboard
                                </button>
                            </div>
                        </div>

                        <div className="page-chip-row">
                            <span className="chip">{email || t("billing.noAccount")}</span>
                            <span className={`chip ${isProActive ? "ok" : ""}`}>Plano: {status?.plan || "FREE"}</span>
                            <span className="chip">{humanStatusLabel()}</span>
                            <span className="chip">{status?.cancelAtPeriodEnd ? t("billing.cancelScheduled") : isProActive ? t("billing.accessGranted") : t("billing.noActiveSubscription")}</span>
                        </div>
                    </section>

                    {checkoutBanner ? (
                        <Card title={t("billing.checkoutUpdateTitle")}>
                            <div className="empty-note">{checkoutBanner}</div>
                        </Card>
                    ) : null}

                    {error ? (
                        <Card title={t("common.warning")}>
                            <div className="empty-note">{error}</div>
                        </Card>
                    ) : null}

                    <div className="page-grid">
                        <div className="page-stack">
                            <Card title={t("billing.statusTitle")}>
                                {loading ? (
                                    <div className="empty-note">{t("billing.loadingStatus")}</div>
                                ) : (
                                    <div className="info-stack billing-status-panel">
                                        <div className="billing-status-grid">
                                            <div className={`billing-status-item ${isProActive ? "billing-status-item--ok" : ""}`}>
                                                <span>{t("billing.status")}</span>
                                                <strong>{humanStatusLabel()}</strong>
                                            </div>
                                            <div className="billing-status-item">
                                                <span>{t("billing.plan")}</span>
                                                <strong>{status?.plan || "FREE"}</strong>
                                            </div>
                                            <div className="billing-status-item">
                                                <span>{t("billing.charge")}</span>
                                                <strong>{renewalLead}</strong>
                                            </div>
                                        </div>
                                        <p className="page-caption">
                                            {isProActive
                                                ? t("billing.activePortalHint", { lead: planLead })
                                                : status?.planStatus === "past_due"
                                                  ? t("billing.pastDueCopy")
                                                  : t("billing.freeUpsell")}
                                        </p>
                                        <div className="page-actions">
                                            <button className="secondary" type="button" onClick={refresh} disabled={loading}>
                                                {t("billing.updateStatus")}
                                            </button>
                                            <button className="secondary" type="button" onClick={openPortal} disabled={loading}>
                                                {t("billing.manageSubscription")}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Card>

                            <Card title={t("billing.featuresTitle")}>
                                <div className="feature-list">
                                    <div className="feature-item">{t("billing.featureBriefings")}</div>
                                    <div className="feature-item">{t("billing.featureFavorites")}</div>
                                    <div className="feature-item">{t("billing.featureHistory")}</div>
                                            <div className="feature-item">{t("billing.examsIncluded")}</div>
                                    <div className="feature-item">{t("billing.featureFuture")}</div>
                                </div>
                            </Card>
                        </div>

                        <div className="page-stack">
                            <Card title={t("billing.comparisonTitle")}>
                                <div className="pricing-grid">
                                    <section className={`pricing-card ${!isProActive ? "pricing-card--current" : ""}`}>
                                        <div className="pricing-head">
                                            <div>
                                                <div className="pricing-name">Free</div>
                                                <div className="pricing-price">R$ 0</div>
                                            </div>
                                            <span className="chip">{isProActive ? t("billing.basePlan") : t("common.current")}</span>
                                        </div>
                                        <div className="feature-list">
                                            <div className="feature-item">{t("billing.freeFeatureMetar")}</div>
                                            <div className="feature-item">{t("billing.freeFeaturePlanner")}</div>
                                            <div className="feature-item">{t("billing.freeFeatureExam")}</div>
                                            <div className="feature-item">{t("billing.freeFeatureLocal")}</div>
                                        </div>
                                        <button className="secondary" type="button" disabled>
                                            {isProActive ? t("common.included") : t("billing.currentPlan")}
                                        </button>
                                    </section>

                                    <section className={`pricing-card pricing-card--pro ${isProActive ? "pricing-card--active" : ""}`}>
                                        <div className="pricing-head">
                                            <div>
                                                <div className="pricing-name">Pro</div>
                                                <div className="pricing-price">{localizedPrice.label}</div>
                                                <div className="pricing-note">{t("billing.localizedPriceNote")}</div>
                                            </div>
                                            <span className="chip ok">{isProActive ? "Ativo" : siteProfile.trialLabel}</span>
                                        </div>
                                        <div className="feature-list">
                                            <div className="feature-item">{t("billing.proFeatureSync")}</div>
                                            <div className="feature-item">{t("billing.proFeatureReopen")}</div>
                                            <div className="feature-item">{t("billing.proFeatureExams")}</div>
                                            <div className="feature-item">{t("billing.proFeatureStripe")}</div>
                                            <div className="feature-item">{t("billing.proFeatureFuture")}</div>
                                        </div>
                                        {isProActive ? (
                                            <div className="billing-active-note">
                                                <strong>{t("billing.proActiveTitle")}</strong>
                                                <span>{planLead}</span>
                                                <button className="secondary" type="button" onClick={openPortal} disabled={loading}>
                                                    {t("billing.manageSubscription")}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="billing-acceptance-box">
                                                <label className="billing-acceptance-check">
                                                    <input
                                                        type="checkbox"
                                                        checked={acceptedCommercialTerms}
                                                        onChange={(event) => setAcceptedCommercialTerms(event.target.checked)}
                                                    />
                                                    <span>
                                                        {t("billing.acceptance")}{" "}
                                                        <Link to="/terms">{t("common.terms")}</Link> · <Link to="/privacy">{t("common.privacy")}</Link> ·{" "}
                                                        <Link to="/cancellation-policy">{t("common.cancellationPolicy")}</Link>
                                                    </span>
                                                </label>
                                                <button className="btn-primary" type="button" onClick={startCheckout} disabled={creating || !acceptedCommercialTerms}>
                                                    {creating ? t("billing.opening") : t("billing.signPro")}
                                                </button>
                                            </div>
                                        )}
                                    </section>
                                </div>

                                <p className="page-caption">
                                    {t("billing.checkoutAndPortal", { email: siteProfile.supportEmail })}{" "}
                                    <Link to="/cancellation-policy">{t("common.cancellationPolicy")}</Link>.
                                </p>
                            </Card>

                            <Card title={t("billing.invoiceTitle")}>
                                <div className="billing-active-note">
                                    <strong>{t("billing.fiscalInfo")}</strong>
                                    <span>{siteProfile.invoiceNotice}</span>
                                    <span>
                                        {t("billing.invoiceNeed", { email: siteProfile.supportEmail })}
                                    </span>
                                </div>
                            </Card>

                            <Card title={t("billing.refundTitle")}>
                                <div className="feature-list">
                                    <div className="feature-item">{t("common.refundWindowNotice")}</div>
                                    <div className="feature-item">
                                        {t("billing.cancelNoAutoRefund")}
                                    </div>
                                    <div className="feature-item">
                                        {t("billing.billingIssues")}
                                    </div>
                                    <div className="feature-item">{t("common.subscriptionDeletionNotice")}</div>
                                </div>
                                <p className="page-caption">
                                    {t("billing.consultPolicy")}
                                </p>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <AppFooter />
        </div>
    );
}
