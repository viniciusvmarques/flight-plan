import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { legalVersions } from "../content/siteProfile";

const AuthContext = createContext(null);

const API = import.meta.env.VITE_API_URL || "http://localhost:3001"; // backend
const LS_USER = "fp_user";
const LS_TOKEN = "fp_token";

function loadJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}
function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function buildApiError(payload, fallback) {
    const error = new Error(payload?.error || fallback);
    if (payload && typeof payload === "object") {
        error.code = payload.code;
        error.email = payload.email;
        error.requiresEmailVerification = payload.requiresEmailVerification;
        error.message = payload.error || payload.message || fallback;
    }
    return error;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => loadJSON(LS_USER, null));
    const [token, setToken] = useState(() => loadJSON(LS_TOKEN, null));

    useEffect(() => saveJSON(LS_USER, user), [user]);
    useEffect(() => saveJSON(LS_TOKEN, token), [token]);

    async function register({ email, password, accepted, consentVersions }) {
        const r = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                password,
                consent: { accepted: !!accepted },
                consentVersions: consentVersions || legalVersions,
            }),
        });

        const json = await r.json().catch(() => ({}));
        if (!r.ok) throw buildApiError(json, "Falha ao criar conta.");

        if (json?.token && json?.user) {
            setToken(json.token);
            setUser(json.user);
        } else {
            setToken(null);
            setUser(null);
        }
        return json;
    }

    async function login({ email, password }) {
        const r = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const json = await r.json().catch(() => ({}));
        if (!r.ok) throw buildApiError(json, "Falha no login.");

        setToken(json.token);
        setUser(json.user);
        return json;
    }

    async function refreshMe() {
        if (!token) return;
        const r = await fetch(`${API}/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const json = await r.json().catch(() => ({}));
        if (r.ok && json?.user) setUser(json.user);
    }


    function setPlan(plan){
        setUser((u)=> (u ? { ...u, plan } : u));
    }

    function logout() {
        setUser(null);
        setToken(null);
        localStorage.removeItem(LS_USER);
        localStorage.removeItem(LS_TOKEN);
    }

    const value = useMemo(
        () => ({ user, token, register, login, logout, refreshMe, setPlan }),
        [user, token]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
