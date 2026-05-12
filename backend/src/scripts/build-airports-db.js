import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const ROOT = process.cwd();
const RAW_DIR = path.join(ROOT, "src", "data", "raw");
const OUT_FILE = path.join(ROOT, "src", "data", "airports_db.json");

const airportsCsv = fs.readFileSync(path.join(RAW_DIR, "airports.csv"), "utf-8");
const runwaysCsv = fs.readFileSync(path.join(RAW_DIR, "runways.csv"), "utf-8");

const airportsRows = parse(airportsCsv, { columns: true, skip_empty_lines: true });
const runwaysRows = parse(runwaysCsv, { columns: true, skip_empty_lines: true });

// Mapa: ICAO -> dados
const db = {};

// 1) airports.csv
for (const a of airportsRows) {
    const icao = (a.ident || "").trim().toUpperCase();
    if (!icao || icao.length !== 4) continue;

    db[icao] = {
        icao,
        name: a.name || null,
        type: a.type || null,
        municipality: a.municipality || null,
        region: a.iso_region || null,
        country: a.iso_country || null,
        lat: a.latitude_deg ? Number(a.latitude_deg) : null,
        lon: a.longitude_deg ? Number(a.longitude_deg) : null,
        elevationFt: a.elevation_ft ? Number(a.elevation_ft) : null,
        runways: [],
    };
}

// 2) runways.csv (liga pelo airport_ident)
for (const r of runwaysRows) {
    const icao = (r.airport_ident || "").trim().toUpperCase();
    if (!db[icao]) continue;

    const rw = {
        surface: r.surface || null,
        lengthFt: r.length_ft ? Number(r.length_ft) : null,
        widthFt: r.width_ft ? Number(r.width_ft) : null,
        leIdent: r.le_ident || null,
        heIdent: r.he_ident || null,
        leHeading: r.le_heading_degT ? Number(r.le_heading_degT) : null,
        heHeading: r.he_heading_degT ? Number(r.he_heading_degT) : null,
    };

    db[icao].runways.push(rw);
}

// 3) Salvar
fs.writeFileSync(OUT_FILE, JSON.stringify(db, null, 2), "utf-8");
console.log(`OK: Gerado ${OUT_FILE} com ${Object.keys(db).length} aeroportos ICAO`);
