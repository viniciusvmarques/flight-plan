// Regras simples (neutras) para "flight category" a partir do METAR bruto.
// (MVP) funciona na maioria dos casos: pega VIS e ceiling aproximado.
// Se não conseguir extrair, retorna "UNKNOWN".

function parseVisibilityMeters(metar) {
    // Ex: "9999" (m), "5000", "2000"
    const m = metar.match(/\s(\d{4})\s/);
    if (!m) return null;
    return Number(m[1]);
}

function parseCeilingFeet(metar) {
    // Procura BKN/OVC com altura (centenas de pés): BKN008 => 800 ft
    const m = metar.match(/\s(?:BKN|OVC)(\d{3})\b/);
    if (!m) return null;
    return Number(m[1]) * 100;
}

export function classifyFromMetar(metarRaw) {
    if (!metarRaw) return "NO_DATA";

    const metar = metarRaw.toString();

    const vis = parseVisibilityMeters(metar);
    const ceil = parseCeilingFeet(metar);

    // Se não achou nada, tenta pelo CAVOK (geralmente VFR)
    if (metar.includes("CAVOK")) return "VFR";

    // Se não conseguiu extrair um ou outro, marca como UNKNOWN (ainda conta como "Sem dados úteis")
    if (vis == null && ceil == null) return "UNKNOWN";

    // IFR: vis < 3000m OU teto < 1000ft
    if ((vis != null && vis < 3000) || (ceil != null && ceil < 1000)) return "IFR";

    // MVFR: vis 3000–4999 OU teto 1000–1499
    if (
        (vis != null && vis >= 3000 && vis < 5000) ||
        (ceil != null && ceil >= 1000 && ceil < 1500)
    ) return "MVFR";

    // VFR: vis >= 5000 E teto >= 1500 (quando presentes)
    return "VFR";
}
