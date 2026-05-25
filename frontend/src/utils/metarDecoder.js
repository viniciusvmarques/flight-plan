import { classifyFromMetar } from "./classifyFlightCategory";

const CATEGORY_LABELS = {
    pt: { VFR: "VFR — condições visuais favoráveis", MVFR: "MVFR — margem visual reduzida", IFR: "IFR — condições instrumentais", NO_DATA: "Sem dados", UNKNOWN: "Não classificado" },
    en: { VFR: "VFR — favorable visual conditions", MVFR: "MVFR — marginal visual conditions", IFR: "IFR — instrument conditions", NO_DATA: "No data", UNKNOWN: "Unclassified" },
    es: { VFR: "VFR — condiciones visuales favorables", MVFR: "MVFR — margen visual reducido", IFR: "IFR — condiciones instrumentales", NO_DATA: "Sin datos", UNKNOWN: "No clasificado" },
};

function localeKey(locale) {
    if (String(locale || "").startsWith("en")) return "en";
    if (String(locale || "").startsWith("es")) return "es";
    return "pt";
}

export function decodeMetarSummary(metarRaw, locale = "pt-BR") {
    const metar = String(metarRaw || "").trim();
    if (!metar) return { category: "NO_DATA", categoryLabel: CATEGORY_LABELS[localeKey(locale)].NO_DATA, hints: [] };

    const hints = [];
    const wind = metar.match(/\s(\d{3}|VRB)(\d{2,3})(G(\d{2,3}))?KT\b/);
    if (wind) {
        const gust = wind[3] ? ` G${wind[3]} kt` : "";
        hints.push(`Wind ${wind[1]}° at ${wind[2]} kt${gust}`);
    }

    const vis = metar.match(/\s(\d{4})\s/);
    if (vis) {
        const meters = Number(vis[1]);
        hints.push(meters >= 9999 ? "Visibility 10 km or more" : `Visibility ${meters} m`);
    }

    if (metar.includes("CAVOK")) hints.push("CAVOK — no significant weather");
    const ceiling = metar.match(/\s(?:BKN|OVC)(\d{3})\b/);
    if (ceiling) hints.push(`Ceiling about ${Number(ceiling[1]) * 100} ft`);

    const category = classifyFromMetar(metar);
    return {
        category,
        categoryLabel: CATEGORY_LABELS[localeKey(locale)][category] || category,
        hints,
    };
}
