const KEY = "fp_profile_v1";

const DEFAULTS = {
    displayName: "Piloto",
    fuelUnitDefault: "L",     // "L" | "USG"
    reserveMinDefault: 45,    // minutos
    favorites: []             // ["SBGR", "SBRJ"]
};

export function loadProfile() {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return { ...DEFAULTS };
        const parsed = JSON.parse(raw);
        return { ...DEFAULTS, ...parsed };
    } catch {
        return { ...DEFAULTS };
    }
}

export function saveProfile(profile) {
    localStorage.setItem(KEY, JSON.stringify(profile));
}

export function resetProfile() {
    localStorage.removeItem(KEY);
    return { ...DEFAULTS };
}

export function normalizeIcao(value) {
    return (value || "").toUpperCase().trim();
}
