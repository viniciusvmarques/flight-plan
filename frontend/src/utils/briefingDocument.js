import { classifyFromMetar } from "./classifyFlightCategory";
import { decodeMetarSummary } from "./metarDecoder";
import { fmtClock, fmtDeg, fmtMinutes } from "./plannerEngine";

function pad(value, size = 2) {
    return String(value ?? "").padStart(size, "0");
}

function fmtUtcStamp(date = new Date()) {
    const d = date instanceof Date ? date : new Date(date);
    return `${pad(d.getUTCDate())}${pad(d.getUTCMonth() + 1)}${String(d.getUTCFullYear()).slice(2)} / ${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}Z`;
}

function fmtNum(value, digits = 0, fallback = "—") {
    if (!Number.isFinite(Number(value))) return fallback;
    return Number(value).toFixed(digits);
}

function oneLine(text, max = 92) {
    const s = String(text || "")
        .replace(/\s+/g, " ")
        .trim();
    if (!s) return "—";
    return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function stationBlock(role, station, locale) {
    if (!station?.icao) return null;
    const category = classifyFromMetar(station.metar);
    const summary = decodeMetarSummary(station.metar, locale);
    return {
        role,
        icao: String(station.icao).toUpperCase(),
        name: station.airport?.name || "",
        category,
        hints: (summary.hints || []).slice(0, 3),
        metar: oneLine(station.metar || "METAR UNAVAILABLE", 110),
        taf: oneLine(station.taf || "TAF UNAVAILABLE", 110),
    };
}

/**
 * Modelo único usado no PDF e na impressão da ficha operacional.
 */
export function buildBriefingDocumentModel({ base, planner, locale = "pt-BR", brand = "MARQUISA" }) {
    const origin = base?.origin || null;
    const dest = base?.dest || null;
    const alternate = base?.alternate || null;
    const plan = base?.plan || {};
    const calc = planner || {};

    const route =
        dest?.icao
            ? `${origin?.icao || "----"} → ${dest.icao}`
            : String(origin?.icao || "----");

    const stations = [
        stationBlock("A · ORIG", origin, locale),
        dest ? stationBlock("B · DEST", dest, locale) : null,
        alternate ? stationBlock("C · ALTN", alternate, locale) : null,
    ].filter(Boolean);

    return {
        brand,
        generatedAtUtc: fmtUtcStamp(),
        route,
        originIcao: origin?.icao || "----",
        destIcao: dest?.icao || "",
        altnIcao: alternate?.icao || "",
        flightRule: String(calc.flightRule || plan.flightRule || "VFR").toUpperCase(),
        callsign: String(plan.callsign || plan.registration || "").toUpperCase() || "—",
        aircraft: String(plan.aircraftLabel || plan.registration || "").trim() || "—",
        cruise: calc.cruiseLevelLabel || "—",
        tas: Number.isFinite(calc.tasKt) && calc.tasKt > 0 ? `${fmtNum(calc.tasKt, 0)} KT` : "—",
        gs: Number.isFinite(calc.groundSpeedKt) && calc.groundSpeedKt > 0 ? `${fmtNum(calc.groundSpeedKt, 0)} KT` : "—",
        hdg: Number.isFinite(calc.headingDeg) ? `${fmtDeg(calc.headingDeg)}` : "—",
        magHdg: Number.isFinite(calc.magHeadingDeg) ? `${fmtDeg(calc.magHeadingDeg)}` : "—",
        distNm: Number.isFinite(calc.routeDistNm) ? `${fmtNum(calc.routeDistNm, 1)} NM` : "—",
        altnDistNm: Number.isFinite(calc.alternateLegDistNm) && calc.alternateLegDistNm > 0 ? `${fmtNum(calc.alternateLegDistNm, 1)} NM` : "—",
        ete: Number.isFinite(calc.tripTimeMin) ? fmtClock(calc.tripTimeMin) : "—",
        eteMin: Number.isFinite(calc.tripTimeMin) ? fmtMinutes(calc.tripTimeMin) : "—",
        endurance: Number.isFinite(calc.enduranceMin) ? fmtClock(calc.enduranceMin) : "—",
        fuelRequired: Number.isFinite(calc.requiredFuelL) ? `${fmtNum(calc.requiredFuelL, 1)} L` : "—",
        fuelOnBoard: Number.isFinite(calc.fuelOnBoardL) ? `${fmtNum(calc.fuelOnBoardL, 1)} L` : "—",
        fuelMargin: Number.isFinite(calc.fuelMarginL) ? `${fmtNum(calc.fuelMarginL, 1)} L` : "—",
        fuelFlow: Number.isFinite(calc.fuelFlowCruiseLph) && calc.fuelFlowCruiseLph > 0 ? `${fmtNum(calc.fuelFlowCruiseLph, 1)} L/H` : "—",
        wind:
            Number.isFinite(calc.windDirectionDeg) && Number.isFinite(calc.windSpeedKt)
                ? `${fmtDeg(calc.windDirectionDeg)} / ${fmtNum(calc.windSpeedKt, 0)} KT`
                : "—",
        warnings: Array.isArray(calc.warnings) ? calc.warnings.slice(0, 4) : [],
        stations,
        disclaimer:
            "APOIO AO PLANEJAMENTO — NAO SUBSTITUI DESPACHO, NOTAM, CARTAS, AIS/MET, ANAC/DECEA NEM O JULGAMENTO DO PILOTO EM COMANDO.",
    };
}

export function briefingFileName(model) {
    const route = String(model?.route || "BRIEF")
        .replace(/→/g, "-")
        .replace(/[^A-Z0-9-]+/gi, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
    const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
    return `Marquisa_Briefing_${route || "OPS"}_${stamp}.pdf`;
}
