import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AviationShell from "../components/AviationShell";
import GrowthCtaBar from "../components/GrowthCtaBar";
import { ExperienceHero, ExperiencePageStack, ResultHighlight, WorkbenchCard } from "../components/experience/ExperienceUI";
import {
    computeCourseFromHeading,
    computeDensityAltitude,
    computeFuel,
    computeLegFuel,
    computeMach,
    computeMagneticHeading,
    computePressureAltitude,
    computeRunwayWindComponents,
    computeTasFromMach,
    computeTimeSpeedDistance,
    computeTrueAirspeed,
    computeTrueAltitude,
    computeVerticalLeg,
    computeWindFromVectors,
    computeWindTriangle,
    formatHoursMinutes,
} from "../utils/flightComputer";
import { useI18n } from "../i18n/I18nContext.jsx";

const SECTIONS = ["wind", "windCases", "runway", "heading", "tsd", "fuel", "climb", "performance"];

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

    const [trueCourse, setTrueCourse] = useState("155");
    const [tas, setTas] = useState("140");
    const [windDir, setWindDir] = useState("040");
    const [windSpeed, setWindSpeed] = useState("40");

    const [case2Heading, setCase2Heading] = useState("273");
    const [case2Tas, setCase2Tas] = useState("150");
    const [case2WindDir, setCase2WindDir] = useState("230");
    const [case2WindSpeed, setCase2WindSpeed] = useState("40");

    const [case3Heading, setCase3Heading] = useState("209");
    const [case3Course, setCase3Course] = useState("219");
    const [case3Tas, setCase3Tas] = useState("150");
    const [case3Gs, setCase3Gs] = useState("134");

    const [runway, setRunway] = useState("09");
    const [rwyWindDir, setRwyWindDir] = useState("270");
    const [rwyWindSpeed, setRwyWindSpeed] = useState("12");

    const [trueHeading, setTrueHeading] = useState("140");
    const [variation, setVariation] = useState("10");
    const [variationEast, setVariationEast] = useState(true);

    const [tsdDistance, setTsdDistance] = useState("170");
    const [tsdSpeed, setTsdSpeed] = useState("95");
    const [tsdTime, setTsdTime] = useState("");

    const [fuelFlow, setFuelFlow] = useState("100");
    const [fuelTime, setFuelTime] = useState("0.75");
    const [fuelTotal, setFuelTotal] = useState("");

    const [climbAlt, setClimbAlt] = useState("6000");
    const [climbRate, setClimbRate] = useState("500");
    const [climbGs, setClimbGs] = useState("90");
    const [climbTimeMin, setClimbTimeMin] = useState("");
    const [legFlow, setLegFlow] = useState("42");
    const [legTime, setLegTime] = useState("1.2");

    const [ias, setIas] = useState("90");
    const [pressureAlt, setPressureAlt] = useState("5000");
    const [oat, setOat] = useState("0");
    const [indicatedAlt, setIndicatedAlt] = useState("14000");
    const [machIn, setMachIn] = useState("0.25");
    const [elevFt, setElevFt] = useState("2500");
    const [qnh, setQnh] = useState("1013");

    const wind = useMemo(
        () => computeWindTriangle({ trueCourse, tas, windDir, windSpeed }),
        [trueCourse, tas, windDir, windSpeed]
    );

    const case2 = useMemo(
        () =>
            computeCourseFromHeading({
                trueHeading: case2Heading,
                tas: case2Tas,
                windDir: case2WindDir,
                windSpeed: case2WindSpeed,
            }),
        [case2Heading, case2Tas, case2WindDir, case2WindSpeed]
    );

    const case3 = useMemo(
        () =>
            computeWindFromVectors({
                trueHeading: case3Heading,
                trueCourse: case3Course,
                tas: case3Tas,
                groundSpeed: case3Gs,
            }),
        [case3Heading, case3Course, case3Tas, case3Gs]
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
        () =>
            computeVerticalLeg({
                altitudeFt: climbAlt,
                rateFpm: climbRate,
                groundSpeedKt: climbGs,
                timeMinutes: climbTimeMin,
            }),
        [climbAlt, climbRate, climbGs, climbTimeMin]
    );

    const legFuel = useMemo(() => computeLegFuel({ flowPerHour: legFlow, timeHours: legTime }), [legFlow, legTime]);

    const performance = useMemo(() => {
        const tasResult = computeTrueAirspeed({ ias, pressureAltFt: pressureAlt, oatC: oat });
        const daResult = computeDensityAltitude({ pressureAltFt: pressureAlt, oatC: oat });
        const trueAlt = computeTrueAltitude({
            indicatedAltFt: indicatedAlt,
            pressureAltFt: pressureAlt,
            oatC: oat,
        });
        const machFromTas = computeMach({ tas: tasResult.tas, oatC: oat });
        const tasFromMach = computeTasFromMach({ mach: machIn, oatC: oat });
        const paFromQnh = computePressureAltitude({ elevationFt: elevFt, qnhHpa: qnh });
        return { tasResult, daResult, trueAlt, machFromTas, tasFromMach, paFromQnh };
    }, [ias, pressureAlt, oat, indicatedAlt, machIn, elevFt, qnh]);

    const rwyHeadLabel =
        runwayWind && Number(runwayWind.headwindKt) < 0
            ? `${runwayWind.headwindKt} kt (${t("tools.tailwindShort")})`
            : `${runwayWind?.headwindKt ?? 0} kt`;

    const wcaLabel =
        wind.wca === 0
            ? `0°`
            : `${wind.wca > 0 ? "+" : ""}${wind.wca}° (${wind.driftLeft ? t("flightComputer.leftShort") : t("flightComputer.rightShort")})`;

    return (
        <AviationShell>
            <ExperiencePageStack>
                <ExperienceHero
                    kicker={t("flightComputer.kicker")}
                    title={t("flightComputer.heroTitle")}
                    copy={t("flightComputer.heroCopy")}
                    statValue="A/B"
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
                            <div className="growth-field-grid growth-field-grid--2">
                                <Field label={t("flightComputer.trueCourse")} value={trueCourse} onChange={setTrueCourse} unit="°" />
                                <Field label={t("flightComputer.tas")} value={tas} onChange={setTas} unit="kt" />
                                <Field label={t("flightComputer.windDir")} value={windDir} onChange={setWindDir} unit="°" />
                                <Field label={t("flightComputer.windSpeed")} value={windSpeed} onChange={setWindSpeed} unit="kt" />
                            </div>
                        }
                        results={
                            <ResultHighlight
                                equal
                                items={[
                                    { label: t("flightComputer.wca"), value: wcaLabel },
                                    { label: t("flightComputer.heading"), value: `${wind.heading}°` },
                                    { label: t("flightComputer.groundSpeed"), value: `${wind.groundSpeed} kt` },
                                    {
                                        label: t("flightComputer.headComponent"),
                                        value: `${wind.headwindKt} kt`,
                                        muted: true,
                                    },
                                ]}
                            />
                        }
                    />

                    <WorkbenchCard
                        id="fc-windCases"
                        title={t("flightComputer.windCasesTitle")}
                        lead={t("flightComputer.windCasesCopy")}
                        footer={<p className="fc-formula-note">{t("flightComputer.windCasesFormula")}</p>}
                        inputs={
                            <div className="fc-wind-cases">
                                <div>
                                    <h3 className="fc-case-title">{t("flightComputer.case2Title")}</h3>
                                    <div className="growth-field-grid growth-field-grid--2">
                                        <Field label={t("flightComputer.heading")} value={case2Heading} onChange={setCase2Heading} unit="°" />
                                        <Field label={t("flightComputer.tas")} value={case2Tas} onChange={setCase2Tas} unit="kt" />
                                        <Field label={t("flightComputer.windDir")} value={case2WindDir} onChange={setCase2WindDir} unit="°" />
                                        <Field label={t("flightComputer.windSpeed")} value={case2WindSpeed} onChange={setCase2WindSpeed} unit="kt" />
                                    </div>
                                    <ResultHighlight
                                        equal
                                        items={[
                                            { label: t("flightComputer.trueCourse"), value: `${case2.trueCourse}°` },
                                            { label: t("flightComputer.groundSpeed"), value: `${case2.groundSpeed} kt` },
                                            {
                                                label: t("flightComputer.drift"),
                                                value: `${case2.drift > 0 ? "+" : ""}${case2.drift}°`,
                                                muted: true,
                                            },
                                        ]}
                                    />
                                </div>
                                <div>
                                    <h3 className="fc-case-title">{t("flightComputer.case3Title")}</h3>
                                    <div className="growth-field-grid growth-field-grid--2">
                                        <Field label={t("flightComputer.heading")} value={case3Heading} onChange={setCase3Heading} unit="°" />
                                        <Field label={t("flightComputer.trueCourse")} value={case3Course} onChange={setCase3Course} unit="°" />
                                        <Field label={t("flightComputer.tas")} value={case3Tas} onChange={setCase3Tas} unit="kt" />
                                        <Field label={t("flightComputer.groundSpeed")} value={case3Gs} onChange={setCase3Gs} unit="kt" />
                                    </div>
                                    <ResultHighlight
                                        equal
                                        items={[
                                            { label: t("flightComputer.windDir"), value: `${case3.windDir}°` },
                                            { label: t("flightComputer.windSpeed"), value: `${case3.windSpeed} kt` },
                                        ]}
                                    />
                                </div>
                            </div>
                        }
                    />

                    <WorkbenchCard
                        id="fc-runway"
                        title={t("flightComputer.runwayTitle")}
                        lead={t("flightComputer.runwayCopy")}
                        footer={<p className="fc-formula-note">{t("flightComputer.runwayFormula")}</p>}
                        inputs={
                            <div className="growth-field-grid growth-field-grid--3">
                                <Field label={t("flightComputer.windDir")} value={rwyWindDir} onChange={setRwyWindDir} unit="°" />
                                <Field label={t("flightComputer.windSpeed")} value={rwyWindSpeed} onChange={setRwyWindSpeed} unit="kt" />
                                <Field label={t("flightComputer.runway")} value={runway} onChange={setRunway} unit="°" placeholder="09" />
                            </div>
                        }
                        results={
                            <ResultHighlight
                                equal
                                items={[
                                    { label: t("tools.crosswindLabel"), value: `${runwayWind.crosswindKt} kt` },
                                    { label: t("tools.headwindLabel"), value: rwyHeadLabel },
                                    { label: t("tools.runwayHeadingLabel"), value: `${runwayWind.runwayHeading}°`, muted: true },
                                ]}
                            />
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
                            <ResultHighlight
                                equal
                                items={[
                                    { label: t("flightComputer.magneticHeading"), value: `${magnetic.magneticHeading}°` },
                                    {
                                        label: t("flightComputer.variationApplied"),
                                        value: `${magnetic.variationDeg}° ${magnetic.variationEast ? t("flightComputer.eastShort") : t("flightComputer.westShort")}`,
                                        muted: true,
                                    },
                                ]}
                            />
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
                                <Field label={t("flightComputer.distance")} value={tsdDistance} onChange={setTsdDistance} unit="NM" />
                                <Field label={t("flightComputer.speed")} value={tsdSpeed} onChange={setTsdSpeed} unit="kt" placeholder="—" />
                                <Field label={t("flightComputer.time")} value={tsdTime} onChange={setTsdTime} unit="h" placeholder="—" />
                            </div>
                        }
                        results={
                            tsd ? (
                                <ResultHighlight
                                    equal
                                    items={[
                                        { label: t("flightComputer.distance"), value: `${tsd.distance} NM` },
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
                                    equal
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
                                <Field label={t("flightComputer.climbTimeMin")} value={climbTimeMin} onChange={setClimbTimeMin} unit="min" placeholder="—" />
                                <Field label={t("flightComputer.climbGs")} value={climbGs} onChange={setClimbGs} unit="kt" />
                                <Field label={t("flightComputer.legFlow")} value={legFlow} onChange={setLegFlow} unit="L/h" />
                                <Field label={t("flightComputer.legTime")} value={legTime} onChange={setLegTime} unit="h" />
                            </div>
                        }
                        results={
                            climb ? (
                                <ResultHighlight
                                    equal
                                    items={[
                                        { label: t("flightComputer.climbTime"), value: formatHoursMinutes(climb.timeHours) },
                                        {
                                            label: t("flightComputer.climbDistance"),
                                            value: climb.distanceNm != null ? `${climb.distanceNm} NM` : "—",
                                        },
                                        { label: t("flightComputer.climbAlt"), value: `${climb.altitudeFt} ft`, muted: true },
                                        { label: t("flightComputer.climbRate"), value: `${climb.rateFpm} ft/min`, muted: true },
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
                            lead={t("flightComputer.tasCopy")}
                            footer={<p className="fc-formula-note">{t("flightComputer.tasNote")}</p>}
                            inputs={
                                <div className="growth-field-grid growth-field-grid--2">
                                    <Field label={t("flightComputer.ias")} value={ias} onChange={setIas} unit="kt" />
                                    <Field label={t("flightComputer.pressureAlt")} value={pressureAlt} onChange={setPressureAlt} unit="ft" />
                                    <Field label={t("flightComputer.oat")} value={oat} onChange={setOat} unit="°C" />
                                </div>
                            }
                            results={
                                <ResultHighlight
                                    equal
                                    items={[
                                        { label: t("flightComputer.tas"), value: `${performance.tasResult.tas} kt` },
                                        {
                                            label: t("flightComputer.tasRule"),
                                            value: `${performance.tasResult.tasRuleOfThumb} kt`,
                                            muted: true,
                                        },
                                    ]}
                                />
                            }
                        />
                        <WorkbenchCard
                            title={t("flightComputer.daTitle")}
                            lead={t("flightComputer.daCopy")}
                            footer={<p className="fc-formula-note">{t("flightComputer.daNote")}</p>}
                            inputs={
                                <div className="growth-field-grid growth-field-grid--2">
                                    <Field label={t("flightComputer.pressureAlt")} value={pressureAlt} onChange={setPressureAlt} unit="ft" />
                                    <Field label={t("flightComputer.oat")} value={oat} onChange={setOat} unit="°C" />
                                </div>
                            }
                            results={
                                <ResultHighlight
                                    equal
                                    items={[
                                        { label: t("flightComputer.isaTemp"), value: `${performance.daResult.isaTempC}°C`, muted: true },
                                        {
                                            label: t("flightComputer.isaDev"),
                                            value: `${performance.daResult.isaDeviationC > 0 ? "+" : ""}${performance.daResult.isaDeviationC}°C`,
                                            muted: true,
                                        },
                                        {
                                            label: t("flightComputer.densityAlt"),
                                            value: `${performance.daResult.densityAltFt.toLocaleString()} ft`,
                                        },
                                    ]}
                                />
                            }
                        />
                    </div>

                    <div className="growth-two-col">
                        <WorkbenchCard
                            title={t("flightComputer.trueAltTitle")}
                            lead={t("flightComputer.trueAltCopy")}
                            footer={<p className="fc-formula-note">{t("flightComputer.trueAltNote")}</p>}
                            inputs={
                                <div className="growth-field-grid growth-field-grid--2">
                                    <Field label={t("flightComputer.indicatedAlt")} value={indicatedAlt} onChange={setIndicatedAlt} unit="ft" />
                                    <Field label={t("flightComputer.pressureAlt")} value={pressureAlt} onChange={setPressureAlt} unit="ft" />
                                    <Field label={t("flightComputer.oat")} value={oat} onChange={setOat} unit="°C" />
                                </div>
                            }
                            results={
                                <ResultHighlight
                                    equal
                                    items={[{ label: t("flightComputer.trueAlt"), value: `${performance.trueAlt.trueAltFt.toLocaleString()} ft` }]}
                                />
                            }
                        />
                        <WorkbenchCard
                            title={t("flightComputer.machTitle")}
                            lead={t("flightComputer.machCopy")}
                            footer={<p className="fc-formula-note">{t("flightComputer.machNote")}</p>}
                            inputs={
                                <div className="growth-field-grid growth-field-grid--2">
                                    <Field label={t("flightComputer.machInput")} value={machIn} onChange={setMachIn} />
                                    <Field label={t("flightComputer.oat")} value={oat} onChange={setOat} unit="°C" />
                                </div>
                            }
                            results={
                                <ResultHighlight
                                    equal
                                    items={[
                                        { label: t("flightComputer.machFromTas"), value: String(performance.machFromTas.mach) },
                                        { label: t("flightComputer.tasFromMach"), value: `${performance.tasFromMach.tas} kt` },
                                    ]}
                                />
                            }
                        />
                    </div>

                    <WorkbenchCard
                        title={t("flightComputer.paFromQnhTitle")}
                        lead={t("flightComputer.paFromQnhCopy")}
                        footer={<p className="fc-formula-note">{t("flightComputer.paFromQnhNote")}</p>}
                        inputs={
                            <div className="growth-field-grid growth-field-grid--2">
                                <Field label={t("tools.elevation")} value={elevFt} onChange={setElevFt} unit="ft" />
                                <Field label={t("tools.qnh")} value={qnh} onChange={setQnh} unit="hPa" />
                            </div>
                        }
                        results={
                            <ResultHighlight
                                equal
                                items={[
                                    {
                                        label: t("tools.pressureAltLabel"),
                                        value: `${performance.paFromQnh.pressureAltFt.toLocaleString()} ft`,
                                    },
                                ]}
                            />
                        }
                    />
                </div>

                <GrowthCtaBar
                    secondaryLabel={t("hub.weatherTitle")}
                    primaryLabel={t("flightComputer.openPlanner")}
                    onSecondary={() => nav("/weather")}
                    onPrimary={() => nav("/")}
                />
            </ExperiencePageStack>
        </AviationShell>
    );
}
