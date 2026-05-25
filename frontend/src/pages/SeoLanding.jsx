import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import Card from "../components/Card";
import { useI18n } from "../i18n/I18nContext.jsx";

const PAGE_KEYS = ["metar", "planning", "pp", "cms"];

const SEO_ROUTES = {
    metar: { primary: "/weather?icao=SBGR", secondary: "/tools" },
    planning: { primary: "/", secondary: "/weather" },
    pp: { primary: "/quiz", secondary: "/register" },
    cms: { primary: "/quiz", secondary: "/#simulados" },
};

export default function SeoLanding({ pageKey = "metar" }) {
    const nav = useNavigate();
    const { t } = useI18n();
    const key = PAGE_KEYS.includes(pageKey) ? pageKey : "metar";

    useEffect(() => {
        document.title = t(`seo.${key}.documentTitle`);
    }, [key, t]);

    return (
        <div className="main-shell">
            <AppHeader title={t(`seo.${key}.headerTitle`)} subtitle={t(`seo.${key}.headerSubtitle`)} />
            <main className="main-scroll seo-landing">
                <section className="public-tool-hero">
                    <h1>{t(`seo.${key}.heroTitle`)}</h1>
                    <p>{t(`seo.${key}.heroCopy`)}</p>
                </section>
                <Card title={t(`seo.${key}.sectionTitle`)}>
                    <p>{t(`seo.${key}.sectionCopy`)}</p>
                    <ul className="seo-landing-list">
                        {(t(`seo.${key}.bullets`) || "").split("|").filter(Boolean).map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </Card>
                <div className="public-tool-cta">
                    <button type="button" className="secondary" onClick={() => nav(SEO_ROUTES[key].secondary)}>
                        {t(`seo.${key}.secondaryCta`)}
                    </button>
                    <button type="button" className="primary" onClick={() => nav(SEO_ROUTES[key].primary)}>
                        {t(`seo.${key}.primaryCta`)}
                    </button>
                </div>
            </main>
            <AppFooter />
        </div>
    );
}
