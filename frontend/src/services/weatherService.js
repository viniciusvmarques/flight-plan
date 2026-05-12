const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function safeText(res) {
    const t = await res.text();

    // Se o Express devolver HTML (rota errada), a gente dá erro amigável
    const trimmed = (t || "").trim();
    if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
        throw new Error("API retornou HTML (rota errada). Verifique /api/weather/metar/:icao e /api/weather/taf/:icao.");
    }

    return t;
}

export async function fetchMetar(icao) {
    const code = String(icao || "").trim().toUpperCase();
    const r = await fetch(`${API}/api/weather/metar/${encodeURIComponent(code)}`);

    if (!r.ok) {
        // tenta ler JSON {error} do backend
        try {
            const j = await r.json();
            throw new Error(j?.error || "Falha ao buscar METAR");
        } catch {
            const t = await safeText(r);
            throw new Error(t || "Falha ao buscar METAR");
        }
    }

    return await safeText(r); // texto
}

export async function fetchTaf(icao) {
    const code = String(icao || "").trim().toUpperCase();
    const r = await fetch(`${API}/api/weather/taf/${encodeURIComponent(code)}`);

    if (!r.ok) {
        try {
            const j = await r.json();
            throw new Error(j?.error || "Falha ao buscar TAF");
        } catch {
            const t = await safeText(r);
            throw new Error(t || "Falha ao buscar TAF");
        }
    }

    return await safeText(r); // texto
}
