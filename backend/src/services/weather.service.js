import axios from "axios";

function normIcao(icao) {
    return String(icao || "").trim().toUpperCase();
}

const CHECKWX_BASE = process.env.CHECKWX_BASE || "https://api.checkwx.com";
const CHECKWX_KEY = process.env.CHECKWX_KEY || "";

async function callCheckWx(path) {
    if (!CHECKWX_KEY) {
        throw new Error("CHECKWX_KEY não configurada no .env");
    }

    const url = `${CHECKWX_BASE}${path}`;
    const r = await axios.get(url, {
        headers: { "X-API-Key": CHECKWX_KEY },
        timeout: 12000,
    });

    return r.data;
}

export async function getMetar(icao) {
    const code = normIcao(icao);
    const json = await callCheckWx(`/metar/${code}/decoded`);
    const first = json?.data?.[0];
    if (!first) throw new Error("Sem METAR disponível.");
    return first?.raw_text || first?.raw || JSON.stringify(first);
}

export async function getTaf(icao) {
    const code = normIcao(icao);
    const json = await callCheckWx(`/taf/${code}/decoded`);
    const first = json?.data?.[0];
    if (!first) throw new Error("Sem TAF disponível.");
    return first?.raw_text || first?.raw || JSON.stringify(first);
}
