import { visitorHeaders } from "../utils/visitorId.js";
import { getApiBase, getToken } from "./apiClient.js";

const API = getApiBase();

function friendlyWeatherMessage(kind, value) {
    const text = String(value || "").trim();
    const upperKind = String(kind || "boletim").toUpperCase();
    const lower = text.toLowerCase();

    if (!text) return `${upperKind} não disponível para este aeródromo no momento.`;
    if (
        lower.includes("body is disturbed") ||
        lower.includes("body is unusable") ||
        lower.includes("locked")
    ) {
        return `${upperKind} não disponível para este aeródromo no momento.`;
    }
    if (
        lower.includes("no data") ||
        lower.includes("not found") ||
        lower.includes("sem metar") ||
        lower.includes("sem taf") ||
        lower.includes("não encontrado") ||
        lower.includes("nao encontrado") ||
        lower.includes("não disponível") ||
        lower.includes("nao disponivel")
    ) {
        return `${upperKind} não disponível para este aeródromo no momento.`;
    }

    return `Não foi possível consultar ${upperKind} agora. Tente novamente em instantes.`;
}

async function readJson(res) {
    const text = await res.text();
    const trimmed = (text || "").trim();
    if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
        throw new Error("API retornou HTML (rota errada).");
    }
    try {
        return JSON.parse(text || "{}");
    } catch {
        return { raw: text };
    }
}

function authHeaders() {
    const h = { ...visitorHeaders() };
    const token = getToken();
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
}

function extractErrorMessage(data) {
    if (data && typeof data === "object") return data.error || data.message || JSON.stringify(data);
    return String(data || "");
}

/** Consulta METAR+TAF — público, sem cadastro. */
export async function fetchStationWeather(icao) {
    const code = String(icao || "").trim().toUpperCase();
    const url = `${API}/api/weather/station/${encodeURIComponent(code)}`;
    let r;
    try {
        r = await fetch(url, { headers: authHeaders() });
    } catch {
        const hint =
            API.includes("localhost")
                ? "Backend local offline. Suba a API na porta 3001 ou aponte VITE_API_URL para a API online."
                : "Não foi possível alcançar a API de meteorologia. Verifique a conexão e tente de novo.";
        const err = new Error(hint);
        err.status = 0;
        throw err;
    }
    const data = await readJson(r);
    if (!r.ok) {
        const err = new Error(extractErrorMessage(data) || friendlyWeatherMessage("METAR", data?.error));
        err.status = r.status;
        err.data = data;
        throw err;
    }
    return data;
}

export async function fetchMetar(icao) {
    const station = await fetchStationWeather(icao);
    return station.metar || "";
}

export async function fetchTaf(icao) {
    const station = await fetchStationWeather(icao);
    return station.taf || "";
}

export async function fetchMetarLegacy(icao) {
    const code = String(icao || "").trim().toUpperCase();
    const r = await fetch(`${API}/api/weather/metar/${encodeURIComponent(code)}`, { headers: authHeaders() });
    const text = await r.text();
    if (!r.ok) {
        let message = text;
        try {
            message = JSON.parse(text)?.error || text;
        } catch {
            /* plain text */
        }
        const err = new Error(friendlyWeatherMessage("METAR", message));
        err.status = r.status;
        throw err;
    }
    return text;
}

export async function fetchTafLegacy(icao) {
    const code = String(icao || "").trim().toUpperCase();
    const r = await fetch(`${API}/api/weather/taf/${encodeURIComponent(code)}`, { headers: authHeaders() });
    const text = await r.text();
    if (!r.ok) {
        let message = text;
        try {
            message = JSON.parse(text)?.error || text;
        } catch {
            /* plain text */
        }
        const err = new Error(friendlyWeatherMessage("TAF", message));
        err.status = r.status;
        throw err;
    }
    return text;
}
