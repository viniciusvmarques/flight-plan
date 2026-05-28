import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import GrowthCtaBar from "../components/GrowthCtaBar";
import {
    ExperienceHero,
    ExperiencePageStack,
    ResultHighlight,
    ToolNavCard,
    WorkbenchCard,
} from "../components/experience/ExperienceUI";
import { useI18n } from "../i18n/I18nContext.jsx";
import { computeRunwayWindComponents } from "../utils/flightComputer";

function toNumber(value, fallback = 0) {
    const n = Number.parseFloat(String(value).replace(",", "."));
    return Number.isFinite(n) ? n : fallback;
}

function Field({ label, value, onChange }) {
    return (
        <label className="growth-field">
            <span>{label}</span>
            <input value={value} onChange={(e) => onChange(e.target.value)} inputMode="decimal" />
        </label>
    );
}

export default function Tools() {
    const nav = useNavigate();
    const { t } = useI18n();
    const [activeTool, setActiveTool] = useState("crosswind");

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

    const headLabel =
        Number(crosswind.head) < 0 ? `${crosswind.head} kt (${t("tools.tailwindShort")})` : `${crosswind.head} kt`;

    return (
        <div className="main-shell">
            <AppHeader compact />
            <main className="main-scroll growth-page experience-surface xp-tools-layout">
                <ExperiencePageStack>
                <ExperienceHero kicker={t("tools.title")} title={t("tools.heroTitle")} copy={t("tools.heroCopy")} statValue="2" statLabel={t("tools.subtitle")} />

                <div className="xp-tool-nav-row">
                    <ToolNavCard
                        active={activeTool === "crosswind"}
                        icon="↔"
                        title={t("tools.crosswindTitle")}
                        description={t("tools.crosswindNavHint")}
                        onClick={() => setActiveTool("crosswind")}
                    />
                    <ToolNavCard
                        active={activeTool === "fuel"}
                        icon="⛽"
                        title={t("tools.fuelTitle")}
                        description={t("tools.fuelNavHint")}
                        onClick={() => setActiveTool("fuel")}
                    />
                </div>

                {activeTool === "crosswind" ? (
                    <WorkbenchCard
                        title={t("tools.crosswindTitle")}
                        lead={t("tools.crosswindLead")}
                        inputs={
                            <div className="growth-field-grid">
                                <Field label={t("tools.windDir")} value={windDir} onChange={setWindDir} />
                                <Field label={t("tools.windSpeed")} value={windSpeed} onChange={setWindSpeed} />
                                <Field label={t("tools.runway")} value={runway} onChange={setRunway} />
                            </div>
                        }
                        results={
                            <ResultHighlight
                                primaryIndex={0}
                                items={[
                                    { label: t("tools.crosswindLabel"), value: `${crosswind.xw} kt` },
                                    { label: t("tools.headwindLabel"), value: headLabel },
                                    { label: t("tools.runwayHeadingLabel"), value: `${crosswind.runwayHeading}°`, muted: true },
                                    { label: t("tools.angleLabel"), value: `${crosswind.angle}°`, muted: true },
                                ]}
                            />
                        }
                    />
                ) : (
                    <WorkbenchCard
                        title={t("tools.fuelTitle")}
                        lead={t("tools.fuelLead")}
                        inputs={
                            <div className="growth-field-grid growth-field-grid--2">
                                <Field label={t("tools.liters")} value={liters} onChange={setLiters} />
                                <Field label={t("tools.density")} value={density} onChange={setDensity} />
                            </div>
                        }
                        results={
                            <ResultHighlight
                                primaryIndex={0}
                                items={[
                                    { label: t("tools.fuelLbLabel"), value: `${fuel.lb} lb` },
                                    { label: t("tools.fuelGalLabel"), value: `${fuel.usGal} US gal` },
                                ]}
                            />
                        }
                    />
                )}

                <div className="tools-promo-card">
                    <div>
                        <strong>{t("flightComputer.shortTitle")}</strong>
                        <p>{t("flightComputer.toolsPromo")}</p>
                    </div>
                    <button type="button" className="primary" onClick={() => nav("/computador")}>
                        {t("flightComputer.openComputer")}
                    </button>
                </div>

                <GrowthCtaBar
                    secondaryLabel={t("hub.weatherTitle")}
                    primaryLabel={t("hub.quizTitle")}
                    onSecondary={() => nav("/weather")}
                    onPrimary={() => nav("/quiz")}
                />
                </ExperiencePageStack>
            </main>
            <AppFooter />
        </div>
    );
}
