import { api } from "./apiClient";

export function fetchAircraftPresets() {
    return api("/api/aircraft/presets", { auth: false }).then((res) => res?.items || []);
}

export function fetchAircraftProfiles() {
    return api("/api/aircraft/profiles").then((res) => res?.items || []);
}

export function createAircraftProfile(payload) {
    return api("/api/aircraft/profiles", { method: "POST", body: payload });
}

export function updateAircraftProfile(id, payload) {
    return api(`/api/aircraft/profiles/${id}`, { method: "PUT", body: payload });
}

export function deleteAircraftProfile(id) {
    return api(`/api/aircraft/profiles/${id}`, { method: "DELETE" });
}
