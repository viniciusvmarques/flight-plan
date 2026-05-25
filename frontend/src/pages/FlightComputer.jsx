import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import Card from "../components/Card";
import GrowthPageHero from "../components/GrowthPageHero";
import GrowthCtaBar from "../components/GrowthCtaBar";
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

    return (
        <div className="main-shell">
            <AppHeader title={t("flightComputer.title")} subtitle={t("flightComputer.subtitle")} />
            <main className="main-scroll growth-page flight-computer-page">
                <GrowthPageHero
                    kicker={t("flightComputer.kicker")}
                    title={t("flightComputer.heroTitle")}
                    copy={t("flightComputer.heroCopy")}
                    statValue="E6B"
                    statLabel={t("flightComputer.statLabel")}
                />

                <div className="flight-computer-tabs" role="tablist" aria-label={t("flightComputer.title")}>
                    {TABS.map((key) => (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={tab === key}
                            className={`flight-computer-tab ${tab === key ? "flight-computer-tab--active" : ""}`}
                            onClick={() => setTab(key)}
                        >
                            {t(`flightComputer.tabs.${key}`)}
                        </button>
                    ))}
                </div>

                {tab === "wind" ? (
                    <Card title={t("flightComputer.windTitle")}>
                        <p className="growth-section-lead">{t("flightComputer.windCopy")}</p>
                        <div className="growth-field-grid">
                            <Field label={t("flightComputer.trueCourse")} value={trueCourse} onChange={setTrueCourse} unit="°" />
                            <Field label={t("flightComputer.tas")} value={tas} onChange={setTas} unit="kt" />
                            <Field label={t("flightComputer.windDir")} value={windDir} onChange={setWindDir} unit="°" />
                            <Field label={t("flightComputer.windSpeed")} value={windSpeed} onChange={setWindSpeed} unit="kt" />
                        </div>
                        {wind ? (
                            <div className="flight-computer-results">
                                <div className="growth-result-item">
                                    <span>{t("flightComputer.wca")}</span>
                                    <strong>{wind.wca > 0 ? "+" : ""}{wind.wca}°</strong>
                                </div>
                                <div className="growth-result-item">
                                    <span>{t("flightComputer.heading")}</span>
                                    <strong>{wind.heading}°</strong>
                                </div>
                                <div className="growth-result-item">
                                    <span>{t("flightComputer.groundSpeed")}</span>
                                    <strong>{wind.groundSpeed} kt</strong>
                                </div>
                            </div>
                        ) : null}
                    </Card>
                ) : null}

                {tab === "tsd" ? (
                    <Card title={t("flightComputer.tsdTitle")}>
                        <p className="growth-section-lead">{t("flightComputer.tsdCopy")}</p>
                        <div className="growth-field-grid growth-field-grid--2">
                            <Field label={t("flightComputer.distance")} value={tsdDistance} onChange={setTsdDistance} unit="nm" />
                            <Field label={t("flightComputer.speed")} value={tsdSpeed} onChange={setTsdSpeed} unit="kt" placeholder="—" />
                            <Field label={t("flightComputer.time")} value={tsdTime} onChange={setTsdTime} unit="h" />
                        </div>
                        {tsd ? (
                            <div className="flight-computer-results">
                                <div className="growth-result-item">
                                    <span>{t("flightComputer.distance")}</span>
                                    <strong>{tsd.distance} nm</strong>
                                </div>
                                <div className="growth-result-item">
                                    <span>{t("flightComputer.speed")}</span>
                                    <strong>{tsd.speed} kt</strong>
                                </div>
                                <div className="growth-result-item">
                                    <span>{t("flightComputer.time")}</span>
                                    <strong>{formatHoursMinutes(tsd.timeHours)}</strong>
                                </div>
                            </div>
                        ) : (
                            <p className="muted">{t("flightComputer.tsdHint")}</p>
                        )}
                    </Card>
                ) : null}

                {tab === "fuel" ? (
                    <Card title={t("flightComputer.fuelTitle")}>
                        <p className="growth-section-lead">{t("flightComputer.fuelCopy")}</p>
                        <div className="growth-field-grid growth-field-grid--2">
                            <Field label={t("flightComputer.fuelFlow")} value={fuelFlow} onChange={setFuelFlow} unit="L/h" />
                            <Field label={t("flightComputer.fuelTime")} value={fuelTime} onChange={setFuelTime} unit="h" />
                            <Field label={t("flightComputer.fuelTotal")} value={fuelTotal} onChange={setFuelTotal} unit="L" placeholder="—" />
                        </div>
                        {fuel ? (
                            <div className="flight-computer-results">
                                <div className="growth-result-item">
                                    <span>{t("flightComputer.fuelFlow")}</span>
                                    <strong>{fuel.flowPerHour} L/h</strong>
                                </div>
                                <div className="growth-result-item">
                                    <span>{t("flightComputer.fuelTime")}</span>
                                    <strong>{formatHoursMinutes(fuel.timeHours)}</strong>
                                </div>
                                <div className="growth-result-item">
                                    <span>{t("flightComputer.fuelTotal")}</span>
                                    <strong>{fuel.totalFuel} L</strong>
                                </div>
                            </div>
                        ) : (
                            <p className="muted">{t("flightComputer.fuelHint")}</p>
                        )}
                    </Card>
                ) : null}

                {tab === "performance" ? (
                    <div className="growth-two-col">
                        <Card title={t("flightComputer.tasTitle")}>
                            <div className="growth-field-grid growth-field-grid--2">
                                <Field label={t("flightComputer.ias")} value={ias} onChange={setIas} unit="kt" />
                                <Field label={t("flightComputer.pressureAlt")} value={pressureAlt} onChange={setPressureAlt} unit="ft" />
                            </div>
                            <div className="flight-computer-results flight-computer-results--single">
                                <div className="growth-result-item">
                                    <span>{t("flightComputer.tas")}</span>
                                    <strong>{performance.tasResult.tas} kt</strong>
                                </div>
                            </div>
                            <p className="muted flight-computer-note">{t("flightComputer.tasNote")}</p>
                        </Card>
                        <Card title={t("flightComputer.daTitle")}>
                            <div className="growth-field-grid growth-field-grid--2">
                                <Field label={t("flightComputer.pressureAlt")} value={pressureAlt} onChange={setPressureAlt} unit="ft" />
                                <Field label={t("flightComputer.oat")} value={oat} onChange={setOat} unit="°C" />
                            </div>
                            <div className="flight-computer-results">
                                <div className="growth-result-item growth-result-item--muted">
                                    <span>{t("flightComputer.isaTemp")}</span>
                                    <strong>{performance.daResult.isaTempC}°C</strong>
                                </div>
                                <div className="growth-result-item">
                                    <span>{t("flightComputer.densityAlt")}</span>
                                    <strong>{performance.daResult.densityAltFt.toLocaleString()} ft</strong>
                                </div>
                            </div>
                            <p className="muted flight-computer-note">{t("flightComputer.daNote")}</p>
                        </Card>
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
