import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { en } from "./messages.en";
import { es } from "./messages.es";
import { ptBR } from "./messages.pt-BR";
import { getLocalizedPrice } from "./pricing";

export const SUPPORTED_LOCALES = ["pt-BR", "en", "es"];
export const LOCALE_LABELS = {
    "pt-BR": "PT",
    en: "EN",
    es: "ES",
};

const STORAGE_KEY = "mq_locale";
const dictionaries = {
    "pt-BR": ptBR,
    en,
    es,
};

const I18nContext = createContext(null);

function normalizeLocale(value) {
    const raw = String(value || "").toLowerCase();
    if (raw.startsWith("pt")) return "pt-BR";
    if (raw.startsWith("es")) return "es";
    if (raw.startsWith("en")) return "en";
    return "pt-BR";
}

function readInitialLocale() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return normalizeLocale(stored);
    } catch {
        /* ignore */
    }
    return normalizeLocale(navigator.language || navigator.languages?.[0]);
}

function getByPath(source, key) {
    return String(key || "")
        .split(".")
        .reduce((acc, part) => (acc && Object.prototype.hasOwnProperty.call(acc, part) ? acc[part] : undefined), source);
}

function interpolate(value, params = {}) {
    return String(value).replace(/\{\{(\w+)\}\}/g, (_, name) => (params[name] ?? params[name] === 0 ? String(params[name]) : ""));
}

export function I18nProvider({ children }) {
    const [locale, setLocaleState] = useState(readInitialLocale);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, locale);
        } catch {
            /* ignore */
        }
        document.documentElement.lang = locale;
        document.title =
            locale === "en"
                ? "Marquisa | ANAC simulators, METAR, TAF and flight planning"
                : locale === "es"
                  ? "Marquisa | Simulados ANAC, METAR, TAF y planificación de vuelo"
                  : "Marquisa | Simulados ANAC, METAR, TAF e planejamento de voo";
    }, [locale]);

    function setLocale(nextLocale) {
        setLocaleState(normalizeLocale(nextLocale));
    }

    const value = useMemo(() => {
        function t(key, params = {}) {
            const current = getByPath(dictionaries[locale], key);
            const fallback = getByPath(dictionaries["pt-BR"], key);
            return interpolate(current ?? fallback ?? key, params);
        }

        return {
            locale,
            setLocale,
            t,
            localizedPrice: getLocalizedPrice(locale),
        };
    }, [locale]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) throw new Error("useI18n must be used within I18nProvider");
    return context;
}

export function getStoredLocale() {
    try {
        return normalizeLocale(localStorage.getItem(STORAGE_KEY));
    } catch {
        return "pt-BR";
    }
}
