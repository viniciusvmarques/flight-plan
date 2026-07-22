/** Vento < este limiar (kt): trata como fraco e exige confirmação da pista padrão. */
export const LIGHT_WIND_KT = 6;
/** Vento >= este limiar (kt): forte. */
export const STRONG_WIND_KT = 20;

/**
 * Faixa visual do vento para badge/cores.
 * @returns {'light'|'moderate'|'strong'|'strong-gust'}
 */
export function resolveWindBand(wind) {
    if (!wind) return "light";
    const spd = Number.isFinite(wind.spdKt) ? wind.spdKt : 0;
    const gust = Number.isFinite(wind.gustKt) ? wind.gustKt : null;
    const hasGust = gust != null;
    const peak = hasGust ? Math.max(spd, gust) : spd;

    if (peak >= STRONG_WIND_KT) return hasGust ? "strong-gust" : "strong";
    if (hasGust && gust - spd >= 10 && gust >= 18) return "strong-gust";
    if (spd >= LIGHT_WIND_KT) return "moderate";
    return "light";
}

/**
 * Extrai vento do METAR (direção mag. típica do boletim; heading OurAirports é true).
 * @returns {{ dirDeg: number|null, spdKt: number|null, gustKt: number|null, calm: boolean, variable: boolean } | null}
 */
export function parseWindFromMetar(raw) {
    const s = String(raw || "");
    if (/\b00000KT\b/.test(s) || /\bCALM\b/i.test(s)) {
        return { dirDeg: null, spdKt: 0, gustKt: null, calm: true, variable: false };
    }
    const m = s.match(/\b(\d{3}|VRB)(\d{2,3})(G(\d{2,3}))?KT\b/);
    if (!m) return null;
    const variable = m[1] === "VRB";
    const dir = variable ? null : Number(m[1]);
    const spd = Number(m[2]);
    const gust = m[4] != null ? Number(m[4]) : null;
    return {
        dirDeg: Number.isFinite(dir) ? dir : null,
        spdKt: Number.isFinite(spd) ? spd : null,
        gustKt: Number.isFinite(gust) ? gust : null,
        calm: Number.isFinite(spd) && spd === 0,
        variable,
    };
}

function degDiff(a, b) {
    let d = Math.abs((Number(a) - Number(b)) % 360);
    if (d > 180) d = 360 - d;
    return d;
}

export function windComponents(windDirDeg, windSpdKt, rwyHdgDeg) {
    if (!Number.isFinite(windSpdKt) || !Number.isFinite(rwyHdgDeg) || !Number.isFinite(windDirDeg)) return null;
    const theta = degDiff(windDirDeg, rwyHdgDeg) * (Math.PI / 180);
    return {
        headKt: windSpdKt * Math.cos(theta),
        crossKt: windSpdKt * Math.sin(theta),
    };
}

/** Ex.: "09L" → 90, "27" → 270. Fallback quando OurAirports não traz heading. */
export function headingFromIdent(ident) {
    const m = String(ident || "")
        .trim()
        .toUpperCase()
        .match(/^(\d{1,2})/);
    if (!m) return null;
    const n = Number(m[1]);
    if (!Number.isFinite(n) || n < 1 || n > 36) return null;
    return (n % 36) * 10;
}

/**
 * Sugestão só com o número da pista (sem L/R/C).
 * Evita sugerir uma paralela específica (pouso/decolagem) sem ATIS.
 * Ex.: "28R" → "28", "09L" → "09", "36C" → "36"
 */
export function formatRunwayNumberOnly(ident) {
    const m = String(ident || "")
        .trim()
        .toUpperCase()
        .match(/^(\d{1,2})/);
    if (!m) return String(ident || "").trim().toUpperCase() || null;
    const n = Number(m[1]);
    if (!Number.isFinite(n) || n < 1 || n > 36) return String(ident || "").trim().toUpperCase() || null;
    return String(n).padStart(2, "0");
}

function withNumberOnlyIdent(end) {
    if (!end) return null;
    const ident = formatRunwayNumberOnly(end.ident);
    return ident ? { ...end, ident, identRaw: end.ident } : end;
}

