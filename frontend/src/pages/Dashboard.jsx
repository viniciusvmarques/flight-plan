import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Card from "../components/Card";
import DashboardBriefingWorkspace from "../components/DashboardBriefingWorkspace";
import FlightPlanStack from "../components/FlightPlanStack";

import { api } from "../services/apiClient";
import { fetchAirport } from "../services/airportsService";
import { fetchAircraftPresets, fetchAircraftProfiles } from "../services/aircraftService";
import { classifyFromMetar } from "../utils/classifyFlightCategory";
import { haversineNm } from "../utils/distance";
import {
    applyAircraftSelectionToPlan,
    buildPlannerSnapshot,
    calculatePlanner,
    resolveAircraftSelection,
} from "../utils/plannerEngine";
import { buildBriefingDocumentModel, briefingFileName } from "../utils/briefingDocument";
import { downloadBriefingPdf } from "../utils/briefingPdf";
import { openBriefingPrintWindow } from "../utils/briefingPrint";

import { useAuth } from "../auth/AuthContext";
import AviationShell from "../components/AviationShell";
import OpsRoutePanel from "../components/OpsRoutePanel";
import HomeHub from "../components/HomeHub";
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

export default function Dashboard() {
    const { user } = useAuth();
    const nav = useNavigate();
    const location = useLocation();
    const { toast } = useNotify();
    const { t, locale } = useI18n();
    const briefingRef = useRef(null);
    const simuladosRef = useRef(null);

    useEffect(() => {
        const hash = (location.hash || "").replace(/^#/, "");
        if (hash !== "simulados") return;
        const timer = window.setTimeout(() => {
            (simuladosRef.current || document.getElementById("simulados"))?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 80);
        return () => window.clearTimeout(timer);
    }, [location.pathname, location.hash]);

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

    function requireProForExport() {
        if (!base?.origin?.icao) {
            toast(t("dashboard.saveOriginRequired"), {
                variant: "warning",
                title: t("dashboard.saveOriginRequiredTitle"),
            });
            return false;
        }
        if (!user) {
            toast(t("dashboard.loginRequired"), { variant: "info", title: t("dashboard.loginRequiredTitle") });
            nav("/login");
            return false;
        }
        const plan = String(user?.plan || "FREE").toUpperCase();
        if (plan !== "PRO") {
            toast(t("dashboard.proRequired"), {
                variant: "warning",
                title: t("dashboard.proRequiredTitle"),
            });
            nav("/assinatura");
            return false;
        }
        return true;
    }

    function exportLabels() {
        return {
            generated: t("dashboard.exportGeneratedLabel"),
            header: t("dashboard.exportHeaderLabel"),
            nav: t("dashboard.exportNavLabel"),
            navLog: t("dashboard.exportNavLogLabel"),
            fuel: t("dashboard.exportFuelLabel"),
            notes: t("dashboard.exportNotesLabel"),
            weather: t("dashboard.exportWeatherLabel"),
            warnings: t("dashboard.exportWarningsLabel"),
            stripTitle: t("dashboard.exportStripTitle"),
            print: t("dashboard.exportPrintAction"),
            close: t("dashboard.exportCloseAction"),
        };
    }

    function buildExportModel() {
        return buildBriefingDocumentModel({
            base,
            planner: plannerSummary,
            locale,
            brand: "MARQUISA",
        });
    }

    function handleSavePdf() {
        if (!requireProForExport()) return;
        try {
            const model = buildExportModel();
            downloadBriefingPdf(model, briefingFileName(model), exportLabels());
            toast(t("dashboard.exportPdfOk"), {
                variant: "success",
                title: t("dashboard.exportPdfOkTitle"),
            });
        } catch (e) {
            toast(e?.message || t("dashboard.exportPdfError"), {
                variant: "error",
                title: t("dashboard.exportPdfErrorTitle"),
            });
        }
    }

    function handlePrintStrip() {
        if (!requireProForExport()) return;
        try {
            openBriefingPrintWindow(buildExportModel(), exportLabels());
        } catch (e) {
            if (String(e?.message || e) === "POPUP_BLOCKED") {
                toast(t("dashboard.printPopupBlocked"), {
                    variant: "warning",
                    title: t("dashboard.printPopupBlockedTitle"),
                });
                return;
            }
            toast(e?.message || t("dashboard.exportPdfError"), {
                variant: "error",
                title: t("dashboard.exportPdfErrorTitle"),
            });
        }
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

    async function handleBrief(origin, dest, alt, requestOptions = {}) {
        if (!user) {
            nav("/register");
            return;
        }
        const o = (origin || "").toUpperCase().trim();
        const d = (dest || "").toUpperCase().trim();
        const a = (alt || "").toUpperCase().trim();
        const isRefresh = requestOptions?.refresh === true;

        setLoading(true);
        setError("");
        if (!isRefresh) {
            setData(null);
            setSelectedIcao("");
            setAirportInfo(null);
            setAirportInfoLoading(false);
        }

        try {
            if (!isValidIcao(o)) throw new Error(t("dashboard.invalidOrigin"));
            if (d && !isValidIcao(d)) throw new Error(t("dashboard.invalidDestination"));
            if (a && !isValidIcao(a)) throw new Error(t("dashboard.invalidAlternate"));

            const generated = await api("/api/briefing/generate", {
                method: "POST",
                auth: true,
                body: { origin: o, dest: d, alternate: a },
            });

            const results = [generated.origin];
            if (d) results.push(generated.dest);
            if (a) results.push(generated.alternate);

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
            if (isRefresh) {
                toast(t("dashboard.refreshBriefingDone"), { variant: "success", title: t("dashboard.refreshBriefing") });
            } else {
                toast(d ? t("dashboard.briefingGeneratedRoute", { origin: o, dest: d }) : t("dashboard.briefingGeneratedSingle", { origin: o }), {
                    variant: "success",
                    title: t("dashboard.briefingGeneratedTitle"),
                });
                window.requestAnimationFrame(() => {
                    briefingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                });
            }
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

    function refreshBriefing() {
        const origin = base?.origin?.icao;
        if (!origin || loading) return;
        handleBrief(origin, base?.dest?.icao || "", base?.alternate?.icao || "", {
            plan: base?.plan || plannerSeed || null,
            refresh: true,
        });
    }

    async function openDetails(icao) {
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

    const markers = useMemo(() => {
        if (!base) return [];
        const list = [];
        const push = (station, role) => {
            if (!station?.icao || !hasCoordinates(station.airport)) return;
            const category = classifyFromMetar(station.metar);
            list.push({
                icao: station.icao,
                lat: station.airport.latitude,
                lon: station.airport.longitude,
                role,
                category,
                label: `${station.icao} · ${category}`,
            });
        };
        push(base.origin, "origin");
        if (base.dest) push(base.dest, "dest");
        if (base.alternate) push(base.alternate, "alternate");
        return list;
    }, [base]);

    return (
        <AviationShell
            wide
            kicker="OPS"
            title={t("appHeader.briefing")}
            subtitle={t("sidebar.caption")}
        >
            <div className="ck-dash-stack">
                <OpsRoutePanel
                    onBrief={handleBrief}
                    onClear={() => {
                        setData(null);
                        setLastData(null);
                        setSelectedIcao("");
                        setError("");
                        setAirportInfo(null);
                        try {
                            localStorage.removeItem("fp_last_briefing");
                        } catch {
                            /* ignore */
                        }
                    }}
                    loading={loading}
                />

                {loading && <Card title={t("common.loading")}>{t("dashboard.loadingBrief")}</Card>}
                {error && <Card title={t("common.error")}>{error}</Card>}

                {!base && !loading && !error && (
                    <section className="ck-empty-brief card fp-card" aria-label={t("dashboard.startTitle")}>
                        <div className="ck-empty-brief-inner">
                            <span className="av-kicker exam-kicker">{t("dashboard.startTitle")}</span>
                            <h2 className="ck-empty-brief-title">{t("dashboard.startSentence")}</h2>
                            <p className="ck-empty-brief-copy">{t("dashboard.sidebarHint")}</p>
                            <div className="ck-empty-brief-steps">
                                <span><em>A</em> {t("common.origin")}</span>
                                <span><em>B</em> {t("common.destination")}</span>
                                <span><em>C</em> {t("common.alternate")}</span>
                            </div>
                        </div>
                    </section>
                )}

                {base ? (
                    <>
                        <div ref={briefingRef} id="briefing-workspace" className="dashboard-briefing-anchor">
                            <DashboardBriefingWorkspace
                                base={base}
                                counts={counts}
                                loading={loading}
                                user={user}
                                selectedIcao={selectedIcao}
                                selectedStation={selectedStation}
                                airportInfo={airportInfo}
                                airportInfoLoading={airportInfoLoading}
                                markers={markers}
                                plannerSummary={plannerSummary}
                                onSelectStation={openDetails}
                                onCloseDetails={closeDetails}
                                onRefresh={refreshBriefing}
                                onSave={saveBriefing}
                                onSavePdf={handleSavePdf}
                                onPrint={handlePrintStrip}
                                onToggleFav={toggleFavorite}
                                isFavorite={isFavorite}
                                t={t}
                                locale={locale}
                            />
                        </div>

                        <section className="dashboard-planner-section" aria-labelledby="dashboard-planner-heading">
                            <div className="dashboard-section-head">
                                <div>
                                    <span className="dashboard-section-kicker">{t("dashboard.plannerKicker")}</span>
                                    <h2 id="dashboard-planner-heading" className="dashboard-section-title">
                                        {t("dashboard.plannerSectionTitle")}
                                    </h2>
                                </div>
                            </div>
                            <div className="dashboard-planner-shell">
                                <FlightPlanStack base={base} plan={base.plan || plannerSeed} onPlanChange={updatePlan} user={user} />
                            </div>
                        </section>
                    </>
                ) : null}

                <HomeHub />

                <section id="simulados" ref={simuladosRef} className="dashboard-anchor-section">
                    <Card title={t("dashboard.examsTitle")}>
                        <div className="dashboard-sim-card">
                            <div>
                                <strong>{t("dashboard.examsLead")}</strong>
                                <p>{t("dashboard.examsCopy")}</p>
                            </div>
                            <button className="primary" type="button" onClick={() => nav(user ? "/simulados" : "/register")}>
                                {user ? t("dashboard.openExams") : t("dashboard.createFreeAccount")}
                            </button>
                        </div>
                    </Card>
                </section>
            </div>
        </AviationShell>
    );
}