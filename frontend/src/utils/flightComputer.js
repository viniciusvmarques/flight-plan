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
