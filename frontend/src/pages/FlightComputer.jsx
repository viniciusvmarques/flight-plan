import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import GrowthCtaBar from "../components/GrowthCtaBar";
import {
    ExperienceHero,
    ResultHighlight,
    SegmentedControl,
    WorkbenchCard,
} from "../components/experience/ExperienceUI";
import {
    computeDensityAltitude,
    computeFuel,
    computeTimeSpeedDistance,
    computeTrueAirspeed,
    computeWindTriangle,
    formatHoursMinutes,
} from "../utils/flightComputer";
import { useI18n } from "../i18n/I18nContext.jsx";

const TABS = ["wind", "tsd", "fuel", "performance"];

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

export default function FlightComputer() {
    const nav = useNavigate();
    const { t } = useI18n();
    const [tab, setTab] = useState("wind");

    const [trueCourse, setTrueCourse] = useState("090");
    const [tas, setTas] = useState("110");
    const [windDir, setWindDir] = useState("270");
    const [windSpeed, setWindSpeed] = useState("18");

    const [tsdDistance, setTsdDistance] = useState("120");
    const [tsdSpeed, setTsdSpeed] = useState("");
    const [tsdTime, setTsdTime] = useState("1.5");

    const [fuelFlow, setFuelFlow] = useState("45");
    const [fuelTime, setFuelTime] = useState("2.5");
    const [fuelTotal, setFuelTotal] = useState("");

    const [ias, setIas] = useState("105");
    const [pressureAlt, setPressureAlt] = useState("5500");
    const [oat, setOat] = useState("22");

    const wind = useMemo(
        () => computeWindTriangle({ trueCourse, tas, windDir, windSpeed }),
        [trueCourse, tas, windDir, windSpeed]
    );

    const tsd = useMemo(
        () => computeTimeSpeedDistance({ distance: tsdDistance, speed: tsdSpeed, time: tsdTime }),
        [tsdDistance, tsdSpeed, tsdTime]
    );

    const fuel = useMemo(
        () => computeFuel({ flowPerHour: fuelFlow, timeHours: fuelTime, totalFuel: fuelTotal }),
        [fuelFlow, fuelTime, fuelTotal]
    );

    const performance = useMemo(() => {
        const tasResult = computeTrueAirspeed({ ias, pressureAltFt: pressureAlt });
        const daResult = computeDensityAltitude({ pressureAltFt: pressureAlt, oatC: oat });
        return { tasResult, daResult };
    }, [ias, pressureAlt, oat]);

    const tabItems = TABS.map((key) => ({ id: key, label: t(`flightComputer.tabs.${key}`) }));

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

                <SegmentedControl tabs={tabItems} value={tab} onChange={setTab} ariaLabel={t("flightComputer.title")} />

                {tab === "wind" ? (
                    <WorkbenchCard
                        title={t("flightComputer.windTitle")}
                        lead={t("flightComputer.windCopy")}
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
                ) : null}

                {tab === "tsd" ? (
                    <WorkbenchCard
                        title={t("flightComputer.tsdTitle")}
                        lead={t("flightComputer.tsdCopy")}
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
                        footer={!tsd ? <p className="muted">{t("flightComputer.tsdHint")}</p> : null}
                    />
                ) : null}

                {tab === "fuel" ? (
                    <WorkbenchCard
                        title={t("flightComputer.fuelTitle")}
                        lead={t("flightComputer.fuelCopy")}
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
                        footer={!fuel ? <p className="muted">{t("flightComputer.fuelHint")}</p> : null}
                    />
                ) : null}

                {tab === "performance" ? (
                    <div className="growth-two-col">
                        <WorkbenchCard
                            title={t("flightComputer.tasTitle")}
                            inputs={
                                <div className="growth-field-grid growth-field-grid--2">
                                    <Field label={t("flightComputer.ias")} value={ias} onChange={setIas} unit="kt" />
                                    <Field label={t("flightComputer.pressureAlt")} value={pressureAlt} onChange={setPressureAlt} unit="ft" />
                                </div>
                            }
                            results={
                                <ResultHighlight
                                    items={[{ label: t("flightComputer.tas"), value: `${performance.tasResult.tas} kt` }]}
                                />
                            }
                            footer={<p className="muted">{t("flightComputer.tasNote")}</p>}
                        />
                        <WorkbenchCard
                            title={t("flightComputer.daTitle")}
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
                            footer={<p className="muted">{t("flightComputer.daNote")}</p>}
                        />
                    </div>
                ) : null}

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
