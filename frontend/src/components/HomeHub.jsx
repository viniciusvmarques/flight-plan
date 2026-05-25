import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function HomeHub() {
    const nav = useNavigate();
    const { t } = useI18n();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetch(`${API}/api/public/stats`)
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => setStats(data))
            .catch(() => null);
    }, []);

    return (
        <section className="home-hub">
            <div className="home-hub-intro">
                <span className="home-hub-badge">{t("hub.badge")}</span>
                <h2>{t("hub.title")}</h2>
                <p>{t("hub.subtitle")}</p>
                {stats ? (
                    <div className="home-hub-stats">
                        <span>{t("hub.statAttempts", { count: stats.examAttempts || 0 })}</span>
                        <span>{t("hub.statQuestions", { count: stats.questionsBank || 6000 })}</span>
                    </div>
                ) : null}
            </div>
            <div className="home-hub-grid">
                <button type="button" className="home-hub-card" onClick={() => nav("/weather")}>
                    <strong>{t("hub.weatherTitle")}</strong>
                    <p>{t("hub.weatherCopy")}</p>
                    <em>{t("hub.free")}</em>
                </button>
                <button type="button" className="home-hub-card" onClick={() => nav("/tools")}>
                    <strong>{t("hub.toolsTitle")}</strong>
                    <p>{t("hub.toolsCopy")}</p>
                    <em>{t("hub.free")}</em>
                </button>
                <button type="button" className="home-hub-card home-hub-card--accent" onClick={() => nav("/quiz")}>
                    <strong>{t("hub.quizTitle")}</strong>
                    <p>{t("hub.quizCopy")}</p>
                    <em>{t("hub.noSignup")}</em>
                </button>
                <button type="button" className="home-hub-card home-hub-card--accent" onClick={() => nav("/#simulados")}>
                    <strong>{t("hub.examsTitle")}</strong>
                    <p>{t("hub.examsCopy")}</p>
                    <em>{t("hub.examsCta")}</em>
                </button>
            </div>
        </section>
    );
}
