function toNum(value, fallback = 0) {
    const n = Number.parseFloat(String(value ?? "").replace(",", "."));
    return Number.isFinite(n) ? n : fallback;
}

function normalizeAngle(deg) {
    let a = deg % 360;
    if (a < 0) a += 360;
    return a;
}

function normalizeSignedAngle(deg) {
    let a = ((deg + 180) % 360) - 180;
    return a;
}

const DEG = Math.PI / 180;

/**
 * Converte entrada de pista (09, 9, 090, 27 ou rumo 90°) para rumo magnético em graus.
 */
export function parseRunwayHeading(input) {
    const raw = String(input ?? "").trim();
    const n = toNum(raw, NaN);
    if (!Number.isFinite(n)) return 0;

    if (/^\d{3}$/.test(raw)) {
        return normalizeAngle(parseInt(raw, 10));
    }

    const runwayNum = Math.round(n);
    if (runwayNum >= 1 && runwayNum <= 36) {
        const slot = runwayNum % 36;
        return slot === 0 ? 0 : slot * 10;
    }

    if (n > 36 && n <= 360) {
        return normalizeAngle(n);
    }

    if (n > 0 && n <= 36) {
        const slot = Math.round(n) % 36;
        return slot === 0 ? 0 : slot * 10;
    }

    return normalizeAngle(n);
}

/** Ângulo agudo (0–180°) entre vento (de onde vem) e rumo da pista. */
export function windRunwayAngleDeg(windDirDeg, runwayHeadingDeg) {
    return Math.abs(normalizeSignedAngle(windDirDeg - runwayHeadingDeg));
}

/** Componentes de vento na pista (kt). head > 0 = proa, head < 0 = cauda. */
export function computeRunwayWindComponents({ windDir, windSpeed, runway }) {
    const wdir = normalizeAngle(toNum(windDir));
    const wspd = Math.max(0, toNum(windSpeed));
    const rwy = parseRunwayHeading(runway);
    const angle = windRunwayAngleDeg(wdir, rwy);
    const rad = angle * DEG;
    const crosswind = Math.abs(Math.sin(rad) * wspd);
    const head = Math.cos(rad) * wspd;
    return {
        runwayHeading: rwy,
        crosswindKt: Number(crosswind.toFixed(1)),
        headwindKt: Number(head.toFixed(1)),
        angleDeg: Number(angle.toFixed(0)),
    };
}

/** Vento em relação ao rumo verdadeiro (TC). */
export function computeWindTriangle({ trueCourse, tas, windDir, windSpeed }) {
    const tc = normalizeAngle(toNum(trueCourse));
    const airspeed = Math.max(1, toNum(tas));
    const wDir = normalizeAngle(toNum(windDir));
    const wSpd = Math.max(0, toNum(windSpeed));

    const relative = normalizeSignedAngle(wDir - tc);
    const relRad = relative * DEG;
    const wcaRad = Math.asin(Math.max(-1, Math.min(1, (wSpd / airspeed) * Math.sin(relRad))));
    const wca = wcaRad / DEG;
    const heading = normalizeAngle(tc + wca);
    const gs =
        airspeed * Math.cos(wcaRad) +
        wSpd * Math.cos(relRad - wcaRad);

    return {
        wca: Number(wca.toFixed(1)),
        heading: Number(heading.toFixed(0)),
        groundSpeed: Number(Math.max(0, gs).toFixed(1)),
        relativeWindAngle: Number(relative.toFixed(0)),
    };
}

/** Tempo (h) = distância (nm) / velocidade (kt). */
export function computeTimeSpeedDistance({ distance, speed, time }) {
    const d = toNum(distance);
    const s = toNum(speed);
    const t = toNum(time);

    if (d > 0 && s > 0) {
        const hours = d / s;
        return {
            distance: d,
            speed: s,
            timeHours: Number(hours.toFixed(2)),
            timeMinutes: Math.round(hours * 60),
        };
    }
    if (d > 0 && t > 0) {
        return {
            distance: d,
            speed: Number((d / t).toFixed(1)),
            timeHours: t,
            timeMinutes: Math.round(t * 60),
        };
    }
    if (s > 0 && t > 0) {
        return {
            distance: Number((s * t).toFixed(1)),
            speed: s,
            timeHours: t,
            timeMinutes: Math.round(t * 60),
        };
    }
    return null;
}

/** Consumo (L/h ou gal/h) × tempo (h). */
export function computeFuel({ flowPerHour, timeHours, totalFuel }) {
    const flow = toNum(flowPerHour);
    const time = toNum(timeHours);
    const fuel = toNum(totalFuel);

    if (flow > 0 && time > 0) {
        return {
            flowPerHour: flow,
            timeHours: time,
            totalFuel: Number((flow * time).toFixed(1)),
            enduranceHours: null,
        };
    }
    if (fuel > 0 && flow > 0) {
        const endurance = fuel / flow;
        return {
            flowPerHour: flow,
            timeHours: Number(endurance.toFixed(2)),
            totalFuel: fuel,
            enduranceHours: Number(endurance.toFixed(2)),
        };
    }
    if (fuel > 0 && time > 0) {
        return {
            flowPerHour: Number((fuel / time).toFixed(1)),
            timeHours: time,
            totalFuel: fuel,
            enduranceHours: null,
        };
    }
    return null;
}

/** Altitude densidade (ft) — aproximação ISA. */
export function computeDensityAltitude({ pressureAltFt, oatC }) {
    const pa = toNum(pressureAltFt);
    const oat = toNum(oatC);
    const isa = 15 - 2 * (pa / 1000);
    const da = pa + 120 * (oat - isa);
    return {
        pressureAltFt: pa,
        oatC: oat,
        isaTempC: Number(isa.toFixed(1)),
        densityAltFt: Math.round(da),
    };
}

/** TAS a partir de IAS — regra prática por altitude (VFR). */
export function computeTrueAirspeed({ ias, pressureAltFt }) {
    const speed = Math.max(0, toNum(ias));
    const pa = Math.max(0, toNum(pressureAltFt));
    const factor = 1 + 0.02 * (pa / 1000);
    const tas = speed * factor;
    return {
        ias: speed,
        pressureAltFt: pa,
        tas: Number(tas.toFixed(0)),
    };
}

export function formatHoursMinutes(hours) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${String(m).padStart(2, "0")}m`;
}
