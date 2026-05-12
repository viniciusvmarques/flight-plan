import Card from "./Card";
import StatusDot from "./StatusDot";
import { classifyFromMetar } from "../utils/classifyFlightCategory";


function parseWindFromMetar(raw) {
    const s = String(raw || "");
    const m = s.match(/\b(\d{3}|VRB)(\d{2,3})(G\d{2,3})?KT\b/);
    if (!m) return null;
    const dir = m[1] === "VRB" ? null : Number(m[1]);
    const spd = Number(m[2]);
    return { dirDeg: Number.isFinite(dir) ? dir : null, spdKt: Number.isFinite(spd) ? spd : null };
}

function degDiff(a, b) {
    let d = Math.abs((a - b) % 360);
    if (d > 180) d = 360 - d;
    return d;
}

function windComponents(windDirDeg, windSpdKt, rwyHdgDeg) {
    if (!Number.isFinite(windSpdKt) || !Number.isFinite(rwyHdgDeg)) return null;
    if (!Number.isFinite(windDirDeg)) return null; // VRB sem direção
    const theta = degDiff(windDirDeg, rwyHdgDeg) * (Math.PI / 180);
    const head = windSpdKt * Math.cos(theta); // + headwind / - tailwind
    const cross = windSpdKt * Math.sin(theta);
    return { headKt: head, crossKt: cross };
}

function pickBestRunway(runways, wind) {
    if (!wind || !runways?.length) return null;
    const ends = [];
    for (const rw of runways) {
        if (rw?.leIdent && Number.isFinite(rw?.leHdg)) ends.push({ ident: rw.leIdent, hdg: rw.leHdg });
        if (rw?.heIdent && Number.isFinite(rw?.heHdg)) ends.push({ ident: rw.heIdent, hdg: rw.heHdg });
    }
    if (!ends.length) return null;

    let best = null;
    for (const end of ends) {
        const comp = windComponents(wind.dirDeg, wind.spdKt, end.hdg);
        if (!comp) continue;
        const score = comp.headKt; // maximizar headwind
        if (!best || score > best.score) {
            best = { ident: end.ident, hdg: end.hdg, ...comp, score };
        }
    }
    return best;
}

function labelPt(category) {
    if (category === "VFR") return "VFR";
    if (category === "MVFR") return "VFR Marginal";
    if (category === "IFR") return "IFR";
    return "Sem dados";
}

export default function StationDetailsCard({ station, airportInfo }) {
    if (!station) {
        return (
            <Card title="Detalhes do aeródromo">
                <div className="empty-note">Clique em um aeródromo em "Estações monitoradas".</div>
            </Card>
        );
    }

    const cat = classifyFromMetar(station.metar);

    const name = airportInfo?.name || "—";
    const elevationFt =
        typeof airportInfo?.elevationFt === "number" ? `${airportInfo.elevationFt} ft` : "—";
    const runwaysText = airportInfo?.runwaysText || "—";
    const wind = parseWindFromMetar(station.metar);
    const bestRwy = pickBestRunway(airportInfo?.runways || [], wind);


    return (
        <Card
            title={`Detalhes • ${station.icao} — ${labelPt(cat)}`}
            titleLeft={<StatusDot category={cat} />}
        >
            <div className="detail-section">
                <strong className="detail-heading">Dados do aeródromo</strong>

                {airportInfo?.error ? (
                    <div className="detail-error">Atenção: {airportInfo.error}</div>
                ) : (
                    <div className="detail-grid">
                        <div className="detail-line">
                            <span className="detail-label">Nome</span>
                            <span>{name}</span>
                        </div>
                        <div className="detail-line">
                            <span className="detail-label">Elevação</span>
                            <span>{elevationFt}</span>
                        </div>
                        <div className="detail-line">
                            <span className="detail-label">Pistas</span>
                            <span>{runwaysText}</span>
                        </div>
                        <div className="detail-line detail-line--block">
                            <span className="detail-label">Vento x pista</span>
                            {bestRwy ? (
                                <span className="detail-copy">
                                    Melhor cabeceira <strong>{bestRwy.ident}</strong> • Headwind {Math.round(bestRwy.headKt)}kt •
                                    Crosswind {Math.round(Math.abs(bestRwy.crossKt))}kt
                                </span>
                            ) : (
                                <span>—</span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="detail-section">
                <strong className="detail-heading">METAR</strong>
                <pre>
          {station.metar ? station.metar : (station.metarError || "Sem METAR disponível")}
        </pre>
            </div>

            <div className="detail-section">
                <strong className="detail-heading">TAF</strong>
                <pre>
          {station.taf ? station.taf : (station.tafError || "Sem TAF disponível")}
        </pre>
            </div>
        </Card>
    );
}
