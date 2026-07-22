import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AviationShell from "../components/AviationShell";
import GrowthCtaBar from "../components/GrowthCtaBar";
import {
    BulletinPanel,
    ExperienceCommandBar,
    ExperienceHero,
    ExperiencePageStack,
    WxCategoryPanel,
} from "../components/experience/ExperienceUI";
import { fetchStationWeather } from "../services/weatherService";
import { fetchAirport } from "../services/airportsService";
import { decodeMetarSummary } from "../utils/metarDecoder";
import { classifyFromMetar } from "../utils/classifyFlightCategory";
import RunwaySuggestion from "../components/RunwaySuggestion";
import { useI18n } from "../i18n/I18nContext.jsx";
import { useNotify } from "../ui/NotifyContext.jsx";
import { useAuth } from "../auth/AuthContext";

const QUICK_ICAO = ["SBGR", "SBRJ", "SBSP", "KJFK", "EGLL"];

function scrollToResultOnMobile(node) {
    if (!node || typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 900px)").matches) return;
    window.requestAnimationFrame(() => {
        node.scrollIntoView({ behavior: "smooth", block: "start" });
    });
}

export default function Weather() {
    const nav = useNavigate();
    const [params, setParams] = useSearchParams();
    const { user } = useAuth();
    const { t, locale } = useI18n();
    const { toast } = useNotify();
    const resultRef = useRef(null);
    const pendingScrollRef = useRef(false);
    const [icao, setIcao] = useState((params.get("icao") || "SBGR").toUpperCase());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [metar, setMetar] = useState("");
    const [taf, setTaf] = useState("");
    const [airport, setAirport] = useState(null);

    async function loadWeather(code, { scroll = true } = {}) {
        const clean = String(code || "").trim().toUpperCase();
        if (clean.length !== 4) {
            setError(t("weather.invalidIcao"));
            return;
        }
        setIcao(clean);
        setLoading(true);
        setError("");
        try {
            const station = await fetchStationWeather(clean);
            setMetar(station.metar || "");
            setTaf(station.taf || "");
            setAirport(station.airport || (await fetchAirport(clean).catch(() => null)));
            setParams({ icao: clean });
            pendingScrollRef.current = scroll;
        } catch (e) {
            setError(e?.message || t("weather.loadError"));
            pendingScrollRef.current = false;
        } finally {
            setLoading(false);
        }
    }

    function resetSearch() {
        setIcao("");
        setMetar("");
        setTaf("");
        setAirport(null);
        setError("");
        setLoading(false);
        setParams({});
        pendingScrollRef.current = false;
    }

    useEffect(() => {
        const fromUrl = params.get("icao");
        if (fromUrl && fromUrl.length === 4) {
            setIcao(fromUrl.toUpperCase());
            loadWeather(fromUrl, { scroll: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const summary = decodeMetarSummary(metar, locale);
    const category = classifyFromMetar(metar);
    const hasData = !!(metar || taf);

    useEffect(() => {
        if (!pendingScrollRef.current || !hasData) return;
        pendingScrollRef.current = false;
        window.setTimeout(() => scrollToResultOnMobile(resultRef.current), 60);
    }, [hasData, metar, taf]);

    async function copyText(text) {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            toast(t("weather.copied"), { variant: "success" });
        } catch {
            toast(t("weather.copyFailed"), { variant: "warning" });
        }
    }

    return (
        <AviationShell>
            <ExperiencePageStack>
                <ExperienceHero
                    kicker={t("weather.nav")}
                    title={t("weather.heroTitle")}
                    copy={t("weather.heroCopy")}
                    statValue={icao}
                    statLabel={hasData ? "ICAO" : t("weather.searchButton")}
                    badge={hasData ? category : null}
                />

                {error ? <div className="form-error">{error}</div> : null}

                <ExperienceCommandBar
                    footer={
                        <div className="growth-quick-chips">
                            <span className="growth-quick-label">{t("weather.quickLabel")}</span>
                            {QUICK_ICAO.map((code) => (
                                <button
                                    key={code}
                                    type="button"
                                    className={`growth-quick-chip ${icao === code ? "growth-quick-chip--active" : ""}`}
                                    onClick={() => loadWeather(code)}
                                >
                                    {code}
                                </button>
                            ))}
                        </div>
                    }
                >
                    <form
                        className="growth-search-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            loadWeather(icao);
                        }}
                    >
                        <label className="growth-search-field">
                            <span>ICAO</span>
                            <input
                                className="growth-search-input"
                                value={icao}
                                onChange={(e) => setIcao(e.target.value.toUpperCase().slice(0, 4))}
                                maxLength={4}
                                placeholder="SBGR"
                                autoComplete="off"
                                spellCheck={false}
                            />
                        </label>
                        <div className="growth-search-actions">
                            <button className="primary growth-search-submit" type="submit" disabled={loading}>
                                {loading ? t("common.loading") : t("weather.searchButton")}
                            </button>
                            <button className="secondary growth-search-reset" type="button" onClick={resetSearch}>
                                {t("weather.resetSearch")}
                            </button>
                        </div>
                    </form>
                </ExperienceCommandBar>

                {hasData ? (
                    <div ref={resultRef} id="wx-result" className="xp-weather-results ck-wx-result-anchor" tabIndex={-1}>
                        <WxCategoryPanel
                            category={category}
                            categoryLabel={summary.categoryLabel}
                            hints={summary.hints}
                            icao={icao}
                            airportName={airport?.name || ""}
                            aerodromeLabel={t("weather.aerodromeLabel")}
                            conditionsLabel={t("weather.conditionsLabel")}
                            factsLabel={t("weather.bulletinFactsLabel")}
                        />

                        <div className="xp-bulletin-stack">
                            <BulletinPanel
                                label={`METAR · ${icao}`}
                                text={metar}
                                emptyLabel={t("weather.metarUnavailable")}
                                copyLabel={t("weather.copy")}
                                onCopy={() => copyText(metar)}
                            />
                            <BulletinPanel
                                label={`TAF · ${icao}`}
                                text={taf}
                                emptyLabel={t("weather.tafUnavailable")}
                                copyLabel={t("weather.copy")}
                                onCopy={() => copyText(taf)}
                            />
                        </div>

                        {airport ? (
                            <div className="xp-airport-strip">
                                {airport.city ? <span>{airport.city}</span> : null}
                                {airport.elevationFt != null ? <span className="chip muted">{airport.elevationFt} ft</span> : null}
                            </div>
                        ) : null}

                        {metar ? (
                            <RunwaySuggestion runways={airport?.runways || []} metar={metar} className="ck-rwy-suggest--weather" />
                        ) : null}
                    </div>
                ) : null}

                {!user ? (
                    <div className="av-lock-banner">
                        <p>{t("plannerGate.bannerCopy")}</p>
                        <button type="button" className="primary" style={{ width: "auto", marginTop: 0 }} onClick={() => nav("/register")}>
                            {t("plannerGate.ctaRegister")}
                        </button>
                    </div>
                ) : null}

                <GrowthCtaBar
                    secondaryLabel={user ? t("appHeader.briefing") : t("common.login")}
                    primaryLabel={user ? t("dashboard.openExams") : t("plannerGate.ctaRegister")}
                    onSecondary={() => nav(user ? "/" : "/login?next=/")}
                    onPrimary={() => nav(user ? "/simulados" : "/register")}
                />
            </ExperiencePageStack>
        </AviationShell>
    );
}
