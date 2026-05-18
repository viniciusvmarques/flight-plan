import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import SummaryCard from "../components/SummaryCard";
import StationsCard from "../components/StationsCard";
import StationDetailsCard from "../components/StationDetailsCard";

import WxSquareCard from "../components/WxSquareCard";
import FlightPlanStack from "../components/FlightPlanStack";

import { fetchMetar, fetchTaf } from "../services/weatherService";
import { fetchAirport } from "../services/airportsService";
import { fetchAircraftPresets, fetchAircraftProfiles } from "../services/aircraftService";
import { api } from "../services/apiClient";
import { classifyFromMetar } from "../utils/classifyFlightCategory";
import { haversineNm } from "../utils/distance";
import {
    applyAircraftSelectionToPlan,
    buildPlannerSnapshot,
    calculatePlanner,
    resolveAircraftSelection,
} from "../utils/plannerEngine";

import { useAuth } from "../auth/AuthContext";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import { useNotify } from "../ui/NotifyContext.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";

function isValidIcao(x) {
    return (x || "").toUpperCase().trim().length === 4;
}

function uid() {
    return Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);
}

function loadJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function saveJSON(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
}

function hasCoordinates(airport) {
    return Number.isFinite(airport?.latitude) && Number.isFinite(airport?.longitude);
}

function friendlyWeatherError(kind, value, t) {
    const fallback = t("dashboard.weatherUnavailable", { kind });
    const text = String(value || "").trim();
    const lower = text.toLowerCase();

    if (!text) return fallback;
    if (lower.includes("body is disturbed") || lower.includes("body is unusable") || lower.includes("locked")) return fallback;
    if (lower.includes("no data") || lower.includes("not found") || lower.includes("não encontrado") || lower.includes("nao encontrado")) return fallback;
    return text;
}

