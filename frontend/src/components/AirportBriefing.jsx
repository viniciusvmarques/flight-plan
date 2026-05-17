import Card from "./Card";
import StatusDot from "./StatusDot";
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

export default function AirportBriefing({ label, icao, metar, taf, metarError, tafError }) {
    const category = classifyFromMetar(metar);
    const noMetar = !metar;
    const noTaf = !taf;

    return (
        <Card
            title={`${label} • ${icao} — ${labelPt(category)}`}
            titleLeft={<StatusDot category={category} />}
        >
            <div style={{ marginBottom: "12px" }}>
                <strong>METAR</strong>
                <pre style={{ marginTop: "6px" }}>
          {noMetar ? weatherMessage("METAR", metarError) : metar}
        </pre>
            </div>

            <div>
                <strong>TAF</strong>
                <pre style={{ marginTop: "6px" }}>
          {noTaf ? weatherMessage("TAF", tafError) : taf}
        </pre>
            </div>

            {noMetar && noTaf && (
                <div style={{ marginTop: "10px", opacity: 0.75, fontSize: "12px" }}>
                    Este aeródromo pode não reportar METAR/TAF.
                </div>
            )}
        </Card>
    );
}
