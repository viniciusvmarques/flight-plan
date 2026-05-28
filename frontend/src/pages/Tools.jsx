import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import Card from "../components/Card";
import GrowthPageHero from "../components/GrowthPageHero";
import GrowthCtaBar from "../components/GrowthCtaBar";
import { useI18n } from "../i18n/I18nContext.jsx";
import { computeRunwayWindComponents } from "../utils/flightComputer";

function toNumber(value, fallback = 0) {
    const n = Number.parseFloat(String(value).replace(",", "."));
    return Number.isFinite(n) ? n : fallback;
}

export default function Tools() {
    const nav = useNavigate();
    const { t } = useI18n();

    const [windDir, setWindDir] = useState("270");
    const [windSpeed, setWindSpeed] = useState("12");
    const [runway, setRunway] = useState("09");

    const [liters, setLiters] = useState("100");
    const [density, setDensity] = useState("0.72");

    const crosswind = useMemo(() => {
        const result = computeRunwayWindComponents({ windDir, windSpeed, runway });
        return {
            xw: String(result.crosswindKt),
            head: String(result.headwindKt),
            angle: String(result.angleDeg),
            runwayHeading: result.runwayHeading,
        };
    }, [windDir, windSpeed, runway]);

    const fuel = useMemo(() => {
        const l = toNumber(liters);
        const d = toNumber(density, 0.72);
        const lb = l * d * 2.20462;
        const usGal = l * 0.264172;
        return { lb: lb.toFixed(1), usGal: usGal.toFixed(2) };
    }, [liters, density]);

    return (
        <div className="main-shell">
            <AppHeader title={t("tools.title")} subtitle={t("tools.subtitle")} />
            <main className="main-scroll growth-page">
                <GrowthPageHero kicker={t("tools.title")} title={t("tools.heroTitle")} copy={t("tools.heroCopy")} statValue="2" statLabel={t("tools.subtitle")} />

                <div className="growth-two-col">
                    <Card title={t("tools.crosswindTitle")}>
                        <div className="growth-field-grid">
                            <label className="growth-field">
                                <span>{t("tools.windDir")}</span>
                                <input value={windDir} onChange={(e) => setWindDir(e.target.value)} inputMode="decimal" />
                            </label>
                            <label className="growth-field">
                                <span>{t("tools.windSpeed")}</span>
                                <input value={windSpeed} onChange={(e) => setWindSpeed(e.target.value)} inputMode="decimal" />
                            </label>
                            <label className="growth-field">
                                <span>{t("tools.runway")}</span>
                                <input value={runway} onChange={(e) => setRunway(e.target.value)} inputMode="decimal" />
                            </label>
                        </div>
                        <div className="growth-result-panel">
                            <div className="growth-result-item">
                                <span>{t("tools.crosswindLabel")}</span>
                                <strong>{crosswind.xw} kt</strong>
                            </div>
                            <div className="growth-result-item">
                                <span>{t("tools.headwindLabel")}</span>
                                <strong>
                                    {crosswind.head} kt
                                    {Number(crosswind.head) < 0 ? ` (${t("tools.tailwindShort")})` : ""}
                                </strong>
                            </div>
                            <div className="growth-result-item growth-result-item--muted">
                                <span>{t("tools.runwayHeadingLabel")}</span>
                                <strong>{crosswind.runwayHeading}°</strong>
                            </div>
                            <div className="growth-result-item growth-result-item--muted">
                                <span>{t("tools.angleLabel")}</span>
                                <strong>{crosswind.angle}°</strong>
                            </div>
                        </div>
                    </Card>

                    <Card title={t("tools.fuelTitle")}>
                        <div className="growth-field-grid growth-field-grid--2">
                            <label className="growth-field">
                                <span>{t("tools.liters")}</span>
                                <input value={liters} onChange={(e) => setLiters(e.target.value)} inputMode="decimal" />
                            </label>
                            <label className="growth-field">
                                <span>{t("tools.density")}</span>
                                <input value={density} onChange={(e) => setDensity(e.target.value)} inputMode="decimal" />
                            </label>
                        </div>
                        <div className="growth-result-panel">
                            <div className="growth-result-item">
                                <span>{t("tools.fuelLbLabel")}</span>
                                <strong>{fuel.lb} lb</strong>
                            </div>
                            <div className="growth-result-item">
                                <span>{t("tools.fuelGalLabel")}</span>
                                <strong>{fuel.usGal} US gal</strong>
                            </div>
                        </div>
                    </Card>
                </div>

                <Card title={t("flightComputer.shortTitle")}>
                    <p className="growth-section-lead">{t("flightComputer.toolsPromo")}</p>
                    <button type="button" className="primary" onClick={() => nav("/computador")}>
                        {t("flightComputer.openComputer")}
                    </button>
                </Card>

                <GrowthCtaBar
                    secondaryLabel={t("hub.weatherTitle")}
                    primaryLabel={t("hub.quizTitle")}
                    onSecondary={() => nav("/weather")}
                    onPrimary={() => nav("/quiz")}
                />
            </main>
            <AppFooter />
        </div>
    );
}
