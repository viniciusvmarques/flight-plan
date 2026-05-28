import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import GrowthCtaBar from "../components/GrowthCtaBar";
import { ExperienceHero, ResultHighlight, WorkbenchCard } from "../components/experience/ExperienceUI";
import {
    computeDensityAltitude,
    computeFuel,
    computeLegFuel,
    computeMagneticHeading,
    computeRunwayWindComponents,
    computeTimeSpeedDistance,
    computeTrueAirspeed,
    computeVerticalLeg,
    computeWindTriangle,
    formatHoursMinutes,
} from "../utils/flightComputer";
import { useI18n } from "../i18n/I18nContext.jsx";

const SECTIONS = ["wind", "runway", "heading", "tsd", "fuel", "climb", "performance"];

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

function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function FlightComputer() {
    const nav = useNavigate();
    const { t } = useI18n();

    const [trueCourse, setTrueCourse] = useState("090");
    const [tas, setTas] = useState("110");
    const [windDir, setWindDir] = useState("270");
    const [windSpeed, setWindSpeed] = useState("18");

    const [runway, setRunway] = useState("09");
    const [rwyWindDir, setRwyWindDir] = useState("270");
    const [rwyWindSpeed, setRwyWindSpeed] = useState("12");

    const [trueHeading, setTrueHeading] = useState("090");
    const [variation, setVariation] = useState("10");
    const [variationEast, setVariationEast] = useState(true);

    const [tsdDistance, setTsdDistance] = useState("120");
    const [tsdSpeed, setTsdSpeed] = useState("");
    const [tsdTime, setTsdTime] = useState("1.5");

    const [fuelFlow, setFuelFlow] = useState("45");
    const [fuelTime, setFuelTime] = useState("2.5");
    const [fuelTotal, setFuelTotal] = useState("");

    const [climbAlt, setClimbAlt] = useState("4500");
    const [climbRate, setClimbRate] = useState("500");
    const [climbGs, setClimbGs] = useState("90");
    const [legFlow, setLegFlow] = useState("42");
    const [legTime, setLegTime] = useState("1.2");

    const [ias, setIas] = useState("105");
    const [pressureAlt, setPressureAlt] = useState("5500");
    const [oat, setOat] = useState("22");

    const wind = useMemo(
        () => computeWindTriangle({ trueCourse, tas, windDir, windSpeed }),
        [trueCourse, tas, windDir, windSpeed]
    );

    const runwayWind = useMemo(
        () => computeRunwayWindComponents({ windDir: rwyWindDir, windSpeed: rwyWindSpeed, runway }),
        [rwyWindDir, rwyWindSpeed, runway]
    );

    const magnetic = useMemo(
        () => computeMagneticHeading({ trueHeading, variationDeg: variation, variationEast }),
        [trueHeading, variation, variationEast]
    );

    const tsd = useMemo(
        () => computeTimeSpeedDistance({ distance: tsdDistance, speed: tsdSpeed, time: tsdTime }),
        [tsdDistance, tsdSpeed, tsdTime]
    );

    const fuel = useMemo(
        () => computeFuel({ flowPerHour: fuelFlow, timeHours: fuelTime, totalFuel: fuelTotal }),
        [fuelFlow, fuelTime, fuelTotal]
    );

    const climb = useMemo(
        () => computeVerticalLeg({ altitudeFt: climbAlt, rateFpm: climbRate, groundSpeedKt: climbGs }),
        [climbAlt, climbRate, climbGs]
    );

    const legFuel = useMemo(() => computeLegFuel({ flowPerHour: legFlow, timeHours: legTime }), [legFlow, legTime]);

    const performance = useMemo(() => {
        const tasResult = computeTrueAirspeed({ ias, pressureAltFt: pressureAlt });
        const daResult = computeDensityAltitude({ pressureAltFt: pressureAlt, oatC: oat });
        return { tasResult, daResult };
    }, [ias, pressureAlt, oat]);

    const rwyHeadLabel =
        runwayWind && Number(runwayWind.headwindKt) < 0
            ? `${runwayWind.headwindKt} kt (${t("tools.tailwindShort")})`
            : `${runwayWind?.headwindKt ?? 0} kt`;

    return (
        <div className="main-shell">
            <AppHeader compact />
            <main className="main-scroll growth-page experience-surface flight-computer-page">
                <ExperienceHero
                    kicker={t("flightComputer.kicker")}
                    title={t("flightComputer.heroTitle")}
                    copy={t("flightComputer.heroCopy")}
                    statValue="E6B"
                    statLabel={t("flightComputer.statLabel")}
                />

                <nav className="fc-jump-nav" aria-label={t("flightComputer.jumpNav")}>
                    {SECTIONS.map((id) => (
                        <button key={id} type="button" className="fc-jump-link" onClick={() => scrollToSection(`fc-${id}`)}>
                            {t(`flightComputer.sections.${id}`)}
                        </button>
                    ))}
                </nav>

                <div className="fc-sections">
                    <WorkbenchCard
                        id="fc-wind"
                        title={t("flightComputer.windTitle")}
                        lead={t("flightComputer.windCopy")}
                        footer={<p className="fc-formula-note">{t("flightComputer.windFormula")}</p>}
                        inputs={
                            <div className="growth-field-grid">
                                <Field label={t("flightComputer.trueCourse")} value={trueCourse} onChange={setTrueCourse} unit="°" />
                                <Field label={t("flightComputer.tas")} value={tas} onChange={setTas} unit="kt" />
                                <Field label={t("flightComputer.windDir")} value={windDir} onChange={setWindDir} unit="°" />
                                <Field label={t("flightComputer.windSpeed")} value={windSpeed} onChange={setWindSpeed} unit="kt" />
                            </div>
                        }
                        results={
                            wind ? (
                                <ResultHighlight
                                    primaryIndex={2}
                                    items={[
                                        { label: t("flightComputer.wca"), value: `${wind.wca > 0 ? "+" : ""}${wind.wca}°` },
                                        { label: t("flightComputer.heading"), value: `${wind.heading}°` },
                                        { label: t("flightComputer.groundSpeed"), value: `${wind.groundSpeed} kt` },
                                    ]}
                                />
                            ) : null
                        }
                    />

                    <WorkbenchCard
                        id="fc-runway"
                        title={t("flightComputer.runwayTitle")}
                        lead={t("flightComputer.runwayCopy")}
                        footer={<p className="fc-formula-note">{t("flightComputer.runwayFormula")}</p>}
                        inputs={
                            <div className="growth-field-grid growth-field-grid--2">
                                <Field label={t("tools.windDir")} value={rwyWindDir} onChange={setRwyWindDir} unit="°" />
                                <Field label={t("tools.windSpeed")} value={rwyWindSpeed} onChange={setRwyWindSpeed} unit="kt" />
                                <Field label={t("tools.runway")} value={runway} onChange={setRunway} placeholder="09" />
                            </div>
                        }
                        results={
                            runwayWind ? (
                                <ResultHighlight
                                    primaryIndex={0}
                                    items={[
                                        { label: t("tools.crosswindLabel"), value: `${runwayWind.crosswindKt} kt` },
                                        { label: t("tools.headwindLabel"), value: rwyHeadLabel },
                                        { label: t("tools.runwayHeadingLabel"), value: `${runwayWind.runwayHeading}°`, muted: true },
                                    ]}
                                />
                            ) : null
                        }
                    />

                    <WorkbenchCard
                        id="fc-heading"
                        title={t("flightComputer.headingTitle")}
                        lead={t("flightComputer.headingCopy")}
                        footer={<p className="fc-formula-note">{t("flightComputer.headingFormula")}</p>}
                        inputs={
                            <div className="growth-field-grid growth-field-grid--2">
                                <Field label={t("flightComputer.trueHeading")} value={trueHeading} onChange={setTrueHeading} unit="°" />
                                <Field label={t("flightComputer.variation")} value={variation} onChange={setVariation} unit="°" />
                                <label className="growth-field growth-field--check">
                                    <span>{t("flightComputer.variationEast")}</span>
                                    <input
                                        type="checkbox"
                                        checked={variationEast}
                                        onChange={(e) => setVariationEast(e.target.checked)}
                                    />
                                </label>
                            </div>
                        }
                        results={
                            magnetic ? (
                                <ResultHighlight
                                    items={[
                                        { label: t("flightComputer.magneticHeading"), value: `${magnetic.magneticHeading}°` },
                                        {
                                            label: t("flightComputer.variationApplied"),
                                            value: `${magnetic.variationDeg}° ${magnetic.variationEast ? t("flightComputer.eastShort") : t("flightComputer.westShort")}`,
                                            muted: true,
                                        },
                                    ]}
                                />
                            ) : null
                        }
                    />

                    <WorkbenchCard
                        id="fc-tsd"
                        title={t("flightComputer.tsdTitle")}
                        lead={t("flightComputer.tsdCopy")}
                        footer={
                            !tsd ? (
                                <p className="muted">{t("flightComputer.tsdHint")}</p>
                            ) : (
                                <p className="fc-formula-note">{t("flightComputer.tsdFormula")}</p>
                            )
                        }
                        inputs={
                            <div className="growth-field-grid growth-field-grid--2">
                                <Field label={t("flightComputer.distance")} value={tsdDistance} onChange={setTsdDistance} unit="nm" />
                                <Field label={t("flightComputer.speed")} value={tsdSpeed} onChange={setTsdSpeed} unit="kt" placeholder="—" />
                                <Field label={t("flightComputer.time")} value={tsdTime} onChange={setTsdTime} unit="h" />
                            </div>
                        }
                        results={
                            tsd ? (
                                <ResultHighlight
                                    items={[
                                        { label: t("flightComputer.distance"), value: `${tsd.distance} nm` },
                                        { label: t("flightComputer.speed"), value: `${tsd.speed} kt` },
                                        { label: t("flightComputer.time"), value: formatHoursMinutes(tsd.timeHours) },
                                    ]}
                                />
                            ) : null
                        }
                    />

                    <WorkbenchCard
                        id="fc-fuel"
                        title={t("flightComputer.fuelTitle")}
                        lead={t("flightComputer.fuelCopy")}
                        footer={
                            !fuel ? (
                                <p className="muted">{t("flightComputer.fuelHint")}</p>
                            ) : (
                                <p className="fc-formula-note">{t("flightComputer.fuelFormula")}</p>
                            )
                        }
                        inputs={
                            <div className="growth-field-grid growth-field-grid--2">
                                <Field label={t("flightComputer.fuelFlow")} value={fuelFlow} onChange={setFuelFlow} unit="L/h" />
                                <Field label={t("flightComputer.fuelTime")} value={fuelTime} onChange={setFuelTime} unit="h" />
                                <Field label={t("flightComputer.fuelTotal")} value={fuelTotal} onChange={setFuelTotal} unit="L" placeholder="—" />
                            </div>
                        }
                        results={
                            fuel ? (
                                <ResultHighlight
                                    primaryIndex={2}
                                    items={[
                                        { label: t("flightComputer.fuelFlow"), value: `${fuel.flowPerHour} L/h` },
                                        { label: t("flightComputer.fuelTime"), value: formatHoursMinutes(fuel.timeHours) },
                                        { label: t("flightComputer.fuelTotal"), value: `${fuel.totalFuel} L` },
                                    ]}
                                />
                            ) : null
                        }
                    />

                    <WorkbenchCard
                        id="fc-climb"
                        title={t("flightComputer.climbTitle")}
                        lead={t("flightComputer.climbCopy")}
                        footer={<p className="fc-formula-note">{t("flightComputer.climbFormula")}</p>}
                        inputs={
                            <div className="growth-field-grid growth-field-grid--2">
                                <Field label={t("flightComputer.climbAlt")} value={climbAlt} onChange={setClimbAlt} unit="ft" />
                                <Field label={t("flightComputer.climbRate")} value={climbRate} onChange={setClimbRate} unit="ft/min" />
                                <Field label={t("flightComputer.climbGs")} value={climbGs} onChange={setClimbGs} unit="kt" />
                                <Field label={t("flightComputer.legFlow")} value={legFlow} onChange={setLegFlow} unit="L/h" />
                                <Field label={t("flightComputer.legTime")} value={legTime} onChange={setLegTime} unit="h" />
                            </div>
                        }
                        results={
                            climb ? (
                                <ResultHighlight
                                    primaryIndex={0}
                                    items={[
                                        { label: t("flightComputer.climbTime"), value: formatHoursMinutes(climb.timeHours) },
                                        { label: t("flightComputer.climbDistance"), value: `${climb.distanceNm} nm` },
                                        {
                                            label: t("flightComputer.legFuelEst"),
                                            value: legFuel ? `${legFuel.fuelLiters} L` : "—",
                                            muted: !legFuel,
                                        },
                                    ]}
                                />
                            ) : null
                        }
                    />

                    <div className="growth-two-col" id="fc-performance">
                        <WorkbenchCard
                            title={t("flightComputer.tasTitle")}
                            footer={<p className="fc-formula-note">{t("flightComputer.tasNote")}</p>}
                            inputs={
                                <div className="growth-field-grid growth-field-grid--2">
                                    <Field label={t("flightComputer.ias")} value={ias} onChange={setIas} unit="kt" />
                                    <Field label={t("flightComputer.pressureAlt")} value={pressureAlt} onChange={setPressureAlt} unit="ft" />
                                </div>
                            }
                            results={
                                <ResultHighlight items={[{ label: t("flightComputer.tas"), value: `${performance.tasResult.tas} kt` }]} />
                            }
                        />
                        <WorkbenchCard
                            title={t("flightComputer.daTitle")}
                            footer={<p className="fc-formula-note">{t("flightComputer.daNote")}</p>}
                            inputs={
                                <div className="growth-field-grid growth-field-grid--2">
                                    <Field label={t("flightComputer.pressureAlt")} value={pressureAlt} onChange={setPressureAlt} unit="ft" />
                                    <Field label={t("flightComputer.oat")} value={oat} onChange={setOat} unit="°C" />
                                </div>
                            }
                            results={
                                <ResultHighlight
                                    items={[
                                        { label: t("flightComputer.isaTemp"), value: `${performance.daResult.isaTempC}°C`, muted: true },
                                        {
                                            label: t("flightComputer.densityAlt"),
                                            value: `${performance.daResult.densityAltFt.toLocaleString()} ft`,
                                        },
                                    ]}
                                />
                            }
                        />
                    </div>
                </div>

                <GrowthCtaBar
                    secondaryLabel={t("hub.weatherTitle")}
                    primaryLabel={t("flightComputer.openPlanner")}
                    onSecondary={() => nav("/weather")}
                    onPrimary={() => nav("/")}
                />
            </main>
            <AppFooter />
        </div>
    );
}
