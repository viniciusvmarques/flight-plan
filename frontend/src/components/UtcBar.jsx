import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext.jsx";
import MarquisaMark from "./MarquisaMark";

function formatUtcClock(date) {
    const hh = String(date.getUTCHours()).padStart(2, "0");
    const mm = String(date.getUTCMinutes()).padStart(2, "0");
    const ss = String(date.getUTCSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}Z`;
}

export default function UtcBar({ showAtis = true }) {
    const nav = useNavigate();
    const { user, logout } = useAuth();
    const { t } = useI18n();
    const [utc, setUtc] = useState(() => formatUtcClock(new Date()));

    useEffect(() => {
        const id = window.setInterval(() => setUtc(formatUtcClock(new Date())), 1000);
        return () => window.clearInterval(id);
    }, []);

    function handleLogout() {
        logout();
        nav("/");
    }

    return (
        <>
            <div className="av-utc-bar" aria-live="polite">
                <div className="av-utc-brand">
                    <button
                        type="button"
                        className="av-utc-badge"
                        aria-label="Marquisa"
                        onClick={() => nav("/")}
                    >
                        <MarquisaMark size={22} />
                    </button>
                    <div>
                        <div className="av-utc-brand-name">Marquisa</div>
                        <div className="av-utc-brand-sub">Ops · Glass cockpit</div>
                    </div>
                </div>
                <div className="av-utc-clock-wrap">
                    <time className="av-utc-clock" dateTime={new Date().toISOString()}>
                        {utc}
                    </time>
                    <div className="av-utc-label">UTC · Zulu time</div>
                </div>
                <div className="av-utc-actions">
                    {user ? (
                        <>
                            <span className="av-utc-tag">Station online</span>
                            <Link className="av-utc-btn av-utc-btn--ghost" to="/perfil">
                                {t("common.account")}
                            </Link>
                            <Link className="av-utc-btn av-utc-btn--cyan" to="/assinatura">
                                PRO
                            </Link>
                            <button type="button" className="av-utc-btn av-utc-btn--ghost" onClick={handleLogout}>
                                {t("common.logout")}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link className="av-utc-btn av-utc-btn--ghost" to="/login">
                                {t("common.login")}
                            </Link>
                            <Link className="av-utc-btn av-utc-btn--cyan" to="/register">
                                {t("common.register")}
                            </Link>
                        </>
                    )}
                </div>
            </div>
            {showAtis ? (
                <div className="av-atis-bar" aria-label="ATIS">
                    <span>
                        ATIS <b>BRAVO</b>
                    </span>
                    <span>
                        QNH <b>1018</b>
                    </span>
                    <span>
                        RWY <b>09L / 27R</b>
                    </span>
                    <span>
                        TWR <b>118.400</b>
                    </span>
                    <span>
                        SQUAWK <b>1200</b>
                    </span>
                </div>
            ) : null}
        </>
    );
}
