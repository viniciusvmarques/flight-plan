import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import AppFooter from "../components/AppFooter";
import AppHeader from "../components/AppHeader";
import AircraftProfilesManager from "../components/AircraftProfilesManager";
import { useAuth } from "../auth/AuthContext";
import { api } from "../services/apiClient";
import { useNotify } from "../ui/NotifyContext.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";

function loadJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}
function saveJSON(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
}
function fmtDate(iso) {
    try {
        return new Date(iso).toLocaleString();
    } catch {
        return iso;
    }
}

export default function Profile() {
    const nav = useNavigate();
    const { toast, confirm } = useNotify();
    const { user, logout } = useAuth();
    const { t } = useI18n();

    useEffect(() => {
        if (!user) nav("/login");
    }, [user, nav]);

    const prefKey = useMemo(() => (user ? `fp_profile_${user.id}` : null), [user]);

    const prefs = useMemo(() => (prefKey ? loadJSON(prefKey, {}) : {}), [prefKey]);

    const [name, setName] = useState(prefs.name || user?.name || "");
    const [track, setTrack] = useState(prefs.track || user?.track || "PP");

    const [favs, setFavs] = useState([]);
    const [briefings, setBriefings] = useState([]);

    useEffect(() => {
        if (!user) return;
        const plan = String(user?.plan || "FREE").toUpperCase();
        if (plan !== "PRO") {
            setFavs([]);
            setBriefings([]);
            return;
        }
        api("/api/favorites").then((r) => setFavs(r.items || [])).catch(() => setFavs([]));
        api("/api/briefings").then((r) => setBriefings(r.items || [])).catch(() => setBriefings([]));
    }, [user]);

    function savePrefs() {
        if (!prefKey) return;
        saveJSON(prefKey, { name, track });
        toast("Suas preferências foram atualizadas neste dispositivo.", { variant: "success", title: "Preferências" });
    }

    async function clearBriefings() {
        if (!user) return;
        const plan = String(user?.plan || "FREE").toUpperCase();
        if (plan !== "PRO") {
            toast("Histórico na nuvem está disponível no plano PRO.", { variant: "warning", title: "Plano PRO" });
            return;
        }
        const ok = await confirm({
            title: "Apagar histórico",
            message: "Todos os briefings salvos serão removidos permanentemente. Esta ação não pode ser desfeita.",
            confirmLabel: "Apagar",
            cancelLabel: "Cancelar",
            danger: true,
        });
        if (!ok) return;
        Promise.all((briefings || []).map((b) => api(`/api/briefings/${b.id}`, { method: "DELETE" }).catch(() => null)))
            .then(() => {
                setBriefings([]);
                toast("O histórico de briefings foi limpo.", { variant: "success", title: "Concluído" });
            })
            .catch((e) =>
                toast(e?.message || "Não foi possível apagar o histórico.", { variant: "error", title: "Erro" })
            );
    }

    async function clearFavs() {
        if (!user) return;
        const plan = String(user?.plan || "FREE").toUpperCase();
        if (plan !== "PRO") {
            toast("Favoritos sincronizados exigem o plano PRO.", { variant: "warning", title: "Plano PRO" });
            return;
        }
        const ok = await confirm({
            title: "Apagar favoritos",
            message: "Todos os aeródromos favoritos serão removidos da sua conta.",
            confirmLabel: "Apagar",
            cancelLabel: "Cancelar",
            danger: true,
        });
        if (!ok) return;
        Promise.all((favs || []).map((f) => api(`/api/favorites/${f.icao}`, { method: "DELETE" }).catch(() => null)))
            .then(() => {
                setFavs([]);
                toast("Seus favoritos foram removidos.", { variant: "success", title: "Concluído" });
            })
            .catch((e) =>
                toast(e?.message || "Não foi possível apagar os favoritos.", { variant: "error", title: "Erro" })
            );
    }

    async function deleteAccount() {
        if (!user) return;
        const ok = await confirm({
            title: "Excluir conta",
            message:
                `Esta ação apaga sua conta, briefings salvos, favoritos e perfis de aeronave. ${t("common.subscriptionDeletionNotice")} Deseja continuar?`,
            confirmLabel: "Continuar",
            cancelLabel: "Cancelar",
            danger: true,
        });
        if (!ok) return;

        const typed = window.prompt(`Para confirmar a exclusão definitiva, digite seu e-mail: ${user.email}`);
        if (String(typed || "").trim().toLowerCase() !== String(user.email || "").toLowerCase()) {
            toast("Exclusão cancelada. O e-mail digitado não confere.", { variant: "warning", title: "Confirmação inválida" });
            return;
        }

        try {
            await api("/me", { method: "DELETE", body: { email: user.email } });
            localStorage.removeItem("fp_last_briefing");
            localStorage.removeItem("fp_planner_seed");
            if (prefKey) localStorage.removeItem(prefKey);
            logout();
            toast("Sua conta foi excluída.", { variant: "success", title: "Conta excluída" });
            nav("/login");
        } catch (e) {
            const message =
                e?.message ||
                "Não foi possível excluir a conta agora. Se houver assinatura ativa, cancele primeiro na área de assinatura.";
            toast(message, { variant: "error", title: "Erro ao excluir conta" });
        }
    }

    function openBriefing(b) {
        const d = b?.data || b; // compat
        saveJSON("fp_pending_brief_request", {
            origin: d.origin,
            dest: d.dest || "",
            alt: d.alt || "",
            plan: d.plan || null,
        });
        nav("/");
    }


    if (!user) return null;

    const plan = String(user.plan || "FREE").toUpperCase();

    return (
        <div className="main-shell">
            <AppHeader
                kicker={t("profile.kicker")}
                title={t("profile.title")}
                subtitle={t("profile.subtitle")}
            />

            <div className="main-scroll">
                <div className="page-shell">
                    <section className="page-hero">
                        <div className="page-hero-head">
                            <div className="page-hero-copy">
                                <span className="page-eyebrow">{t("profile.eyebrow")}</span>
                                <h1 className="page-title">{t("profile.heroTitle")}</h1>
                                <p className="page-caption">
                                    {t("profile.heroCaption")}
                                </p>
                            </div>

                            <div className="page-actions">
                                <button className="secondary" type="button" onClick={() => nav("/")}>
                                    {t("common.dashboard")}
                                </button>
                                <button className="secondary" type="button" onClick={() => nav("/assinatura")}>
                                    {t("common.billing")}
                                </button>
                            </div>
                        </div>

                        <div className="page-chip-row">
                            <span className="chip">{user.email}</span>
                            <span className="chip ok">Conta ativa</span>
                            <span className={`chip ${plan === "PRO" ? "ok" : ""}`}>Plano: {plan}</span>
                            <span className="chip">Trilha: {track}</span>
                        </div>
                    </section>

                    <div className="page-grid">
                        <div className="page-stack">
                            <Card title={t("profile.pilotProfile")}>
                                <div className="info-stack">
                                    <div className="plan-grid plan-grid--2">
                                        <label className="plan-field">
                                            <span className="label">{t("profile.namePreference")}</span>
                                            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
                                        </label>

                                        <label className="plan-field">
                                            <span className="label">{t("profile.trackPreference")}</span>
                                            <select className="input" value={track} onChange={(e) => setTrack(e.target.value)}>
                                                <option value="PP">PP</option>
                                                <option value="PC">PC</option>
                                                <option value="IFR">IFR</option>
                                                <option value="PLA">PLA</option>
                                                <option value="Aluno">Aluno</option>
                                            </select>
                                        </label>
                                    </div>

                                    <div className="page-chip-row">
                                        <span className="chip">{user.email}</span>
                                        <span className={`chip ${plan === "PRO" ? "ok" : ""}`}>{plan}</span>
                                    </div>

                                    <div className="page-actions">
                                        <button className="primary profile-primary-action" type="button" onClick={savePrefs}>
                                            {t("profile.savePreferences")}
                                        </button>
                                        <button className="secondary" type="button" onClick={() => nav("/assinatura")}>
                                            {t("profile.viewBilling")}
                                        </button>
                                    </div>

                                    <p className="page-caption">
                                        {t("profile.localPreferenceNote")}
                                    </p>
                                </div>
                            </Card>

                            <AircraftProfilesManager />

                            <Card title={t("profile.savedBriefings", { count: briefings.length })}>
                                {briefings.length === 0 ? (
                                    <div className="empty-note">
                                        {t("profile.noBriefings")}
                                    </div>
                                ) : (
                                    <div className="list-stack">
                                        {briefings.slice(0, 15).map((b) => (
                                            <button
                                                key={b.id}
                                                type="button"
                                                className="list-card-button"
                                                onClick={() => openBriefing(b)}
                                                title="Abrir este briefing no Dashboard"
                                            >
                                                <div className="page-chip-row">
                                                    <span className="chip">
                                                        {b.data?.origin || ""}
                                                        {b.data?.dest ? ` → ${b.data.dest}` : ""}
                                                    </span>
                                                    {b.data?.alt ? <span className="chip warn">ALT {b.data.alt}</span> : <span className="chip">Sem ALT</span>}
                                                    {b.data?.aircraft?.label ? <span className="chip ok">{b.data.aircraft.label}</span> : null}
                                                    <span className="chip ok">{t("profile.openDashboard")}</span>
                                                </div>
                                                <div className="list-card-meta">{fmtDate(b.data?.at || b.createdAt)}</div>
                                            </button>
                                        ))}

                                        <div className="page-actions">
                                            <button className="secondary" type="button" onClick={clearBriefings}>
                                                {t("profile.deleteHistory")}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>

                        <div className="page-stack">
                            <Card title={t("profile.billingTitle")}>
                                <div className="info-stack">
                                    <div className="page-chip-row">
                                        <span className={`chip ${plan === "PRO" ? "ok" : ""}`}>Plano: {plan}</span>
                                    </div>
                                    <p className="page-caption">
                                        {t("profile.billingText")}
                                    </p>
                                    <button className="secondary" type="button" onClick={() => nav("/assinatura")}>
                                        {t("billing.manageSubscription")}
                                    </button>
                                </div>
                            </Card>

                            <Card title={t("profile.favorites", { count: favs.length })}>
                                <div className="info-stack">
                                    {favs.length === 0 ? (
                                        <div className="empty-note">{t("profile.noFavorites")}</div>
                                    ) : (
                                        <div className="page-chip-row">
                                            {favs.slice(0, 40).map((f) => (
                                                <span key={f.id || f.icao} className="chip">
                                                    {f.icao}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <button className="secondary" type="button" onClick={clearFavs}>
                                        {t("profile.deleteFavorites")}
                                    </button>
                                </div>
                            </Card>

                            <Card title={t("profile.security")}>
                                <div className="info-stack">
                                    <p className="page-caption">
                                        {t("profile.securityText")}
                                    </p>
                                    <button className="secondary" type="button" onClick={() => nav("/forgot")}>
                                        {t("profile.resetByEmail")}
                                    </button>
                                </div>
                            </Card>

                            <Card title={t("profile.deleteAccountTitle")}>
                                <div className="info-stack account-danger-zone">
                                    <p className="page-caption">
                                        {t("profile.deleteAccountText")}
                                    </p>
                                    <p className="page-caption">
                                        {t("common.subscriptionDeletionNotice")}
                                    </p>
                                    <p className="page-caption">
                                        {t("common.dataRetentionNotice")}
                                    </p>
                                    <button className="secondary danger-action" type="button" onClick={deleteAccount}>
                                        {t("profile.deleteMyAccount")}
                                    </button>
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
