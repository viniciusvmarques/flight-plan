import { Link, useNavigate } from "react-router-dom";
import BrandMark from "./Brandmark";
import { useAuth } from "../auth/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function AppHeader({ kicker = "Marquisa", title = "", subtitle = "" }) {
    const nav = useNavigate();
    const { user } = useAuth();
    const { t } = useI18n();

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

                <nav className="fp-topbar-nav" aria-label="Principal">
                    <Link className="fp-nav-link" to="/">
                        {t("appHeader.briefing")}
                    </Link>
                    <Link className="fp-nav-link" to="/simulados">
                        {t("exams.nav")}
                    </Link>
                    {user ? (
                        <>
                            <Link className="fp-nav-link" to="/perfil">
                                {t("common.account")}
                            </Link>
                            <Link className="fp-nav-link" to="/assinatura">
                                {t("common.billing")}
                            </Link>
                        </>
                    ) : (
                        <Link className="fp-nav-link fp-nav-link--accent" to="/login">
                            {t("common.login")}
                        </Link>
                    )}
                    <LanguageSwitcher compact />
                </nav>
            </div>
        </header>
    );
}
