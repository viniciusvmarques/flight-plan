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

export function fmtClock(totalMinutes) {
    const minutes = Math.max(0, Math.round(clampPositive(totalMinutes)));
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function normalizeDeg(value) {
    const n = toNumber(value, 0) % 360;
    return n < 0 ? n + 360 : n;
}

export function fmtDeg(value) {
    if (!Number.isFinite(value)) return "—";
    return `${String(Math.round(normalizeDeg(value))).padStart(3, "0")}°`;
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
            flightRule: calculated.flightRule,
            groundSpeedKt: calculated.groundSpeedKt,
            headingDeg: calculated.headingDeg,
            cruiseLevelLabel: calculated.cruiseLevelLabel,
        },
    };
}

function hasAnyFilled(...values) {
    return values.some(hasFilledValue);
}

function calculateWindNavigation(working, tasKt, fallbackGsKt) {
    const trueCourseDeg = hasFilledValue(working.trueCourseDeg) ? normalizeDeg(working.trueCourseDeg) : null;
    const magVariationDeg = toNumber(working.magVariationDeg, 0);
    const magCourseDeg = trueCourseDeg != null ? normalizeDeg(trueCourseDeg - magVariationDeg) : null;
    const windDirectionDeg = hasFilledValue(working.windDirectionDeg) ? normalizeDeg(working.windDirectionDeg) : null;
    const windSpeedKt = clampPositive(working.windSpeedKt);
    const legacyWindCompKt = toNumber(working.windCompKt);

    if (trueCourseDeg == null || !tasKt || windDirectionDeg == null || !windSpeedKt) {
        const gsKt = Math.max(0, fallbackGsKt || tasKt + legacyWindCompKt);
        return {
            trueCourseDeg,
            magVariationDeg,
            magCourseDeg,
            windDirectionDeg,
            windSpeedKt,
            windCorrectionDeg: 0,
            headingDeg: trueCourseDeg != null ? trueCourseDeg : null,
            magHeadingDeg: trueCourseDeg != null ? normalizeDeg(trueCourseDeg - magVariationDeg) : null,
            headwindKt: -legacyWindCompKt,
            crosswindKt: 0,
            groundSpeedKt: gsKt,
        };
    }

    const rel = (windDirectionDeg - trueCourseDeg) * (Math.PI / 180);
    const headwindKt = windSpeedKt * Math.cos(rel);
    const crosswindKt = windSpeedKt * Math.sin(rel);
    const ratio = tasKt > 0 ? Math.max(-0.95, Math.min(0.95, crosswindKt / tasKt)) : 0;
    const windCorrectionDeg = Math.asin(ratio) * (180 / Math.PI);
    const headingDeg = normalizeDeg(trueCourseDeg + windCorrectionDeg);
    const groundSpeedKt = Math.max(0, tasKt - headwindKt);

    return {
        trueCourseDeg,
        magVariationDeg,
        magCourseDeg,
        windDirectionDeg,
        windSpeedKt,
        windCorrectionDeg,
        headingDeg,
        magHeadingDeg: normalizeDeg(headingDeg - magVariationDeg),
        headwindKt,
        crosswindKt,
        groundSpeedKt,
    };
}

function buildCheckpoints(working, routeDistNm, groundSpeedKt) {
    const raw = Array.isArray(working.vfrCheckpoints) ? working.vfrCheckpoints : [];
    return raw
        .map((item, index) => {
            const distanceNm = clampPositive(item?.distanceNm);
            const eteMin = groundSpeedKt > 0 ? (distanceNm / groundSpeedKt) * 60 : 0;
            return {
                id: item?.id || `cp-${index}`,
                name: String(item?.name || `Ponto ${index + 1}`).trim(),
                distanceNm,
                eteMin,
                cumulativeNm: Math.min(routeDistNm, distanceNm),
            };
        })
        .filter((item) => item.distanceNm > 0 || item.name);
}

