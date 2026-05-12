import Card from "./Card";
import { calculatePlanner, fmtHours, fmtMinutes } from "../utils/plannerEngine";

function Field({ label, children, hint }) {
    return (
        <label className="plan-field">
            <span className="label">{label}</span>
            {children}
            {hint ? <span className="plan-field-hint">{hint}</span> : null}
        </label>
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

export default function FlightPlanStack({ base, plan, onPlanChange }) {
    const p = plan || {};
    const calc = calculatePlanner(p, {
        originAirport: base?.origin?.airport || null,
        destAirport: base?.dest?.airport || null,
        alternateAirport: base?.alternate?.airport || null,
        originIcao: base?.origin?.icao || "A",
        destIcao: base?.dest?.icao || "",
        alternateIcao: base?.alternate?.icao || "",
    });

    function setField(key, value) {
        onPlanChange?.({ ...p, [key]: value });
    }

    return (
        <Card title="Planejador operacional">
            <div className="plan-stack">
                <section className="plan-panel plan-panel--dark">
                    <div className="plan-section-head">
                        <div className="card-title">Missão e parâmetros básicos</div>
                        <p className="plan-section-copy">
                            Ajuste os dados essenciais do voo com liberdade total, sem depender de um perfil pré-carregado.
                        </p>
                    </div>

                    <div className="plan-chip-row">
                        <span className="chip">{base?.dest?.icao ? `A ${base?.origin?.icao || "----"} → B ${base.dest.icao}` : `A ${base?.origin?.icao || "----"}`}</span>
                        {base?.alternate?.icao ? <span className="chip warn">C {base.alternate.icao}</span> : <span className="chip">Sem C</span>}
                        <span className="chip ok">{p.reserveRule || "Reserva livre"}</span>
                    </div>

                    <div className="plan-grid plan-grid--2">
                        <Field label="Callsign / identificação">
                            <input
                                className="input"
                                value={p.callsign ?? ""}
                                onChange={(e) => setField("callsign", e.target.value.toUpperCase())}
                                placeholder="PP-ABC / MARQUISA 01"
                            />
                        </Field>
                        <Field label="Matrícula">
                            <input className="input" value={p.registration ?? ""} onChange={(e) => setField("registration", e.target.value.toUpperCase())} placeholder="PT-ABC" />
                        </Field>
                    </div>

                    <div className="plan-grid plan-grid--3">
                        <Field label="Nível / altitude (ft)">
                            <input className="input" value={p.cruiseAltFt ?? p.defaultCruiseAltFt ?? ""} onChange={(e) => setField("cruiseAltFt", e.target.value)} placeholder="6500" />
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
                    <div className="plan-section-head">
                        <div className="card-title">Base da rota</div>
                        <p className="plan-section-copy">Ajuste distância, velocidade, vento e política de combustível do voo atual.</p>
                    </div>

                    <div className="plan-grid plan-grid--4">
                        <Field label="Distância planejada (NM)" hint={calc.suggestedRouteDistNm > 0 ? `Sugestão A-B: ${calc.suggestedRouteDistNm} NM` : null}>
                            <input className="input" value={p.routeDistNm ?? ""} onChange={(e) => setField("routeDistNm", e.target.value)} placeholder="165" />
                        </Field>
                        <Field label="TAS (kt)">
                            <input className="input" value={p.tasKt ?? ""} onChange={(e) => setField("tasKt", e.target.value)} placeholder="122" />
                        </Field>
                        <Field label="Componente de vento (kt)">
                            <input className="input" value={p.windCompKt ?? ""} onChange={(e) => setField("windCompKt", e.target.value)} placeholder="+10 / -10" />
                        </Field>
                        <MetricBox label="GS estimado" value={calc.gsKt ? `${calc.gsKt.toFixed(0)} kt` : "—"} tone="ok" />
                    </div>

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

                    <div className="plan-grid plan-grid--4">
                        <Field label="Táxi (L)">
                            <input className="input" value={p.taxiFuelL ?? ""} onChange={(e) => setField("taxiFuelL", e.target.value)} placeholder="8" />
                        </Field>
                        <Field label="Approach / landing (L)">
                            <input className="input" value={p.approachFuelL ?? ""} onChange={(e) => setField("approachFuelL", e.target.value)} placeholder="4" />
                        </Field>
                        <Field label="Contingência (%)">
                            <input className="input" value={p.contingencyPct ?? ""} onChange={(e) => setField("contingencyPct", e.target.value)} placeholder="5" />
                        </Field>
                        <Field label="Reserva final (min)">
                            <input className="input" value={p.finalReserveMin ?? ""} onChange={(e) => setField("finalReserveMin", e.target.value)} placeholder="45" />
                        </Field>
                    </div>

                    <div className="plan-grid plan-grid--2">
                        <Field label="Extra fuel (L)" hint="Coloque aqui combustível extra de operação, espera, replanejamento ou margem adicional.">
                            <input className="input" value={p.extraFuelL ?? ""} onChange={(e) => setField("extraFuelL", e.target.value)} placeholder="0" />
                        </Field>
                        <Field label="Observações operacionais">
                            <input className="input" value={p.notes ?? ""} onChange={(e) => setField("notes", e.target.value)} placeholder="PAX leves, pista molhada, alternado obrigatório..." />
                        </Field>
                    </div>
                </section>

                <div className="plan-phase-grid">
                    <section className="plan-panel">
                        <div className="card-title">Subida</div>
                        <div className="plan-grid plan-grid--2">
                            <Field label="Tempo (min)">
                                <input className="input" value={p.climbTimeMin ?? ""} onChange={(e) => setField("climbTimeMin", e.target.value)} placeholder="14" />
                            </Field>
                            <Field label="Combustível (L)">
                                <input className="input" value={p.climbFuelL ?? ""} onChange={(e) => setField("climbFuelL", e.target.value)} placeholder="18" />
                            </Field>
                        </div>
                    </section>

                    <section className="plan-panel">
                        <div className="card-title">Cruzeiro</div>
                        <div className="plan-grid plan-grid--3">
                            <Field label="Modo de cruzeiro">
                                <select className="input" value={p.cruiseMode ?? "auto"} onChange={(e) => setField("cruiseMode", e.target.value)}>
                                    <option value="auto">Auto</option>
                                    <option value="manual">Manual</option>
                                </select>
                            </Field>
                            <Field label="Distância cruzeiro (NM)">
                                <input className="input" value={p.cruiseDistNm ?? ""} onChange={(e) => setField("cruiseDistNm", e.target.value)} placeholder="vazio = A-B" />
                            </Field>
                            <Field label="GS cruzeiro (kt)">
                                <input className="input" value={p.cruiseGsKt ?? ""} onChange={(e) => setField("cruiseGsKt", e.target.value)} placeholder="vazio = GS base" />
                            </Field>
                        </div>

                        {String(p.cruiseMode ?? "auto") === "manual" ? (
                            <div className="plan-grid plan-grid--2">
                                <Field label="Tempo cruzeiro (min)">
                                    <input className="input" value={p.cruiseTimeMin ?? ""} onChange={(e) => setField("cruiseTimeMin", e.target.value)} placeholder="48" />
                                </Field>
                                <Field label="Combustível cruzeiro (L)">
                                    <input className="input" value={p.cruiseFuelL ?? ""} onChange={(e) => setField("cruiseFuelL", e.target.value)} placeholder="28" />
                                </Field>
                            </div>
                        ) : (
                            <div className="plan-grid plan-grid--2">
                                <MetricBox label="Tempo automático" value={fmtMinutes(calc.cruiseTimeMinAuto)} />
                                <MetricBox label="Combustível automático" value={`${calc.cruiseFuelLAuto.toFixed(1)} L`} tone="warn" />
                            </div>
                        )}
                    </section>

                    <section className="plan-panel">
                        <div className="card-title">Descida e alternado</div>
                        <div className="plan-grid plan-grid--2">
                            <Field label="Tempo descida (min)">
                                <input className="input" value={p.descentTimeMin ?? ""} onChange={(e) => setField("descentTimeMin", e.target.value)} placeholder="10" />
                            </Field>
                            <Field label="Combustível descida (L)">
                                <input className="input" value={p.descentFuelL ?? ""} onChange={(e) => setField("descentFuelL", e.target.value)} placeholder="5" />
                            </Field>
                        </div>

                        <div className="plan-grid plan-grid--3">
                            <Field label="Perna B-C (NM)" hint={calc.suggestedAlternateDistNm > 0 ? `Sugestão B-C: ${calc.suggestedAlternateDistNm} NM` : null}>
                                <input className="input" value={p.alternateLegDistNm ?? ""} onChange={(e) => setField("alternateLegDistNm", e.target.value)} placeholder="opcional" />
                            </Field>
                            <Field label="GS alternado (kt)">
                                <input className="input" value={p.alternateGsKt ?? ""} onChange={(e) => setField("alternateGsKt", e.target.value)} placeholder="usa GS base" />
                            </Field>
                            <Field label="Combustível alternado (L)">
                                <input className="input" value={p.alternateFuelL ?? ""} onChange={(e) => setField("alternateFuelL", e.target.value)} placeholder="auto se vazio" />
                            </Field>
                        </div>
                    </section>
                </div>

                <section className="plan-panel">
                    <div className="plan-section-head">
                        <div className="card-title">Contexto operacional</div>
                        <p className="plan-section-copy">Elevação, pistas e estrutura básica dos aeródromos já entram no mesmo fluxo do planner.</p>
                    </div>

                    <div className="plan-context-grid">
                        <StationContext letter="A" title="Origem" station={base?.origin} />
                        <StationContext letter="B" title="Destino" station={base?.dest} />
                        <StationContext letter="C" title="Alternativa" station={base?.alternate} />
                    </div>
                </section>

                <section className="plan-panel plan-panel--accent">
                    <div className="plan-section-head">
                        <div className="card-title">Resultado ao vivo</div>
                        <p className="plan-section-copy">Blocos de combustível, margem de bordo, endurance e navlog simplificado por perna.</p>
                    </div>

                    <div className="plan-chip-row">
                        <span className="chip ok">Trip: {fmtMinutes(calc.tripTimeMin)}</span>
                        <span className="chip warn">Trip fuel: {calc.tripFuelL.toFixed(1)} L</span>
                        <span className="chip">Alternado: {calc.alternateFuelL.toFixed(1)} L</span>
                        <span className="chip">Reserva final: {calc.finalReserveFuelL.toFixed(1)} L</span>
                        <span className={`chip ${calc.fuelMarginL >= 0 ? "ok" : "bad"}`}>Margem: {calc.fuelMarginL.toFixed(1)} L</span>
                    </div>

                    <div className="plan-summary-grid plan-summary-grid--4">
                        <MetricBox label="Required fuel" value={`${calc.requiredFuelL.toFixed(1)} L`} tone="bad" />
                        <MetricBox label="A bordo" value={`${calc.fuelOnBoardL.toFixed(1)} L`} tone="ok" />
                        <MetricBox label="No pouso" value={`${calc.estimatedLandingFuelL.toFixed(1)} L`} tone={calc.estimatedLandingFuelL >= calc.desiredLandingFuelL ? "ok" : "warn"} />
                        <MetricBox label="Endurance" value={fmtHours(calc.enduranceHours)} />
                    </div>

                    <div className="plan-summary-grid plan-summary-grid--4">
                        <MetricBox label="Táxi" value={`${calc.taxiFuelL.toFixed(1)} L`} />
                        <MetricBox label="Trip" value={`${calc.tripFuelL.toFixed(1)} L`} />
                        <MetricBox label="Reservas" value={`${calc.reservesFuelL.toFixed(1)} L`} />
                        <MetricBox label="Após requerido" value={`${calc.remainingAfterRequiredL.toFixed(1)} L`} tone={calc.remainingAfterRequiredL > 0 ? "ok" : "warn"} />
                    </div>

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
                        <div className="plan-total-label">Total estimado de combustível</div>
                        <div className="plan-total-value">
                            {calc.totalFuelL.toFixed(1)} <span>L</span>
                        </div>
                        <div className="plan-total-sub">
                            Inclui táxi, trip, alternado, contingência, reserva final e extra fuel. Base forte para GA, em caráter estimativo.
                        </div>
                    </div>
                </section>
            </div>
        </Card>
    );
}

