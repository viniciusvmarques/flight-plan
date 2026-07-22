/**
 * Smoke/regression tests for planner multi-leg nav.
 * Run: node frontend/scripts/test-planner-nav.mjs
 */
import { calculatePlanner, buildNavLegs, fmtClock } from "../src/utils/plannerEngine.js";

let passed = 0;
let failed = 0;
const failures = [];

function almost(a, b, eps = 0.15) {
    return Math.abs(Number(a) - Number(b)) <= eps;
}

function assert(name, cond, detail = "") {
    if (cond) {
        passed += 1;
        console.log(`  OK  ${name}`);
    } else {
        failed += 1;
        const msg = `FAIL ${name}${detail ? ` — ${detail}` : ""}`;
        failures.push(msg);
        console.log(`  ${msg}`);
    }
}

function baseCtx(extra = {}) {
    return {
        originIcao: "SBSP",
        destIcao: "SBGR",
        alternateIcao: "",
        originAirport: { latitude: -23.626, longitude: -46.656 },
        destAirport: { latitude: -23.435, longitude: -46.473 },
        ...extra,
    };
}

console.log("\n=== 1) Direta A-B (regressão) ===");
{
    const calc = calculatePlanner(
        {
            routeMode: "direct",
            routeDistNm: 165,
            trueCourseDeg: 90,
            magVariationDeg: -20,
            tasKt: 120,
            windDirectionDeg: 90,
            windSpeedKt: 20,
            climbTimeMin: 12,
            climbFuelL: 10,
            descentTimeMin: 10,
            descentFuelL: 4,
            fuelFlowCruiseLph: 36,
            taxiFuelL: 5,
            approachFuelL: 3,
            contingencyPct: 5,
            finalReserveMin: 30,
            fuelOnBoardL: 180,
            cruiseLevel: "FL085",
            cruiseMode: "auto",
        },
        baseCtx()
    );
    assert("GS headwind 20kt", almost(calc.groundSpeedKt, 100), `got ${calc.groundSpeedKt}`);
    assert("RM = RV - var", almost(calc.magCourseDeg, 110), `got ${calc.magCourseDeg}`);
    assert("climbDist = t*GS/60", almost(calc.climbDistNm, 20), `got ${calc.climbDistNm}`);
    assert("descentDist", almost(calc.descentDistNm, 100 / 6), `got ${calc.descentDistNm}`);
    assert("cruiseDist auto", almost(calc.cruiseDistAutoNm, 165 - 20 - 100 / 6), `got ${calc.cruiseDistAutoNm}`);
    assert("useNavLegs false", calc.useNavLegs === false);
    assert("trip = climb+cruise+descent", almost(calc.tripTimeMin, calc.climbTimeMin + calc.cruiseTimeMin + calc.descentTimeMin));
    assert("tripFuel sum", almost(calc.tripFuelL, 10 + calc.cruiseFuelL + 4 + 3));
}

console.log("\n=== 2) Multi-leg SBSP→waypoints→SBRF ===");
{
    const plan = {
        routeMode: "checkpoints",
        trueCourseDeg: 50,
        magVariationDeg: -22,
        tasKt: 110,
        windDirectionDeg: 80,
        windSpeedKt: 15,
        climbTimeMin: 21,
        climbFuelL: 17.5,
        descentTimeMin: 18,
        descentFuelL: 6,
        fuelFlowCruiseLph: 34,
        taxiFuelL: 8,
        approachFuelL: 4,
        contingencyPct: 5,
        finalReserveMin: 30,
        fuelOnBoardL: 200,
        cruiseLevel: "FL085",
        cruiseMode: "auto",
        navLegs: [
            { id: "1", name: "Rio Salgado", distanceNm: 45, trueCourseDeg: 48 },
            { id: "2", name: "Joaquim Gomes", distanceNm: 52, trueCourseDeg: 55 },
            { id: "3", name: "Maceió", distanceNm: 38, trueCourseDeg: 60 },
            { id: "4", name: "Penedo", distanceNm: 41, trueCourseDeg: 70 },
            { id: "5", name: "SBRF", distanceNm: 38, trueCourseDeg: 75 },
        ],
    };
    const ctx = baseCtx({ originIcao: "SBMO", destIcao: "SBRF", destAirport: { latitude: -8.126, longitude: -34.923 }, originAirport: { latitude: -9.511, longitude: -35.793 } });
    const calc = calculatePlanner(plan, ctx);
    const sumDist = 45 + 52 + 38 + 41 + 38;
    assert("soma pernas = routeDist", almost(calc.routeDistNm, sumDist), `got ${calc.routeDistNm}`);
    assert("useNavLegs", calc.useNavLegs === true);
    assert("5 legs", calc.navLegs.length === 5);
    assert("cumulativo final = total", almost(calc.navLegs[4].cumulativeNm, sumDist));
    assert("ETE acum monotônico", calc.navLegs.every((l, i) => i === 0 || l.cumulativeEteMin >= calc.navLegs[i - 1].cumulativeEteMin));
    assert("cada ETE = dist/gs*60", calc.navLegs.every((l) => almost(l.eteMin, (l.distanceNm / l.gsKt) * 60, 0.2)));
    assert("totalEte = soma ETEs", almost(calc.navLog.totalEteMin, calc.navLegs.reduce((s, l) => s + l.eteMin, 0), 0.2));
    assert("cruiseDist <= route", calc.cruiseDistNm <= calc.routeDistNm + 0.01);
    assert("cruiseDist = route-climb-desc", almost(calc.cruiseDistAutoNm, Math.max(0, sumDist - calc.climbDistNm - calc.descentDistNm)));
    assert("TOC <= climbDist", calc.toc.distanceFromOriginNm <= calc.climbDistNm + 0.01);
    assert("TOD = route - descent", almost(calc.tod.distanceFromOriginNm, sumDist - Math.min(sumDist, calc.descentDistNm)));
    assert("label contém waypoints", calc.navLog.routeLabel.includes("Maceió") && calc.navLog.routeLabel.includes("SBRF"));
    assert("required >= trip", calc.requiredFuelL >= calc.tripFuelL);
}

