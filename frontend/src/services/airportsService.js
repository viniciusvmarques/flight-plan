const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function fetchAirport(icao) {
    const code = (icao || "").toUpperCase().trim();
    if (code.length !== 4) {
        throw new Error("ICAO inválido");
    }

    const r = await fetch(`${API_BASE}/api/airport?icao=${encodeURIComponent(code)}`);

    if (!r.ok) {
        let msg = "Não foi possível buscar dados do aeródromo.";
        try {
            const j = await r.json();
            if (j?.error) msg = j.error;
        } catch {}
        throw new Error(msg);
    }

    return await r.json();
}
