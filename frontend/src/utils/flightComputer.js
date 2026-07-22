/**
 * Computador de voo — fórmulas alinhadas ao material de navegação (Face A / Face B).
 * Constantes e exemplos validados contra o Resumão de Computador de Voo (Editora Bianch).
 */

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
    return ((deg + 180) % 360) - 180;
}

const DEG = Math.PI / 180;

/** Fatores do computador mecânico (exemplos do livro). */
export const BOOK_CONSTANTS = {
    KG_TO_LB: 2.2,
    L_TO_US_GAL: 90 / 23.8, // ≈ 3.7815 L/US gal
    L_TO_IMP_GAL: 90 / 19.8, // ≈ 4.5455 L/IMP gal
    KT_TO_KMH: 1.85,
    KT_TO_MPH: 1.15,
    NM_TO_KM: 1.85,
    NM_TO_SM: 1.15,
    FT_TO_M: 0.305,
    LONGITUDE_MIN_PER_DEG: 4, // 15° = 60 min
    ISA_LAPSE_C_PER_1000FT: 2,
    DA_FT_PER_ISA_DEV: 120,
    QNH_FT_PER_HPA: 30,
};

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

/**
 * Componentes de vento na pista (kt).
 * head > 0 = proa, head < 0 = cauda.
 * crossSigned > 0 = da direita, < 0 = da esquerda (visto no sentido da pista).
 */
export function computeRunwayWindComponents({ windDir, windSpeed, runway }) {
    const wdir = normalizeAngle(toNum(windDir));
    const wspd = Math.max(0, toNum(windSpeed));
    const rwy = parseRunwayHeading(runway);
    const relative = normalizeSignedAngle(wdir - rwy);
    const rad = relative * DEG;
    const crossSigned = Math.sin(rad) * wspd;
    const head = Math.cos(rad) * wspd;
    return {
        runwayHeading: rwy,
        crosswindKt: Number(Math.abs(crossSigned).toFixed(1)),
        crosswindSignedKt: Number(crossSigned.toFixed(1)),
        crossFromRight: crossSigned > 0,
        headwindKt: Number(head.toFixed(1)),
        angleDeg: Number(Math.abs(relative).toFixed(0)),
        relativeDeg: Number(relative.toFixed(0)),
    };
}

/**
 * Caso 1 (Face B): RV + VA + vento → PV (proa verdadeira), VS (GS) e CD (WCA).
 * CD > 0 = vento da direita (soma ao RV); CD < 0 = vento da esquerda (subtrai do RV).
 * GS = VA·cos(CD) − Vento·cos(θ), com θ = vento − RV.
 */
export function computeWindTriangle({ trueCourse, tas, windDir, windSpeed }) {
    const tc = normalizeAngle(toNum(trueCourse));
    const airspeed = Math.max(1, toNum(tas));
    const wDir = normalizeAngle(toNum(windDir));
    const wSpd = Math.max(0, toNum(windSpeed));

    const relative = normalizeSignedAngle(wDir - tc);
    const relRad = relative * DEG;
    const headwindKt = wSpd * Math.cos(relRad);
    const crosswindKt = wSpd * Math.sin(relRad);
    const ratio = Math.max(-1, Math.min(1, crosswindKt / airspeed));
    const wcaRad = Math.asin(ratio);
    const wca = wcaRad / DEG;
    const heading = normalizeAngle(tc + wca);
    const gs = airspeed * Math.cos(wcaRad) - headwindKt;

    return {
        wca: Number(wca.toFixed(1)),
        heading: Number(heading.toFixed(0)),
        groundSpeed: Number(Math.max(0, gs).toFixed(1)),
        relativeWindAngle: Number(relative.toFixed(0)),
        headwindKt: Number(headwindKt.toFixed(1)),
        crosswindKt: Number(crosswindKt.toFixed(1)),
        driftLeft: wca < 0,
    };
}

/**
 * Caso 2 (Face B): PV + VA + vento → RV (rumo) e VS.
 */