function buildOperationalChecklist({ working, flightRule, hasDest, hasAlternate, hasMetar, hasTaf, fuelMarginL, cruiseLevelLabel }) {
    const items = [
        {
            key: "meteo",
            label: hasMetar || hasTaf ? "METAR/TAF consultado para aeródromos disponíveis." : "Consultar METAR/TAF e tendência antes da decisão.",
            ok: hasMetar || hasTaf,
        },
        {
            key: "route",
            label: hasDest ? "Origem e destino definidos para navegação." : "Definir destino para cálculo de etapa.",
            ok: hasDest,
        },
        {
            key: "alternate",
            label:
                flightRule === "IFR"
                    ? hasAlternate
                        ? "Alternativa IFR informada."
                        : "IFR sem alternativa informada: verifique requisito operacional."
                    : hasAlternate
                      ? "Alternativa VFR informada."
                      : "Alternativa VFR não informada; avalie conforme meteorologia e operação.",
            ok: flightRule === "IFR" ? hasAlternate : true,
        },
        {
            key: "level",
            label: cruiseLevelLabel ? `Nível/altitude planejado: ${cruiseLevelLabel}.` : "Informar altitude ou nível de cruzeiro.",
            ok: !!cruiseLevelLabel,
        },
        {
            key: "fuel",
            label: fuelMarginL >= 0 ? "Combustível a bordo cobre o requerido estimado." : "Combustível a bordo abaixo do requerido estimado.",
            ok: fuelMarginL >= 0,
        },
        {
            key: "documents",
            label: "Conferir IAIP/ROTAER, NOTAM, restrições e cartas aplicáveis fora do app.",
            ok: false,
            advisory: true,
        },
    ];

    if (flightRule === "IFR") {
        items.push({
            key: "ifr-procedure",
            label: working.ifrProcedureNotes ? "Procedimento IFR anotado para a navegação." : "Anotar SID/rota/STAR/IAC ou procedimento pretendido.",
            ok: !!working.ifrProcedureNotes,
            advisory: true,
        });
    }

    return items;
}

