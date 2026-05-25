import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import Card from "../components/Card";
import GrowthPageHero from "../components/GrowthPageHero";
import GrowthCtaBar from "../components/GrowthCtaBar";
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
    const bullets = (t(`seo.${key}.bullets`) || "").split("|").filter(Boolean);

    useEffect(() => {
        document.title = t(`seo.${key}.documentTitle`);
    }, [key, t]);

    return (
        <div className="main-shell">
            <AppHeader title={t(`seo.${key}.headerTitle`)} subtitle={t(`seo.${key}.headerSubtitle`)} />
            <main className="main-scroll growth-page">
                <GrowthPageHero
                    kicker="Marquisa"
                    title={t(`seo.${key}.heroTitle`)}
                    copy={t(`seo.${key}.heroCopy`)}
                />

                <Card title={t(`seo.${key}.sectionTitle`)}>
                    <p className="growth-section-lead">{t(`seo.${key}.sectionCopy`)}</p>
                    <ul className="growth-feature-list">
                        {bullets.map((item) => (
                            <li key={item}>
                                <span className="growth-feature-check" aria-hidden="true">
                                    ✓
                                </span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </Card>

                <GrowthCtaBar
                    secondaryLabel={t(`seo.${key}.secondaryCta`)}
                    primaryLabel={t(`seo.${key}.primaryCta`)}
                    onSecondary={() => nav(SEO_ROUTES[key].secondary)}
                    onPrimary={() => nav(SEO_ROUTES[key].primary)}
                />
            </main>
            <AppFooter />
        </div>
    );
}