export default function Dashboard() {
    const { user } = useAuth();
    const nav = useNavigate();
    const { toast } = useNotify();
    const { t } = useI18n();
    const detailRef = useRef(null);
    const simuladosRef = useRef(null);

    const [lastData, setLastData] = useState(() => {
        try {
            const raw = localStorage.getItem("fp_last_briefing");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });

    const [plannerSeed, setPlannerSeed] = useState(() => {
        const stored = loadJSON("fp_planner_seed", null);
        if (stored) return stored;
        return lastData?.plan || {};
    });

    const [data, setData] = useState(null);
    const base = data || lastData;

    const [selectedIcao, setSelectedIcao] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [airportInfo, setAirportInfo] = useState(null);
    const [airportInfoLoading, setAirportInfoLoading] = useState(false);
    const [presets, setPresets] = useState([]);
    const [profiles, setProfiles] = useState([]);

    const favKey = useMemo(() => (user ? `fp_favs_${user.id}` : null), [user]);

    const currentPlan = data?.plan || plannerSeed || base?.plan || {};
    const activeAircraft = useMemo(() => resolveAircraftSelection(currentPlan, presets, profiles), [currentPlan, presets, profiles]);

    useEffect(() => {
        saveJSON("fp_planner_seed", plannerSeed || {});
    }, [plannerSeed]);

    useEffect(() => {
        function scrollToSimulados() {
            if (window.location.hash !== "#simulados") return;
            window.setTimeout(() => {
                simuladosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 250);
        }

        scrollToSimulados();
        window.addEventListener("hashchange", scrollToSimulados);
        return () => window.removeEventListener("hashchange", scrollToSimulados);
    }, []);

    useEffect(() => {
        let cancelled = false;

        Promise.allSettled([fetchAircraftPresets(), user ? fetchAircraftProfiles() : Promise.resolve([])]).then((results) => {
            if (cancelled) return;
            setPresets(results[0].status === "fulfilled" ? results[0].value : []);
            setProfiles(results[1].status === "fulfilled" ? results[1].value : []);
        });

        return () => {
            cancelled = true;
        };
    }, [user]);

    useEffect(() => {
        if (activeAircraft || !presets.length) return;
        const defaultProfile = profiles.find((item) => item.isDefault);
        const fallbackSelection = defaultProfile
            ? {
                  kind: "profile",
                  id: defaultProfile.id,
                  presetKey: defaultProfile.presetKey,
                  label: defaultProfile.registration ? `${defaultProfile.name} · ${defaultProfile.registration}` : defaultProfile.name,
                  registration: defaultProfile.registration || "",
                  defaults: defaultProfile.data || {},
              }
            : {
                  kind: "preset",
                  id: null,
                  presetKey: presets[0].key,
                  label: presets[0].label,
                  registration: "",
                  defaults: presets[0].defaults || {},
              };
        setPlannerSeed((current) => applyAircraftSelectionToPlan(current, fallbackSelection));
    }, [activeAircraft, presets, profiles]);

    function updatePlan(nextPlan) {
        setPlannerSeed(nextPlan || {});
        if (data) {
            const next = { ...data, plan: nextPlan || {} };
            setData(next);
            setLastData(next);
            localStorage.setItem("fp_last_briefing", JSON.stringify(next));
        } else if (lastData) {
            const next = { ...lastData, plan: nextPlan || {} };
            setLastData(next);
            localStorage.setItem("fp_last_briefing", JSON.stringify(next));
        }
    }

    function isFavorite(icao) {
        if (!favKey || !icao) return false;
        const favs = loadJSON(favKey, []);
        return favs.includes(icao);
    }

    function toggleFavorite(icao) {
        if (!favKey || !icao) return;
        const favs = loadJSON(favKey, []);
        const exists = favs.includes(icao);
        const next = exists ? favs.filter((x) => x !== icao) : [icao, ...favs];
        saveJSON(favKey, next);
    }

    function saveBriefing() {
        if (!base?.origin?.icao) {
            toast(t("dashboard.saveOriginRequired"), {
                variant: "warning",
                title: t("dashboard.saveOriginRequiredTitle"),
            });
            return;
        }
        if (!user) {
            toast(t("dashboard.loginRequired"), { variant: "info", title: t("dashboard.loginRequiredTitle") });
            nav("/login");
            return;
        }

        const plan = String(user?.plan || "FREE").toUpperCase();
        if (plan !== "PRO") {
            toast(t("dashboard.proRequired"), {
                variant: "warning",
                title: t("dashboard.proRequiredTitle"),
            });
            nav("/assinatura");
            return;
        }

        const calculation = calculatePlanner(base?.plan || plannerSeed || {}, {
            originAirport: base?.origin?.airport || null,
            destAirport: base?.dest?.airport || null,
            alternateAirport: base?.alternate?.airport || null,
            originIcao: base?.origin?.icao || "A",
            destIcao: base?.dest?.icao || "",
            alternateIcao: base?.alternate?.icao || "",
        });

        const entry = {
            id: uid(),
            at: new Date().toISOString(),
            origin: base.origin?.icao || "",
            dest: base.dest?.icao || "",
            alt: base.alternate?.icao || "",
            plan: base.plan || plannerSeed || null,
            aircraft: activeAircraft
                ? {
                      kind: activeAircraft.kind,
                      presetKey: activeAircraft.presetKey || null,
                      profileId: activeAircraft.id || null,
                      label: activeAircraft.label,
                  }
                : null,
            snapshot: buildPlannerSnapshot(base, calculation, activeAircraft),
        };

        api("/api/briefings", { method: "POST", body: { data: entry } })
            .then(() =>
                toast(t("dashboard.saved"), {
                    variant: "success",
                    title: t("dashboard.savedTitle"),
                })
            )
            .catch((e) =>
                toast(e?.message || t("dashboard.saveError"), {
                    variant: "error",
                    title: t("dashboard.saveErrorTitle"),
                })
            );
    }

    function recomputeCounts(snapshot) {
        const next = { VFR: 0, MVFR: 0, IFR: 0, NO_DATA: 0, UNKNOWN: 0 };
        if (!snapshot) return next;
        const airports = [snapshot.origin, snapshot.dest, snapshot.alternate].filter(Boolean);
        for (const a of airports) {
            const cat = classifyFromMetar(a?.metar);
            next[cat] = (next[cat] || 0) + 1;
        }
        return next;
    }

    const counts = useMemo(() => recomputeCounts(base), [base]);
    const plannerSummary = useMemo(() => {
        if (!base) return null;
        return calculatePlanner(base.plan || plannerSeed || {}, {
            originAirport: base?.origin?.airport || null,
            destAirport: base?.dest?.airport || null,
            alternateAirport: base?.alternate?.airport || null,
            originIcao: base?.origin?.icao || "A",
            destIcao: base?.dest?.icao || "",
            alternateIcao: base?.alternate?.icao || "",
        });
    }, [base, plannerSeed]);

    async function briefFor(icao) {
        const code = icao.toUpperCase().trim();
        const [metarRes, tafRes, airportRes] = await Promise.allSettled([fetchMetar(code), fetchTaf(code), fetchAirport(code)]);

        return {
            icao: code,
            metar: metarRes.status === "fulfilled" ? metarRes.value : null,
            taf: tafRes.status === "fulfilled" ? tafRes.value : null,
            metarError: metarRes.status === "rejected" ? friendlyWeatherError("METAR", metarRes.reason?.message, t) : null,
            tafError: tafRes.status === "rejected" ? friendlyWeatherError("TAF", tafRes.reason?.message, t) : null,
            airport: airportRes.status === "fulfilled" ? airportRes.value : null,
                    airportError: airportRes.status === "rejected" ? airportRes.reason?.message || t("dashboard.airportFetchError") : null,
        };
    }

    async function handleBrief(origin, dest, alt, requestOptions = {}) {
        const o = (origin || "").toUpperCase().trim();
        const d = (dest || "").toUpperCase().trim();
        const a = (alt || "").toUpperCase().trim();

        setLoading(true);
        setError("");
        setData(null);
        setSelectedIcao("");
        setAirportInfo(null);
        setAirportInfoLoading(false);

        try {
            if (!isValidIcao(o)) throw new Error(t("dashboard.invalidOrigin"));
            if (d && !isValidIcao(d)) throw new Error(t("dashboard.invalidDestination"));
            if (a && !isValidIcao(a)) throw new Error(t("dashboard.invalidAlternate"));

            const tasks = [briefFor(o)];
            if (d) tasks.push(briefFor(d));
            if (a) tasks.push(briefFor(a));

            const results = await Promise.all(tasks);

            let basePlan = requestOptions?.plan || plannerSeed || base?.plan || {};
            if (requestOptions?.aircraftSelection) {
                basePlan = applyAircraftSelectionToPlan(basePlan, {
                    kind: requestOptions.aircraftSelection.kind,
                    id: requestOptions.aircraftSelection.id,
                    presetKey: requestOptions.aircraftSelection.presetKey,
                    label: requestOptions.aircraftSelection.label,
                    registration: requestOptions.aircraftSelection.registration || "",
                    defaults: requestOptions.aircraftSelection.data || {},
                });
            }
            if (!basePlan.routeDistNm && hasCoordinates(results[0]?.airport) && hasCoordinates(d ? results[1]?.airport : null)) {
                basePlan = {
                    ...basePlan,
                    routeDistNm: String(
                        Math.round(haversineNm(results[0].airport.latitude, results[0].airport.longitude, results[1].airport.latitude, results[1].airport.longitude))
                    ),
                };
            }
            const out = {
                origin: results[0],
                dest: d ? results[1] : null,
                alternate: a ? results[results.length - 1] : null,
                mode: d ? "route" : "single",
                plan: basePlan,
            };

            setData(out);
            setLastData(out);
            setPlannerSeed(basePlan);
            localStorage.setItem("fp_last_briefing", JSON.stringify(out));
            toast(d ? t("dashboard.briefingGeneratedRoute", { origin: o, dest: d }) : t("dashboard.briefingGeneratedSingle", { origin: o }), {
                variant: "success",
                title: t("dashboard.briefingGeneratedTitle"),
            });
        } catch (e) {
            setError(e?.message || "Erro ao gerar briefing");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        try {
            const raw = localStorage.getItem("fp_pending_brief_request");
            if (!raw) return;
            const req = JSON.parse(raw);
            localStorage.removeItem("fp_pending_brief_request");
            if (req?.origin) handleBrief(req.origin, req.dest || "", req.alt || "", { plan: req.plan || null });
        } catch {}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectedStation = useMemo(() => {
        if (!base || !selectedIcao) return null;
        if (base.origin?.icao === selectedIcao) return base.origin;
        if (base.dest?.icao === selectedIcao) return base.dest;
        if (base.alternate?.icao === selectedIcao) return base.alternate;
        return null;
    }, [base, selectedIcao]);

    function scrollToDetails() {
        if (!detailRef.current) return;
        window.requestAnimationFrame(() => {
            detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    useEffect(() => {
        if (!selectedStation) return;
        scrollToDetails();
    }, [selectedStation]);

    async function openDetails(icao) {
        if (selectedIcao === icao && detailRef.current) {
            scrollToDetails();
        }
        setSelectedIcao(icao);

        const cachedStation = [base?.origin, base?.dest, base?.alternate].filter(Boolean).find((station) => station.icao === icao);
        if (cachedStation?.airport) {
            setAirportInfo(cachedStation.airport);
            setAirportInfoLoading(false);
            return;
        }

        setAirportInfo(null);
        setAirportInfoLoading(true);

        try {
            const info = await fetchAirport(icao);
            setAirportInfo(info);
        } catch (e) {
            setAirportInfo({ error: e?.message || t("dashboard.airportLoadError") });
        } finally {
            setAirportInfoLoading(false);
        }
    }

    function closeDetails() {
        setSelectedIcao("");
        setAirportInfo(null);
        setAirportInfoLoading(false);
    }

    const headerSubtitle = selectedIcao
        ? t("dashboard.detailsSubtitle")
        : t("dashboard.defaultSubtitle");

    const routeHeadline = base?.dest?.icao
        ? `${base.origin?.icao || "A"} → ${base.dest.icao}`
        : base?.origin?.icao || "Aguardando rota";

    const activeFocusLabel = selectedStation
        ? `${selectedStation.icao} em foco`
        : t("dashboard.selectStationDetails");

    return (
        <div className="app">
            <Sidebar onBrief={handleBrief} />

            <div className="main-shell">
                <AppHeader kicker={t("dashboard.headerKicker")} title={t("dashboard.headerTitle")} subtitle={t("dashboard.headerSubtitle")} />

                <div className="main-scroll">
                    <div className="page-shell">
                        <section className="page-hero page-hero--dashboard">
                            <div className="page-hero-head">
                                <div className="page-hero-copy">
                                    <span className="page-eyebrow">{t("dashboard.eyebrow")}</span>
                                    <h1 className="page-title">{t("dashboard.title")}</h1>
                                    <p className="page-caption">
                                        {t("dashboard.caption")}
                                    </p>
                                </div>
                                {user ? (
                                    <div className="page-actions">
                                        <button className="secondary" type="button" onClick={() => nav("/simulados")}>
                                            {t("dashboard.examsTitle")}
                                        </button>
                                        <button className="secondary" type="button" onClick={saveBriefing}>
                                            {t("dashboard.saveBriefing")}
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                            <div className="dashboard-route-strip">
                                <div className="dashboard-route-pill">
                                    <span className="dashboard-route-code">A</span>
                                    <div className="dashboard-route-meta">
                                        <span className="dashboard-route-label">{t("common.origin")}</span>
                                        <strong className="dashboard-route-value">{base?.origin?.icao || "Pendente"}</strong>
                                    </div>
                                </div>
                                <div className="dashboard-route-pill">
                                    <span className="dashboard-route-code">B</span>
                                    <div className="dashboard-route-meta">
                                        <span className="dashboard-route-label">{t("common.destination")}</span>
                                        <strong className="dashboard-route-value">{base?.dest?.icao || "Opcional"}</strong>
                                    </div>
                                </div>
                                <div className="dashboard-route-pill">
                                    <span className="dashboard-route-code">C</span>
                                    <div className="dashboard-route-meta">
                                        <span className="dashboard-route-label">{t("common.alternate")}</span>
                                        <strong className="dashboard-route-value">{base?.alternate?.icao || "Opcional"}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-meta-strip">
                                <span className="chip ok">{user ? t("dashboard.accountPlan", { plan: String(user.plan || "FREE").toUpperCase() }) : t("dashboard.visitorMode")}</span>
                            </div>
                        </section>

                        <section id="simulados" ref={simuladosRef} className="dashboard-anchor-section">
                            <Card title={t("dashboard.examsTitle")}>
                            <div className="dashboard-sim-card">
                                <div>
                                    <strong>{t("dashboard.examsLead")}</strong>
                                    <p>
                                        {t("dashboard.examsCopy")}
                                    </p>
                                </div>
                                <button className="primary" type="button" onClick={() => nav(user ? "/simulados" : "/register")}>
                                    {user ? t("dashboard.openExams") : t("dashboard.createFreeAccount")}
                                </button>
                            </div>
                            </Card>
                        </section>

                        {base ? (
                            <section className="dashboard-overview-grid">
                                <article className="dashboard-overview-card">
                                    <span className="dashboard-overview-label">{t("dashboard.routeActive")}</span>
                                    <strong className="dashboard-overview-value">{routeHeadline}</strong>
                                    <span className="dashboard-overview-copy">
                                        {base?.alternate?.icao ? `${t("common.alternate")}: ${base.alternate.icao}` : t("dashboard.noAlternate")}
                                    </span>
                                </article>

                                <article className="dashboard-overview-card">
                                    <span className="dashboard-overview-label">{t("dashboard.planning")}</span>
                                    <strong className="dashboard-overview-value">
                                        {base?.plan?.cruiseAltFt || base?.plan?.defaultCruiseAltFt
                                            ? `Cruzeiro ${base.plan?.cruiseAltFt || base.plan?.defaultCruiseAltFt} ft`
                                            : t("dashboard.paramsFree")}
                                    </strong>
                                    <span className="dashboard-overview-copy">
                                        {base?.plan?.reserveRule
                                            ? `Reserva ${base.plan.reserveRule}`
                                            : t("dashboard.adjustReserve")}
                                    </span>
                                </article>

                                <article className="dashboard-overview-card">
                                    <span className="dashboard-overview-label">{t("dashboard.fuel")}</span>
                                    <strong className="dashboard-overview-value">
                                        {plannerSummary ? `${plannerSummary.totalFuelL.toFixed(1)} L` : "—"}
                                    </strong>
                                    <span className="dashboard-overview-copy">
                                        {plannerSummary
                                            ? `Trip ${plannerSummary.tripFuelL.toFixed(1)} L · margem ${plannerSummary.fuelMarginL.toFixed(1)} L`
                                            : t("dashboard.summaryAfterBriefing")}
                                    </span>
                                </article>

                                <article className="dashboard-overview-card">
                                    <span className="dashboard-overview-label">{t("dashboard.focus")}</span>
                                    <strong className="dashboard-overview-value">{activeFocusLabel}</strong>
                                    <span className="dashboard-overview-copy">
                                        {selectedStation ? t("dashboard.detailsOpen") : t("dashboard.useStations")}
                                    </span>
                                </article>
                            </section>
                        ) : null}

                        {loading && <Card title={t("common.loading")}>{t("dashboard.loadingBrief")}</Card>}
                        {error && <Card title={t("common.error")}>{error}</Card>}

                        {!base && !loading && !error && (
                            <Card title={t("dashboard.startTitle")}>
                                <div className="empty-note route-start-note">
                                    <span>{t("dashboard.startSentence")}</span>
                                    <div className="route-start-list" aria-label="Campos da rota">
                                        <span className="route-start-item">
                                            <strong>A</strong>
                                            <span>{t("dashboard.originRequired")}</span>
                                        </span>
                                        <span className="route-start-item">
                                            <strong>B</strong>
                                            <span>{t("dashboard.destinationOptional")}</span>
                                        </span>
                                        <span className="route-start-item">
                                            <strong>C</strong>
                                            <span>{t("dashboard.alternateOptional")}</span>
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {base && (
                            <>
                                <div className="dashboard-section-head">
                                    <div>
                                        <span className="dashboard-section-kicker">{t("dashboard.wxKicker")}</span>
                                        <h2 className="dashboard-section-title">{t("dashboard.wxTitle")}</h2>
                                    </div>
                                </div>

                                <div className="dashboard-support-grid">
                                    <div className="dashboard-side-stack">
                                        <div className="dashboard-summary-grid">
                                            <SummaryCard
                                                counts={counts}
                                                loading={loading}
                                                onRefresh={() =>
                                                    handleBrief(base.origin?.icao || "", base.dest?.icao || "", base.alternate?.icao || "", {
                                                        plan: base.plan || plannerSeed || null,
                                                    })
                                                }
                                            />

                                            <StationsCard data={base} selectedIcao={selectedIcao} onSelect={(icao) => openDetails(icao)} />
                                        </div>

                                        <div className="dashboard-weather-grid">
                                            <WxSquareCard
                                                label={base.mode === "single" ? t("dashboard.originLabelFull") : t("dashboard.originRouteLabel")}
                                                station={base.origin}
                                                showFav={!!user}
                                                isFav={isFavorite(base.origin?.icao)}
                                                onToggleFav={toggleFavorite}
                                            />

                                            {base.dest && (
                                                <WxSquareCard
                                                    label="B · DESTINO"
                                                    station={base.dest}
                                                    showFav={!!user}
                                                    isFav={isFavorite(base.dest?.icao)}
                                                    onToggleFav={toggleFavorite}
                                                />
                                            )}

                                            {base.alternate && (
                                                <WxSquareCard
                                                    label="C · ALTERNATIVA"
                                                    station={base.alternate}
                                                    showFav={!!user}
                                                    isFav={isFavorite(base.alternate?.icao)}
                                                    onToggleFav={toggleFavorite}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {selectedStation ? (
                                    <div ref={detailRef} className="dashboard-detail-shell">
                                        <button className="secondary detail-back" onClick={closeDetails} type="button">
                                            Fechar detalhes
                                        </button>

                                        <StationDetailsCard
                                            station={selectedStation}
                                            airportInfo={airportInfoLoading ? { name: "Carregando...", runwaysText: "—", elevationFt: null } : airportInfo}
                                        />
                                    </div>
                                ) : null}

                                <div className="dashboard-section-head">
                                    <div>
                                        <span className="dashboard-section-kicker">Planejamento operacional</span>
                                        <h2 className="dashboard-section-title">{t("dashboard.plannerSectionTitle")}</h2>
                                    </div>
                                </div>

                                <div className="dashboard-planner-shell">
                                    <FlightPlanStack
                                        base={base}
                                        plan={base.plan || plannerSeed}
                                        onPlanChange={updatePlan}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <AppFooter />
            </div>
        </div>
    );
}