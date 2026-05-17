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

function friendlyWeatherError(kind, value) {
    const fallback = `${kind} não disponível para este aeródromo no momento.`;
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
    const detailRef = useRef(null);

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
            toast("Defina o ICAO de origem na coluna à esquerda e gere o briefing antes de salvar.", {
                variant: "warning",
                title: "Origem obrigatória",
            });
            return;
        }
        if (!user) {
            toast("Entre na sua conta para guardar briefings na nuvem.", { variant: "info", title: "Login necessário" });
            nav("/login");
            return;
        }

        const plan = String(user?.plan || "FREE").toUpperCase();
        if (plan !== "PRO") {
            toast("Briefings salvos e favoritos ilimitados fazem parte do plano PRO.", {
                variant: "warning",
                title: "Plano PRO",
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
                toast("Seu briefing e os dados do plano de voo foram salvos.", {
                    variant: "success",
                    title: "Salvo",
                })
            )
            .catch((e) =>
                toast(e?.message || "Não foi possível salvar. Tente novamente.", {
                    variant: "error",
                    title: "Erro ao salvar",
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
            metarError: metarRes.status === "rejected" ? friendlyWeatherError("METAR", metarRes.reason?.message) : null,
            tafError: tafRes.status === "rejected" ? friendlyWeatherError("TAF", tafRes.reason?.message) : null,
            airport: airportRes.status === "fulfilled" ? airportRes.value : null,
            airportError: airportRes.status === "rejected" ? airportRes.reason?.message || "Falha ao buscar aeródromo" : null,
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
            if (!isValidIcao(o)) throw new Error("Origem: ICAO inválido");
            if (d && !isValidIcao(d)) throw new Error("Destino: ICAO inválido");
            if (a && !isValidIcao(a)) throw new Error("Alternativa: ICAO inválido");

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
            toast(d ? `Briefing ${o} → ${d} gerado com sucesso.` : `Briefing ${o} gerado com sucesso.`, {
                variant: "success",
                title: "Briefing gerado",
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
            setAirportInfo({ error: e?.message || "Falha ao carregar dados do aeródromo" });
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
        ? "METAR, TAF e dados do aeródromo no mesmo fluxo operacional"
        : "Meteorologia, estações e planejamento operacional em um único painel";

    const routeHeadline = base?.dest?.icao
        ? `${base.origin?.icao || "A"} → ${base.dest.icao}`
        : base?.origin?.icao || "Aguardando rota";

    const activeFocusLabel = selectedStation
        ? `${selectedStation.icao} em foco`
        : "Selecione uma estação para abrir detalhes";

    return (
        <div className="app">
            <Sidebar onBrief={handleBrief} />

            <div className="main-shell">
                <AppHeader kicker="Operações" title="Briefing operacional" subtitle={headerSubtitle} />

                <div className="main-scroll">
                    <div className="page-shell">
                        <section className="page-hero page-hero--dashboard">
                            <div className="page-hero-head">
                                <div className="page-hero-copy">
                                    <span className="page-eyebrow">Painel operacional</span>
                                    <h1 className="page-title">Meteorologia e planejamento do voo</h1>
                                    <p className="page-caption">
                                        Consulte as estações monitoradas, leia os boletins e ajuste o plano do voo com uma estrutura mais objetiva.
                                    </p>
                                </div>
                                {user ? (
                                    <div className="page-actions">
                                        <button className="secondary" type="button" onClick={saveBriefing}>
                                            Salvar briefing
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                            <div className="dashboard-route-strip">
                                <div className="dashboard-route-pill">
                                    <span className="dashboard-route-code">A</span>
                                    <div className="dashboard-route-meta">
                                        <span className="dashboard-route-label">Origem</span>
                                        <strong className="dashboard-route-value">{base?.origin?.icao || "Pendente"}</strong>
                                    </div>
                                </div>
                                <div className="dashboard-route-pill">
                                    <span className="dashboard-route-code">B</span>
                                    <div className="dashboard-route-meta">
                                        <span className="dashboard-route-label">Destino</span>
                                        <strong className="dashboard-route-value">{base?.dest?.icao || "Opcional"}</strong>
                                    </div>
                                </div>
                                <div className="dashboard-route-pill">
                                    <span className="dashboard-route-code">C</span>
                                    <div className="dashboard-route-meta">
                                        <span className="dashboard-route-label">Alternativa</span>
                                        <strong className="dashboard-route-value">{base?.alternate?.icao || "Opcional"}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-meta-strip">
                                <span className="chip ok">{user ? `Conta ${String(user.plan || "FREE").toUpperCase()}` : "Modo visitante"}</span>
                            </div>
                        </section>

                        {base ? (
                            <section className="dashboard-overview-grid">
                                <article className="dashboard-overview-card">
                                    <span className="dashboard-overview-label">Rota ativa</span>
                                    <strong className="dashboard-overview-value">{routeHeadline}</strong>
                                    <span className="dashboard-overview-copy">
                                        {base?.alternate?.icao ? `Alternativa prevista: ${base.alternate.icao}` : "Sem alternativa definida"}
                                    </span>
                                </article>

                                <article className="dashboard-overview-card">
                                    <span className="dashboard-overview-label">Planejamento</span>
                                    <strong className="dashboard-overview-value">
                                        {base?.plan?.cruiseAltFt || base?.plan?.defaultCruiseAltFt
                                            ? `Cruzeiro ${base.plan?.cruiseAltFt || base.plan?.defaultCruiseAltFt} ft`
                                            : "Parâmetros livres"}
                                    </strong>
                                    <span className="dashboard-overview-copy">
                                        {base?.plan?.reserveRule
                                            ? `Reserva ${base.plan.reserveRule}`
                                            : "Ajuste reserva, callsign e combustível livremente no planner"}
                                    </span>
                                </article>

                                <article className="dashboard-overview-card">
                                    <span className="dashboard-overview-label">Combustível</span>
                                    <strong className="dashboard-overview-value">
                                        {plannerSummary ? `${plannerSummary.totalFuelL.toFixed(1)} L` : "—"}
                                    </strong>
                                    <span className="dashboard-overview-copy">
                                        {plannerSummary
                                            ? `Trip ${plannerSummary.tripFuelL.toFixed(1)} L · margem ${plannerSummary.fuelMarginL.toFixed(1)} L`
                                            : "Resumo aparece após gerar o briefing"}
                                    </span>
                                </article>

                                <article className="dashboard-overview-card">
                                    <span className="dashboard-overview-label">Foco atual</span>
                                    <strong className="dashboard-overview-value">{activeFocusLabel}</strong>
                                    <span className="dashboard-overview-copy">
                                        {selectedStation ? "Detalhes do aeródromo abertos ao lado da meteorologia." : "Use a lista de estações para abrir o painel do aeródromo."}
                                    </span>
                                </article>
                            </section>
                        ) : null}

                        {loading && <Card title="Carregando">Buscando METAR, TAF e dados operacionais...</Card>}
                        {error && <Card title="Erro">{error}</Card>}

                        {!base && !loading && !error && (
                            <Card title="Comece por aqui">
                                <div className="empty-note">
                                    Preencha <strong>A origem</strong> e gere o briefing. B destino e C alternativa continuam opcionais.
                                </div>
                            </Card>
                        )}

                        {base && (
                            <>
                                <div className="dashboard-section-head">
                                    <div>
                                        <span className="dashboard-section-kicker">Meteorologia e estações</span>
                                        <h2 className="dashboard-section-title">Resumo rápido, sequência monitorada e leitura dos boletins</h2>
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
                                                label={base.mode === "single" ? "A · AERÓDROMO" : "A · ORIGEM"}
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
                                        <h2 className="dashboard-section-title">Combustível, tempo, reserva e parâmetros do voo</h2>
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