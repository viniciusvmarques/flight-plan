const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

function friendlyWeatherMessage(kind, value) {
    const text = String(value || "").trim();
    const upperKind = String(kind || "boletim").toUpperCase();
    const lower = text.toLowerCase();

    if (!text) return `${upperKind} não disponível para este aeródromo no momento.`;
    if (
        lower.includes("body is disturbed") ||
        lower.includes("body is unusable") ||
        lower.includes("locked")
    ) {
        return `${upperKind} não disponível para este aeródromo no momento.`;
    }
    if (
        lower.includes("no data") ||
        lower.includes("not found") ||
        lower.includes("sem metar") ||
        lower.includes("sem taf") ||
        lower.includes("não encontrado") ||
        lower.includes("nao encontrado") ||
        lower.includes("não disponível") ||
        lower.includes("nao disponivel")
    ) {
        return `${upperKind} não disponível para este aeródromo no momento.`;
    }

    return `Não foi possível consultar ${upperKind} agora. Tente novamente em instantes.`;
}

async function readText(res) {
    const t = await res.text();

    // Se o Express devolver HTML (rota errada), a gente dá erro amigável
    const trimmed = (t || "").trim();
    if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
        throw new Error("API retornou HTML (rota errada). Verifique /api/weather/metar/:icao e /api/weather/taf/:icao.");
    }

    return t;
}

function extractErrorMessage(text) {
    try {
        const json = JSON.parse(text || "{}");
        return json?.error || json?.message || text;
    } catch {
        return text;
    }
}

export async function fetchMetar(icao) {
    const code = String(icao || "").trim().toUpperCase();
    const r = await fetch(`${API}/api/weather/metar/${encodeURIComponent(code)}`);
    const text = await readText(r);

    if (!r.ok) {
        throw new Error(friendlyWeatherMessage("METAR", extractErrorMessage(text)));
    }

    return text; // texto
}

export async function fetchTaf(icao) {
    const code = String(icao || "").trim().toUpperCase();
    const r = await fetch(`${API}/api/weather/taf/${encodeURIComponent(code)}`);
    const text = await readText(r);

    if (!r.ok) {
        throw new Error(friendlyWeatherMessage("TAF", extractErrorMessage(text)));
    }

    return text; // texto
}
