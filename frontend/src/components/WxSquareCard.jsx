import { useState } from "react";
import Card from "./Card";
import StatusDot from "./StatusDot";
import { classifyFromMetar } from "../utils/classifyFlightCategory";

function friendlyWeatherError(kind, value) {
    const fallback = `${kind} não disponível para este aeródromo no momento.`;
    const text = String(value || "").trim();
    const lower = text.toLowerCase();

    if (!text) return fallback;
    if (lower.includes("body is disturbed") || lower.includes("body is unusable") || lower.includes("locked")) return fallback;
    if (lower.includes("no data") || lower.includes("not found") || lower.includes("não encontrado") || lower.includes("nao encontrado")) return fallback;
    return text;
}

export default function WxSquareCard({ label, station, showFav, isFav, onToggleFav }) {
    const [expanded, setExpanded] = useState(false);

    const cat = classifyFromMetar(station?.metar);
    const icao = station?.icao || "----";

    const metarText = station?.metar || "Sem METAR disponível";
    const tafText = station?.taf || "Sem TAF disponível";

    const metarError = friendlyWeatherError("METAR", station?.metarError);
    const tafError = friendlyWeatherError("TAF", station?.tafError);
    const noMetarMessage = "METAR não disponível para este aeródromo no momento.";
    const noTafMessage = "TAF não disponível para este aeródromo no momento.";

    return (
        <div className={`wx-card-wrap ${expanded ? "expanded" : ""}`}>
            <Card
                title={`${label} • ${icao}`}
                titleLeft={<StatusDot category={cat} />}
                actions={
                    <>
                        {showFav && (
                            <button
                                type="button"
                                className={`fp-btn-icon ${isFav ? "fp-btn-icon--active" : ""}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFav?.(icao);
                                }}
                                title={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                aria-label={isFav ? "Remover favorito" : "Favoritar aeródromo"}
                                aria-pressed={isFav}
                            >
                                {isFav ? "★" : "☆"}
                            </button>
                        )}
                        <button
                            type="button"
                            className="fp-btn-icon fp-btn-icon--text"
                            onClick={(e) => {
                                e.stopPropagation();
                                setExpanded((v) => !v);
                            }}
                            aria-expanded={expanded}
                            title={expanded ? "Recolher texto METAR/TAF" : "Expandir METAR/TAF completo"}
                        >
                            {expanded ? "Recolher" : "Expandir"}
                        </button>
                    </>
                }
            >
                <div className="wx-body">
                    <div className="wx-meta-strip">
                        <span className="chip">{station?.airport?.name || "Aeródromo"}</span>
                        <span className="chip">{cat}</span>
                        {station?.airport?.elevationFt ? <span className="chip">{station.airport.elevationFt} ft</span> : null}
                    </div>

                    <section className="wx-section">
                        <div className="wx-label">METAR</div>

                        {station?.metarError ? (
                            <div className="wx-empty-state">{metarError || noMetarMessage}</div>
                        ) : (
                            <div className={`wx-text ${expanded ? "expanded" : ""}`}>{metarText}</div>
                        )}
                    </section>

                    <section className="wx-section">
                        <div className="wx-label">TAF</div>

                        {station?.tafError ? (
                            <div className="wx-empty-state">{tafError || noTafMessage}</div>
                        ) : (
                            <div className={`wx-text ${expanded ? "expanded" : ""}`}>{tafText}</div>
                        )}
                    </section>
                </div>
            </Card>
        </div>
    );

}
