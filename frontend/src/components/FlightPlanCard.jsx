import { useMemo, useState } from "react";
import Card from "./Card";
import {
    computeFlightPlan,
    fromLiters,
    minutesToHHMM,
    toLiters
} from "../utils/flightPlanCalc";

function isPosNumber(v) {
    const n = Number(v);
    return Number.isFinite(n) && n > 0;
}

export default function FlightPlanCard({ base }) {
    const [fuelUnit, setFuelUnit] = useState("L"); // "L" | "USG"

    // inputs (string para UX)
    const [distanceNm, setDistanceNm] = useState("");
    const [groundSpeedKt, setGroundSpeedKt] = useState("");
    const [burn, setBurn] = useState(""); // L/h ou USG/h (depende do seletor)
    const [fuelOnBoard, setFuelOnBoard] = useState(""); // L ou USG
    const [reserveMin, setReserveMin] = useState("45");

    // conversões internas para litros
    const burnLph = useMemo(() => toLiters(burn, fuelUnit), [burn, fuelUnit]);
    const fobLiters = useMemo(() => toLiters(fuelOnBoard, fuelUnit), [fuelOnBoard, fuelUnit]);

    const result = useMemo(() => {
        return computeFlightPlan({
            distanceNm,
            groundSpeedKt,
            burnPerHour: burnLph,
            fuelOnBoard: fobLiters,
            reserveMinutes: reserveMin
        });
    }, [distanceNm, groundSpeedKt, burnLph, fobLiters, reserveMin]);

    const header = useMemo(() => {
        const o = base?.origin?.icao;
        const d = base?.dest?.icao;
        const a = base?.alternate?.icao;

        if (o && d && a) return `PLANO DE VOO • ${o} → ${d} (ALT: ${a})`;
        if (o && d) return `PLANO DE VOO • ${o} → ${d}`;
        if (o) return `PLANO DE VOO • ${o}`;
        return "PLANO DE VOO";
    }, [base]);

    const burnLabel = fuelUnit === "L" ? "Consumo (L/h)" : "Consumo (USG/h)";
    const fobLabel = fuelUnit === "L" ? "Combustível a bordo (L)" : "Combustível a bordo (USG)";

    function clearAll() {
        setDistanceNm("");
        setGroundSpeedKt("");
        setBurn("");
        setFuelOnBoard("");
        setReserveMin("45");
        setFuelUnit("L");
    }

    // mensagens rápidas de validação (sem “encher o saco”)
    const hints = useMemo(() => {
        const msgs = [];
        if (distanceNm && !isPosNumber(distanceNm)) msgs.push("Distância deve ser > 0");
        if (groundSpeedKt && !isPosNumber(groundSpeedKt)) msgs.push("GS deve ser > 0");
        if (burn && !isPosNumber(burn)) msgs.push("Consumo deve ser > 0");
        if (fuelOnBoard && !isPosNumber(fuelOnBoard)) msgs.push("FOB deve ser > 0");
        if (reserveMin && Number(reserveMin) < 0) msgs.push("Reserva não pode ser negativa");
        return msgs;
    }, [distanceNm, groundSpeedKt, burn, fuelOnBoard, reserveMin]);

    return (
        <Card title={header}>
            <div style={{ display: "grid", gap: "12px" }}>
                {/* Inputs */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                        <label className="label">Distância (NM)</label>
                        <input
                            className="input"
                            value={distanceNm}
                            onChange={(e) => setDistanceNm(e.target.value)}
                            placeholder="ex: 245"
                            inputMode="decimal"
                        />
                    </div>

                    <div>
                        <label className="label">Ground Speed (kt)</label>
                        <input
                            className="input"
                            value={groundSpeedKt}
                            onChange={(e) => setGroundSpeedKt(e.target.value)}
                            placeholder="ex: 110"
                            inputMode="decimal"
                        />
                    </div>

                    <div>
                        <label className="label">{burnLabel}</label>
                        <input
                            className="input"
                            value={burn}
                            onChange={(e) => setBurn(e.target.value)}
                            placeholder={fuelUnit === "L" ? "ex: 32" : "ex: 8.5"}
                            inputMode="decimal"
                        />
                    </div>

                    <div>
                        <label className="label">{fobLabel}</label>
                        <input
                            className="input"
                            value={fuelOnBoard}
                            onChange={(e) => setFuelOnBoard(e.target.value)}
                            placeholder={fuelUnit === "L" ? "ex: 120" : "ex: 32"}
                            inputMode="decimal"
                        />
                    </div>

                    <div>
                        <label className="label">Reserva (min)</label>
                        <input
                            className="input"
                            value={reserveMin}
                            onChange={(e) => setReserveMin(e.target.value)}
                            placeholder="ex: 45"
                            inputMode="numeric"
                        />
                    </div>

                    <div>
                        <label className="label">Unidade</label>
                        <select className="input" value={fuelUnit} onChange={(e) => setFuelUnit(e.target.value)}>
                            <option value="L">Litros (L)</option>
                            <option value="USG">Galões (USG)</option>
                        </select>
                    </div>
                </div>

                {/* hints */}
                {hints.length > 0 && (
                    <div style={{ fontSize: "12px", opacity: 0.8 }}>
                        ⚠️ {hints.join(" • ")}
                    </div>
                )}

                <div className="divider" />

                {/* Resultados */}
                {!result.ok ? (
                    <div style={{ opacity: 0.8, fontSize: "13px" }}>
                        {result.error}
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "8px" }}>
                        <Row label="ETE" value={minutesToHHMM(result.eteMinutes)} />

                        <Row
                            label="Trip Fuel"
                            value={`${fromLiters(result.tripFuel, fuelUnit).toFixed(1)} ${fuelUnit}`}
                        />

                        <Row
                            label="Reserve Fuel"
                            value={`${fromLiters(result.reserveFuel, fuelUnit).toFixed(1)} ${fuelUnit}`}
                        />

                        <Row
                            label="Total Required"
                            value={`${fromLiters(result.totalRequired, fuelUnit).toFixed(1)} ${fuelUnit}`}
                        />

                        <Row label="Endurance" value={minutesToHHMM(result.enduranceMinutes)} />

                        <Row
                            label="Fuel Remaining"
                            value={`${fromLiters(result.fuelRemaining, fuelUnit).toFixed(1)} ${fuelUnit}`}
                        />

                        <div style={{ marginTop: "6px", display: "flex", gap: "10px", alignItems: "center" }}>
                            <span className={`chip ${chipClass(result.status)}`}>{result.status}</span>

                            <button
                                className="secondary"
                                onClick={clearAll}
                                style={{ marginLeft: "auto" }}
                                type="button"
                            >
                                Limpar
                            </button>
                        </div>

                        <div style={{ opacity: 0.7, fontSize: "12px", marginTop: "6px" }}>
                            * Cálculo simplificado (linha reta não considerada). Confirme sempre com planejamento operacional oficial.
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}

function Row({ label, value }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ opacity: 0.75 }}>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}

function chipClass(status) {
    if (status === "OK") return "ok";
    if (status === "MARGEM BAIXA") return "warn";
    if (status === "INSUFICIENTE") return "bad";
    return "warn";
}
