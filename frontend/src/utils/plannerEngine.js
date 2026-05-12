import { haversineNm } from "./distance";

export function hasFilledValue(value) {
    return value !== undefined && value !== null && String(value).trim() !== "";
}

export function toNumber(value, fallback = 0) {
    const normalized = Number(String(value ?? "").replace(",", "."));
    return Number.isFinite(normalized) ? normalized : fallback;
}

export function clampPositive(value, fallback = 0) {
    const normalized = toNumber(value, fallback);
    return normalized < 0 ? 0 : normalized;
}

export function fmtMinutes(totalMinutes) {
    const minutes = Math.max(0, Math.round(clampPositive(totalMinutes)));
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return hours > 0 ? `${hours}h ${String(rest).padStart(2, "0")}min` : `${minutes}min`;
}

export function fmtHours(hoursValue) {
    if (!Number.isFinite(hoursValue) || hoursValue <= 0) return "—";
    return `${hoursValue.toFixed(1)} h`;
}

export function hasCoordinates(airport) {
    return Number.isFinite(airport?.latitude) && Number.isFinite(airport?.longitude);
}

export function distanceBetweenAirports(originAirport, destAirport) {
    if (!hasCoordinates(originAirport) || !hasCoordinates(destAirport)) return 0;
    return Math.round(haversineNm(originAirport.latitude, originAirport.longitude, destAirport.latitude, destAirport.longitude));
}

export function buildAircraftOptions(presets = [], profiles = []) {
    const profileOptions = (profiles || []).map((profile) => ({
        kind: "profile",
        key: `profile:${profile.id}`,
        id: profile.id,
        presetKey: profile.presetKey || null,
        label: profile.registration ? `${profile.name} · ${profile.registration}` : profile.name,
        helper: profile.isDefault ? "Perfil salvo (padrão)" : "Perfil salvo",
        data: profile.data || {},
        registration: profile.registration || "",
        notes: profile.notes || "",
        family: profile.family || "custom",
    }));

    const presetOptions = (presets || []).map((preset) => ({
        kind: "preset",
        key: `preset:${preset.key}`,
        id: null,
        presetKey: preset.key,
        label: preset.label,
        helper: "Preset nativo",
        data: preset.defaults || {},
        registration: "",
        notes: preset.description || "",
        family: preset.family || "ga_piston",
    }));

    return [...profileOptions, ...presetOptions];
}

export function resolveAircraftSelection(plan, presets = [], profiles = []) {
    if (plan?.aircraftProfileId) {
        const profile = (profiles || []).find((item) => item.id === plan.aircraftProfileId);
        if (profile) {
            const preset = (presets || []).find((item) => item.key === profile.presetKey) || null;
            return {
                kind: "profile",
                id: profile.id,
                presetKey: profile.presetKey || preset?.key || null,
                label: profile.registration ? `${profile.name} · ${profile.registration}` : profile.name,
                notes: profile.notes || preset?.description || "",
                registration: profile.registration || "",
                defaults: {
                    ...(preset?.defaults || {}),
                    ...(profile.data || {}),
                },
            };
        }
    }

    if (plan?.aircraftPresetKey) {
        const preset = (presets || []).find((item) => item.key === plan.aircraftPresetKey);
        if (preset) {
            return {
                kind: "preset",
                id: null,
                presetKey: preset.key,
                label: preset.label,
                notes: preset.description || "",
                registration: "",
                defaults: { ...(preset.defaults || {}) },
            };
        }
    }

    return null;
}

export function applyAircraftSelectionToPlan(plan, aircraft, options = {}) {
    const next = { ...(plan || {}) };

    if (!aircraft) return next;

    next.aircraftProfileId = aircraft.kind === "profile" ? aircraft.id : null;
    next.aircraftPresetKey = aircraft.presetKey || null;
    next.aircraftLabel = aircraft.label || "";
    next.registration = aircraft.registration || next.registration || "";
    next.reserveRule = next.reserveRule || aircraft.defaults?.reserveRule || "";

    const onlyFillMissing = !!options.onlyFillMissing;
    for (const [key, value] of Object.entries(aircraft.defaults || {})) {
        if (onlyFillMissing) {
            if (!hasFilledValue(next[key])) next[key] = value;
        } else {
            next[key] = value;
        }
    }

    return next;
}

