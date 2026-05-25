import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import Card from "../components/Card";
import { fetchMetar, fetchTaf } from "../services/weatherService";
import { fetchAirport } from "../services/airportsService";
import { decodeMetarSummary } from "../utils/metarDecoder";
import { classifyFromMetar } from "../utils/classifyFlightCategory";
import { useI18n } from "../i18n/I18nContext.jsx";

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

    return (
        <div className="main-shell">
            <AppHeader title={t("weather.title")} subtitle={t("weather.subtitle")} />
            <main className="main-scroll">
                <section className="public-tool-hero">
                    <h1>{t("weather.heroTitle")}</h1>
                    <p>{t("weather.heroCopy")}</p>
                </section>

                <Card title={t("weather.searchTitle")}>
                    <form
                        className="public-tool-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            loadWeather(icao);
                        }}
                    >
                        <label>
                            ICAO
                            <input value={icao} onChange={(e) => setIcao(e.target.value.toUpperCase().slice(0, 4))} maxLength={4} placeholder="SBGR" />
                        </label>
                        <button className="primary" type="submit" disabled={loading}>
                            {loading ? t("common.loading") : t("weather.searchButton")}
                        </button>
                    </form>
                    {error ? <div className="form-error">{error}</div> : null}
                </Card>

                {metar || taf ? (
                    <>
                        <Card title={t("weather.decoderTitle")}>
                            <div className="weather-decoder-grid">
                                <div>
                                    <span className="chip">{category}</span>
                                    <p>{summary.categoryLabel}</p>
                                </div>
                                <ul>
                                    {summary.hints.map((hint) => (
                                        <li key={hint}>{hint}</li>
                                    ))}
                                </ul>
                            </div>
                        </Card>
                        <div className="public-tool-grid">
                            <Card title={`METAR · ${icao}`}>
                                <pre className="wx-raw">{metar || t("weather.metarUnavailable")}</pre>
                            </Card>
                            <Card title={`TAF · ${icao}`}>
                                <pre className="wx-raw">{taf || t("weather.tafUnavailable")}</pre>
                            </Card>
                        </div>
                        {airport ? (
                            <Card title={t("weather.airportTitle")}>
                                <p>
                                    <strong>{airport.name || icao}</strong>
                                    {airport.city ? ` · ${airport.city}` : ""}
                                </p>
                            </Card>
                        ) : null}
                    </>
                ) : null}

                <div className="public-tool-cta">
                    <button type="button" className="secondary" onClick={() => nav("/quiz")}>
                        {t("hub.quizTitle")}
                    </button>
                    <button type="button" className="primary" onClick={() => nav("/#simulados")}>
                        {t("dashboard.openExams")}
                    </button>
                </div>
            </main>
            <AppFooter />
        </div>
    );
}
