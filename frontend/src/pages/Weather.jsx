import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import Card from "../components/Card";
import GrowthPageHero from "../components/GrowthPageHero";
import GrowthCtaBar from "../components/GrowthCtaBar";
import { fetchMetar, fetchTaf } from "../services/weatherService";
import { fetchAirport } from "../services/airportsService";
import { decodeMetarSummary } from "../utils/metarDecoder";
import { classifyFromMetar } from "../utils/classifyFlightCategory";
import { flightCategoryChipClass } from "../utils/flightCategoryChip";
import { useI18n } from "../i18n/I18nContext.jsx";

const QUICK_ICAO = ["SBGR", "SBRJ", "SBSP", "KJFK", "EGLL"];

export default function Weather() {
    const nav = useNavigate();
    const [params, setParams] = useSearchParams();
    const { t, locale } = useI18n();
    const [icao, setIcao] = useState((params.get("icao") || "SBGR").toUpperCase());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [metar, setMetar] = useState("");
    const [taf, setTaf] = useState("");
    const [airport, setAirport] = useState(null);

    async function loadWeather(code) {
        const clean = String(code || "").trim().toUpperCase();
        if (clean.length !== 4) {
            setError(t("weather.invalidIcao"));
            return;
        }
        setIcao(clean);
        setLoading(true);
        setError("");
        try {
            const [metarText, tafText, airportData] = await Promise.all([
                fetchMetar(clean).catch(() => ""),
                fetchTaf(clean).catch(() => ""),
                fetchAirport(clean).catch(() => null),
            ]);
            setMetar(metarText || "");
            setTaf(tafText || "");
            setAirport(airportData);
            setParams({ icao: clean });
        } catch (e) {
            setError(e?.message || t("weather.loadError"));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const fromUrl = params.get("icao");
        if (fromUrl && fromUrl.length === 4) {
            setIcao(fromUrl.toUpperCase());
            loadWeather(fromUrl);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const summary = decodeMetarSummary(metar, locale);
    const category = classifyFromMetar(metar);
    const hasData = !!(metar || taf);

    return (
        <div className="main-shell">
            <AppHeader title={t("weather.title")} subtitle={t("weather.subtitle")} />
            <main className="main-scroll growth-page">
                <GrowthPageHero
                    kicker={t("weather.nav")}
                    title={t("weather.heroTitle")}
                    copy={t("weather.heroCopy")}
                    statValue={icao}
                    statLabel={hasData ? "ICAO" : t("weather.searchButton")}
                />

                {error ? <div className="form-error">{error}</div> : null}

                <Card title={t("weather.searchTitle")}>
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
                        <button className="primary growth-search-submit" type="submit" disabled={loading}>
                            {loading ? t("common.loading") : t("weather.searchButton")}
                        </button>
                    </form>
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
                </Card>

                {hasData ? (
                    <div className="growth-stack">
                        <Card title={t("weather.decoderTitle")}>
                            <div className="wx-decoder-panel">
                                <div className="wx-decoder-main">
                                    <span className={flightCategoryChipClass(category)}>{category}</span>
                                    <p>{summary.categoryLabel}</p>
                                </div>
                                {summary.hints.length ? (
                                    <ul className="wx-decoder-hints">
                                        {summary.hints.map((hint) => (
                                            <li key={hint}>{hint}</li>
                                        ))}
                                    </ul>
                                ) : null}
                            </div>
                        </Card>

                        <div className="growth-two-col">
                            <Card title={`METAR · ${icao}`}>
                                <pre className="wx-raw-panel">{metar || t("weather.metarUnavailable")}</pre>
                            </Card>
                            <Card title={`TAF · ${icao}`}>
                                <pre className="wx-raw-panel">{taf || t("weather.tafUnavailable")}</pre>
                            </Card>
                        </div>

                        {airport ? (
                            <Card title={t("weather.airportTitle")}>
                                <p className="wx-airport-line">
                                    <strong>{airport.name || icao}</strong>
                                    {airport.city ? <span> · {airport.city}</span> : null}
                                </p>
                            </Card>
                        ) : null}
                    </div>
                ) : null}

                <GrowthCtaBar
                    secondaryLabel={t("hub.quizTitle")}
                    primaryLabel={t("dashboard.openExams")}
                    onSecondary={() => nav("/quiz")}
                    onPrimary={() => nav("/#simulados")}
                />
            </main>
            <AppFooter />
        </div>
    );
}