console.log("\n=== 3) Vento por perna (head/tail) ===");
{
    const calc = calculatePlanner(
        {
            routeMode: "checkpoints",
            tasKt: 100,
            magVariationDeg: 0,
            cruiseLevel: "A065",
            cruiseMode: "auto",
            climbTimeMin: 0,
            descentTimeMin: 0,
            fuelFlowCruiseLph: 30,
            fuelOnBoardL: 100,
            navLegs: [
                { name: "WP1", distanceNm: 60, trueCourseDeg: 0, windDirectionDeg: 0, windSpeedKt: 20 }, // head → GS 80
                { name: "WP2", distanceNm: 60, trueCourseDeg: 0, windDirectionDeg: 180, windSpeedKt: 20 }, // tail → GS 120
                { name: "DEST", distanceNm: 60, trueCourseDeg: 90, windDirectionDeg: 90, windSpeedKt: 10 }, // head → GS 90
            ],
        },
        baseCtx()
    );
    assert("perna1 GS ~80", almost(calc.navLegs[0].gsKt, 80, 0.5), `got ${calc.navLegs[0].gsKt}`);
    assert("perna2 GS ~120", almost(calc.navLegs[1].gsKt, 120, 0.5), `got ${calc.navLegs[1].gsKt}`);
    assert("perna3 GS ~90", almost(calc.navLegs[2].gsKt, 90, 0.5), `got ${calc.navLegs[2].gsKt}`);
    const expectedEte = (60 / 80) * 60 + (60 / 120) * 60 + (60 / 90) * 60;
    assert("ETE total vento misto", almost(calc.navLog.totalEteMin, expectedEte, 0.3), `got ${calc.navLog.totalEteMin} vs ${expectedEte}`);
    const harmonic = 180 / (expectedEte / 60);
    assert("GS harmônica (não aritmética)", almost(calc.groundSpeedKt, harmonic, 0.5), `got ${calc.groundSpeedKt}`);
    assert("trip ≈ ETE nav (sem climb/desc)", almost(calc.tripTimeMin, expectedEte, 0.5), `trip ${calc.tripTimeMin}`);
    assert("eet = trip", almost(calc.eetMinutes, expectedEte, 0.5), `eet ${calc.eetMinutes}`);
}

console.log("\n=== 4) Rota curta: climb+desc > route ===");
{
    const calc = calculatePlanner(
        {
            routeMode: "checkpoints",
            tasKt: 100,
            groundSpeedKt: 100,
            climbTimeMin: 40,
            descentTimeMin: 40,
            cruiseMode: "auto",
            cruiseLevel: "FL100",
            fuelFlowCruiseLph: 40,
            climbFuelL: 20,
            descentFuelL: 10,
            fuelOnBoardL: 150,
            navLegs: [
                { name: "MID", distanceNm: 20 },
                { name: "SBJD", distanceNm: 20 },
            ],
        },
        baseCtx({ destIcao: "SBJD" })
    );
    assert("route 40nm", almost(calc.routeDistNm, 40));
    assert("cruise auto 0", almost(calc.cruiseDistAutoNm, 0), `got ${calc.cruiseDistAutoNm}`);
    assert("warning climb+desc", calc.warnings.some((w) => w.includes("subida + descida")));
    assert("cruise fuel ~0 auto", almost(calc.cruiseFuelL, 0, 0.2));
}

