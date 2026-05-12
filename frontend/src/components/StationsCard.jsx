import Card from "./Card";
import StatusDot from "./StatusDot";
import { classifyFromMetar } from "../utils/classifyFlightCategory";

function labelPt(category) {
    if (category === "VFR") return "VFR";
    if (category === "MVFR") return "VFR marginal";
    if (category === "IFR") return "IFR";
    return "Sem dados";
}

export default function StationsCard({ data, onSelect, selectedIcao }) {
    if (!data) {
        return (
            <Card title="Estações monitoradas">
                <div className="empty-note">Gere um briefing para ver origem, destino e alternativa aqui.</div>
            </Card>
        );
    }

    const stations = [
        { role: data.mode === "single" ? "A · Aeródromo" : "A · Origem", item: data.origin },
        ...(data.dest ? [{ role: "B · Destino", item: data.dest }] : []),
        ...(data.alternate ? [{ role: "C · Alternativa", item: data.alternate }] : []),
    ];

    return (
        <Card title="Estações monitoradas">
            <div className="stations-list">
                {stations.map(({ role, item }) => {
                    const category = classifyFromMetar(item.metar);
                    const active = selectedIcao === item.icao;

                    return (
                        <div
                            key={item.icao}
                            role="button"
                            tabIndex={0}
                            className={`fp-station-row ${active ? "fp-station-row--active" : ""}`}
                            onClick={() => onSelect(item.icao)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    onSelect(item.icao);
                                }
                            }}
                        >
                            <StatusDot category={category} />

                            <div className="fp-station-main">
                                <strong className="fp-station-code">{item.icao}</strong>
                                <div className="fp-station-meta">
                                    {role} · {labelPt(category)}
                                </div>
                                <div className="fp-station-submeta">{item.airport?.name || "Aeródromo sem identificação local"}</div>
                            </div>

                            <span className="fp-station-chevron" aria-hidden>
                                Detalhes ›
                            </span>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
