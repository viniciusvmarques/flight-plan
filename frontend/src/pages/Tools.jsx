import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import Card from "../components/Card";
import { useI18n } from "../i18n/I18nContext.jsx";

function toNumber(value, fallback = 0) {
    const n = Number.parseFloat(String(value).replace(",", "."));
    return Number.isFinite(n) ? n : fallback;
}

export default function Tools() {
    const nav = useNavigate();
    const { t } = useI18n();

    const [windDir, setWindDir] = useState("270");
    const [windSpeed, setWindSpeed] = useState("12");
    const [runway, setRunway] = useState("09");
    const [gust, setGust] = useState("0");

    const [liters, setLiters] = useState("100");
    const [density, setDensity] = useState("0.72");

    const crosswind = useMemo(() => {
        const rwy = (toNumber(runway) * 10) % 360;
        const wdir = toNumber(windDir) % 360;
        const wspd = toNumber(windSpeed);
        const angle = Math.abs(((wdir - rwy + 540) % 360) - 180);
        const rad = (angle * Math.PI) / 180;
        const xw = Math.abs(Math.sin(rad) * wspd);
        const head = Math.cos(rad) * wspd;
        return { xw: xw.toFixed(1), head: head.toFixed(1), angle: angle.toFixed(0) };
    }, [windDir, windSpeed, runway]);

    const fuel = useMemo(() => {
        const l = toNumber(liters);
        const d = toNumber(density, 0.72);
        const lb = l * d * 2.20462;
        const usGal = l * 0.264172;
        return { lb: lb.toFixed(1), usGal: usGal.toFixed(2) };
    }, [liters, density]);

    return (
        <div className="main-shell">
            <AppHeader title={t("tools.title")} subtitle={t("tools.subtitle")} />
            <main className="main-scroll">
                <section className="public-tool-hero">
                    <h1>{t("tools.heroTitle")}</h1>
                    <p>{t("tools.heroCopy")}</p>
                </section>

                <div className="public-tool-grid">
                    <Card title={t("tools.crosswindTitle")}>
                        <div className="tools-form-grid">
                            <label>
                                {t("tools.windDir")}
                                <input value={windDir} onChange={(e) => setWindDir(e.target.value)} />
                            </label>
                            <label>
                                {t("tools.windSpeed")}
                                <input value={windSpeed} onChange={(e) => setWindSpeed(e.target.value)} />
                            </label>
                            <label>
                                {t("tools.runway")}
                                <input value={runway} onChange={(e) => setRunway(e.target.value)} />
                            </label>
                            <label>
                                {t("tools.gust")}
                                <input value={gust} onChange={(e) => setGust(e.target.value)} />
                            </label>
                        </div>
                        <div className="tools-result">
                            <strong>{t("tools.crosswindResult", { value: crosswind.xw })}</strong>
                            <p>{t("tools.headwindResult", { value: crosswind.head })}</p>
                            <small>{t("tools.angleResult", { value: crosswind.angle })}</small>
                        </div>
                    </Card>

                    <Card title={t("tools.fuelTitle")}>
                        <div className="tools-form-grid">
                            <label>
                                {t("tools.liters")}
                                <input value={liters} onChange={(e) => setLiters(e.target.value)} />
                            </label>
                            <label>
                                {t("tools.density")}
                                <input value={density} onChange={(e) => setDensity(e.target.value)} />
                            </label>
                        </div>
                        <div className="tools-result">
                            <strong>{t("tools.fuelLb", { value: fuel.lb })}</strong>
                            <p>{t("tools.fuelGal", { value: fuel.usGal })}</p>
                        </div>
                    </Card>
                </div>

                <div className="public-tool-cta">
                    <button type="button" className="secondary" onClick={() => nav("/weather")}>
                        {t("hub.weatherTitle")}
                    </button>
                    <button type="button" className="primary" onClick={() => nav("/quiz")}>
                        {t("hub.quizTitle")}
                    </button>
                </div>
            </main>
            <AppFooter />
        </div>
    );
}
