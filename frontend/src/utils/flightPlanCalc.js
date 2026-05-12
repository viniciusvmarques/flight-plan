// Unidades
// 1 USG = 3.785411784 L
export const L_PER_USG = 3.785411784;

export function toLiters(value, unit) {
    const v = Number(value);
    if (!isFinite(v)) return 0;
    return unit === "USG" ? v * L_PER_USG : v;
}

export function fromLiters(liters, unit) {
    const v = Number(liters);
    if (!isFinite(v)) return 0;
    return unit === "USG" ? v / L_PER_USG : v;
}

export function minutesToHHMM(min) {
    const m = Math.max(0, Math.round(min));
    const hh = Math.floor(m / 60);
    const mm = m % 60;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function computeFlightPlan({
                                      distanceNm,
                                      groundSpeedKt,
                                      burnPerHour, // em L/h
                                      fuelOnBoard, // em L
                                      reserveMinutes
                                  }) {
    const d = Number(distanceNm);
    const gs = Number(groundSpeedKt);
    const burn = Number(burnPerHour);
    const fob = Number(fuelOnBoard);
    const resMin = Number(reserveMinutes);

    if (!(d > 0) || !(gs > 0) || !(burn > 0)) {
        return { ok: false, error: "Preencha Distância, GS e Consumo corretamente." };
    }

    const eteHours = d / gs;
    const eteMinutes = eteHours * 60;

    const tripFuel = burn * eteHours;
    const reserveFuel = burn * (Math.max(0, resMin) / 60);
    const totalRequired = tripFuel + reserveFuel;

    const enduranceHours = fob > 0 ? fob / burn : 0;
    const enduranceMinutes = enduranceHours * 60;

    const fuelRemaining = fob - totalRequired;

    let status = "OK";
    if (fob <= 0) status = "SEM COMBUSTÍVEL";
    else if (fuelRemaining < 0) status = "INSUFICIENTE";
    else if (fuelRemaining < reserveFuel * 0.25) status = "MARGEM BAIXA";

    return {
        ok: true,
        eteMinutes,
        tripFuel,
        reserveFuel,
        totalRequired,
        enduranceMinutes,
        fuelRemaining,
        status
    };
}
