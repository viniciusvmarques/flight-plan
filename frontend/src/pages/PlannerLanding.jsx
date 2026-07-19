import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AviationShell from "../components/AviationShell";
import Card from "../components/Card";
import GrowthCtaBar from "../components/GrowthCtaBar";
import { useI18n } from "../i18n/I18nContext.jsx";
import { fetchStationWeather } from "../services/weatherService";
import { decodeMetarSummary } from "../utils/metarDecoder";
import { classifyFromMetar } from "../utils/classifyFlightCategory";

const QUICK = ["SBGR", "SBRJ", "SBSP", "SBGL", "SBCF"];

function categoryTone(cat) {
    const c = String(cat || "").toUpperCase();
    if (c === "VFR") return "vfr";
    if (c === "MVFR") return "mvfr";
    if (c === "IFR" || c === "LIFR") return "ifr";
    return "nodata";
}

function categoryPlain(cat, t) {
    const c = String(cat || "").toUpperCase();
    if (c === "VFR") return t("plannerWx.vfrPlain");
    if (c === "MVFR") return t("plannerWx.mvfrPlain");
    if (c === "IFR" || c === "LIFR") return t("plannerWx.ifrPlain");
    return t("plannerWx.nodataPlain");
}

function scrollToResultOnMobile(node) {
    if (!node || typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 900px)").matches) return;
    window.requestAnimationFrame(() => {
        node.scrollIntoView({ behavior: "smooth", block: "start" });
    });
}