export function computeCourseFromHeading({ trueHeading, tas, windDir, windSpeed }) {
    const th = normalizeAngle(toNum(trueHeading));
    const airspeed = Math.max(1, toNum(tas));
    const wDir = normalizeAngle(toNum(windDir));
    const wSpd = Math.max(0, toNum(windSpeed));

    const windTo = (wDir + 180) * DEG;
    const headingRad = th * DEG;
    const gx = airspeed * Math.sin(headingRad) + wSpd * Math.sin(windTo);
    const gy = airspeed * Math.cos(headingRad) + wSpd * Math.cos(windTo);
    const gs = Math.hypot(gx, gy);
    const track = normalizeAngle(Math.atan2(gx, gy) / DEG);
    const drift = normalizeSignedAngle(track - th);

    return {
        trueCourse: Number(track.toFixed(0)),
        groundSpeed: Number(Math.max(0, gs).toFixed(1)),
        drift: Number(drift.toFixed(1)),
        driftLeft: drift < 0,
    };
}

/**
 * Caso 3 (Face B): PV + RV + VA + VS → direção e intensidade do vento (de onde sopra).
 */
export function computeWindFromVectors({ trueHeading, trueCourse, tas, groundSpeed }) {
    const th = normalizeAngle(toNum(trueHeading));
    const tc = normalizeAngle(toNum(trueCourse));
    const airspeed = Math.max(1, toNum(tas));
    const gs = Math.max(0, toNum(groundSpeed));

    const thRad = th * DEG;
    const tcRad = tc * DEG;
    const wx = gs * Math.sin(tcRad) - airspeed * Math.sin(thRad);
    const wy = gs * Math.cos(tcRad) - airspeed * Math.cos(thRad);
    const wspd = Math.hypot(wx, wy);
    const windToDeg = Math.atan2(wx, wy) / DEG;
    const windFrom = normalizeAngle(windToDeg + 180);

    return {
        windDir: Number(windFrom.toFixed(0)),
        windSpeed: Number(wspd.toFixed(1)),
    };
}

