const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

/** Mesma chave que `AuthContext`: JWT como string JSON-stringified no storage. */
export function getToken() {
    try {
        const raw = localStorage.getItem("fp_token");
        if (!raw) return null;
        const v = JSON.parse(raw);
        if (typeof v === "string") return v;
        if (v && typeof v === "object" && typeof v.token === "string") return v.token;
        return null;
    } catch {
        return null;
    }
}

/**
 * @param {string} path
 * @param {{ method?: string, headers?: Record<string,string>, body?: unknown, auth?: boolean, token?: string|null }} [options]
 */
export async function api(path, options = {}) {
    const {
        method = "GET",
        headers,
        body,
        auth = true,
        token: tokenOverride,
    } = options;

    const h = { ...(headers || {}) };
    if (body !== undefined) h["Content-Type"] = "application/json";

    const token = tokenOverride !== undefined ? tokenOverride : auth ? getToken() : null;
    if (token) h["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: h,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text ? { raw: text } : null;
    }

    if (!res.ok) {
        const msg =
            (data && typeof data === "object" && (data.error || data.message)) ||
            (typeof data === "string" ? data : null) ||
            `Erro HTTP ${res.status}`;
        throw new Error(msg);
    }

    return data;
}

/** Segundo argumento pode ser token (string) ou opções `{ token, auth }` — compatível com Billing. */
export function apiGet(path, arg2) {
    const opts = typeof arg2 === "string" ? { token: arg2 } : arg2 || {};
    return api(path, { method: "GET", ...opts });
}

export function apiPost(path, body, arg3) {
    const opts = typeof arg3 === "string" ? { token: arg3 } : arg3 || {};
    return api(path, { method: "POST", body, ...opts });
}