console.log("\n=== 5) Checkpoints vazios / legado vfrCheckpoints ===");
{
    const empty = calculatePlanner({ routeMode: "checkpoints", tasKt: 100, cruiseLevel: "A045", fuelOnBoardL: 50 }, baseCtx());
    assert("sem pernas válidas", empty.useNavLegs === false);
    assert("aviso checkpoints", empty.warnings.some((w) => w.includes("checkpoints")));

    const legacy = calculatePlanner(
        {
            routeMode: "checkpoints",
            tasKt: 100,
            groundSpeedKt: 100,
            cruiseLevel: "A045",
            fuelOnBoardL: 80,
            climbTimeMin: 0,
            descentTimeMin: 0,
            fuelFlowCruiseLph: 30,
            vfrCheckpoints: [
                { name: "Rio", distanceNm: 30 },
                { name: "DEST", distanceNm: 40 },
            ],
        },
        baseCtx()
    );
    assert("legado vfrCheckpoints funciona", legacy.useNavLegs === true);
    assert("legado soma 70", almost(legacy.routeDistNm, 70));
}

console.log("\n=== 6) Override GS manual por perna ===");
{
    const calc = calculatePlanner(
        {
            routeMode: "checkpoints",
            tasKt: 120,
            trueCourseDeg: 100,
            windDirectionDeg: 100,
            windSpeedKt: 30, // would give GS 90 if used
            cruiseLevel: "FL075",
            climbTimeMin: 0,
            descentTimeMin: 0,
            fuelFlowCruiseLph: 32,
            fuelOnBoardL: 100,
            navLegs: [
                { name: "A", distanceNm: 90, groundSpeedKt: 90 },
                { name: "B", distanceNm: 90, groundSpeedKt: 180 },
            ],
        },
        baseCtx()
    );
    assert("override GS 90", almost(calc.navLegs[0].gsKt, 90));
    assert("override GS 180", almost(calc.navLegs[1].gsKt, 180));
    assert("ETE 60+30", almost(calc.navLog.totalEteMin, 90, 0.3), `got ${calc.navLog.totalEteMin}`);
}

console.log("\n=== 7) Alternado + combustível ===");
{
    const calc = calculatePlanner(
        {
            routeMode: "checkpoints",
            tasKt: 100,
            groundSpeedKt: 100,
            climbTimeMin: 10,
            climbFuelL: 8,
            descentTimeMin: 8,
            descentFuelL: 3,
            approachFuelL: 2,
            taxiFuelL: 5,
            fuelFlowCruiseLph: 30,
            contingencyPct: 10,
            finalReserveMin: 45,
            extraFuelL: 5,
            fuelOnBoardL: 120,
            cruiseMode: "auto",
            cruiseLevel: "FL065",
            alternateLegDistNm: 50,
            alternateGsKt: 100,
            navLegs: [
                { name: "WP", distanceNm: 50 },
                { name: "SBKP", distanceNm: 50 },
            ],
        },
        baseCtx({ destIcao: "SBKP", alternateIcao: "SBMT" })
    );
    const climbD = (10 / 60) * 100;
    const descD = (8 / 60) * 100;
    const cruiseD = Math.max(0, 100 - climbD - descD);
    const cruiseT = (cruiseD / 100) * 60;
    const cruiseF = (cruiseT / 60) * 30;
    const tripF = 8 + cruiseF + 3 + 2;
    const altT = (50 / 100) * 60;
    const altF = (altT / 60) * 30 + 2;
    const cont = 0.1 * tripF;
    const finalR = (45 / 60) * 30;
    const req = 5 + tripF + altF + cont + finalR + 5;
    assert("cruiseDist esperado", almost(calc.cruiseDistNm, cruiseD, 0.2), `got ${calc.cruiseDistNm}`);
    assert("tripFuel", almost(calc.tripFuelL, tripF, 0.3), `got ${calc.tripFuelL} vs ${tripF}`);
    assert("alternateFuel", almost(calc.alternateFuelL, altF, 0.3), `got ${calc.alternateFuelL}`);
    assert("requiredFuel", almost(calc.requiredFuelL, req, 0.5), `got ${calc.requiredFuelL} vs ${req}`);
    assert("legs inclui ALTN", calc.legs.some((l) => l.code === "ALTN"));
}

