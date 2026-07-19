import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext.jsx";

/**
 * Painel de rota A-B-C no estilo glass cockpit (substitui a sidebar antiga).
 */
export default function OpsRoutePanel({ onBrief, loading = false }) {
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
        if (!user) {
            nav("/register");
            return;
        }
        if (!onBrief) return;
        onBrief(origin, dest, alternate);
    }

    const plan = user?.plan ? String(user.plan).toUpperCase() : "FREE";

    return (
        <section className="ck-ops-panel card fp-card">
            <div className="card-body">
                <span className="av-kicker exam-kicker">{t("sidebar.eyebrow")}</span>
                <h2 className="ck-ops-title">{t("sidebar.title")}</h2>
                <p className="ck-ops-lead">{t("sidebar.lead")}</p>

                <form className="ck-ops-form" onSubmit={onSubmit}>
                    <label className="ck-ops-field">
                        <span>
                            <em>A</em> {t("sidebar.originLabel")}
                        </span>
                        <input
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value.toUpperCase().slice(0, 4))}
                            placeholder="SBSP"
                            maxLength={4}
                            autoComplete="off"
                            spellCheck={false}
                            required
                        />
                    </label>
                    <label className="ck-ops-field">
                        <span>
                            <em>B</em> {t("sidebar.destLabel")}
                        </span>
                        <input
                            value={dest}
                            onChange={(e) => setDest(e.target.value.toUpperCase().slice(0, 4))}
                            placeholder="SBGR"
                            maxLength={4}
                            autoComplete="off"
                            spellCheck={false}
                        />
                    </label>
                    <label className="ck-ops-field">
                        <span>
                            <em>C</em> {t("sidebar.alternateLabel")}
                        </span>
                        <input
                            value={alternate}
                            onChange={(e) => setAlternate(e.target.value.toUpperCase().slice(0, 4))}
                            placeholder="SBMT"
                            maxLength={4}
                            autoComplete="off"
                            spellCheck={false}
                        />
                    </label>
                    <button type="submit" className="primary ck-ops-submit" disabled={loading}>
                        {loading ? t("common.loading") : t("sidebar.submit")}
                    </button>
                </form>

                {user ? (
                    <div className="ck-ops-account">
                        <div className="ck-ops-account-row">
                            <span title={user.email}>{user.email}</span>
                            <span className={`ck-tag${plan === "PRO" ? " ck-tag--amber" : ""}`}>{plan}</span>
                        </div>
                        <div className="ck-ops-account-actions">
                            <Link to="/perfil">{t("sidebar.profile")}</Link>
                            <Link to="/assinatura">{t("sidebar.billing")}</Link>
                            <button
                                type="button"
                                onClick={() => {
                                    logout();
                                    nav("/");
                                }}
                            >
                                {t("sidebar.logout")}
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </section>
    );
}
