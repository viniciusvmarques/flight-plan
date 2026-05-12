import { getAirportByIcao } from "../services/airports.service.js";

export function getAirport(req, res) {
    const icao = req.params.icao;
    const airport = getAirportByIcao(icao);

    if (!airport) {
        return res.status(404).json({ error: "Aeródromo não encontrado na base." });
    }

    // Texto de pistas pronto pra UI
    const runwaysText = (airport.runways || [])
        .slice(0, 10)
        .map(r => {
            const id = `${r.leIdent || "??"}/${r.heIdent || "??"}`;
            const len = r.lengthFt ? `${Math.round(r.lengthFt * 0.3048)}m` : "—";
            const sfc = r.surface || "—";
            return `${id} • ${len} • ${sfc}`;
        })
        .join(" | ");

    return res.json({
        icao: airport.icao,
        name: airport.name,
        elevationFt: airport.elevationFt,
        lat: airport.lat,
        lon: airport.lon,
        runways: airport.runways,
        runwaysText,
    });
}
