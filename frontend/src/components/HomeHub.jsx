import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext.jsx";
import { getApiBase } from "../services/apiClient";

const API = getApiBase();
const DEFAULT_QUESTIONS_BANK = 6000;

const HUB_ITEMS = [
    { key: "weather", icon: "WX", path: "/weather", free: true },
    { key: "flightComputer", icon: "E6", path: "/computador", free: false },
    { key: "tools", icon: "FX", path: "/tools", free: false },
    { key: "quiz", icon: "Q5", path: "/quiz", free: false, accent: true },
    { key: "exams", icon: "AN", path: "/simulados", free: false, accent: true },
];

export default function HomeHub() {
    const nav = useNavigate();
    const { user } = useAuth();
    const { t } = useI18n();
    const [questionsBank, setQuestionsBank] = useState(DEFAULT_QUESTIONS_BANK);

    useEffect(() => {
        fetch(`${API}/api/public/stats`)
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (data?.questionsBank > 0) {
                    setQuestionsBank(data.questionsBank);
                }
            })
            .catch(() => null);
    }, []);

    function openItem(item) {
        if (item.free || user) {
            nav(item.path);
            return;
        }
        nav(`/register?next=${encodeURIComponent(item.path)}`);
    }

    return (
        <section className="home-hub" aria-label={t("hub.title")}>
            <div className="home-hub-head">
                <div className="home-hub-copy">
                    <span className="home-hub-badge">{t("hub.badge")}</span>
                    <h2>{t("hub.title")}</h2>
                    <p>{t("hub.subtitle")}</p>
                </div>
                <div className="home-hub-metrics home-hub-metrics--single">
                    <div className="home-hub-metric">
                        <strong>{questionsBank.toLocaleString()}</strong>
                        <span>{t("hub.metricQuestions")}</span>
                    </div>
                </div>
            </div>

            <div className="home-hub-grid home-hub-grid--5">
                {HUB_ITEMS.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        className={`home-hub-card ${item.accent ? "home-hub-card--accent" : ""}`}
                        onClick={() => openItem(item)}
                    >
                        <span className="home-hub-card-icon" aria-hidden="true">
                            {item.icon}
                        </span>
                        <div className="home-hub-card-body">
                            <strong>{t(`hub.${item.key}Title`)}</strong>
                            <p>{t(`hub.${item.key}Copy`)}</p>
                        </div>
                        <span className="home-hub-card-tag">
                            {item.free ? t("hub.noSignup") : item.key === "exams" ? t("hub.examsCta") : t("hub.open")}
                        </span>
                        <span className="home-hub-card-arrow" aria-hidden="true">
                            →
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
}
