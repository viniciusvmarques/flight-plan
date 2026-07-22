import { useEffect, useMemo, useState } from "react";
import Card from "./Card";
import { calculatePlanner, fmtDeg, fmtMinutes } from "../utils/plannerEngine";
import { useI18n } from "../i18n/I18nContext.jsx";
import { suggestRunwayFromMetar } from "../utils/suggestRunwayFromMetar";

function profileDisplayName(user) {
    return [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
}

function resolveElevationFt(airport) {
    const raw =
        airport?.elevationFt ??
        airport?.elevation_ft ??
        airport?.elev_ft ??
        airport?.elevation ??
        null;
    const n = Number(raw);
    return Number.isFinite(n) ? Math.round(n) : null;
}

function resolveSuggestedRunway(airport, metar) {
    const runways = airport?.runways || [];
    if (!runways.length) return "";
    const sug = suggestRunwayFromMetar(runways, metar);
    return sug?.suggested?.ident || "";
}

function formatElevationLabel(ft) {
    return Number.isFinite(ft) ? String(ft) : "";
}

function formatBriefingDate(locale) {
    try {
        return new Intl.DateTimeFormat(locale || "pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(new Date());
    } catch {
        return new Date().toLocaleDateString();
    }
}

function formatUtcClock() {
    const now = new Date();
    const hh = String(now.getUTCHours()).padStart(2, "0");
    const mm = String(now.getUTCMinutes()).padStart(2, "0");
    const ss = String(now.getUTCSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}Z`;
}

function PenBox({ label }) {
    return (
        <label className="plan-field briefing-cell briefing-pen-field">
            <span className="label">{label}</span>
            <div className="briefing-pen-line" />
        </label>
    );
}

function Field({ label, children, hint, className = "" }) {
    return (
        <label className={`plan-field ${className}`.trim()}>
            <span className="label">{label}</span>
            {children}
            {hint ? <span className="plan-field-hint">{hint}</span> : null}
        </label>
    );
}

function SelectField({ label, value, onChange, options, hint }) {
    return (
        <Field label={label} hint={hint}>
            <select className="input" value={value} onChange={(event) => onChange(event.target.value)}>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </Field>
    );
}

function MetricBox({ label, value, tone = "neutral" }) {
    return (
        <div className={`plan-metric plan-metric--${tone}`}>
            <span className="plan-metric-label">{label}</span>
            <strong className="plan-metric-value">{value}</strong>
        </div>
    );
}

function SectionHead({ step, title, children }) {
    return (
        <div className="plan-section-head plan-section-head--numbered">
            <span className="plan-step">{step}</span>
            <div>
                <div className="card-title">{title}</div>
                {children ? <p className="plan-section-copy">{children}</p> : null}
            </div>
        </div>
    );
}

function StationContext({ letter, title, station }) {
    if (!station) return null;
    return (
        <div className="plan-context-card">
            <div className="plan-context-head">
                <span className="chip">{letter}</span>
                <strong>{title}</strong>
            </div>
            <div className="plan-context-copy">
                <div>{station.icao}</div>
                <div>{station.airport?.name || "Aeródromo"}</div>
                <div>Elevação: {station.airport?.elevationFt ? `${station.airport.elevationFt} ft` : "—"}</div>
                <div>Pistas: {station.airport?.runwaysText || "—"}</div>
            </div>
        </div>
    );
}

function SummaryLine({ label, value }) {
    return (
        <div className="plan-summary-line">
            <span>{label}</span>
            <strong>{value || "—"}</strong>
        </div>
    );
}

function ChecklistItem({ item }) {
    return (
        <div className={`plan-check-item ${item.ok ? "plan-check-item--ok" : item.advisory ? "plan-check-item--info" : "plan-check-item--warn"}`}>
            <span>{item.ok ? "OK" : item.advisory ? "Verificar" : "Atenção"}</span>
            <strong>{item.label}</strong>
        </div>
    );
}

function RouteChip({ base }) {
    return (
        <span className="chip plan-route-chip">
            <span className="plan-route-point">
                <strong>A</strong>
                <span>{base?.origin?.icao || "----"}</span>
            </span>
            {base?.dest?.icao ? (
                <>
                    <span className="plan-route-arrow">→</span>
                    <span className="plan-route-point">
                        <strong>B</strong>
                        <span>{base.dest.icao}</span>
                    </span>
                </>
            ) : null}
        </span>
    );
}

function createNavLegId() {
    return `leg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function emptyNavLeg(name = "") {
    return {
        id: createNavLegId(),
        name,
        distanceNm: "",
        trueCourseDeg: "",
        windDirectionDeg: "",
        windSpeedKt: "",
        iasKt: "",
        tasKt: "",
        groundSpeedKt: "",
        fuelFlowLph: "",
    };
}

function migrateLegacyCheckpoints(plan, destIcao) {
    if (!Array.isArray(plan?.vfrCheckpoints) || !plan.vfrCheckpoints.length) return null;
    return plan.vfrCheckpoints.map((item, index) => ({
        id: item?.id || createNavLegId(),
        name: item?.name || (index === plan.vfrCheckpoints.length - 1 ? destIcao || "" : ""),
        distanceNm: item?.distanceNm ?? "",
        trueCourseDeg: item?.trueCourseDeg ?? "",
        windDirectionDeg: item?.windDirectionDeg ?? "",
        windSpeedKt: item?.windSpeedKt ?? "",
        tasKt: item?.tasKt ?? "",
        iasKt: item?.iasKt ?? "",
        groundSpeedKt: item?.groundSpeedKt ?? "",
        fuelFlowLph: item?.fuelFlowLph ?? "",
    }));
}

function resolveEditableNavLegs(plan, destIcao) {
    if (Array.isArray(plan?.navLegs) && plan.navLegs.length) {
        // Migra rascunho antigo: única perna com nome = ICAO destino → TOC.
        if (plan.navLegs.length === 1 && destIcao) {
            const only = plan.navLegs[0];
            const name = String(only?.name || "").trim().toUpperCase();
            if (name === String(destIcao).toUpperCase()) {
                return [{ ...only, name: "TOC" }];
            }
        }
        return plan.navLegs;
    }
    const legacy = migrateLegacyCheckpoints(plan, destIcao);
    if (legacy?.length) return legacy;
    // 1ª perna: origem → TOC (não o destino final).
    return [
        {
            id: "leg-initial",
            name: "TOC",
            distanceNm: "",
            trueCourseDeg: "",
            windDirectionDeg: "",
            windSpeedKt: "",
            iasKt: "",
            tasKt: "",
            groundSpeedKt: "",
            fuelFlowLph: "",
        },
    ];
}

function legFromLabel(legs, index, originIcao) {
    if (index <= 0) return originIcao || "ORIG";
    const prev = String(legs[index - 1]?.name || "").trim();
    return prev || `Ponto ${index}`;
}

function legToLabel(leg, t) {
    const name = String(leg?.name || "").trim();
    return name || t("planner.nextFix");
}

function NavLegsTable({ legs }) {
    if (!legs?.length) return null;
    return (
        <div className="plan-nav-table-wrap">
            <table className="plan-nav-table">
                <thead>
                    <tr>
                        <th>Perna</th>
                        <th>Dist</th>
                        <th>RV</th>
                        <th>RM</th>
                        <th>Proa</th>
                        <th>GS</th>
                        <th>ETE</th>
                        <th>Acum.</th>
                    </tr>
                </thead>
                <tbody>
                    {legs.map((leg) => (
                        <tr key={leg.id || leg.code || leg.label}>
                            <td>{leg.label}</td>
                            <td>{Number.isFinite(leg.distanceNm) ? `${leg.distanceNm.toFixed(0)} NM` : "—"}</td>
                            <td>{fmtDeg(leg.trueCourseDeg)}</td>
                            <td>{fmtDeg(leg.magCourseDeg)}</td>
                            <td>{fmtDeg(leg.headingDeg)}</td>
                            <td>{Number.isFinite(leg.gsKt) && leg.gsKt > 0 ? `${leg.gsKt.toFixed(0)} kt` : "—"}</td>
                            <td>{fmtMinutes(leg.eteMin ?? leg.timeMin)}</td>
                            <td>{fmtMinutes(leg.cumulativeEteMin ?? leg.eteMin ?? leg.timeMin)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function NavLegsEditor({ legs, calcLegs, originIcao, onChange, t }) {
    function updateLeg(index, key, value) {
        const next = legs.map((leg, i) => (i === index ? { ...leg, [key]: value } : leg));
        onChange(next);
    }

    function addLeg() {
        onChange([...legs, emptyNavLeg("")]);
    }

    function removeLeg(index) {
        if (legs.length <= 1) {
            onChange([{ ...emptyNavLeg("TOC"), id: "leg-initial" }]);
            return;
        }
        onChange(legs.filter((_, i) => i !== index));
    }

    return (
        <div className="plan-nav-editor">
            <div className="plan-nav-editor-head">
                <div>
                    <strong>{t("planner.navLogTitle")}</strong>
                    <p className="plan-section-copy">{t("planner.navLogCopy")}</p>
                </div>
                <div className="plan-nav-origin chip ok">
                    {t("planner.originPoint")}: <strong>{originIcao || "----"}</strong>
                </div>
            </div>

            <div className="plan-nav-legs">
                {legs.map((leg, index) => {
                    const from = legFromLabel(legs, index, originIcao);
                    const toHint = legToLabel(leg, t);
                    const namePlaceholder = index === 0 ? "TOC" : t("planner.nextFix");
                    const calcLeg = calcLegs?.[index];
                    const tasAuto = calcLeg?.tasKt > 0 ? `${Number(calcLeg.tasKt).toFixed(0)} kt` : "—";
                    const gsAuto = calcLeg?.gsKt > 0 ? `${Number(calcLeg.gsKt).toFixed(0)} kt` : "—";
                    const eteAuto = Number(calcLeg?.eteMin) > 0 ? fmtMinutes(calcLeg.eteMin) : "—";
                    const fuelAuto = Number(calcLeg?.fuelL) > 0 ? `${Number(calcLeg.fuelL).toFixed(1)} L` : "—";
                    return (
                        <div key={leg.id || `leg-${index}`} className="plan-nav-leg-card">
                            <div className="plan-nav-leg-toolbar">
                                <div className="plan-nav-leg-title">
                                    <span className="plan-leg-code">{t("planner.legNumber", { n: index + 1 })}</span>
                                    <strong className="plan-nav-leg-route">
                                        {from} → {toHint}
                                    </strong>
                                </div>
                                <div className="plan-nav-leg-actions">
                                    {legs.length > 1 ? (
                                        <button type="button" className="btn btn-ghost" onClick={() => removeLeg(index)}>
                                            {t("planner.removeWaypoint")}
                                        </button>
                                    ) : null}
                                </div>
                            </div>

                            <div className="plan-nav-leg-grid">
                                <Field className="nav-leg-cell" label={t("planner.waypointName")}>
                                    <input
                                        className="input"
                                        value={leg.name ?? ""}
                                        onChange={(e) => updateLeg(index, "name", e.target.value)}
                                        placeholder={namePlaceholder}
                                    />
                                </Field>
                                <Field className="nav-leg-cell" label={t("planner.legDistance")}>
                                    <input
                                        className="input"
                                        value={leg.distanceNm ?? ""}
                                        onChange={(e) => updateLeg(index, "distanceNm", e.target.value)}
                                        placeholder="42"
                                    />
                                </Field>
                                <Field className="nav-leg-cell" label={t("planner.legCourse")}>
                                    <input
                                        className="input"
                                        value={leg.trueCourseDeg ?? ""}
                                        onChange={(e) => updateLeg(index, "trueCourseDeg", e.target.value)}
                                        placeholder="092"
                                    />
                                </Field>
                                <Field className="nav-leg-cell" label={t("planner.legWindDir")}>
                                    <input
                                        className="input"
                                        value={leg.windDirectionDeg ?? ""}
                                        onChange={(e) => updateLeg(index, "windDirectionDeg", e.target.value)}
                                        placeholder="140"
                                    />
                                </Field>
                                <Field className="nav-leg-cell" label={t("planner.legWindSpeed")}>
                                    <input
                                        className="input"
                                        value={leg.windSpeedKt ?? ""}
                                        onChange={(e) => updateLeg(index, "windSpeedKt", e.target.value)}
                                        placeholder="12"
                                    />
                                </Field>
                                <Field className="nav-leg-cell" label={t("planner.legIas")}>
                                    <input
                                        className="input"
                                        value={leg.iasKt ?? ""}
                                        onChange={(e) => updateLeg(index, "iasKt", e.target.value)}
                                        placeholder="105"
                                        data-testid="leg-ias"
                                    />
                                </Field>
                                <Field className="nav-leg-cell" label={t("planner.legFuelFlow")}>
                                    <input
                                        className="input"
                                        value={leg.fuelFlowLph ?? ""}
                                        onChange={(e) => updateLeg(index, "fuelFlowLph", e.target.value)}
                                        placeholder="34"
                                        data-testid="leg-fuel-flow"
                                    />
                                </Field>
                            </div>

                            <div className="plan-nav-leg-metrics">
                                <MetricBox label="TAS" value={tasAuto} tone="ok" />
                                <MetricBox label="GS" value={gsAuto} tone="ok" />
                                <MetricBox label="ETE" value={eteAuto} />
                                <MetricBox label={t("planner.legFuel")} value={fuelAuto} tone="warn" />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="plan-nav-add-row">
                <button type="button" className="btn btn-secondary plan-nav-add" onClick={addLeg}>
                    {t("planner.addWaypoint")}
                </button>
            </div>
        </div>
    );
}

export default function FlightPlanStack({ base, plan, onPlanChange, user = null }) {
    const p = plan || {};
    const { t, locale } = useI18n();
    const originIcao = base?.origin?.icao || "A";
    const destIcao = base?.dest?.icao || "";
    const altnIcao = base?.alternate?.icao || "";
    const navLegsDraft = resolveEditableNavLegs(p, destIcao);
    const workingPlan = { ...p, routeMode: "checkpoints", navLegs: navLegsDraft };
    const [utcNow, setUtcNow] = useState(() => formatUtcClock());

    const calc = calculatePlanner(workingPlan, {
        originAirport: base?.origin?.airport || null,
        destAirport: base?.dest?.airport || null,
        alternateAirport: base?.alternate?.airport || null,
        originStation: base?.origin || null,
        destStation: base?.dest || null,
        alternateStation: base?.alternate || null,
        originIcao,
        destIcao,
        alternateIcao: altnIcao,
    });

    const profileName = useMemo(() => profileDisplayName(user), [user]);
    const pilotNameValue = p.pilotName != null ? p.pilotName : profileName;
    const briefingDate = useMemo(() => formatBriefingDate(locale), [locale]);
    const routeDistanceLabel = calc.routeDistNm > 0 ? calc.routeDistNm.toFixed(0) : "";

    useEffect(() => {
        const id = window.setInterval(() => setUtcNow(formatUtcClock()), 1000);
        return () => window.clearInterval(id);
    }, []);

    useEffect(() => {
        if (!onPlanChange) return;
        const patches = {};

        const originIcaoNow = String(base?.origin?.icao || "").toUpperCase();
        const destIcaoNow = String(base?.dest?.icao || "").toUpperCase();
        const altnIcaoNow = String(base?.alternate?.icao || "").toUpperCase();
        const originAirport = base?.origin?.airport;
        const destAirport = base?.dest?.airport;
        const altnAirport = base?.alternate?.airport;

        if (originIcaoNow && originIcaoNow !== "A") {
            const elev = resolveElevationFt(originAirport);
            const syncKey = `${originIcaoNow}:${elev ?? "na"}`;
            if (p.depAutoKey !== syncKey) {
                const rwy = resolveSuggestedRunway(originAirport, base?.origin?.metar);
                patches.depAutoKey = syncKey;
                patches.depAutoIcao = originIcaoNow;
                if (elev != null) patches.depAltFt = formatElevationLabel(elev);
                if (rwy) patches.depRwy = rwy;
            } else if (originAirport) {
                if ((p.depRwy == null || p.depRwy === "") && originAirport.runways?.length) {
                    const rwy = resolveSuggestedRunway(originAirport, base?.origin?.metar);
                    if (rwy) patches.depRwy = rwy;
                }
            }
        }

        if (destIcaoNow) {
            const elev = resolveElevationFt(destAirport);
            const syncKey = `${destIcaoNow}:${elev ?? "na"}`;
            if (p.arrAutoKey !== syncKey) {
                const rwy = resolveSuggestedRunway(destAirport, base?.dest?.metar);
                patches.arrAutoKey = syncKey;
                patches.arrAutoIcao = destIcaoNow;
                if (elev != null) patches.arrAltFt = formatElevationLabel(elev);
                if (rwy) patches.arrRwy = rwy;
            } else if (destAirport) {
                if ((p.arrRwy == null || p.arrRwy === "") && destAirport.runways?.length) {
                    const rwy = resolveSuggestedRunway(destAirport, base?.dest?.metar);
                    if (rwy) patches.arrRwy = rwy;
                }
            }
        }

        if (altnIcaoNow) {
            const elev = resolveElevationFt(altnAirport);
            const syncKey = `${altnIcaoNow}:${elev ?? "na"}`;
            if (p.altnAutoKey !== syncKey) {
                const rwy = resolveSuggestedRunway(altnAirport, base?.alternate?.metar);
                patches.altnAutoKey = syncKey;
                patches.altnAutoIcao = altnIcaoNow;
                patches.altnIcao = altnIcaoNow;
                if (elev != null) patches.altnAltFt = formatElevationLabel(elev);
                if (rwy) patches.altnRwy = rwy;
            } else if (altnAirport) {
                if ((p.altnRwy == null || p.altnRwy === "") && altnAirport.runways?.length) {
                    const rwy = resolveSuggestedRunway(altnAirport, base?.alternate?.metar);
                    if (rwy) patches.altnRwy = rwy;
                }
                if (!p.altnIcao) patches.altnIcao = altnIcaoNow;
            }
        } else if (p.altnAutoKey || p.altnAutoIcao) {
            patches.altnAutoKey = "";
            patches.altnAutoIcao = "";
            patches.altnIcao = "";
            patches.altnRwy = "";
            patches.altnAltFt = "";
        }

        if (!Object.keys(patches).length) return;
        onPlanChange({ ...p, routeMode: "checkpoints", navLegs: navLegsDraft, ...patches });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        base?.origin?.icao,
        base?.dest?.icao,
        base?.alternate?.icao,
        base?.origin?.metar,
        base?.dest?.metar,
        base?.alternate?.metar,
        base?.origin?.airport?.elevationFt,
        base?.dest?.airport?.elevationFt,
        base?.alternate?.airport?.elevationFt,
        base?.origin?.airport?.runways?.length,
        base?.dest?.airport?.runways?.length,
        base?.alternate?.airport?.runways?.length,
    ]);

    function setField(key, value) {
        const next = { ...p, routeMode: "checkpoints", navLegs: navLegsDraft, [key]: value };
        if (key === "flightRule" && value === "IFR" && !next.reserveRule) {
            next.reserveRule = "IFR 45 min";
            next.finalReserveMin = next.finalReserveMin || 45;
        }
        if (key === "flightRule" && value === "VFR" && !next.reserveRule) {
            next.reserveRule = "VFR 30 min";
            next.finalReserveMin = next.finalReserveMin || 30;
        }
        onPlanChange?.(next);
    }

    function setAtcFreq(key, value) {
        const atc = { ...(p.atcFreqs || {}), [key]: value };
        setField("atcFreqs", atc);
    }

    function setNavLegs(nextLegs) {
        onPlanChange?.({ ...p, navLegs: nextLegs, routeMode: "checkpoints" });
    }

    const atc = p.atcFreqs || {};

    return (
        <Card title={t("planner.title")}>
            <div className="plan-stack plan-stack--anac">
                <section className="plan-panel plan-panel--dark briefing-sheet">
                    <SectionHead step="1" title={t("planner.briefing")}>
                        {t("planner.briefingCopy")}
                    </SectionHead>

                    <p className="briefing-disclaimer">{t("planner.briefingDisclaimer")}</p>

                    <div className="briefing-lines">
                        <div className="briefing-line briefing-line--id">
                            <Field className="briefing-cell" label={t("planner.aircraftId")}>
                                <input
                                    className="input"
                                    value={p.registration ?? ""}
                                    onChange={(e) => setField("registration", e.target.value.toUpperCase())}
                                    placeholder="PR-ABC"
                                />
                            </Field>
                            <Field className="briefing-cell" label={t("planner.pilotName")}>
                                <input
                                    className="input"
                                    value={pilotNameValue}
                                    onChange={(e) => setField("pilotName", e.target.value)}
                                    placeholder={t("planner.pilotNamePlaceholder")}
                                />
                            </Field>
                            <Field className="briefing-cell" label={t("planner.briefingDate")}>
                                <input className="input" value={briefingDate} readOnly />
                            </Field>
                        </div>

                        <div className="briefing-line briefing-line--route">
                            <Field className="briefing-cell" label={t("common.origin")}>
                                <input className="input" value={originIcao === "A" ? "" : originIcao} readOnly placeholder="ICAO" />
                            </Field>
                            <Field className="briefing-cell" label={t("common.destination")}>
                                <input className="input" value={destIcao} readOnly placeholder="ICAO" />
                            </Field>
                            <Field className="briefing-cell" label={t("planner.speedKt")}>
                                <input
                                    className="input"
                                    value={p.tasKt ?? ""}
                                    onChange={(e) => setField("tasKt", e.target.value)}
                                    placeholder="120"
                                />
                            </Field>
                            <Field className="briefing-cell" label={t("planner.flightLevel")}>
                                <input
                                    className="input"
                                    value={p.cruiseLevel ?? ""}
                                    onChange={(e) => setField("cruiseLevel", e.target.value.toUpperCase())}
                                    placeholder="FL090"
                                />
                            </Field>
                            <Field className="briefing-cell" label={t("planner.distanceNm")}>
                                <input className="input" value={routeDistanceLabel} readOnly placeholder="—" />
                            </Field>
                        </div>

                        <div className="briefing-line briefing-line--times">
                            <Field className="briefing-cell" label={t("planner.utcTime")}>
                                <input className="input briefing-utc" value={utcNow} readOnly />
                            </Field>
                            <PenBox label={t("planner.startupTime")} />
                            <PenBox label={t("planner.takeoffTime")} />
                            <PenBox label={t("planner.landingTime")} />
                            <PenBox label={t("planner.shutdownTime")} />
                        </div>

                        <div className="briefing-line briefing-line--atc">
                            <Field className="briefing-cell" label="CLR">
                                <input className="input" value={atc.clr ?? ""} onChange={(e) => setAtcFreq("clr", e.target.value)} placeholder="118.—" />
                            </Field>
                            <Field className="briefing-cell" label="GND">
                                <input className="input" value={atc.gnd ?? ""} onChange={(e) => setAtcFreq("gnd", e.target.value)} placeholder="121.—" />
                            </Field>
                            <Field className="briefing-cell" label="TWR">
                                <input className="input" value={atc.twr ?? ""} onChange={(e) => setAtcFreq("twr", e.target.value)} placeholder="118.—" />
                            </Field>
                            <Field className="briefing-cell" label="APP">
                                <input className="input" value={atc.app ?? ""} onChange={(e) => setAtcFreq("app", e.target.value)} placeholder="119.—" />
                            </Field>
                            <Field className="briefing-cell" label="CTR">
                                <input className="input" value={atc.ctr ?? ""} onChange={(e) => setAtcFreq("ctr", e.target.value)} placeholder="129.—" />
                            </Field>
                            <Field className="briefing-cell" label={t("planner.atcDest")}>
                                <input className="input" value={atc.dest ?? ""} onChange={(e) => setAtcFreq("dest", e.target.value)} placeholder="DEST" />
                            </Field>
                        </div>

                        <div className="briefing-line briefing-line--ops">
                            <Field className="briefing-cell" label={t("planner.depAirport")}>
                                <input className="input" value={originIcao === "A" ? "" : originIcao} readOnly placeholder="ICAO" />
                            </Field>
                            <Field className="briefing-cell" label={t("planner.depRwy")}>
                                <input className="input" value={p.depRwy ?? ""} onChange={(e) => setField("depRwy", e.target.value.toUpperCase())} placeholder="09" />
                            </Field>
                            <Field className="briefing-cell" label={t("planner.depAlt")}>
                                <input className="input" value={p.depAltFt ?? ""} onChange={(e) => setField("depAltFt", e.target.value)} placeholder="ft" />
                            </Field>
                            <Field className="briefing-cell" label={t("planner.depNotes")}>
                                <input className="input" value={p.depNotes ?? ""} onChange={(e) => setField("depNotes", e.target.value)} placeholder={t("planner.notesPlaceholder")} />
                            </Field>
                        </div>

                        <div className="briefing-line briefing-line--ops">
                            <Field className="briefing-cell" label={t("planner.arrAirport")}>
                                <input className="input" value={destIcao} readOnly placeholder="ICAO" />
                            </Field>
                            <Field className="briefing-cell" label={t("planner.arrRwy")}>
                                <input className="input" value={p.arrRwy ?? ""} onChange={(e) => setField("arrRwy", e.target.value.toUpperCase())} placeholder="27" />
                            </Field>
                            <Field className="briefing-cell" label={t("planner.arrAlt")}>
                                <input className="input" value={p.arrAltFt ?? ""} onChange={(e) => setField("arrAltFt", e.target.value)} placeholder="ft" />
                            </Field>
                            <Field className="briefing-cell" label={t("planner.arrNotes")}>
                                <input className="input" value={p.arrNotes ?? ""} onChange={(e) => setField("arrNotes", e.target.value)} placeholder={t("planner.notesPlaceholder")} />
                            </Field>
                        </div>

                        <div className="briefing-line briefing-line--ops">
                            <Field className="briefing-cell" label={t("planner.altnAirport")}>
                                <input
                                    className="input"
                                    value={p.altnIcao ?? altnIcao}
                                    onChange={(e) => setField("altnIcao", e.target.value.toUpperCase())}
                                    placeholder="ICAO"
                                />
                            </Field>
                            <Field className="briefing-cell" label={t("planner.altnRwy")}>
                                <input className="input" value={p.altnRwy ?? ""} onChange={(e) => setField("altnRwy", e.target.value.toUpperCase())} placeholder="—" />
                            </Field>
                            <Field className="briefing-cell" label={t("planner.altnAlt")}>
                                <input className="input" value={p.altnAltFt ?? ""} onChange={(e) => setField("altnAltFt", e.target.value)} placeholder="ft" />
                            </Field>
                            <Field className="briefing-cell" label={t("planner.altnNotes")}>
                                <input className="input" value={p.altnNotes ?? ""} onChange={(e) => setField("altnNotes", e.target.value)} placeholder={t("planner.notesPlaceholder")} />
                            </Field>
                        </div>
                    </div>

                    <div className="plan-chip-row briefing-meta-row">
                        <RouteChip base={base} />
                        {altnIcao ? (
                            <span className="chip warn plan-route-chip plan-route-chip--compact">
                                <span className="plan-route-point">
                                    <strong>C</strong>
                                    <span>{altnIcao}</span>
                                </span>
                            </span>
                        ) : null}
                        <label className="briefing-rule-select">
                            <span className="label">{t("planner.flightRule")}</span>
                            <select
                                className="input"
                                value={p.flightRule || "VFR"}
                                onChange={(e) => setField("flightRule", e.target.value)}
                            >
                                <option value="VFR">VFR</option>
                                <option value="IFR">IFR</option>
                            </select>
                        </label>
                    </div>
                </section>

                <section className="plan-panel">
                    <SectionHead step="2" title={t("planner.navigation")}>
                        {t("planner.navigationCopyCheckpoints")}
                    </SectionHead>

                    <NavLegsEditor
                        legs={navLegsDraft}
                        calcLegs={calc.navLegs}
                        originIcao={originIcao}
                        onChange={setNavLegs}
                        t={t}
                    />
                    <NavLegsTable legs={calc.navLegs} />

                    <div className="plan-summary-grid plan-summary-grid--4">
                        <MetricBox label="Rumo magnético" value={fmtDeg(calc.magCourseDeg)} />
                        <MetricBox label="Proa" value={fmtDeg(calc.headingDeg)} tone="ok" />
                        <MetricBox label="GS" value={calc.groundSpeedKt ? `${calc.groundSpeedKt.toFixed(0)} kt` : "—"} tone="ok" />
                        <MetricBox label="EET" value={fmtMinutes(calc.eetMinutes)} />
                    </div>

                    <div className="plan-chip-row">
                        <span className="chip">Proa/cauda: {Number.isFinite(calc.headwindKt) ? `${calc.headwindKt.toFixed(0)} kt` : "—"}</span>
                        <span className="chip">Través: {Number.isFinite(calc.crosswindKt) ? `${Math.abs(calc.crosswindKt).toFixed(0)} kt` : "—"}</span>
                        <span className="chip">Correção: {calc.windCorrectionDeg ? `${calc.windCorrectionDeg.toFixed(1)}°` : "—"}</span>
                        {calc.useNavLegs ? <span className="chip ok">{calc.navLog?.routeLabel}</span> : null}
                    </div>
                </section>

                <section className="plan-panel">
                    <SectionHead step="3" title={t("planner.fuel")}>
                        {t("planner.fuelCopy")}
                    </SectionHead>

                    <div className="plan-grid plan-grid--4">
                        <Field label="Fuel flow cruzeiro (L/h)">
                            <input className="input" value={p.fuelFlowCruiseLph ?? ""} onChange={(e) => setField("fuelFlowCruiseLph", e.target.value)} placeholder="34" />
                        </Field>
                        <Field label="Capacidade útil (L)">
                            <input className="input" value={p.usableFuelL ?? ""} onChange={(e) => setField("usableFuelL", e.target.value)} placeholder="201" />
                        </Field>
                        <Field label="Combustível a bordo (L)">
                            <input className="input" value={p.fuelOnBoardL ?? ""} onChange={(e) => setField("fuelOnBoardL", e.target.value)} placeholder="170" />
                        </Field>
                        <Field label="Desejado no pouso (L)">
                            <input className="input" value={p.desiredLandingFuelL ?? ""} onChange={(e) => setField("desiredLandingFuelL", e.target.value)} placeholder="34" />
                        </Field>
                    </div>

                    <div className="plan-summary-grid plan-summary-grid--4">
                        <MetricBox label={t("planner.toc")} value={`${calc.toc.distanceFromOriginNm.toFixed(0)} NM · ${fmtMinutes(calc.toc.eteMin)}`} tone="ok" />
                        <MetricBox label={t("planner.tod")} value={`${calc.tod.distanceFromOriginNm.toFixed(0)} NM · ${fmtMinutes(calc.tod.eteMin)}`} tone="ok" />
                        <MetricBox label={t("planner.climbDist")} value={`${calc.climbDistNm.toFixed(0)} NM`} />
                        <MetricBox label={t("planner.descentDist")} value={`${calc.descentDistNm.toFixed(0)} NM`} />
                    </div>

                    <div className="plan-phase-grid">
                        <div className="plan-mini-panel">
                            <div className="card-title">Táxi e subida</div>
                            <div className="plan-grid plan-grid--2">
                                <Field label="Táxi (L)">
                                    <input className="input" value={p.taxiFuelL ?? ""} onChange={(e) => setField("taxiFuelL", e.target.value)} placeholder="8" />
                                </Field>
                                <Field label="Subida (min)">
                                    <input className="input" value={p.climbTimeMin ?? ""} onChange={(e) => setField("climbTimeMin", e.target.value)} placeholder="14" />
                                </Field>
                                <Field label="Comb. subida (L)">
                                    <input className="input" value={p.climbFuelL ?? ""} onChange={(e) => setField("climbFuelL", e.target.value)} placeholder="18" />
                                </Field>
                                <Field label="Descida (min)">
                                    <input className="input" value={p.descentTimeMin ?? ""} onChange={(e) => setField("descentTimeMin", e.target.value)} placeholder="10" />
                                </Field>
                            </div>
                        </div>

                        <div className="plan-mini-panel">
                            <div className="card-title">Cruzeiro</div>
                            <div className="plan-grid plan-grid--2">
                                <SelectField
                                    label="Modo"
                                    value={p.cruiseMode ?? "auto"}
                                    onChange={(value) => setField("cruiseMode", value)}
                                    options={[
                                        { value: "auto", label: "Automático" },
                                        { value: "manual", label: "Manual" },
                                    ]}
                                />
                                <Field
                                    label="Distância cruzeiro (NM)"
                                    hint={
                                        calc.useNavLegs
                                            ? `Comb. pernas: ${calc.cruiseFuelLAuto.toFixed(1)} L (VI × vento × consumo)`
                                            : String(p.cruiseMode ?? "auto") === "auto"
                                              ? `Auto: ${calc.cruiseDistAutoNm.toFixed(0)} NM (rota − subida − descida)`
                                              : null
                                    }
                                >
                                    <input className="input" value={p.cruiseDistNm ?? ""} onChange={(e) => setField("cruiseDistNm", e.target.value)} placeholder={String(calc.cruiseDistAutoNm.toFixed(0))} />
                                </Field>
                                {String(p.cruiseMode ?? "auto") === "manual" ? (
                                    <>
                                        <Field label="Tempo cruzeiro (min)">
                                            <input className="input" value={p.cruiseTimeMin ?? ""} onChange={(e) => setField("cruiseTimeMin", e.target.value)} placeholder="48" />
                                        </Field>
                                        <Field label="Comb. cruzeiro (L)">
                                            <input className="input" value={p.cruiseFuelL ?? ""} onChange={(e) => setField("cruiseFuelL", e.target.value)} placeholder="28" />
                                        </Field>
                                    </>
                                ) : (
                                    <>
                                        <MetricBox label="Tempo" value={fmtMinutes(calc.cruiseTimeMinAuto)} />
                                        <MetricBox label="Combustível" value={`${calc.cruiseFuelLAuto.toFixed(1)} L`} tone="warn" />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="plan-mini-panel">
                            <div className="card-title">Reservas</div>
                            <div className="plan-grid plan-grid--2">
                                <Field label="Descida (L)">
                                    <input className="input" value={p.descentFuelL ?? ""} onChange={(e) => setField("descentFuelL", e.target.value)} placeholder="5" />
                                </Field>
                                <Field label="Aproximação (L)">
                                    <input className="input" value={p.approachFuelL ?? ""} onChange={(e) => setField("approachFuelL", e.target.value)} placeholder="4" />
                                </Field>
                                <Field label="Contingência (%)">
                                    <input className="input" value={p.contingencyPct ?? ""} onChange={(e) => setField("contingencyPct", e.target.value)} placeholder="5" />
                                </Field>
                                <Field label="Reserva final (min)">
                                    <input className="input" value={p.finalReserveMin ?? ""} onChange={(e) => setField("finalReserveMin", e.target.value)} placeholder="45" />
                                </Field>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="plan-panel">
                    <SectionHead step="4" title={t("planner.alternate")}>
                        {t("planner.alternateCopy")}
                    </SectionHead>

                    <div className="plan-grid plan-grid--4">
                        <Field label="Perna B-C (NM)" hint={calc.suggestedAlternateDistNm > 0 ? `Sugestão: ${calc.suggestedAlternateDistNm} NM` : null}>
                            <input className="input" value={p.alternateLegDistNm ?? ""} onChange={(e) => setField("alternateLegDistNm", e.target.value)} placeholder="opcional" />
                        </Field>
                        <Field label="GS alternado (kt)">
                            <input className="input" value={p.alternateGsKt ?? ""} onChange={(e) => setField("alternateGsKt", e.target.value)} placeholder="usa GS base" />
                        </Field>
                        <Field label="Comb. alternado (L)">
                            <input className="input" value={p.alternateFuelL ?? ""} onChange={(e) => setField("alternateFuelL", e.target.value)} placeholder="auto se vazio" />
                        </Field>
                        <Field label="Extra fuel (L)">
                            <input className="input" value={p.extraFuelL ?? ""} onChange={(e) => setField("extraFuelL", e.target.value)} placeholder="0" />
                        </Field>
                    </div>

                    <div className="plan-grid plan-grid--2">
                        <Field label="Notas IFR / procedimento">
                            <textarea className="input plan-textarea" value={p.ifrProcedureNotes ?? ""} onChange={(e) => setField("ifrProcedureNotes", e.target.value)} placeholder="SID, rota, STAR, IAC, mínimos, RMK..." />
                        </Field>
                        <Field label="Observações VFR / navegação">
                            <textarea className="input plan-textarea" value={p.notes ?? ""} onChange={(e) => setField("notes", e.target.value)} placeholder="Referências visuais, restrições, NOTAM/ROTAER..." />
                        </Field>
                    </div>
                </section>

                <section className="plan-panel plan-panel--accent">
                    <SectionHead step="5" title={t("planner.summary")}>
                        {t("planner.summaryCopy")}
                    </SectionHead>

                    {calc.useNavLegs ? (
                        <div className="plan-chip-row">
                            <span className="chip ok plan-route-chip">{calc.navLog.routeLabel}</span>
                            <span className="chip">TOC {calc.toc.distanceFromOriginNm.toFixed(0)} NM</span>
                            <span className="chip">TOD {calc.tod.distanceFromOriginNm.toFixed(0)} NM</span>
                        </div>
                    ) : null}

                    <div className="plan-brief-grid">
                        <SummaryLine label="Identificação" value={calc.flightPlanSummary.aircraftId} />
                        <SummaryLine label="Regra" value={calc.flightPlanSummary.rule} />
                        <SummaryLine label="Rota" value={calc.flightPlanSummary.route} />
                        <SummaryLine label="Velocidade" value={calc.flightPlanSummary.speed} />
                        <SummaryLine label="Nível" value={calc.flightPlanSummary.level} />
                        <SummaryLine label="EET" value={calc.flightPlanSummary.eet} />
                        <SummaryLine label="Autonomia" value={calc.flightPlanSummary.endurance} />
                        <SummaryLine label="Alternado" value={calc.flightPlanSummary.alternate} />
                    </div>

                    <div className="plan-summary-grid plan-summary-grid--4">
                        <MetricBox label="Requerido" value={`${calc.requiredFuelL.toFixed(1)} L`} tone={calc.fuelMarginL >= 0 ? "warn" : "bad"} />
                        <MetricBox label="A bordo" value={`${calc.fuelOnBoardL.toFixed(1)} L`} tone="ok" />
                        <MetricBox label="No pouso" value={`${calc.estimatedLandingFuelL.toFixed(1)} L`} tone={calc.estimatedLandingFuelL >= calc.desiredLandingFuelL ? "ok" : "warn"} />
                        <MetricBox label="Margem" value={`${calc.fuelMarginL.toFixed(1)} L`} tone={calc.fuelMarginL >= 0 ? "ok" : "bad"} />
                    </div>

                    <div className="plan-summary-grid plan-summary-grid--4">
                        <MetricBox label="Táxi" value={`${calc.taxiFuelL.toFixed(1)} L`} />
                        <MetricBox label="Trip" value={`${calc.tripFuelL.toFixed(1)} L`} />
                        <MetricBox label="Reservas" value={`${calc.reservesFuelL.toFixed(1)} L`} />
                        <MetricBox label="Após requerido" value={`${calc.remainingAfterRequiredL.toFixed(1)} L`} tone={calc.remainingAfterRequiredL > 0 ? "ok" : "warn"} />
                    </div>

                    <div className="plan-context-grid">
                        <StationContext letter="A" title="Origem" station={base?.origin} />
                        <StationContext letter="B" title="Destino" station={base?.dest} />
                        <StationContext letter="C" title="Alternativa" station={base?.alternate} />
                    </div>

                    {calc.useNavLegs ? <NavLegsTable legs={calc.navLegs} /> : null}

                    {calc.legs.length ? (
                        <div className="plan-leg-list">
                            {calc.legs.map((leg) => (
                                <div key={leg.code} className="plan-leg-card">
                                    <span className="plan-leg-code">{leg.code}</span>
                                    <strong>{leg.label}</strong>
                                    <span>{leg.distanceNm.toFixed(0)} NM</span>
                                    <span>{leg.gsKt.toFixed(0)} kt</span>
                                    <span>{fmtMinutes(leg.timeMin)}</span>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    <div className="plan-check-grid">
                        {calc.checklist.map((item) => (
                            <ChecklistItem key={item.key} item={item} />
                        ))}
                    </div>

                    {calc.warnings.length ? (
                        <div className="plan-warning-list">
                            {calc.warnings.map((warning) => (
                                <div key={warning} className="detail-error">
                                    {warning}
                                </div>
                            ))}
                        </div>
                    ) : null}

                    <div className="plan-total">
                        <div className="plan-total-label">Combustível total requerido</div>
                        <div className="plan-total-value">
                            {calc.totalFuelL.toFixed(1)} <span>L</span>
                        </div>
                        <div className="plan-total-sub">
                            Estimativa didática baseada em táxi, trip, alternado, contingência, reserva final e extra. Não substitui ROTAER, NOTAM, cartas, manual da aeronave ou julgamento do piloto.
                        </div>
                    </div>
                </section>
            </div>
        </Card>
    );
}
