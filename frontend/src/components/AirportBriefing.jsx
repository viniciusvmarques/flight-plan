import Card from "./Card";
import StatusDot from "./StatusDot";
import { classifyFromMetar } from "../utils/classifyFlightCategory";

function labelPt(category) {
    if (category === "VFR") return "VFR";
    if (category === "MVFR") return "VFR Marginal";
    if (category === "IFR") return "IFR";
    return "Sem dados";
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
          {noMetar ? (metarError || "Sem METAR disponível") : metar}
        </pre>
            </div>

            <div>
                <strong>TAF</strong>
                <pre style={{ marginTop: "6px" }}>
          {noTaf ? (tafError || "Sem TAF disponível") : taf}
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
