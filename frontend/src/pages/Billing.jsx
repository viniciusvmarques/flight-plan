import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Card from "../components/Card";
import AppFooter from "../components/AppFooter";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../auth/AuthContext";
import { apiGet, apiPost } from "../services/apiClient";
import { siteProfile } from "../content/siteProfile";

export default function Billing() {
    const nav = useNavigate();
    const { user, token, refreshMe } = useAuth();
    const [searchParams] = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [status, setStatus] = useState(null);
    const [creating, setCreating] = useState(false);

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

    async function startCheckout() {
        setError("");
        setCreating(true);
        try {
            const res = await apiPost("/api/stripe/checkout", {}, token);
            if (res?.demo) {
                setError("O servidor atual está em modo local sem Stripe ativo. No ambiente configurado, o checkout abrirá normalmente.");
                return;
            }
            if (res?.url) window.location.href = res.url;
            else throw new Error("URL do checkout não retornada");
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
            else throw new Error("Portal não configurado");
        } catch (e) {
            setError(e?.message || "Falha ao abrir portal");
        }
    }

    const checkoutState = searchParams.get("checkout");
    const checkoutBanner =
        checkoutState === "success"
            ? "Checkout concluído. Assim que o webhook confirmar o ciclo comercial, o status da sua assinatura será atualizado."
            : checkoutState === "cancel"
              ? "Seu checkout foi interrompido antes da confirmação. Você pode tentar novamente quando quiser."
              : "";

    function formatDate(value) {
        if (!value) return "—";
        try {
            return new Date(value).toLocaleDateString("pt-BR");
        } catch {
            return "—";
        }
    }

    function humanStatusLabel() {
        const current = String(status?.planStatus || "").toLowerCase();
        if (current === "active") return "Assinatura ativa";
        if (current === "trialing" || current === "demo") return "Período de teste";
        if (current === "past_due") return "Pagamento pendente";
        if (current === "canceled") return "Assinatura cancelada";
        return status?.plan === "PRO" ? "Plano Pro" : "Plano Free";
    }

    const isProActive = !!status?.active;
    const planLead = loading
        ? "Carregando os dados da sua assinatura..."
        : isProActive
          ? status?.trialing
              ? `Seu Pro está em teste gratuito${status?.trialEndsAt ? ` até ${formatDate(status.trialEndsAt)}` : ""}.`
              : "Seu Pro está ativo e liberado para uso."
          : status?.planStatus === "past_due"
            ? "Existe uma pendência de pagamento para regularizar."
            : "Você está no plano Free.";
    const renewalLead = status?.cancelAtPeriodEnd
        ? `Cancelamento agendado${status?.currentPeriodEnd ? ` para ${formatDate(status.currentPeriodEnd)}` : ""}.`
        : status?.currentPeriodEnd
          ? `Próximo ciclo em ${formatDate(status.currentPeriodEnd)}.`
          : "Sem ciclo de cobrança ativo.";

    return (
        <div className="main-shell">
            <AppHeader
                kicker="Assinatura"
                title="Plano Marquisa Pro"
                subtitle="Checkout, renovação e gestão de acesso premium em uma única experiência."
            />

            <div className="main-scroll">
                <div className="page-shell">
                    <section className="page-hero">
                        <div className="page-hero-head">
                            <div className="page-hero-copy">
                                <span className="page-eyebrow">Gestão comercial</span>
                                <h1 className="page-title">Ative o Pro e mantenha sua operação no mesmo fluxo</h1>
                                <p className="page-caption">
                                    Acompanhe seu estado comercial, libere recursos premium e acesse o portal do assinante sem sair do painel.
                                </p>
                            </div>

                            <div className="page-actions">
                                <button className="secondary" type="button" onClick={() => nav("/perfil")}>
                                    Minha conta
                                </button>
                                <button className="secondary" type="button" onClick={() => nav("/")}>
                                    Dashboard
                                </button>
                            </div>
                        </div>

                        <div className="page-chip-row">
                            <span className="chip">{email || "Conta não identificada"}</span>
                            <span className={`chip ${isProActive ? "ok" : ""}`}>Plano: {status?.plan || "FREE"}</span>
                            <span className="chip">{humanStatusLabel()}</span>
                            <span className="chip">{status?.cancelAtPeriodEnd ? "Cancelamento programado" : isProActive ? "Acesso liberado" : "Sem assinatura ativa"}</span>
                        </div>
                    </section>

                    {checkoutBanner ? (
                        <Card title="Atualização do checkout">
                            <div className="empty-note">{checkoutBanner}</div>
                        </Card>
                    ) : null}

                    {error ? (
                        <Card title="Aviso">
                            <div className="empty-note">{error}</div>
                        </Card>
                    ) : null}

                    <div className="page-grid">
                        <div className="page-stack">
                            <Card title="Status atual">
                                {loading ? (
                                    <div className="empty-note">Carregando status da conta...</div>
                                ) : (
                                    <div className="info-stack billing-status-panel">
                                        <div className="billing-status-grid">
                                            <div className={`billing-status-item ${isProActive ? "billing-status-item--ok" : ""}`}>
                                                <span>Status</span>
                                                <strong>{humanStatusLabel()}</strong>
                                            </div>
                                            <div className="billing-status-item">
                                                <span>Plano</span>
                                                <strong>{status?.plan || "FREE"}</strong>
                                            </div>
                                            <div className="billing-status-item">
                                                <span>Cobrança</span>
                                                <strong>{renewalLead}</strong>
                                            </div>
                                        </div>
                                        <p className="page-caption">
                                            {isProActive
                                                ? `${planLead} Use o portal para atualizar cartão, acompanhar cobrança ou cancelar quando precisar.`
                                                : status?.planStatus === "past_due"
                                                  ? "Existe uma pendência de pagamento na sua assinatura. Enquanto ela não for regularizada, o acesso premium pode ficar restrito."
                                                  : "Você ainda está no plano FREE. O Pro libera continuidade operacional, salvamento em nuvem e favoritos sincronizados."}
                                        </p>
                                        <div className="page-actions">
                                            <button className="secondary" type="button" onClick={refresh} disabled={loading}>
                                                Atualizar status
                                            </button>
                                            <button className="secondary" type="button" onClick={openPortal} disabled={loading}>
                                                Gerenciar assinatura
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Card>

                            <Card title="O que o Pro libera">
                                <div className="feature-list">
                                    <div className="feature-item">Salvar briefings ilimitados e reabrir rotas rapidamente.</div>
                                    <div className="feature-item">Sincronizar favoritos e preferências entre sessões.</div>
                                    <div className="feature-item">Centralizar histórico e continuidade do planejamento.</div>
                                    <div className="feature-item">Preparar a conta para exportações, suporte comercial e recursos premium futuros.</div>
                                </div>
                            </Card>
                        </div>

                        <div className="page-stack">
                            <Card title="Comparação de planos">
                                <div className="pricing-grid">
                                    <section className={`pricing-card ${!isProActive ? "pricing-card--current" : ""}`}>
                                        <div className="pricing-head">
                                            <div>
                                                <div className="pricing-name">Free</div>
                                                <div className="pricing-price">R$ 0</div>
                                            </div>
                                            <span className="chip">{isProActive ? "Base" : "Atual"}</span>
                                        </div>
                                        <div className="feature-list">
                                            <div className="feature-item">Briefing METAR / TAF</div>
                                            <div className="feature-item">Planejamento manual de combustível e tempo</div>
                                            <div className="feature-item">Persistência local no navegador</div>
                                        </div>
                                        <button className="secondary" type="button" disabled>
                                            {isProActive ? "Incluso" : "Plano atual"}
                                        </button>
                                    </section>

                                    <section className={`pricing-card pricing-card--pro ${isProActive ? "pricing-card--active" : ""}`}>
                                        <div className="pricing-head">
                                            <div>
                                                <div className="pricing-name">Pro</div>
                                                <div className="pricing-price">{siteProfile.monthlyPrice}</div>
                                            </div>
                                            <span className="chip ok">{isProActive ? "Ativo" : siteProfile.trialLabel}</span>
                                        </div>
                                        <div className="feature-list">
                                            <div className="feature-item">Briefings e favoritos sincronizados</div>
                                            <div className="feature-item">Reabertura rápida do planejamento salvo</div>
                                            <div className="feature-item">Gestão de cobrança e cancelamento via Stripe</div>
                                            <div className="feature-item">Expansão de recursos premium futuros</div>
                                        </div>
                                        {isProActive ? (
                                            <div className="billing-active-note">
                                                <strong>Seu plano Pro já está liberado.</strong>
                                                <span>{planLead}</span>
                                                <button className="secondary" type="button" onClick={openPortal} disabled={loading}>
                                                    Gerenciar assinatura
                                                </button>
                                            </div>
                                        ) : (
                                            <button className="btn-primary" type="button" onClick={startCheckout} disabled={creating}>
                                                {creating ? "Abrindo..." : "Assinar Pro"}
                                            </button>
                                        )}
                                    </section>
                                </div>

                                <p className="page-caption">
                                    O checkout e o portal do assinante usam Stripe. Em caso de dúvida comercial, use <strong>{siteProfile.supportEmail}</strong> ou consulte a{" "}
                                    <Link to="/cancellation-policy">política de cancelamento</Link>.
                                </p>
                            </Card>

                            <Card title="Comprovante e nota fiscal">
                                <div className="billing-active-note">
                                    <strong>Informação fiscal importante</strong>
                                    <span>{siteProfile.invoiceNotice}</span>
                                    <span>
                                        Se você precisa obrigatoriamente de nota fiscal para contratar, fale antes com <strong>{siteProfile.supportEmail}</strong>.
                                    </span>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <AppFooter />
        </div>
    );
}
