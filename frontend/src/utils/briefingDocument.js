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

function cleanBulletin(text) {
    return String(text || "")
        .replace(/\s+/g, " ")
        .trim();
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
        metar: cleanBulletin(station.metar) || "METAR UNAVAILABLE",
        taf: cleanBulletin(station.taf) || "TAF UNAVAILABLE",
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
        calc.useNavLegs && calc.navLog?.routeLabel
            ? calc.navLog.routeLabel
            : dest?.icao
              ? `${origin?.icao || "----"} → ${dest.icao}`
              : String(origin?.icao || "----");

    const stations = [
        stationBlock("A · ORIG", origin, locale),
        dest ? stationBlock("B · DEST", dest, locale) : null,
        alternate ? stationBlock("C · ALTN", alternate, locale) : null,
    ].filter(Boolean);

    const navLegs = Array.isArray(calc.navLegs)
        ? calc.navLegs.map((leg, index) => ({
              index: index + 1,
              label: leg.label || `${leg.fromLabel || ""} → ${leg.name || ""}`,
              name: leg.name || "",
              distanceNm: Number.isFinite(leg.distanceNm) ? `${fmtNum(leg.distanceNm, 0)} NM` : "—",
              course: Number.isFinite(leg.trueCourseDeg) ? fmtDeg(leg.trueCourseDeg) : "—",
              magCourse: Number.isFinite(leg.magCourseDeg) ? fmtDeg(leg.magCourseDeg) : "—",
              heading: Number.isFinite(leg.headingDeg) ? fmtDeg(leg.headingDeg) : "—",
              gs: Number.isFinite(leg.gsKt) && leg.gsKt > 0 ? `${fmtNum(leg.gsKt, 0)} KT` : "—",
              ete: Number.isFinite(leg.eteMin) ? fmtClock(leg.eteMin) : "—",
              line: `L${index + 1} ${leg.label || leg.name || "WP"}  ${fmtNum(leg.distanceNm, 0)}NM  TC ${
                  Number.isFinite(leg.trueCourseDeg) ? fmtDeg(leg.trueCourseDeg) : "-"
              }  GS ${Number.isFinite(leg.gsKt) ? fmtNum(leg.gsKt, 0) : "-"}  ETE ${
                  Number.isFinite(leg.eteMin) ? fmtClock(leg.eteMin) : "-"
              }`,
          }))
        : [];

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
        toc:
            calc.toc && Number.isFinite(calc.toc.distanceFromOriginNm)
                ? `TOC ${fmtNum(calc.toc.distanceFromOriginNm, 0)} NM / ${fmtClock(calc.toc.eteMin)}`
                : "—",
        tod:
            calc.tod && Number.isFinite(calc.tod.distanceFromOriginNm)
                ? `TOD ${fmtNum(calc.tod.distanceFromOriginNm, 0)} NM / ${fmtClock(calc.tod.eteMin)}`
                : "—",
        cruiseDist:
            Number.isFinite(calc.cruiseDistNm) ? `${fmtNum(calc.cruiseDistNm, 0)} NM` : "—",
        useNavLegs: !!calc.useNavLegs,
        navLegs,
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
