import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AviationShell from "../components/AviationShell";
import GrowthCtaBar from "../components/GrowthCtaBar";
import {
    ExperienceHero,
    ExperiencePageStack,
    ResultHighlight,
    SegmentedControl,
    ToolNavCard,
    WorkbenchCard,
} from "../components/experience/ExperienceUI";
import { useI18n } from "../i18n/I18nContext.jsx";
import {
    computeFuelWeight,
    computePressureAltitude,
    computeRunwayWindComponents,
    convertUnits,
} from "../utils/flightComputer";

function Field({ label, value, onChange, unit, placeholder }) {
    return (
        <label className="growth-field">
            <span>
                {label}
                {unit ? ` (${unit})` : ""}
            </span>
            <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} inputMode="decimal" />
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

    const [liters, setLiters] = useState("90");
    const [density, setDensity] = useState("0.72");

    const [convKind, setConvKind] = useState("speedKt");
    const [convValue, setConvValue] = useState("100");

    const [elevFt, setElevFt] = useState("2500");
    const [qnh, setQnh] = useState("1013");

    const runwayWind = useMemo(
        () => computeRunwayWindComponents({ windDir, windSpeed, runway }),
        [windDir, windSpeed, runway]
    );

    const fuel = useMemo(() => computeFuelWeight({ liters, densityKgPerL: density }), [liters, density]);

    const conversion = useMemo(() => convertUnits({ value: convValue, kind: convKind }), [convValue, convKind]);

    const pressureAlt = useMemo(
        () => computePressureAltitude({ elevationFt: elevFt, qnhHpa: qnh }),
        [elevFt, qnh]
    );

    const headLabel =
        runwayWind.headwindKt < 0
            ? `${runwayWind.headwindKt} kt (${t("tools.tailwindShort")})`
            : `${runwayWind.headwindKt} kt`;

    const crossSide =
        Math.abs(runwayWind.crosswindSignedKt) < 0.05
            ? t("tools.crossCalm")
            : runwayWind.crossFromRight
              ? t("tools.crossFromRight")
              : t("tools.crossFromLeft");

    const conversionResults = (() => {
        if (!conversion) return [];
        switch (convKind) {
            case "massKg":
                return [
                    { label: "kg", value: `${conversion.kg}` },
                    { label: "lb", value: `${conversion.lb}` },
                ];
            case "massLb":
                return [
                    { label: "lb", value: `${conversion.lb}` },
                    { label: "kg", value: `${conversion.kg}` },
                ];
            case "volL":
                return [
                    { label: "L", value: `${conversion.liters}` },
                    { label: "US gal", value: `${conversion.usGal}` },
                    { label: "IMP gal", value: `${conversion.impGal}` },
                ];
            case "speedKt":
                return [
                    { label: "kt", value: `${conversion.kt}` },
                    { label: "km/h", value: `${conversion.kmh}` },
                    { label: "mph", value: `${conversion.mph}` },
                ];
            case "distNm":
                return [
                    { label: "NM", value: `${conversion.nm}` },
                    { label: "km", value: `${conversion.km}` },
                    { label: "SM", value: `${conversion.sm}` },
                ];
            case "altFt":
                return [
                    { label: "ft", value: `${conversion.ft}` },
                    { label: "m", value: `${conversion.m}` },
                ];
            case "altM":
                return [
                    { label: "m", value: `${conversion.m}` },
                    { label: "ft", value: `${conversion.ft}` },
                ];
            case "tempC":
                return [
                    { label: "°C", value: `${conversion.c}` },
                    { label: "°F", value: `${conversion.f}` },
                ];
            case "tempF":
                return [
                    { label: "°F", value: `${conversion.f}` },
                    { label: "°C", value: `${conversion.c}` },
                ];
            case "longitude":
                return [
                    { label: "°", value: `${conversion.deg}` },
                    { label: "min", value: `${conversion.minutes}` },
                    { label: "h", value: `${conversion.hours}` },
                ];
            default:
                return [];
        }
    })();

    return (
        <AviationShell>
            <ExperiencePageStack>
                <ExperienceHero
                    kicker={t("tools.title")}
                    title={t("tools.heroTitle")}
                    copy={t("tools.heroCopy")}
                    statValue="A"
                    statLabel={t("tools.faceALabel")}
                />

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
                    <ToolNavCard
                        active={activeTool === "convert"}
                        icon="⇄"
                        title={t("tools.convertTitle")}
                        description={t("tools.convertNavHint")}
                        onClick={() => setActiveTool("convert")}
                    />
                    <ToolNavCard
                        active={activeTool === "pressure"}
                        icon="↕"
                        title={t("tools.pressureTitle")}
                        description={t("tools.pressureNavHint")}
                        onClick={() => setActiveTool("pressure")}
                    />
                </div>

                {activeTool === "crosswind" ? (
                    <WorkbenchCard
                        title={t("tools.crosswindTitle")}
                        lead={t("tools.crosswindLead")}
                        footer={<p className="fc-formula-note">{t("tools.crosswindFormula")}</p>}
                        inputs={
                            <div className="growth-field-grid growth-field-grid--3">
                                <Field label={t("tools.windDir")} value={windDir} onChange={setWindDir} unit="°" />
                                <Field label={t("tools.windSpeed")} value={windSpeed} onChange={setWindSpeed} unit="kt" />
                                <Field label={t("tools.runway")} value={runway} onChange={setRunway} placeholder="09" />
                            </div>
                        }
                        results={
                            <ResultHighlight
                                equal
                                items={[
                                    { label: t("tools.crosswindLabel"), value: `${runwayWind.crosswindKt} kt`, hint: crossSide },
                                    { label: t("tools.headwindLabel"), value: headLabel },
                                    { label: t("tools.runwayHeadingLabel"), value: `${runwayWind.runwayHeading}°`, muted: true },
                                    { label: t("tools.angleLabel"), value: `${runwayWind.angleDeg}°`, muted: true },
                                ]}
                            />
                        }
                    />
                ) : null}

                {activeTool === "fuel" ? (
                    <WorkbenchCard
                        title={t("tools.fuelTitle")}
                        lead={t("tools.fuelLead")}
                        footer={<p className="fc-formula-note">{t("tools.fuelFormula")}</p>}
                        inputs={
                            <div className="growth-field-grid growth-field-grid--2">
                                <Field label={t("tools.liters")} value={liters} onChange={setLiters} unit="L" />
                                <Field label={t("tools.density")} value={density} onChange={setDensity} unit="kg/L" />
                            </div>
                        }
                        results={
                            <ResultHighlight
                                equal
                                items={[
                                    { label: t("tools.fuelKgLabel"), value: `${fuel.kg} kg` },
                                    { label: t("tools.fuelLbLabel"), value: `${fuel.lb} lb` },
                                    { label: t("tools.fuelGalLabel"), value: `${fuel.usGal} US gal` },
                                    { label: t("tools.fuelImpLabel"), value: `${fuel.impGal} IMP gal` },
                                ]}
                            />
                        }
                    />
                ) : null}

                {activeTool === "convert" ? (
                    <WorkbenchCard
                        className="xp-workbench--convert"
                        title={t("tools.convertTitle")}
                        lead={t("tools.convertLead")}
                        footer={<p className="fc-formula-note">{t("tools.convertFormula")}</p>}
                        inputs={
                            <div className="tools-convert-panel">
                                <SegmentedControl
                                    layout="grid"
                                    ariaLabel={t("tools.convertTitle")}
                                    value={convKind}
                                    onChange={setConvKind}
                                    tabs={[
                                        { id: "speedKt", label: t("tools.convSpeed") },
                                        { id: "distNm", label: t("tools.convDist") },
                                        { id: "altFt", label: t("tools.convAlt") },
                                        { id: "volL", label: t("tools.convVol") },
                                        { id: "massKg", label: t("tools.convMass") },
                                        { id: "tempC", label: t("tools.convTemp") },
                                        { id: "longitude", label: t("tools.convLong") },
                                    ]}
                                />
                                <div className="tools-convert-value">
                                    <Field label={t("tools.convValue")} value={convValue} onChange={setConvValue} />
                                </div>
                            </div>
                        }
                        results={<ResultHighlight equal items={conversionResults} />}
                    />
                ) : null}

                {activeTool === "pressure" ? (
                    <WorkbenchCard
                        title={t("tools.pressureTitle")}
                        lead={t("tools.pressureLead")}
                        footer={<p className="fc-formula-note">{t("tools.pressureFormula")}</p>}
                        inputs={
                            <div className="growth-field-grid growth-field-grid--2">
                                <Field label={t("tools.elevation")} value={elevFt} onChange={setElevFt} unit="ft" />
                                <Field label={t("tools.qnh")} value={qnh} onChange={setQnh} unit="hPa" />
                            </div>
                        }
                        results={
                            <ResultHighlight
                                equal
                                items={[{ label: t("tools.pressureAltLabel"), value: `${pressureAlt.pressureAltFt.toLocaleString()} ft` }]}
                            />
                        }
                    />
                ) : null}

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
        </AviationShell>
    );
}
