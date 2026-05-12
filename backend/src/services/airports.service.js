import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// tenta achar os arquivos em locais comuns do seu projeto
function tryPaths(relPaths) {
    for (const rel of relPaths) {
        const p = path.resolve(__dirname, rel);
        if (fs.existsSync(p)) return p;
    }
    return null;
}

const airportsDbPath = tryPaths([
    "../data/airports_db.json",
    "../data/airports-db.json",
    "../data/airportsDb.json",
    "../data/raw/airports_db.json",
]);

const runwaysDbPath = tryPaths([
    "../data/runways_db.json",
    "../data/runways-db.json",
    "../data/runwaysDb.json",
    "../data/raw/runways_db.json",
]);

let AIRPORTS = null;
let RUNWAYS = null;

function loadDbOnce() {
    if (!AIRPORTS) {
        if (!airportsDbPath) {
            throw new Error(
                "Não encontrei airports_db.json. Coloque em backend/src/data/airports_db.json (recomendado)."
            );
        }
        AIRPORTS = JSON.parse(fs.readFileSync(airportsDbPath, "utf-8"));
    }

    if (!RUNWAYS) {
        // runways é opcional: se não existir, só não mostra pistas
        if (runwaysDbPath) {
            RUNWAYS = JSON.parse(fs.readFileSync(runwaysDbPath, "utf-8"));
        } else {
            RUNWAYS = {};
        }
    }
}

/**
 * Retorna informações do aeródromo:
 * { icao, name, elevationFt, runwaysText }
 */


function normalizeRunwayIdent(id) {
    const s = String(id || "").trim().toUpperCase();
    if (!s) return "";
    const m = s.match(/^(\d{1,2})([A-Z])?$/);
    if (m) return m[1].padStart(2, "0") + (m[2] || "");
    return s;
}
export function getAirportInfo(icao) {
    loadDbOnce();

    const code = String(icao || "").trim().toUpperCase();
    if (code.length !== 4) throw new Error("ICAO inválido");

    // airports_db.json pode estar como objeto { "SBGR": {...} } ou lista
    let a = null;

    if (Array.isArray(AIRPORTS)) {
        a = AIRPORTS.find(
            (x) =>
                String(x.icao || x.ident || x.gps_code || "")
                    .trim()
                    .toUpperCase() === code
        );
    } else {
        a = AIRPORTS[code] || null;
    }

    if (!a) {
        throw new Error(`Aeródromo ${code} não encontrado no banco local.`);
    }

    const name =
        a.name ||
        a.airport_name ||
        a.municipality ||
        a.local_name ||
        "Aeródromo";

    const elevationFt =
        Number(a.elevation_ft ?? a.elevationFt ?? a.elev_ft ?? a.elevation) || null;

    // runways_db.json recomendado como { "SBGR": ["09L/27R 3700m", ...] } ou { "SBGR": [...] }
    const rw = RUNWAYS?.[code];

    let runwaysText = "—";

    if (Array.isArray(rw) && rw.length) {

        const formatted = rw.map(r => {

            // CASO 1: já veio como string
            if (typeof r === "string") return r;

            // CASO 2: formato comum { le: "09L", he: "27R", length_m: 3700 }
            if (r.le && r.he) {
                const len = r.length_m ? ` ${r.length_m}m` : "";
                return `${normalizeRunwayIdent(r.le)}/${normalizeRunwayIdent(r.he)}${len}`;
            }

            // CASO 3: formato airports.csv (runway identifiers)
            if (r.le_ident && r.he_ident) {
                const len = r.length_ft ? ` ${Math.round(r.length_ft * 0.3048)}m` : "";
                return `${normalizeRunwayIdent(r.le_ident)}/${normalizeRunwayIdent(r.he_ident)}${len}`;
            }

            return "";
        });

        runwaysText = formatted.filter(Boolean).join(" • ");
    }


    return { icao: code, name, elevationFt, runwaysText };
}