console.log("\n=== 8) Declinação por perna (herança) ===");
{
    const calc = calculatePlanner(
        {
            routeMode: "checkpoints",
            tasKt: 100,
            trueCourseDeg: 100,
            magVariationDeg: -20,
            groundSpeedKt: 100,
            cruiseLevel: "A055",
            climbTimeMin: 0,
            descentTimeMin: 0,
            fuelOnBoardL: 50,
            navLegs: [
                { name: "X", distanceNm: 10, trueCourseDeg: 100 },
                { name: "Y", distanceNm: 10, trueCourseDeg: 200 },
            ],
        },
        baseCtx()
    );
    assert("RM perna1 120", almost(calc.navLegs[0].magCourseDeg, 120), `got ${calc.navLegs[0].magCourseDeg}`);
    assert("RM perna2 220", almost(calc.navLegs[1].magCourseDeg, 220), `got ${calc.navLegs[1].magCourseDeg}`);
}

console.log("\n=== 9) buildNavLegs isolado + EET coerência ===");
{
    const log = buildNavLegs(
        {
            navLegs: [
                { name: "P1", distanceNm: 30 },
                { name: "P2", distanceNm: 70 },
            ],
        },
        { originIcao: "AAAA", destIcao: "BBBB" },
        { tasKt: 100, groundSpeedKt: 100, trueCourseDeg: 10 }
    );
    assert("buildNavLegs total 100", almost(log.totalDistanceNm, 100));
    assert("buildNavLegs ETE 60", almost(log.totalEteMin, 60));
    assert("routeLabel", log.routeLabel === "AAAA → P1 → P2");

    // Coerência trip ≈ navLog quando GS uniforme e climb/desc convertidos em distância
    const calc = calculatePlanner(
        {
            routeMode: "checkpoints",
            tasKt: 100,
            groundSpeedKt: 100,
            climbTimeMin: 12,
            descentTimeMin: 6,
            cruiseMode: "auto",
            cruiseLevel: "FL070",
            fuelFlowCruiseLph: 30,
            fuelOnBoardL: 100,
            navLegs: [
                { name: "M", distanceNm: 40 },
                { name: "D", distanceNm: 60 },
            ],
        },
        baseCtx()
    );
    // Com GS constante, tripTime deve ≈ route/gs*60
    assert("trip ≈ route/GS", almost(calc.tripTimeMin, 60, 0.5), `trip ${calc.tripTimeMin} nav ${calc.navLog.totalEteMin}`);
    assert("eet próximo do trip", almost(calc.eetMinutes, calc.tripTimeMin, 0.5) || almost(calc.eetMinutes, calc.navLog.totalEteMin, 0.5), `eet ${calc.eetMinutes}`);
}

console.log("\n=== 10) Rota longa 8 pernas + IFR altn ===");
{
    const legs = Array.from({ length: 8 }, (_, i) => ({
        name: i === 7 ? "SBGL" : `WP${i + 1}`,
        distanceNm: 25 + (i % 3) * 5,
        trueCourseDeg: 80 + i * 8,
        windDirectionDeg: 100,
        windSpeedKt: 10 + (i % 2) * 5,
    }));
    const sum = legs.reduce((s, l) => s + l.distanceNm, 0);
    const calc = calculatePlanner(
        {
            routeMode: "checkpoints",
            flightRule: "IFR",
            tasKt: 140,
            magVariationDeg: -21,
            climbTimeMin: 18,
            climbFuelL: 22,
            descentTimeMin: 15,
            descentFuelL: 8,
            approachFuelL: 5,
            taxiFuelL: 10,
            fuelFlowCruiseLph: 55,
            contingencyPct: 5,
            finalReserveMin: 45,
            fuelOnBoardL: 400,
            usableFuelL: 420,
            cruiseLevel: "FL120",
            cruiseMode: "auto",
            alternateLegDistNm: 40,
            navLegs: legs,
        },
        baseCtx({ originIcao: "SBRJ", destIcao: "SBGL", alternateIcao: "SBJR" })
    );
    assert("8 pernas", calc.navLegs.length === 8);
    assert("soma longa", almost(calc.routeDistNm, sum));
    assert("TOC < TOD", calc.toc.distanceFromOriginNm < calc.tod.distanceFromOriginNm || calc.cruiseDistNm === 0);
    assert("fuel margin finito", Number.isFinite(calc.fuelMarginL));
    assert("fmtClock eet", /^\d{2}:\d{2}$/.test(fmtClock(calc.eetMinutes)));
}

console.log("\n=== RESUMO ===");
console.log(`passed=${passed} failed=${failed}`);
if (failures.length) {
    console.log(failures.join("\n"));
    process.exit(1);
}
console.log("ALL TESTS PASSED");
