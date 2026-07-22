import Card from "./Card";
import { calculatePlanner, fmtDeg, fmtMinutes } from "../utils/plannerEngine";
import { useI18n } from "../i18n/I18nContext.jsx";

function Field({ label, children, hint }) {
    return (
        <label className="plan-field">
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
        tasKt: "",
        groundSpeedKt: "",
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
        groundSpeedKt: item?.groundSpeedKt ?? "",
    }));
}

function resolveEditableNavLegs(plan, destIcao) {
    if (Array.isArray(plan?.navLegs) && plan.navLegs.length) return plan.navLegs;
    return migrateLegacyCheckpoints(plan, destIcao);
}

function NavLogTable({ legs }) {
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

function NavLegsEditor({ legs, originIcao, destIcao, onChange, t }) {
    function updateLeg(index, key, value) {
        const next = legs.map((leg, i) => (i === index ? { ...leg, [key]: value } : leg));
        onChange(next);
    }

    function addWaypoint() {
        const next = [...legs];
        if (!next.length) {
            onChange([emptyNavLeg(""), emptyNavLeg(destIcao || "")]);
            return;
        }
        const insertAt = Math.max(0, next.length - 1);
        next.splice(insertAt, 0, emptyNavLeg(""));
        const last = next[next.length - 1];
        if (destIcao && (!last.name || last.name === destIcao)) {
            next[next.length - 1] = { ...last, name: destIcao };
        }
        onChange(next);
    }

    function removeLeg(index) {
        if (legs.length <= 1) {
            onChange([]);
            return;
        }
        onChange(legs.filter((_, i) => i !== index));
    }

    function moveLeg(index, delta) {
        const target = index + delta;
        if (target < 0 || target >= legs.length) return;
        const next = [...legs];
        const [item] = next.splice(index, 1);
        next.splice(target, 0, item);
        onChange(next);
    }

    return (
        <div className="plan-nav-editor">
            <div className="plan-nav-editor-head">
                <div>
                    <strong>{t("planner.navLogTitle")}</strong>
                    <p className="plan-section-copy">{t("planner.navLogCopy")}</p>
                </div>
                <button type="button" className="btn btn-secondary plan-nav-add" onClick={addWaypoint}>
                    {t("planner.addWaypoint")}
                </button>
            </div>

            <div className="plan-nav-origin chip ok">
                {t("planner.originPoint")}: <strong>{originIcao || "A"}</strong>
            </div>

            {!legs.length ? (
                <p className="plan-section-copy">{t("planner.navLogCopy")}</p>
            ) : null}

            <div className="plan-nav-legs">
                {legs.map((leg, index) => {
                    const isLast = index === legs.length - 1;
                    return (
                        <div key={leg.id || `leg-${index}`} className="plan-nav-leg-card">
                            <div className="plan-nav-leg-toolbar">
                                <span className="plan-leg-code">{isLast ? "DEST" : `WP${index + 1}`}</span>
                                <div className="plan-nav-leg-actions">
                                    <button type="button" className="btn btn-ghost" disabled={index === 0} onClick={() => moveLeg(index, -1)} aria-label="Subir">
                                        ↑
                                    </button>
                                    <button type="button" className="btn btn-ghost" disabled={isLast} onClick={() => moveLeg(index, 1)} aria-label="Descer">
                                        ↓
                                    </button>
                                    <button type="button" className="btn btn-ghost" onClick={() => removeLeg(index)} aria-label={t("planner.removeWaypoint")}>
                                        {t("planner.removeWaypoint")}
                                    </button>
                                </div>
                            </div>
                            <div className="plan-grid plan-grid--4">
                                <Field label={t("planner.waypointName")}>
                                    <input
                                        className="input"
                                        value={leg.name ?? ""}
                                        onChange={(e) => updateLeg(index, "name", e.target.value)}
                                        placeholder={isLast ? destIcao || "Destino" : "Rio / cidade / ref. visual"}
                                    />
                                </Field>
                                <Field label={t("planner.legDistance")}>
                                    <input className="input" value={leg.distanceNm ?? ""} onChange={(e) => updateLeg(index, "distanceNm", e.target.value)} placeholder="42" />
                                </Field>
                                <Field label={t("planner.legCourse")}>
                                    <input className="input" value={leg.trueCourseDeg ?? ""} onChange={(e) => updateLeg(index, "trueCourseDeg", e.target.value)} placeholder={t("planner.inheritDefault")} />
                                </Field>
                                <Field label={t("planner.legWindDir")}>
                                    <input className="input" value={leg.windDirectionDeg ?? ""} onChange={(e) => updateLeg(index, "windDirectionDeg", e.target.value)} placeholder={t("planner.inheritDefault")} />
                                </Field>
                            </div>
                            <div className="plan-grid plan-grid--4">
                                <Field label={t("planner.legWindSpeed")}>
                                    <input className="input" value={leg.windSpeedKt ?? ""} onChange={(e) => updateLeg(index, "windSpeedKt", e.target.value)} placeholder={t("planner.inheritDefault")} />
                                </Field>
                                <Field label="TAS (kt)">
                                    <input className="input" value={leg.tasKt ?? ""} onChange={(e) => updateLeg(index, "tasKt", e.target.value)} placeholder={t("planner.inheritDefault")} />
                                </Field>
                                <Field label="GS (kt)">
                                    <input className="input" value={leg.groundSpeedKt ?? ""} onChange={(e) => updateLeg(index, "groundSpeedKt", e.target.value)} placeholder={t("planner.inheritDefault")} />
                                </Field>
                                <div className="plan-nav-leg-hint">{isLast ? t("planner.lastLegHint") : t("planner.waypointHint")}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function FlightPlanStack({ base, plan, onPlanChange }) {
    const p = plan || {};
    const { t } = useI18n();
    const calc = calculatePlanner(p, {
        originAirport: base?.origin?.airport || null,
        destAirport: base?.dest?.airport || null,
        alternateAirport: base?.alternate?.airport || null,
        originStation: base?.origin || null,
        destStation: base?.dest || null,
        alternateStation: base?.alternate || null,
        originIcao: base?.origin?.icao || "A",
        destIcao: base?.dest?.icao || "",
        alternateIcao: base?.alternate?.icao || "",
    });
    const isCheckpoints = String(p.routeMode || "direct") === "checkpoints";
    const navLegsDraft = isCheckpoints ? resolveEditableNavLegs(p, base?.dest?.icao || "") || [] : [];

    function setField(key, value) {
        const next = { ...p, [key]: value };
        if (key === "flightRule" && value === "IFR" && !next.reserveRule) {
            next.reserveRule = "IFR 45 min";
            next.finalReserveMin = next.finalReserveMin || 45;
        }
        if (key === "flightRule" && value === "VFR" && !next.reserveRule) {
            next.reserveRule = "VFR 30 min";
            next.finalReserveMin = next.finalReserveMin || 30;
        }
        if (key === "routeMode" && value === "checkpoints") {
            const existing = resolveEditableNavLegs(next, base?.dest?.icao || "");
            if (existing?.length) {
                next.navLegs = existing;
            } else if (!(Array.isArray(next.navLegs) && next.navLegs.length)) {
                next.navLegs = [emptyNavLeg(""), emptyNavLeg(base?.dest?.icao || "")];
            }
        }
        onPlanChange?.(next);
    }

    function setNavLegs(nextLegs) {
        onPlanChange?.({ ...p, navLegs: nextLegs, routeMode: "checkpoints" });
    }

    return (
        <Card title={t("planner.title")}>
            <div className="plan-stack plan-stack--anac">
                <section className="plan-panel plan-panel--dark">
                    <SectionHead step="1" title={t("planner.mission")}>
                        {t("planner.missionCopy")}
                    </SectionHead>

                    <div className="plan-chip-row">
                        <RouteChip base={base} />
                        {base?.alternate?.icao ? (
                            <span className="chip warn plan-route-chip plan-route-chip--compact">
                                <span className="plan-route-point">
                                    <strong>C</strong>
                                    <span>{base.alternate.icao}</span>
                                </span>
                            </span>
                        ) : (
                            <span className="chip">Sem C</span>
                        )}
                        <span className={`chip ${calc.flightRule === "IFR" ? "warn" : "ok"}`}>{calc.flightRule}</span>
                        <span className="chip">{calc.cruiseLevelLabel || "Nível pendente"}</span>
                    </div>

                    <div className="plan-grid plan-grid--4">
                        <SelectField
                            label={t("billing.plan")}
                            value={p.flightRule || "VFR"}
                            onChange={(value) => setField("flightRule", value)}
                            options={[
                                { value: "VFR", label: "VFR" },
                                { value: "IFR", label: "IFR" },
                            ]}
                            hint="Use IFR quando houver rota/procedimento por instrumentos."
                        />
                        <SelectField
                            label={t("planner.routeType")}
                            value={p.routeMode || "direct"}
                            onChange={(value) => setField("routeMode", value)}
                            options={[
                                { value: "direct", label: t("planner.routeDirect") },
                                { value: "manual", label: t("planner.routeManual") },
                                { value: "checkpoints", label: t("planner.routeCheckpoints") },
                            ]}
                        />
                        <Field label="Callsign / identificação">
                            <input className="input" value={p.callsign ?? ""} onChange={(e) => setField("callsign", e.target.value.toUpperCase())} placeholder="PP-ABC / MARQUISA 01" />
                        </Field>
                        <Field label="Registration">
                            <input className="input" value={p.registration ?? ""} onChange={(e) => setField("registration", e.target.value.toUpperCase())} placeholder="PT-ABC" />
                        </Field>
                    </div>

                    <div className="plan-grid plan-grid--4">
                        <Field label="Altitude (ft)">
                            <input className="input" value={p.cruiseAltFt ?? p.defaultCruiseAltFt ?? ""} onChange={(e) => setField("cruiseAltFt", e.target.value)} placeholder="6500" />
                        </Field>
                        <Field label="Nível / FL">
                            <input className="input" value={p.cruiseLevel ?? ""} onChange={(e) => setField("cruiseLevel", e.target.value.toUpperCase())} placeholder="FL090 / A065" />
                        </Field>
                        <Field label="Payload básico (kg)">
                            <input className="input" value={p.payloadKg ?? ""} onChange={(e) => setField("payloadKg", e.target.value)} placeholder="300" />
                        </Field>
                        <Field label="Regra de reserva">
                            <input className="input" value={p.reserveRule ?? ""} onChange={(e) => setField("reserveRule", e.target.value)} placeholder="IFR 45 min" />
                        </Field>
                    </div>
                </section>

                <section className="plan-panel">
                    <SectionHead step="2" title={t("planner.navigation")}>
                        {isCheckpoints ? t("planner.navigationCopyCheckpoints") : t("planner.navigationCopy")}
                    </SectionHead>

                    <div className="plan-grid plan-grid--4">
                        <Field
                            label={isCheckpoints ? t("planner.defaultsLabel") : "Distância A-B (NM)"}
                            hint={
                                isCheckpoints
                                    ? calc.useNavLegs
                                        ? `${t("planner.routeSum")}: ${calc.routeDistNm.toFixed(0)} NM`
                                        : calc.suggestedRouteDistNm > 0
                                          ? `Sugestão A-B: ${calc.suggestedRouteDistNm} NM`
                                          : null
                                    : calc.suggestedRouteDistNm > 0
                                      ? `Sugestão: ${calc.suggestedRouteDistNm} NM`
                                      : null
                            }
                        >
                            {isCheckpoints ? (
                                <input className="input" value={calc.routeDistNm ? calc.routeDistNm.toFixed(0) : ""} readOnly placeholder="soma das pernas" />
                            ) : (
                                <input className="input" value={p.routeDistNm ?? ""} onChange={(e) => setField("routeDistNm", e.target.value)} placeholder="165" />
                            )}
                        </Field>
                        <Field label="Rumo verdadeiro (°)" hint={isCheckpoints ? t("planner.defaultHint") : null}>
                            <input className="input" value={p.trueCourseDeg ?? ""} onChange={(e) => setField("trueCourseDeg", e.target.value)} placeholder="092" />
                        </Field>
                        <Field label="Declinação (E + / W -)">
                            <input className="input" value={p.magVariationDeg ?? ""} onChange={(e) => setField("magVariationDeg", e.target.value)} placeholder="-20" />
                        </Field>
                        <Field label="TAS (kt)">
                            <input className="input" value={p.tasKt ?? ""} onChange={(e) => setField("tasKt", e.target.value)} placeholder="122" />
                        </Field>
                    </div>

                    <div className="plan-grid plan-grid--4">
                        <Field label="Vento de (°)">
                            <input className="input" value={p.windDirectionDeg ?? ""} onChange={(e) => setField("windDirectionDeg", e.target.value)} placeholder="140" />
                        </Field>
                        <Field label="Vento (kt)">
                            <input className="input" value={p.windSpeedKt ?? ""} onChange={(e) => setField("windSpeedKt", e.target.value)} placeholder="12" />
                        </Field>
                        <Field label="GS manual (kt)" hint="Use se preferir informar GS direto.">
                            <input className="input" value={p.groundSpeedKt ?? ""} onChange={(e) => setField("groundSpeedKt", e.target.value)} placeholder="115" />
                        </Field>
                        <Field label="EET manual (min)">
                            <input className="input" value={p.eetMinutes ?? ""} onChange={(e) => setField("eetMinutes", e.target.value)} placeholder="vazio = automático" />
                        </Field>
                    </div>

                    {isCheckpoints ? (
                        <>
                            <NavLegsEditor
                                legs={navLegsDraft}
                                originIcao={base?.origin?.icao || "A"}
                                destIcao={base?.dest?.icao || ""}
                                onChange={setNavLegs}
                                t={t}
                            />
                            <NavLogTable legs={calc.navLegs} />
                        </>
                    ) : null}

                    <div className="plan-summary-grid plan-summary-grid--4">
                        <MetricBox label="Rumo magnético" value={fmtDeg(calc.magCourseDeg)} />
                        <MetricBox label="Proa corrigida" value={fmtDeg(calc.headingDeg)} tone="ok" />
                        <MetricBox label="GS estimado" value={calc.groundSpeedKt ? `${calc.groundSpeedKt.toFixed(0)} kt` : "—"} tone="ok" />
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
                                <Field label="Distância cruzeiro (NM)" hint={String(p.cruiseMode ?? "auto") === "auto" ? `Auto: ${calc.cruiseDistAutoNm.toFixed(0)} NM (rota − subida − descida)` : null}>
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
                            <textarea className="input plan-textarea" value={p.notes ?? ""} onChange={(e) => setField("notes", e.target.value)} placeholder="Referências visuais, checkpoints, restrições, NOTAM/ROTAER a verificar..." />
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
                            <span className="chip">
                                TOC {calc.toc.distanceFromOriginNm.toFixed(0)} NM
                            </span>
                            <span className="chip">
                                TOD {calc.tod.distanceFromOriginNm.toFixed(0)} NM
                            </span>
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

                    {calc.useNavLegs ? <NavLogTable legs={calc.navLegs} /> : null}

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
