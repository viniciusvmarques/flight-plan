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

function fmtLocalDate(locale = "pt-BR") {
    try {
        return new Intl.DateTimeFormat(locale, {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(new Date());
    } catch {
        return new Date().toLocaleDateString();
    }
}

function cleanBulletin(text) {
    return String(text || "")
        .replace(/\s+/g, " ")
        .trim();
}

function pilotDisplayName(plan = {}) {
    return String(plan.pilotName || "").trim() || "—";
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

function atcBlock(plan = {}) {
    const atc = plan.atcFreqs || {};
    return {
        clr: String(atc.clr || "").trim() || "____",
        gnd: String(atc.gnd || "").trim() || "____",
        twr: String(atc.twr || "").trim() || "____",
        app: String(atc.app || "").trim() || "____",
        ctr: String(atc.ctr || "").trim() || "____",
        dest: String(atc.dest || "").trim() || "____",
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
    const atc = atcBlock(plan);

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
        ? calc.navLegs.map((leg, index) => {
              const label = leg.label || `${leg.fromLabel || ""} → ${leg.name || ""}`;
              const dist = Number.isFinite(leg.distanceNm) ? fmtNum(leg.distanceNm, 0) : "-";
              const tc = Number.isFinite(leg.trueCourseDeg) ? fmtDeg(leg.trueCourseDeg) : "-";
              const mh = Number.isFinite(leg.magCourseDeg) ? fmtDeg(leg.magCourseDeg) : "-";
              const hdg = Number.isFinite(leg.headingDeg) ? fmtDeg(leg.headingDeg) : "-";
              const gs = Number.isFinite(leg.gsKt) && leg.gsKt > 0 ? fmtNum(leg.gsKt, 0) : "-";
              const ete = Number.isFinite(leg.eteMin) ? fmtClock(leg.eteMin) : "-";
              const fuel = Number.isFinite(leg.fuelL) && leg.fuelL > 0 ? fmtNum(leg.fuelL, 1) : "-";
              const ias = Number.isFinite(leg.iasKt) && leg.iasKt > 0 ? fmtNum(leg.iasKt, 0) : "-";
              const tas = Number.isFinite(leg.tasKt) && leg.tasKt > 0 ? fmtNum(leg.tasKt, 0) : "-";
              return {
                  index: index + 1,
                  label,
                  name: leg.name || "",
                  from: leg.fromLabel || "",
                  to: leg.toLabel || leg.name || "",
                  distanceNm: Number.isFinite(leg.distanceNm) ? `${fmtNum(leg.distanceNm, 0)} NM` : "—",
                  distanceRaw: dist,
                  course: Number.isFinite(leg.trueCourseDeg) ? fmtDeg(leg.trueCourseDeg) : "—",
                  courseRaw: tc,
                  magCourse: Number.isFinite(leg.magCourseDeg) ? fmtDeg(leg.magCourseDeg) : "—",
                  magCourseRaw: mh,
                  heading: Number.isFinite(leg.headingDeg) ? fmtDeg(leg.headingDeg) : "—",
                  headingRaw: hdg,
                  ias: Number.isFinite(leg.iasKt) && leg.iasKt > 0 ? `${fmtNum(leg.iasKt, 0)} KT` : "—",
                  iasRaw: ias,
                  tas: Number.isFinite(leg.tasKt) && leg.tasKt > 0 ? `${fmtNum(leg.tasKt, 0)} KT` : "—",
                  tasRaw: tas,
                  gs: Number.isFinite(leg.gsKt) && leg.gsKt > 0 ? `${fmtNum(leg.gsKt, 0)} KT` : "—",
                  gsRaw: gs,
                  ete: Number.isFinite(leg.eteMin) ? fmtClock(leg.eteMin) : "—",
                  eteRaw: ete,
                  fuel: Number.isFinite(leg.fuelL) && leg.fuelL > 0 ? `${fmtNum(leg.fuelL, 1)} L` : "—",
                  fuelRaw: fuel,
                  line: `L${String(index + 1).padStart(2, "0")} ${label}  ${dist}NM  TC ${tc}  MH ${mh}  HDG ${hdg}  GS ${gs}  ETE ${ete}  FUEL ${fuel}L`,
              };
          })
        : [];

    const header = {
        aircraft: String(plan.registration || plan.callsign || calc.flightPlanSummary?.aircraftId || "").toUpperCase() || "—",
        pilot: pilotDisplayName(plan),
        date: fmtLocalDate(locale),
        origin: String(origin?.icao || "").toUpperCase() || "—",
        dest: String(dest?.icao || "").toUpperCase() || "—",
        speed: Number.isFinite(calc.tasKt) && calc.tasKt > 0 ? `${fmtNum(calc.tasKt, 0)} KT` : plan.tasKt ? `${plan.tasKt} KT` : "—",
        level: calc.cruiseLevelLabel || String(plan.cruiseLevel || "").toUpperCase() || "—",
        distance: Number.isFinite(calc.routeDistNm) ? `${fmtNum(calc.routeDistNm, 0)} NM` : "—",
        utc: modelUtcNow(),
        startup: "________",
        takeoff: "________",
        landing: "________",
        shutdown: "________",
        atc,
        depRwy: String(plan.depRwy || "").toUpperCase() || "—",
        depAlt: plan.depAltFt ? `${plan.depAltFt} FT` : "—",
        depNotes: String(plan.depNotes || "").trim() || "—",
        arrRwy: String(plan.arrRwy || "").toUpperCase() || "—",
        arrAlt: plan.arrAltFt ? `${plan.arrAltFt} FT` : "—",
        arrNotes: String(plan.arrNotes || "").trim() || "—",
        altn: String(plan.altnIcao || alternate?.icao || "").toUpperCase() || "—",
        altnRwy: String(plan.altnRwy || "").toUpperCase() || "—",
        altnAlt: plan.altnAltFt ? `${plan.altnAltFt} FT` : "—",
        altnNotes: String(plan.altnNotes || "").trim() || "—",
    };

    const fuelBreakdown = {
        taxi: Number.isFinite(calc.taxiFuelL) ? `${fmtNum(calc.taxiFuelL, 1)} L` : "—",
        climb: Number.isFinite(calc.climbFuelL) ? `${fmtNum(calc.climbFuelL, 1)} L` : "—",
        cruise: Number.isFinite(calc.cruiseFuelL) ? `${fmtNum(calc.cruiseFuelL, 1)} L` : "—",
        descent: Number.isFinite(calc.descentFuelL) ? `${fmtNum(calc.descentFuelL, 1)} L` : "—",
        approach: Number.isFinite(calc.approachFuelL) ? `${fmtNum(calc.approachFuelL, 1)} L` : "—",
        trip: Number.isFinite(calc.tripFuelL) ? `${fmtNum(calc.tripFuelL, 1)} L` : "—",
        alternate: Number.isFinite(calc.alternateFuelL) ? `${fmtNum(calc.alternateFuelL, 1)} L` : "—",
        contingency: Number.isFinite(calc.contingencyFuelL) ? `${fmtNum(calc.contingencyFuelL, 1)} L` : "—",
        finalReserve: Number.isFinite(calc.finalReserveFuelL) ? `${fmtNum(calc.finalReserveFuelL, 1)} L` : "—",
        extra: Number.isFinite(calc.extraFuelL) ? `${fmtNum(calc.extraFuelL, 1)} L` : "—",
        required: Number.isFinite(calc.requiredFuelL) ? `${fmtNum(calc.requiredFuelL, 1)} L` : "—",
        onBoard: Number.isFinite(calc.fuelOnBoardL) ? `${fmtNum(calc.fuelOnBoardL, 1)} L` : "—",
        landing: Number.isFinite(calc.estimatedLandingFuelL) ? `${fmtNum(calc.estimatedLandingFuelL, 1)} L` : "—",
        margin: Number.isFinite(calc.fuelMarginL) ? `${fmtNum(calc.fuelMarginL, 1)} L` : "—",
        legsTotal:
            calc.useNavLegs && Number.isFinite(calc.navLog?.totalFuelL)
                ? `${fmtNum(calc.navLog.totalFuelL, 1)} L`
                : "—",
    };

    return {
        brand,
        generatedAtUtc: fmtUtcStamp(),
        route,
        originIcao: origin?.icao || "----",
        destIcao: dest?.icao || "",
        altnIcao: alternate?.icao || header.altn || "",
        flightRule: String(calc.flightRule || plan.flightRule || "VFR").toUpperCase(),
        callsign: String(plan.callsign || plan.registration || "").toUpperCase() || "—",
        aircraft: header.aircraft,
        cruise: calc.cruiseLevelLabel || "—",
        tas: Number.isFinite(calc.tasKt) && calc.tasKt > 0 ? `${fmtNum(calc.tasKt, 0)} KT` : "—",
        gs: Number.isFinite(calc.groundSpeedKt) && calc.groundSpeedKt > 0 ? `${fmtNum(calc.groundSpeedKt, 0)} KT` : "—",
        hdg: Number.isFinite(calc.headingDeg) ? `${fmtDeg(calc.headingDeg)}` : "—",
        magHdg: Number.isFinite(calc.magHeadingDeg) ? `${fmtDeg(calc.magHeadingDeg)}` : "—",
        distNm: Number.isFinite(calc.routeDistNm) ? `${fmtNum(calc.routeDistNm, 1)} NM` : "—",
        altnDistNm:
            Number.isFinite(calc.alternateLegDistNm) && calc.alternateLegDistNm > 0
                ? `${fmtNum(calc.alternateLegDistNm, 1)} NM`
                : "—",
        ete: Number.isFinite(calc.tripTimeMin) ? fmtClock(calc.tripTimeMin) : "—",
        eteMin: Number.isFinite(calc.tripTimeMin) ? fmtMinutes(calc.tripTimeMin) : "—",
        endurance: Number.isFinite(calc.enduranceMin) ? fmtClock(calc.enduranceMin) : "—",
        fuelRequired: fuelBreakdown.required,
        fuelOnBoard: fuelBreakdown.onBoard,
        fuelMargin: fuelBreakdown.margin,
        fuelFlow:
            Number.isFinite(calc.fuelFlowCruiseLph) && calc.fuelFlowCruiseLph > 0
                ? `${fmtNum(calc.fuelFlowCruiseLph, 1)} L/H`
                : "—",
        fuelBreakdown,
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
        cruiseDist: Number.isFinite(calc.cruiseDistNm) ? `${fmtNum(calc.cruiseDistNm, 0)} NM` : "—",
        useNavLegs: !!calc.useNavLegs,
        navLegs,
        header,
        ifrNotes: String(plan.ifrProcedureNotes || "").trim(),
        vfrNotes: String(plan.notes || "").trim(),
        warnings: Array.isArray(calc.warnings) ? calc.warnings.slice(0, 4) : [],
        stations,
        disclaimer:
            "APOIO AO PLANEJAMENTO — CONFIRIR SEMPRE NOTAM, AIS/MET, CARTAS, COMPUTADOR DE VOO E FONTES OFICIAIS. NAO SUBSTITUI DESPACHO NEM O JULGAMENTO DO PILOTO EM COMANDO.",
    };
}

function modelUtcNow() {
    const now = new Date();
    return `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}Z`;
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
