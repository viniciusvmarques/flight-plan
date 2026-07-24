import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "../i18n/I18nContext.jsx";

/**
 * Nav cockpit (Modelo B) — faixa fina sob o ATIS, sem logo duplicado.
 */
export default function AppHeader({ hideMobileMenu = false }) {
    const nav = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { t } = useI18n();
    const [menuOpen, setMenuOpen] = useState(false);

    const simuladosTarget = user ? "/simulados" : "/register?next=/simulados";

    const navItems = useMemo(() => {
        const gate = (path) => (user ? path : `/register?next=${encodeURIComponent(path)}`);
        const items = [
            { key: "briefing", to: "/", label: t("appHeader.briefing") },
            { key: "weather", to: "/weather", label: t("weather.nav"), free: true },
            { key: "tools", to: gate("/tools"), label: t("appHeader.tools") },
            { key: "computer", to: gate("/computador"), label: t("flightComputer.nav") },
            { key: "quiz", to: gate("/quiz"), label: t("quiz.nav"), accent: true },
            { key: "exams", to: simuladosTarget, label: t("exams.nav") },
            { key: "summaries", to: "/resumos", label: t("summaries.nav"), free: true },
        ];
        if (user) {
            items.push(
                { key: "account", to: "/perfil", label: t("common.account") },
                { key: "billing", to: "/assinatura", label: t("common.billing") }
            );
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
        if (e) e.preventDefault();
        setMenuOpen(false);
        if (user) {
            nav("/simulados");
            return;
        }
        nav("/register?next=/simulados");
    }

    function closeMenu() {
        setMenuOpen(false);
    }

    function handleLogout() {
        setMenuOpen(false);
        logout();
        nav("/");
    }

    function isActive(to) {
        if (to === "/") return location.pathname === "/" || location.pathname === "/briefing";
        return location.pathname === to || location.pathname.startsWith(`${to}/`);
    }

    return (
        <header className={`ck-navbar${hideMobileMenu ? " ck-navbar--no-mobile" : ""}`} role="banner">
            <div className="ck-navbar-inner">
                <nav className="ck-nav ck-nav--desktop" aria-label={t("appHeader.navLabel")}>
                    {navItems.map((item) =>
                        item.key === "exams" && !user ? (
                            <Link
                                key={item.key}
                                className={`ck-nav-link${item.accent ? " ck-nav-link--accent" : ""}`}
                                to="/"
                                onClick={goSimulados}
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <Link
                                key={item.key}
                                className={[
                                    "ck-nav-link",
                                    item.accent ? "ck-nav-link--accent" : "",
                                    isActive(item.to) ? "is-active" : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                                to={item.to}
                            >
                                {item.label}
                            </Link>
                        )
                    )}
                </nav>

                <div className="ck-navbar-tools">
                    {user ? (
                        <button type="button" className="ck-nav-logout ck-nav-logout--desktop" onClick={handleLogout}>
                            {t("common.logout")}
                        </button>
                    ) : null}
                    <LanguageSwitcher compact />
                    {!hideMobileMenu ? (
                        <button
                            type="button"
                            className={`ck-nav-burger${menuOpen ? " is-open" : ""}`}
                            aria-expanded={menuOpen}
                            aria-controls="ck-mobile-nav"
                            onClick={() => setMenuOpen((open) => !open)}
                        >
                            <span aria-hidden="true" />
                            <span aria-hidden="true" />
                            <span aria-hidden="true" />
                            <span className="sr-only">
                                {menuOpen ? t("appHeader.menuClose") : t("appHeader.menuOpen")}
                            </span>
                        </button>
                    ) : null}
                </div>
            </div>

            {!hideMobileMenu ? (
                <div
                    id="ck-mobile-nav"
                    className={`ck-mobile-nav${menuOpen ? " is-open" : ""}`}
                    aria-hidden={!menuOpen}
                >
                    <button
                        type="button"
                        className="ck-mobile-nav-backdrop"
                        aria-label={t("appHeader.menuClose")}
                        onClick={closeMenu}
                    />
                    <div className="ck-mobile-nav-panel" role="dialog" aria-modal="true" aria-label={t("appHeader.navLabel")}>
                        <div className="ck-mobile-nav-head">
                            <strong>{t("appHeader.menuTitle")}</strong>
                            <button type="button" className="ck-mobile-nav-close" onClick={closeMenu}>
                                ×
                            </button>
                        </div>
                        <nav className="ck-mobile-nav-links">
                            {navItems.map((item) =>
                                item.key === "exams" && !user ? (
                                    <Link
                                        key={item.key}
                                        className={`ck-mobile-nav-link${item.accent ? " ck-nav-link--accent" : ""}`}
                                        to="/"
                                        onClick={goSimulados}
                                    >
                                        {item.label}
                                    </Link>
                                ) : (
                                    <Link
                                        key={item.key}
                                        className={`ck-mobile-nav-link${item.accent ? " ck-nav-link--accent" : ""}`}
                                        to={item.to}
                                        onClick={closeMenu}
                                    >
                                        {item.label}
                                    </Link>
                                )
                            )}
                        </nav>
                        {user ? (
                            <button type="button" className="ck-nav-logout ck-nav-logout--mobile" onClick={handleLogout}>
                                {t("common.logout")}
                            </button>
                        ) : null}
                        <div className="ck-mobile-nav-lang">
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            ) : null}
        </header>
    );
}
