/**
 * Banco de cenas climáticas × período do dia.
 * Fotos em /wx-scenes/{weather}-{period}.png
 * Períodos: dawn | day | dusk | night | late
 */

export const WEATHER_KINDS = ["clear", "cloudy", "overcast", "rain", "fog", "storm"];
export const DAY_PERIODS = ["dawn", "day", "dusk", "night", "late"];

const WEATHER_LABEL = {
    clear: "plannerWx.sceneClear",
    cloudy: "plannerWx.sceneCloudy",
    overcast: "plannerWx.sceneOvercast",
    rain: "plannerWx.sceneRain",
    fog: "plannerWx.sceneFog",
    storm: "plannerWx.sceneStorm",
    idle: "plannerWx.sceneIdle",
};

const PERIOD_LABEL = {
    dawn: "plannerWx.periodDawn",
    day: "plannerWx.periodDay",
    dusk: "plannerWx.periodDusk",
    night: "plannerWx.periodNight",
    late: "plannerWx.periodLate",
};

/** Extrai hora UTC do METAR (ddHHMMZ). */
export function parseMetarUtcHour(metarRaw) {
    const m = String(metarRaw || "").toUpperCase().match(/\b\d{2}(\d{2})(\d{2})Z\b/);
    if (!m) return null;
    const hour = Number(m[1]);
    const minute = Number(m[2]);
    if (!Number.isFinite(hour) || hour > 23) return null;
    if (!Number.isFinite(minute) || minute > 59) return null;
    return hour + minute / 60;
}

/** Offset horário aproximado pela longitude (15° ≈ 1h). */
export function approxTimezoneOffsetHours(longitude) {
    if (!Number.isFinite(longitude)) return -3; // default BR
    const offset = Math.round(Number(longitude) / 15);
    return Math.max(-12, Math.min(14, offset));
}

/**
 * Hora local aproximada no aeródromo (0–24).
 * @param {string} metarRaw
 * @param {{ longitude?: number, latitude?: number } | null} airport
 */
export function resolveLocalHour(metarRaw, airport = null) {
    const utcHour = parseMetarUtcHour(metarRaw);
    if (utcHour == null) {
        // Sem hora no METAR: usa hora local do dispositivo
        const now = new Date();
        return now.getHours() + now.getMinutes() / 60;
    }
    const lon = Number(airport?.longitude ?? airport?.lon);
    const offset = approxTimezoneOffsetHours(lon);
    return ((utcHour + offset) % 24 + 24) % 24;
}

/**
 * @returns {'dawn'|'day'|'dusk'|'night'|'late'}
 */
export function resolveDayPeriod(localHour) {
    const h = Number(localHour);
    if (!Number.isFinite(h)) return "day";
    if (h >= 5 && h < 7.5) return "dawn";
    if (h >= 7.5 && h < 16.5) return "day";
    if (h >= 16.5 && h < 19) return "dusk";
    if (h >= 19) return "night";
    return "late"; // 00:00–04:59 madrugada
}

export function resolveWeatherKind(metarRaw) {
    const m = String(metarRaw || "").toUpperCase();
    if (!m.trim()) return "idle";

    if (/\bTS(RA|GR|GS)?\b/.test(m) || /\b\+TS\b/.test(m) || /\bCB\b/.test(m)) return "storm";
    if (/\b(FG|BR|HZ|FU|VA)\b/.test(m) || /\bVV\d{3}\b/.test(m)) return "fog";
    if (/\b(\+|-)?(RA|DZ|SHRA|SHSN|SN|PL|GR|GS)\b/.test(m)) return "rain";
    if (/\bCAVOK\b/.test(m) || /\bSKC\b/.test(m) || /\bCLR\b/.test(m) || /\bNSC\b/.test(m)) return "clear";
    if (/\b(BKN|OVC)\d{3}\b/.test(m)) return "overcast";
    if (/\b(FEW|SCT)\d{3}\b/.test(m)) return "cloudy";

    if (/\b\d{4}\b/.test(m)) {
        const vis = Number((m.match(/\s(\d{4})\s/) || [])[1]);
        if (Number.isFinite(vis) && vis < 3000) return "fog";
        if (Number.isFinite(vis) && vis < 5000) return "cloudy";
    }

    return "clear";
}

/**
 * @returns {{
 *   id: string,
 *   weather: string,
 *   period: string,
 *   src: string,
 *   fallbackSrc: string,
 *   labelKey: string,
 *   periodLabelKey: string,
 *   localHour: number|null,
 * }}
 */
export function resolveWeatherScene(metarRaw, airport = null) {
    const weather = resolveWeatherKind(metarRaw);
    const localHour = metarRaw ? resolveLocalHour(metarRaw, airport) : null;
    const period = weather === "idle" ? "day" : resolveDayPeriod(localHour);

    if (weather === "idle") {
        return {
            id: "idle",
            weather: "idle",
            period: "night",
            src: "/wx-scenes/idle.png",
            fallbackSrc: "/wx-scenes/clear-night.png",
            labelKey: WEATHER_LABEL.idle,
            periodLabelKey: PERIOD_LABEL.night,
            localHour,
        };
    }

    const id = `${weather}-${period}`;
    return {
        id,
        weather,
        period,
        src: `/wx-scenes/${weather}-${period}.png`,
        // fallback para versão “dia” se o arquivo do período faltar
        fallbackSrc: `/wx-scenes/${weather}-day.png`,
        labelKey: WEATHER_LABEL[weather] || WEATHER_LABEL.clear,
        periodLabelKey: PERIOD_LABEL[period] || PERIOD_LABEL.day,
        localHour,
    };
}

/** Compat: id só do clima (SVG fallback). */
export function resolveWeatherSceneId(metarRaw) {
    return resolveWeatherKind(metarRaw);
}
