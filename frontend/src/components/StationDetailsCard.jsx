import Card from "./Card";
import StatusDot from "./StatusDot";
import RunwaySuggestion from "./RunwaySuggestion";
import { classifyFromMetar } from "../utils/classifyFlightCategory";

function labelPt(category) {
    if (category === "VFR") return "VFR";
    if (category === "MVFR") return "VFR Marginal";
    if (category === "IFR") return "IFR";
    return "Sem dados";
}

function weatherMessage(kind, error) {
    const fallback = `${kind} não disponível para este aeródromo no momento.`;
    const text = String(error || "").trim();
    const lower = text.toLowerCase();

    if (!text) return fallback;
    if (lower.includes("body is disturbed") || lower.includes("body is unusable") || lower.includes("locked")) return fallback;
    if (lower.includes("no data") || lower.includes("not found") || lower.includes("não encontrado") || lower.includes("nao encontrado")) return fallback;
    return text;
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
                            <RunwaySuggestion runways={airportInfo?.runways || []} metar={station.metar} />
                        </div>
                    </div>
                )}
            </div>

            <div className="detail-section">
                <strong className="detail-heading">METAR</strong>
                {station.metar ? <pre>{station.metar}</pre> : <div className="wx-empty-state">{weatherMessage("METAR", station.metarError)}</div>}
            </div>

            <div className="detail-section">
                <strong className="detail-heading">TAF</strong>
                {station.taf ? <pre>{station.taf}</pre> : <div className="wx-empty-state">{weatherMessage("TAF", station.tafError)}</div>}
            </div>
        </Card>
    );
}