function collectEnds(runways) {
    const ends = [];
    for (const rw of runways || []) {
        const lengthFt = Number.isFinite(rw?.lengthFt) ? rw.lengthFt : Number(rw?.length_ft) || 0;
        const closed = !!(rw?.closed || rw?.closedRaw);
        if (closed) continue;

        const leIdent = rw?.leIdent || rw?.le_ident;
        const heIdent = rw?.heIdent || rw?.he_ident;
        let leHdg = Number.isFinite(rw?.leHdg) ? rw.leHdg : Number(rw?.le_heading_degT);
        let heHdg = Number.isFinite(rw?.heHdg) ? rw.heHdg : Number(rw?.he_heading_degT);
        if (!Number.isFinite(leHdg)) leHdg = headingFromIdent(leIdent);
        if (!Number.isFinite(heHdg)) heHdg = headingFromIdent(heIdent);

        if (leIdent && Number.isFinite(leHdg)) {
            ends.push({ ident: String(leIdent), hdg: leHdg, lengthFt, source: Number.isFinite(rw?.leHdg) ? "db" : "ident" });
        }
        if (heIdent && Number.isFinite(heHdg)) {
            ends.push({ ident: String(heIdent), hdg: heHdg, lengthFt, source: Number.isFinite(rw?.heHdg) ? "db" : "ident" });
        }
    }
    return ends;
}

function pickLongestReference(ends) {
    if (!ends.length) return null;
    return [...ends].sort((a, b) => (b.lengthFt || 0) - (a.lengthFt || 0) || String(a.ident).localeCompare(String(b.ident)))[0];
}

/**
 * Sugestão de cabeceira a partir do METAR + pistas do aeródromo.
 * Não é pista oficial em uso (ATC/AIS).
 *
 * @returns {{
 *   mode: 'wind'|'light'|'calm'|'vrb'|'unavailable',
 *   suggested: { ident: string, hdg: number, headKt?: number, crossKt?: number, lengthFt?: number } | null,
 *   wind: object | null,
 *   endsAvailable: number,
 * }}
 */
export function suggestRunwayFromMetar(runways, metarRaw) {
    const ends = collectEnds(runways);
    const wind = parseWindFromMetar(metarRaw);
    const band = resolveWindBand(wind);

    if (!ends.length) {
        return { mode: "unavailable", suggested: null, wind, windBand: band, endsAvailable: 0 };
    }

    if (!wind) {
        return { mode: "unavailable", suggested: null, wind: null, windBand: "light", endsAvailable: ends.length };
    }

    const light = wind.calm || (Number.isFinite(wind.spdKt) && wind.spdKt < LIGHT_WIND_KT);
    if (wind.variable || wind.calm || (light && !Number.isFinite(wind.dirDeg))) {
        const ref = pickLongestReference(ends);
        return {
            mode: wind.variable ? "vrb" : wind.calm ? "calm" : "light",
            suggested: withNumberOnlyIdent(
                ref ? { ident: ref.ident, hdg: ref.hdg, lengthFt: ref.lengthFt, headKt: 0, crossKt: 0 } : null
            ),
            wind,
            windBand: band,
            endsAvailable: ends.length,
        };
    }

    if (light) {
        // Vento fraco com direção: ainda calcula a melhor proa, mas sinaliza modo light.
        let best = null;
        for (const end of ends) {
            const comp = windComponents(wind.dirDeg, wind.spdKt, end.hdg);
            if (!comp) continue;
            if (!best || comp.headKt > best.headKt) {
                best = { ident: end.ident, hdg: end.hdg, lengthFt: end.lengthFt, ...comp };
            }
        }
        return {
            mode: "light",
            suggested: withNumberOnlyIdent(best),
            wind,
            windBand: band,
            endsAvailable: ends.length,
        };
    }

    let best = null;
    for (const end of ends) {
        const comp = windComponents(wind.dirDeg, wind.spdKt, end.hdg);
        if (!comp) continue;
        if (!best || comp.headKt > best.headKt) {
            best = { ident: end.ident, hdg: end.hdg, lengthFt: end.lengthFt, ...comp };
        }
    }

    return {
        mode: best ? "wind" : "unavailable",
        suggested: withNumberOnlyIdent(best),
        wind,
        windBand: band,
        endsAvailable: ends.length,
    };
}
