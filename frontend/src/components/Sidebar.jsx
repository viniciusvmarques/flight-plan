import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext.jsx";

function RouteFieldLabel({ code, children, required = false }) {
    return (
        <span className="route-field-label">
            <span className="route-field-code">{code}</span>
            <span>{children}</span>
            {required ? <span className="route-field-required">*</span> : null}
        </span>
    );
}

export default function Sidebar({ onBrief, children }) {
    const { user, logout } = useAuth();
    const nav = useNavigate();
    const { t } = useI18n();

    const [origin, setOrigin] = useState("");
    const [dest, setDest] = useState("");
    const [alternate, setAlternate] = useState("");

    useEffect(() => {
        try {
            const raw = localStorage.getItem("fp_last_briefing");
            if (!raw) return;
            const j = JSON.parse(raw);
            if (j?.origin?.icao) setOrigin(j.origin.icao);
            if (j?.dest?.icao) setDest(j.dest.icao);
            if (j?.alternate?.icao) setAlternate(j.alternate.icao);
        } catch {
            /* ignore */
        }
    }, []);

    function onSubmit(e) {
        e.preventDefault();
        if (!onBrief) return;
        onBrief(origin, dest, alternate);
    }

    const plan = user?.plan ? String(user.plan).toUpperCase() : "FREE";

    return (
        <aside className="fp-sidebar" aria-label={t("sidebar.aria")}>
            <div className="fp-sidebar-inner">
                <div className="fp-sidebar-head">
                    <div className="fp-sidebar-eyebrow">{t("sidebar.eyebrow")}</div>
                    <div className="fp-sidebar-caption">{t("sidebar.caption")}</div>
                </div>

                <form className="fp-brief-form" onSubmit={onSubmit}>
                    <h2 className="fp-sidebar-title">{t("sidebar.title")}</h2>
                    <p className="fp-sidebar-lead">{t("sidebar.lead")}</p>

                    <div className="field">
                        <label htmlFor="fp-origin">
                            <RouteFieldLabel code="A" required>
                                {t("sidebar.originLabel")}
                            </RouteFieldLabel>
                        </label>
                        <input
                            id="fp-origin"
                            className="input"
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                            placeholder="SBSP"
                            maxLength={4}
                            autoComplete="off"
                            spellCheck={false}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="fp-dest">
                            <RouteFieldLabel code="B">{t("sidebar.destLabel")}</RouteFieldLabel>
                        </label>
                        <input
                            id="fp-dest"
                            className="input"
                            value={dest}
                            onChange={(e) => setDest(e.target.value.toUpperCase())}
                            placeholder="SBGR"
                            maxLength={4}
                            autoComplete="off"
                            spellCheck={false}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="fp-alt">
                            <RouteFieldLabel code="C">{t("sidebar.alternateLabel")}</RouteFieldLabel>
                        </label>
                        <input
                            id="fp-alt"
                            className="input"
                            value={alternate}
                            onChange={(e) => setAlternate(e.target.value.toUpperCase())}
                            placeholder="SBMT"
                            maxLength={4}
                            autoComplete="off"
                            spellCheck={false}
                        />
                    </div>

                    <button type="submit" className="primary">
                        {t("sidebar.submit")}
                    </button>
                </form>

                {children}

                <div className="fp-sidebar-account">
                    {user ? (
                        <>
                            <div className="fp-account-row">
                                <span className="fp-account-email" title={user.email}>
                                    {user.email}
                                </span>
                                <span className={`fp-plan-pill fp-plan-pill--${plan === "PRO" ? "pro" : "free"}`}>{plan}</span>
                            </div>
                            <div className="fp-account-actions">
                                <Link className="fp-link-btn" to="/perfil">
                                    {t("sidebar.profile")}
                                </Link>
                                <Link className="fp-link-btn" to="/assinatura">
                                    {t("sidebar.billing")}
                                </Link>
                                <button
                                    type="button"
                                    className="fp-link-btn fp-link-btn--ghost"
                                    onClick={() => {
                                        logout();
                                        nav("/");
                                    }}
                                >
                                    {t("sidebar.logout")}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="fp-sidebar-lead">{t("dashboard.loginRequired")}</p>
                            <div className="fp-account-actions">
                                <Link className="fp-link-btn fp-link-btn--primary" to="/login">
                                    {t("sidebar.login")}
                                </Link>
                                <Link className="fp-link-btn" to="/register">
                                    {t("auth.createAccount")}
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </aside>
    );
}
