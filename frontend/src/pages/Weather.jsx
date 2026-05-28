import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import GrowthCtaBar from "../components/GrowthCtaBar";
import {
    BulletinPanel,
    ExperienceCommandBar,
    ExperienceHero,
    WxCategoryPanel,
} from "../components/experience/ExperienceUI";
import { fetchMetar, fetchTaf } from "../services/weatherService";
import { fetchAirport } from "../services/airportsService";
import { decodeMetarSummary } from "../utils/metarDecoder";
import { classifyFromMetar } from "../utils/classifyFlightCategory";
import { useI18n } from "../i18n/I18nContext.jsx";
import { useNotify } from "../ui/NotifyContext.jsx";

const QUICK_ICAO = ["SBGR", "SBRJ", "SBSP", "KJFK", "EGLL"];

export default function Weather() {
    const nav = useNavigate();
    const [params, setParams] = useSearchParams();
    const { t, locale } = useI18n();
    const { toast } = useNotify();
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
        <div className="main-shell">
            <AppHeader compact />
            <main className="main-scroll growth-page experience-surface">
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
                        <button className="primary growth-search-submit" type="submit" disabled={loading}>
                            {loading ? t("common.loading") : t("weather.searchButton")}
                        </button>
                    </form>
                </ExperienceCommandBar>

                {hasData ? (
                    <div className="xp-weather-results">
                        <WxCategoryPanel category={category} categoryLabel={summary.categoryLabel} hints={summary.hints} />

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
                                <strong>{airport.name || icao}</strong>
                                {airport.city ? <span>· {airport.city}</span> : null}
                                {airport.elevationFt != null ? <span className="chip muted">{airport.elevationFt} ft</span> : null}
                            </div>
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
