import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BrandMark from "./Brandmark";
import { useAuth } from "../auth/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function AppHeader({ kicker = "Marquisa", title = "", subtitle = "" }) {
    const nav = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { t } = useI18n();
    const [menuOpen, setMenuOpen] = useState(false);

    const simuladosTarget = user ? "/simulados" : "/#simulados";

    const navItems = useMemo(() => {
        const items = [
            { key: "briefing", to: "/", label: t("appHeader.briefing") },
            { key: "weather", to: "/weather", label: t("weather.nav") },
            { key: "tools", to: "/tools", label: t("appHeader.tools") },
            { key: "computer", to: "/computador", label: t("flightComputer.nav") },
            { key: "quiz", to: "/quiz", label: t("quiz.nav"), accent: true },
            { key: "exams", to: simuladosTarget, label: t("exams.nav") },
        ];
        if (user) {
            items.push(
                { key: "account", to: "/perfil", label: t("common.account") },
                { key: "billing", to: "/assinatura", label: t("common.billing") }
            );
        } else {
            items.push({ key: "login", to: "/login", label: t("common.login"), accent: true });
        }
        return items;
    }, [t, user, simuladosTarget]);

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname, location.hash]);

    useEffect(() => {
        if (!menuOpen) return undefined;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [menuOpen]);

    function goSimulados(e) {
        if (user) return;
        e.preventDefault();
        setMenuOpen(false);
        if (location.pathname === "/") {
            window.location.hash = "simulados";
            document.getElementById("simulados")?.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }
        nav("/#simulados");
    }

    function closeMenu() {
        setMenuOpen(false);
    }

    return (
        <header className="fp-topbar" role="banner">
            <div className="fp-topbar-inner">
                <button type="button" className="fp-topbar-brand" onClick={() => nav("/")} aria-label={t("appHeader.goToBriefing")}>
                    <BrandMark size={38} showText={false} compact />
                    <div className="fp-topbar-titles">
                        <span className="fp-topbar-kicker">{kicker}</span>
                        <span className="fp-topbar-title">{title || t("appHeader.defaultTitle")}</span>
                        {subtitle ? <span className="fp-topbar-sub">{subtitle}</span> : null}
                    </div>
                </button>

                <button
                    type="button"
                    className="fp-topbar-menu-btn"
                    aria-expanded={menuOpen}
                    aria-controls="fp-mobile-nav"
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <span className="fp-topbar-menu-icon" aria-hidden="true" />
                    <span className="sr-only">{menuOpen ? t("appHeader.menuClose") : t("appHeader.menuOpen")}</span>
                </button>

                <nav className="fp-topbar-nav fp-topbar-nav--desktop" aria-label={t("appHeader.navLabel")}>
                    {navItems.map((item) =>
                        item.key === "exams" && !user ? (
                            <Link
                                key={item.key}
                                className="fp-nav-link"
                                to="/"
                                onClick={goSimulados}
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <Link
                                key={item.key}
                                className={[
                                    "fp-nav-link",
                                    item.accent ? "fp-nav-link--accent" : "",
                                ].join(" ")}
                                to={item.to}
                            >
                                {item.label}
                            </Link>
                        )
                    )}
                    <LanguageSwitcher compact />
                </nav>
            </div>

            <div
                id="fp-mobile-nav"
                className={`fp-mobile-nav ${menuOpen ? "fp-mobile-nav--open" : ""}`}
                aria-hidden={!menuOpen}
            >
                <button
                    type="button"
                    className="fp-mobile-nav-backdrop"
                    aria-label={t("appHeader.menuClose")}
                    onClick={closeMenu}
                />
                <div className="fp-mobile-nav-panel" role="dialog" aria-modal="true" aria-label={t("appHeader.navLabel")}>
                    <div className="fp-mobile-nav-head">
                        <strong>{t("appHeader.menuTitle")}</strong>
                        <button type="button" className="fp-mobile-nav-close" onClick={closeMenu}>
                            ×
                        </button>
                    </div>
                    <nav className="fp-mobile-nav-links">
                        {navItems.map((item) =>
                            item.key === "exams" && !user ? (
                                <Link
                                    key={item.key}
                                    className={`fp-mobile-nav-link ${item.accent ? "fp-mobile-nav-link--accent" : ""}`}
                                    to="/"
                                    onClick={goSimulados}
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <Link
                                    key={item.key}
                                    className={`fp-mobile-nav-link ${item.accent ? "fp-mobile-nav-link--accent" : ""}`}
                                    to={item.to}
                                    onClick={closeMenu}
                                >
                                    {item.label}
                                </Link>
                            )
                        )}
                    </nav>
                    <div className="fp-mobile-nav-lang">
                        <LanguageSwitcher />
                    </div>
                </div>
            </div>
        </header>
    );
}