export function buildPlannerSnapshot(base, calculated, aircraft) {
    return {
        route: {
            origin: base?.origin?.icao || "",
            dest: base?.dest?.icao || "",
            alternate: base?.alternate?.icao || "",
        },
        aircraft: aircraft
            ? {
                  kind: aircraft.kind,
                  presetKey: aircraft.presetKey || null,
                  profileId: aircraft.id || null,
                  label: aircraft.label,
              }
            : null,
        summary: {
            routeDistNm: calculated.routeDistNm,
            alternateLegDistNm: calculated.alternateLegDistNm,
            totalFuelL: calculated.totalFuelL,
            requiredFuelL: calculated.requiredFuelL,
            fuelMarginL: calculated.fuelMarginL,
            tripTimeMin: calculated.tripTimeMin,
            tripFuelL: calculated.tripFuelL,
        },
    };
}

export function calculatePlanner(plan, context = {}) {
    const working = plan || {};
    const suggestedRouteDistNm = distanceBetweenAirports(context.originAirport, context.destAirport);
    const suggestedAlternateDistNm = distanceBetweenAirports(context.destAirport || context.originAirport, context.alternateAirport);

    const routeDistNm = clampPositive(hasFilledValue(working.routeDistNm) ? working.routeDistNm : suggestedRouteDistNm);
    const tasKt = clampPositive(working.tasKt);
    const windCompKt = toNumber(working.windCompKt);
    const gsKt = Math.max(0, tasKt + windCompKt);
    const cruiseAltFt = clampPositive(working.cruiseAltFt || working.defaultCruiseAltFt);
    const payloadKg = clampPositive(working.payloadKg);
    const usableFuelL = clampPositive(working.usableFuelL);
    const fuelOnBoardL = clampPositive(working.fuelOnBoardL || usableFuelL);
    const desiredLandingFuelL = clampPositive(working.desiredLandingFuelL);
    const fuelFlowCruiseLph = clampPositive(working.fuelFlowCruiseLph);
    const taxiFuelL = clampPositive(working.taxiFuelL);
    const climbTimeMin = clampPositive(working.climbTimeMin);
    const climbFuelL = clampPositive(working.climbFuelL);
    const descentTimeMin = clampPositive(working.descentTimeMin);
    const descentFuelL = clampPositive(working.descentFuelL);
    const approachFuelL = clampPositive(working.approachFuelL);
    const contingencyPct = clampPositive(working.contingencyPct);
    const finalReserveMin = clampPositive(working.finalReserveMin);
    const extraFuelL = clampPositive(working.extraFuelL);

    const cruiseMode = String(working.cruiseMode || "auto");
    const cruiseDistNm = clampPositive(hasFilledValue(working.cruiseDistNm) ? working.cruiseDistNm : routeDistNm);
    const cruiseGsKt = clampPositive(hasFilledValue(working.cruiseGsKt) ? working.cruiseGsKt : gsKt);
    const cruiseTimeMinAuto = cruiseGsKt > 0 ? (cruiseDistNm / cruiseGsKt) * 60 : 0;
    const cruiseTimeMin = cruiseMode === "auto" ? cruiseTimeMinAuto : clampPositive(working.cruiseTimeMin);
    const cruiseFuelLAuto = fuelFlowCruiseLph > 0 ? (cruiseTimeMin / 60) * fuelFlowCruiseLph : 0;
    const cruiseFuelL = cruiseMode === "auto" ? cruiseFuelLAuto : clampPositive(working.cruiseFuelL);

    const alternateLegDistNm = clampPositive(hasFilledValue(working.alternateLegDistNm) ? working.alternateLegDistNm : suggestedAlternateDistNm);
    const alternateGsKt = clampPositive(hasFilledValue(working.alternateGsKt) ? working.alternateGsKt : gsKt);
    const alternateTimeMinAuto = alternateGsKt > 0 ? (alternateLegDistNm / alternateGsKt) * 60 : 0;
    const alternateFuelAuto = fuelFlowCruiseLph > 0 ? (alternateTimeMinAuto / 60) * fuelFlowCruiseLph + approachFuelL : 0;
    const alternateFuelL = hasFilledValue(working.alternateFuelL) ? clampPositive(working.alternateFuelL) : alternateFuelAuto;

    const tripTimeMin = climbTimeMin + cruiseTimeMin + descentTimeMin;
    const tripFuelL = climbFuelL + cruiseFuelL + descentFuelL + approachFuelL;
    const contingencyFuelL = (contingencyPct / 100) * tripFuelL;
    const finalReserveFuelL = fuelFlowCruiseLph > 0 ? (finalReserveMin / 60) * fuelFlowCruiseLph : 0;

    const requiredFuelL = taxiFuelL + tripFuelL + alternateFuelL + contingencyFuelL + finalReserveFuelL + extraFuelL;
    const reservesFuelL = alternateFuelL + contingencyFuelL + finalReserveFuelL + extraFuelL;
    const totalFuelL = requiredFuelL;
    const fuelMarginL = fuelOnBoardL - totalFuelL;
    const estimatedLandingFuelL = Math.max(0, fuelOnBoardL - (taxiFuelL + tripFuelL));
    const remainingAfterRequiredL = Math.max(0, fuelOnBoardL - totalFuelL);
    const enduranceHours = fuelFlowCruiseLph > 0 ? fuelOnBoardL / fuelFlowCruiseLph : 0;

    const legs = [
        context.destAirport || context.destIcao
            ? {
                  code: "A-B",
                  label: `${context.originIcao || "A"} → ${context.destIcao || "B"}`,
                  distanceNm: routeDistNm,
                  gsKt: cruiseGsKt || gsKt,
                  timeMin: tripTimeMin,
              }
            : null,
        context.alternateAirport || context.alternateIcao
            ? {
                  code: context.destIcao ? "B-C" : "A-C",
                  label: `${context.destIcao || context.originIcao || "A"} → ${context.alternateIcao || "C"}`,
                  distanceNm: alternateLegDistNm,
                  gsKt: alternateGsKt || gsKt,
                  timeMin: alternateTimeMinAuto,
              }
            : null,
    ].filter(Boolean);

    const warnings = [];
    if (fuelMarginL < 0) warnings.push("Combustível a bordo menor que o total requerido.");
    if (desiredLandingFuelL > 0 && estimatedLandingFuelL < desiredLandingFuelL) {
        warnings.push("Combustível estimado no pouso está abaixo do mínimo desejado.");
    }
    if (usableFuelL > 0 && fuelOnBoardL > usableFuelL) warnings.push("Combustível a bordo informado acima da capacidade útil configurada.");

    return {
        routeDistNm,
        suggestedRouteDistNm,
        alternateLegDistNm,
        suggestedAlternateDistNm,
        tasKt,
        windCompKt,
        gsKt,
        cruiseAltFt,
        payloadKg,
        usableFuelL,
        fuelOnBoardL,
        desiredLandingFuelL,
        fuelFlowCruiseLph,
        taxiFuelL,
        climbTimeMin,
        climbFuelL,
        cruiseMode,
        cruiseDistNm,
        cruiseGsKt,
        cruiseTimeMinAuto,
        cruiseTimeMin,
        cruiseFuelLAuto,
        cruiseFuelL,
        descentTimeMin,
        descentFuelL,
        approachFuelL,
        alternateGsKt,
        alternateTimeMinAuto,
        alternateFuelAuto,
        alternateFuelL,
        contingencyPct,
        contingencyFuelL,
        finalReserveMin,
        finalReserveFuelL,
        extraFuelL,
        tripTimeMin,
        tripFuelL,
        requiredFuelL,
        reservesFuelL,
        totalFuelL,
        fuelMarginL,
        estimatedLandingFuelL,
        remainingAfterRequiredL,
        enduranceHours,
        legs,
        warnings,
    };
}