export default function PlannerLanding() {
    const nav = useNavigate();
    const { t, locale } = useI18n();
    const resultRef = useRef(null);
    const [icao, setIcao] = useState("SBGR");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [metar, setMetar] = useState("");
    const [taf, setTaf] = useState("");
    const [airportName, setAirportName] = useState("");

    async function load(code, { scroll = true } = {}) {
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
            setAirportName(station.airport?.name || station.airport?.city || clean);
            if (scroll) {
                window.setTimeout(() => scrollToResultOnMobile(resultRef.current), 80);
            }
        } catch (e) {
            setMetar("");
            setTaf("");
            setAirportName("");
            setError(e?.message || t("weather.loadError"));
        } finally {
            setLoading(false);
        }
    }

    function resetSearch() {
        setIcao("");
        setMetar("");
        setTaf("");
        setAirportName("");
        setError("");
        setLoading(false);
    }

    useEffect(() => {
        load("SBGR", { scroll: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const category = classifyFromMetar(metar);
    const summary = decodeMetarSummary(metar, locale);
    const tone = categoryTone(category);

    return (
        <AviationShell>
            <section className="ck-landing-hero">
                <Card>
                    <span className="av-kicker exam-kicker">{t("plannerGate.kicker")}</span>
                    <h1 className="page-title" style={{ marginTop: 8 }}>
                        {t("plannerGate.homeTitle")}
                    </h1>
                    <p className="page-caption" style={{ maxWidth: "46ch" }}>
                        {t("plannerGate.homeCopy")}
                    </p>

                    <form
                        className="ck-wx-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            load(icao);
                        }}
                    >
                        <label className="ck-wx-field">
                            <span>{t("plannerWx.icaoLabel")}</span>
                            <input
                                value={icao}
                                onChange={(e) => setIcao(e.target.value.toUpperCase().slice(0, 4))}
                                maxLength={4}
                                placeholder="SBGR"
                                autoComplete="off"
                                spellCheck={false}
                                aria-label="ICAO"
                            />
                        </label>
                        <div className="ck-wx-form-actions">
                            <button type="submit" className="primary" disabled={loading}>
                                {loading ? t("common.loading") : t("plannerWx.consult")}
                            </button>
                            <button type="button" className="secondary" onClick={resetSearch} disabled={loading}>
                                {t("weather.resetSearch")}
                            </button>
                        </div>
                    </form>

                    <div className="ck-wx-quick">
                        {QUICK.map((code) => (
                            <button
                                key={code}
                                type="button"
                                className={`ck-wx-chip${icao === code ? " is-active" : ""}`}
                                onClick={() => load(code)}
                            >
                                {code}
                            </button>
                        ))}
                    </div>

                    {error ? <div className="form-error" style={{ marginTop: 12 }}>{error}</div> : null}

                    <div className="ck-wx-actions">
                        <button type="button" className="secondary" onClick={() => nav("/weather")}>
                            {t("plannerWx.openFull")}
                        </button>
                        <button type="button" className="primary" onClick={() => nav("/register")}>
                            {t("plannerGate.ctaRegister")}
                        </button>
                    </div>
                </Card>

                <Card className={`ck-wx-panel ck-wx-panel--${tone}`}>
                    <div ref={resultRef} id="wx-result" className="ck-wx-result-anchor" tabIndex={-1}>
                    <div className="ck-wx-panel-head">
                        <div>
                            <span className="ck-wx-station">{airportName || icao || "—"}</span>
                            <strong className="ck-wx-icao">{icao || "----"}</strong>
                        </div>
                        <div className={`ck-wx-cat ck-wx-cat--${tone}`} aria-live="polite">
                            <span className="ck-wx-cat-code">{category === "NO_DATA" || category === "UNKNOWN" ? "—" : category}</span>
                            <span className="ck-wx-cat-plain">{categoryPlain(category, t)}</span>
                        </div>
                    </div>

                    <p className="ck-wx-readout">{summary.categoryLabel}</p>

                    {summary.hints?.length ? (
                        <ul className="ck-wx-hints">
                            {summary.hints.map((hint) => (
                                <li key={hint}>{hint}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="ck-wx-empty">{loading ? t("common.loading") : t("plannerWx.waitHint")}</p>
                    )}

                    <div className="ck-wx-bulletin">
                        <div className="ck-wx-bulletin-label">METAR</div>
                        <pre>{metar || t("weather.metarUnavailable")}</pre>
                    </div>
                    <div className="ck-wx-bulletin">
                        <div className="ck-wx-bulletin-label">TAF</div>
                        <pre>{taf || t("weather.tafUnavailable")}</pre>
                    </div>
                    </div>
                </Card>
            </section>

            <Card title={t("plannerGate.accountTitle")}>
                <p className="growth-section-lead">{t("plannerGate.accountCopy")}</p>
                <div className="av-feature-grid" style={{ marginTop: 14 }}>
                    <button type="button" className="av-feature-card av-feature-card--free" onClick={() => nav("/weather")}>
                        <strong>{t("weather.nav")}</strong>
                        <span>{t("plannerGate.metarHint")}</span>
                    </button>
                    <button type="button" className="av-feature-card av-feature-card--lock" onClick={() => nav("/register")}>
                        <strong>{t("appHeader.briefing")}</strong>
                        <span>{t("plannerGate.lockBriefing")}</span>
                    </button>
                    <button type="button" className="av-feature-card av-feature-card--lock" onClick={() => nav("/register?next=/tools")}>
                        <strong>{t("appHeader.tools")}</strong>
                        <span>{t("plannerGate.lockTools")}</span>
                    </button>
                    <button
                        type="button"
                        className="av-feature-card av-feature-card--lock"
                        onClick={() => nav("/register?next=/computador")}
                    >
                        <strong>{t("flightComputer.nav")}</strong>
                        <span>{t("plannerGate.lockComputer")}</span>
                    </button>
                    <button type="button" className="av-feature-card av-feature-card--lock" onClick={() => nav("/register?next=/quiz")}>
                        <strong>{t("quiz.nav")}</strong>
                        <span>{t("plannerGate.lockQuiz")}</span>
                    </button>
                    <button
                        type="button"
                        className="av-feature-card av-feature-card--lock"
                        onClick={() => nav("/register?next=/simulados")}
                    >
                        <strong>{t("exams.nav")}</strong>
                        <span>{t("plannerGate.lockExams")}</span>
                    </button>
                </div>
            </Card>

            <div className="av-lock-banner">
                <p>{t("plannerGate.bannerCopy")}</p>
                <button type="button" className="primary" style={{ width: "auto", marginTop: 0 }} onClick={() => nav("/register")}>
                    {t("plannerGate.ctaRegister")}
                </button>
            </div>

            <GrowthCtaBar
                secondaryLabel={t("common.login")}
                primaryLabel={t("plannerGate.ctaRegister")}
                onSecondary={() => nav("/login?next=/")}
                onPrimary={() => nav("/register")}
            />
        </AviationShell>
    );
}