export function calculatePlanner(plan, context = {}) {
    const working = plan || {};
    const flightRule = String(working.flightRule || "VFR").toUpperCase() === "IFR" ? "IFR" : "VFR";
    const routeMode = String(working.routeMode || "direct");
    const suggestedRouteDistNm = distanceBetweenAirports(context.originAirport, context.destAirport);
    const suggestedAlternateDistNm = distanceBetweenAirports(context.destAirport || context.originAirport, context.alternateAirport);

    const routeDistNm = clampPositive(hasFilledValue(working.routeDistNm) ? working.routeDistNm : suggestedRouteDistNm);
    const tasKt = clampPositive(working.tasKt);
    const fallbackGsKt = hasFilledValue(working.groundSpeedKt) ? clampPositive(working.groundSpeedKt) : null;
    const nav = calculateWindNavigation(working, tasKt, fallbackGsKt);
    const windCompKt = -nav.headwindKt;
    const gsKt = nav.groundSpeedKt;
    const groundSpeedKt = nav.groundSpeedKt;
    const cruiseAltFt = clampPositive(working.cruiseAltFt || working.defaultCruiseAltFt);
    const cruiseLevel = String(working.cruiseLevel || "").trim().toUpperCase();
    const transitionMode = String(working.transitionMode || (cruiseLevel ? "flightLevel" : "altitude"));
    const cruiseLevelLabel = cruiseLevel || (cruiseAltFt ? `${cruiseAltFt.toFixed(0)} ft` : "");
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
    const cruiseGsKt = clampPositive(hasFilledValue(working.cruiseGsKt) ? working.cruiseGsKt : groundSpeedKt);
    const cruiseTimeMinAuto = cruiseGsKt > 0 ? (cruiseDistNm / cruiseGsKt) * 60 : 0;
    const cruiseTimeMin = cruiseMode === "auto" ? cruiseTimeMinAuto : clampPositive(working.cruiseTimeMin);
    const cruiseFuelLAuto = fuelFlowCruiseLph > 0 ? (cruiseTimeMin / 60) * fuelFlowCruiseLph : 0;
    const cruiseFuelL = cruiseMode === "auto" ? cruiseFuelLAuto : clampPositive(working.cruiseFuelL);

    const alternateLegDistNm = clampPositive(hasFilledValue(working.alternateLegDistNm) ? working.alternateLegDistNm : suggestedAlternateDistNm);
    const alternateGsKt = clampPositive(hasFilledValue(working.alternateGsKt) ? working.alternateGsKt : groundSpeedKt);
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
    const enduranceMin = enduranceHours * 60;
    const eetMinutes = hasFilledValue(working.eetMinutes) ? clampPositive(working.eetMinutes) : tripTimeMin;
    const vfrCheckpoints = buildCheckpoints(working, routeDistNm, groundSpeedKt);

    const legs = [
        context.destAirport || context.destIcao
            ? {
                  code: "A-B",
                  label: `${context.originIcao || "A"} → ${context.destIcao || "B"}`,
                  distanceNm: routeDistNm,
                  gsKt: cruiseGsKt || groundSpeedKt,
                  timeMin: tripTimeMin,
              }
            : null,
        context.alternateAirport || context.alternateIcao
            ? {
                  code: context.destIcao ? "B-C" : "A-C",
                  label: `${context.destIcao || context.originIcao || "A"} → ${context.alternateIcao || "C"}`,
                  distanceNm: alternateLegDistNm,
                  gsKt: alternateGsKt || groundSpeedKt,
                  timeMin: alternateTimeMinAuto,
              }
            : null,
    ].filter(Boolean);

    const warnings = [];
    if (!hasAnyFilled(working.trueCourseDeg, working.cruiseGsKt, working.groundSpeedKt, working.windCompKt)) {
        warnings.push("Informe rumo/vento ou GS para uma navegação estimada mais completa.");
    }
    if (!cruiseLevelLabel) warnings.push("Informe altitude ou nível de cruzeiro para completar a ficha de navegação.");
    if (flightRule === "IFR" && !(context.alternateAirport || context.alternateIcao)) {
        warnings.push("IFR sem alternativa informada: confirme se a operação permite essa condição.");
    }
    if (flightRule === "VFR" && !context.originStation?.metar && !context.destStation?.metar) {
        warnings.push("VFR requer avaliação visual e meteorológica fora do app quando não houver METAR/TAF.");
    }
    if (fuelMarginL < 0) warnings.push("Combustível a bordo menor que o total requerido.");
    if (desiredLandingFuelL > 0 && estimatedLandingFuelL < desiredLandingFuelL) {
        warnings.push("Combustível estimado no pouso está abaixo do mínimo desejado.");
    }
    if (usableFuelL > 0 && fuelOnBoardL > usableFuelL) warnings.push("Combustível a bordo informado acima da capacidade útil configurada.");

    const checklist = buildOperationalChecklist({
        working,
        flightRule,
        hasDest: !!(context.destAirport || context.destIcao),
        hasAlternate: !!(context.alternateAirport || context.alternateIcao),
        hasMetar: !!(context.originStation?.metar || context.destStation?.metar || context.alternateStation?.metar),
        hasTaf: !!(context.originStation?.taf || context.destStation?.taf || context.alternateStation?.taf),
        fuelMarginL,
        cruiseLevelLabel,
    });

    const flightPlanSummary = {
        aircraftId: working.registration || working.callsign || "—",
        rule: flightRule,
        route: `${context.originIcao || "A"}${context.destIcao ? ` → ${context.destIcao}` : ""}${context.alternateIcao ? ` / ALT ${context.alternateIcao}` : ""}`,
        speed: tasKt ? `N${tasKt.toFixed(0)}` : "—",
        level: cruiseLevelLabel || "—",
        eet: fmtClock(eetMinutes),
        endurance: fmtClock(enduranceMin),
        alternate: context.alternateIcao || "—",
        fuelRequired: `${requiredFuelL.toFixed(1)} L`,
    };

    return {
        flightRule,
        routeMode,
        routeDistNm,
        suggestedRouteDistNm,
        alternateLegDistNm,
        suggestedAlternateDistNm,
        tasKt,
        windCompKt,
        gsKt,
        groundSpeedKt,
        trueCourseDeg: nav.trueCourseDeg,
        magVariationDeg: nav.magVariationDeg,
        magCourseDeg: nav.magCourseDeg,
        windDirectionDeg: nav.windDirectionDeg,
        windSpeedKt: nav.windSpeedKt,
        windCorrectionDeg: nav.windCorrectionDeg,
        headingDeg: nav.headingDeg,
        magHeadingDeg: nav.magHeadingDeg,
        headwindKt: nav.headwindKt,
        crosswindKt: nav.crosswindKt,
        cruiseAltFt,
        cruiseLevel,
        transitionMode,
        cruiseLevelLabel,
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
        enduranceMin,
        eetMinutes,
        vfrCheckpoints,
        legs,
        warnings,
        checklist,
        flightPlanSummary,
    };
}