/** Tempo (h) = distância (nm) / velocidade (kt). Aceita tempo em horas. */
export function computeTimeSpeedDistance({ distance, speed, time }) {
    const d = toNum(distance);
    const s = toNum(speed);
    const t = toNum(time);

    if (d > 0 && s > 0) {
        const hours = d / s;
        return {
            distance: d,
            speed: s,
            timeHours: Number(hours.toFixed(4)),
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
            timeHours: Number(endurance.toFixed(4)),
            totalFuel: fuel,
            enduranceHours: Number(endurance.toFixed(4)),
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

/** Temperatura ISA (°C) na altitude de pressão. */
export function computeIsaTempC(pressureAltFt) {
    const pa = toNum(pressureAltFt);
    return 15 - BOOK_CONSTANTS.ISA_LAPSE_C_PER_1000FT * (pa / 1000);
}

/**
 * Altitude densidade (ft) — DA = AP + 120 × (OAT − ISA).
 * Ex.: FL200 / −10°C → 22.000 ft (livro).
 */
export function computeDensityAltitude({ pressureAltFt, oatC }) {
    const pa = toNum(pressureAltFt);
    const oat = toNum(oatC);
    const isa = computeIsaTempC(pa);
    const isaDev = oat - isa;
    const da = pa + BOOK_CONSTANTS.DA_FT_PER_ISA_DEV * isaDev;
    return {
        pressureAltFt: pa,
        oatC: oat,
        isaTempC: Number(isa.toFixed(1)),
        isaDeviationC: Number(isaDev.toFixed(1)),
        densityAltFt: Math.round(da),
    };
}

/** Razão de pressão ISA abaixo da tropopausa (~36.089 ft). */
function isaPressureRatio(pressureAltFt) {
    const h = Math.max(-2000, Math.min(36089, toNum(pressureAltFt)));
    return Math.pow(1 - 6.87535e-6 * h, 5.2561);
}

/**
 * VA (TAS) a partir de VI (IAS), altitude pressão e OAT.
 * Método do computador: janela AP + temperatura → ler VA na escala.
 * Sem OAT, usa temperatura ISA na AP (mais preciso que a regra +2%/1000 ft).
 * Exemplos livro: 90 kt / FL050 / 0°C → 96 kt; 120 kt / FL120 / −10°C → 144 kt.
 */
export function computeTrueAirspeed({ ias, pressureAltFt, oatC }) {
    const speed = Math.max(0, toNum(ias));
    const pa = toNum(pressureAltFt);
    const hasOat = oatC !== undefined && oatC !== null && String(oatC).trim() !== "";
    const oat = hasOat ? toNum(oatC) : computeIsaTempC(pa);
    const tKelvin = oat + 273.15;
    const theta = tKelvin / 288.15;
    const delta = isaPressureRatio(pa);
    const sigma = delta / Math.max(1e-6, theta);
    const tas = speed / Math.sqrt(Math.max(1e-6, sigma));
    const ruleOfThumb = speed * (1 + 0.02 * (Math.max(0, pa) / 1000));

    return {
        ias: speed,
        pressureAltFt: pa,
        oatC: Number(oat.toFixed(1)),
        oatAssumedIsa: !hasOat,
        densityRatio: Number(sigma.toFixed(4)),
        tas: Number(tas.toFixed(0)),
        tasRuleOfThumb: Number(ruleOfThumb.toFixed(0)),
    };
}

/**
 * Altitude verdadeira aproximada (método E6B / livro).
 * TA ≈ AI × (T_real / T_ISA na AP), com AP e OAT na janela.
 */
export function computeTrueAltitude({ indicatedAltFt, pressureAltFt, oatC }) {
    const ia = Math.max(0, toNum(indicatedAltFt));
    const pa = toNum(pressureAltFt);
    const oat = toNum(oatC);
    const isa = computeIsaTempC(pa);
    const tReal = oat + 273.15;
    const tIsa = isa + 273.15;
    const trueAlt = ia * (tReal / Math.max(1, tIsa));
    return {
        indicatedAltFt: ia,
        pressureAltFt: pa,
        oatC: oat,
        isaTempC: Number(isa.toFixed(1)),
        trueAltFt: Math.round(trueAlt),
    };
}

/** Número Mach a partir de VA e OAT (a ≈ 38,94 × √T_K kt). */
export function computeMach({ tas, oatC }) {
    const airspeed = Math.max(0, toNum(tas));
    const oat = toNum(oatC);
    const a = 38.94 * Math.sqrt(oat + 273.15);
    const mach = a > 0 ? airspeed / a : 0;
    return {
        tas: airspeed,
        oatC: oat,
        speedOfSoundKt: Number(a.toFixed(1)),
        mach: Number(mach.toFixed(2)),
    };
}

/** VA a partir de Mach e OAT. */
export function computeTasFromMach({ mach, oatC }) {
    const m = Math.max(0, toNum(mach));
    const oat = toNum(oatC);
    const a = 38.94 * Math.sqrt(oat + 273.15);
    return {
        mach: m,
        oatC: oat,
        tas: Number((m * a).toFixed(0)),
    };
}

/**
 * Altitude pressão a partir da elevação e QNH.
 * AP ≈ elev + 30 × (1013,25 − QNH_hPa) — fator escolar padrão.
 */
export function computePressureAltitude({ elevationFt, qnhHpa }) {
    const elev = toNum(elevationFt);
    const qnh = toNum(qnhHpa, 1013.25);
    const pa = elev + BOOK_CONSTANTS.QNH_FT_PER_HPA * (1013.25 - qnh);
    return {
        elevationFt: elev,
        qnhHpa: qnh,
        pressureAltFt: Math.round(pa),
    };
}

export function formatHoursMinutes(hours) {
    const totalMin = Math.round(Math.max(0, toNum(hours)) * 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h}h ${String(m).padStart(2, "0")}m`;
}

/**
 * Rumo magnético a partir do verdadeiro (Leste −, Oeste + no TH→MH).
 * variationDeg: valor absoluto da declinação; variationEast true se declinação leste.
 */
export function computeMagneticHeading({ trueHeading, variationDeg, variationEast }) {
    const th = normalizeAngle(toNum(trueHeading));
    const varDeg = Math.abs(toNum(variationDeg));
    const sign = variationEast ? -1 : 1;
    const mh = normalizeAngle(th + sign * varDeg);
    return {
        trueHeading: th,
        variationDeg: varDeg,
        magneticHeading: Number(mh.toFixed(0)),
        variationEast: !!variationEast,
    };
}

/**
 * Subida/descida: razão, quantidade e tempo (regra de três do livro).
 * Com GS, também distancia horizontal.
 */
export function computeVerticalLeg({ altitudeFt, rateFpm, groundSpeedKt, timeMinutes }) {
    const alt = toNum(altitudeFt);
    const rate = toNum(rateFpm);
    const gs = toNum(groundSpeedKt);
    const tMinIn = toNum(timeMinutes);

    let altitude = Math.abs(alt);
    let rateAbs = Math.abs(rate);
    let minutes = Math.abs(tMinIn);

    if (altitude > 0 && rateAbs > 0) {
        minutes = altitude / rateAbs;
    } else if (altitude > 0 && minutes > 0) {
        rateAbs = altitude / minutes;
    } else if (rateAbs > 0 && minutes > 0) {
        altitude = rateAbs * minutes;
    } else {
        return null;
    }

    const hours = minutes / 60;
    const distanceNm = gs > 0 ? gs * hours : null;
    const gradientPercent = gs > 0 && rateAbs > 0 ? (rateAbs / (gs * 101.3)) * 100 : null;

    return {
        altitudeFt: Number(altitude.toFixed(0)),
        rateFpm: Number(rateAbs.toFixed(0)),
        groundSpeedKt: gs > 0 ? gs : null,
        timeMinutes: Number(minutes.toFixed(1)),
        timeHours: Number(hours.toFixed(4)),
        distanceNm: distanceNm != null ? Number(distanceNm.toFixed(1)) : null,
        gradientPercent: gradientPercent != null ? Number(gradientPercent.toFixed(1)) : null,
    };
}

/** Combustível por etapa: consumo L/h × tempo (h). */
export function computeLegFuel({ flowPerHour, timeHours }) {
    const flow = toNum(flowPerHour);
    const time = toNum(timeHours);
    if (flow <= 0 || time <= 0) return null;
    return {
        flowPerHour: flow,
        timeHours: time,
        fuelLiters: Number((flow * time).toFixed(1)),
    };
}

/** Conversões Face A — fatores do computador mecânico. */
export function convertUnits({ value, kind }) {
    const v = toNum(value);
    const C = BOOK_CONSTANTS;
    switch (kind) {
        case "massKg":
            return { kg: v, lb: Number((v * C.KG_TO_LB).toFixed(1)) };
        case "massLb":
            return { lb: v, kg: Number((v / C.KG_TO_LB).toFixed(1)) };
        case "volL":
            return {
                liters: v,
                usGal: Number((v / C.L_TO_US_GAL).toFixed(2)),
                impGal: Number((v / C.L_TO_IMP_GAL).toFixed(2)),
                kgAvgas072: Number((v * 0.72).toFixed(1)),
                lbAvgas072: Number((v * 0.72 * C.KG_TO_LB).toFixed(1)),
            };
        case "speedKt":
            return {
                kt: v,
                kmh: Number((v * C.KT_TO_KMH).toFixed(0)),
                mph: Number((v * C.KT_TO_MPH).toFixed(0)),
            };
        case "distNm":
            return {
                nm: v,
                km: Number((v * C.NM_TO_KM).toFixed(1)),
                sm: Number((v * C.NM_TO_SM).toFixed(1)),
            };
        case "altFt":
            return {
                ft: v,
                m: Number((v * C.FT_TO_M).toFixed(0)),
            };
        case "altM":
            return {
                m: v,
                ft: Number((v / C.FT_TO_M).toFixed(0)),
            };
        case "tempC":
            return {
                c: v,
                f: Number((v * (9 / 5) + 32).toFixed(1)),
            };
        case "tempF":
            return {
                f: v,
                c: Number((((v - 32) * 5) / 9).toFixed(1)),
            };
        case "longitude":
            return {
                deg: v,
                minutes: Number((v * C.LONGITUDE_MIN_PER_DEG).toFixed(0)),
                hours: Number(((v * C.LONGITUDE_MIN_PER_DEG) / 60).toFixed(2)),
            };
        default:
            return null;
    }
}

/** Combustível: litros ↔ peso (densidade kg/L) com fator 2,2 lb/kg do livro. */
export function computeFuelWeight({ liters, densityKgPerL = 0.72 }) {
    const l = toNum(liters);
    const d = toNum(densityKgPerL, 0.72);
    const kg = l * d;
    const lb = kg * BOOK_CONSTANTS.KG_TO_LB;
    const usGal = l / BOOK_CONSTANTS.L_TO_US_GAL;
    const impGal = l / BOOK_CONSTANTS.L_TO_IMP_GAL;
    return {
        liters: l,
        densityKgPerL: d,
        kg: Number(kg.toFixed(1)),
        lb: Number(lb.toFixed(1)),
        usGal: Number(usGal.toFixed(2)),
        impGal: Number(impGal.toFixed(2)),
    };
}
