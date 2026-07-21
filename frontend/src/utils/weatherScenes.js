/**
 * Banco de cenas climáticas derivadas do METAR.
 * Fotos em public/wx-scenes/*.png (bundle estático).
 * Se a foto não existir, WeatherScene cai no SVG inline.
 */

export const WEATHER_SCENES = {
    clear: {
        id: "clear",
        src: "/wx-scenes/clear.png",
        labelKey: "plannerWx.sceneClear",
    },
    cloudy: {
        id: "cloudy",
        src: "/wx-scenes/cloudy.png",
        labelKey: "plannerWx.sceneCloudy",
    },
    overcast: {
        id: "overcast",
        src: "/wx-scenes/overcast.png",
        labelKey: "plannerWx.sceneOvercast",
    },
    rain: {
        id: "rain",
        src: "/wx-scenes/rain.png",
        labelKey: "plannerWx.sceneRain",
    },
    fog: {
        id: "fog",
        src: "/wx-scenes/fog.png",
        labelKey: "plannerWx.sceneFog",
    },
    storm: {
        id: "storm",
        src: "/wx-scenes/storm.png",
        labelKey: "plannerWx.sceneStorm",
    },
    idle: {
        id: "idle",
        src: "/wx-scenes/idle.png",
        labelKey: "plannerWx.sceneIdle",
    },
};

/**
 * @param {string} metarRaw
 * @returns {keyof typeof WEATHER_SCENES}
 */
export function resolveWeatherSceneId(metarRaw) {
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

export function resolveWeatherScene(metarRaw) {
    const id = resolveWeatherSceneId(metarRaw);
    return WEATHER_SCENES[id] || WEATHER_SCENES.idle;
}
