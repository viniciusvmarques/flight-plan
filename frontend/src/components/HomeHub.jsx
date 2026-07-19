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
        <section className="home-hub ck-hub" aria-label={t("hub.title")}>
            <div className="ck-hub-head">
                <div className="ck-hub-copy">
                    <span className="av-kicker exam-kicker">{t("hub.badge")}</span>
                    <h2 className="ck-hub-title">{t("hub.title")}</h2>
                    <p className="ck-hub-lead">{t("hub.subtitle")}</p>
                </div>
                <div className="ck-hub-metric" aria-label={t("hub.metricQuestions")}>
                    <strong>{questionsBank.toLocaleString()}</strong>
                    <span>{t("hub.metricQuestions")}</span>
                </div>
            </div>

            <div className="ck-hub-grid">
                {HUB_ITEMS.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        className={`ck-hub-card${item.accent ? " ck-hub-card--accent" : ""}${item.free ? " ck-hub-card--free" : ""}`}
                        onClick={() => openItem(item)}
                    >
                        <span className="ck-hub-card-icon" aria-hidden="true">
                            {item.icon}
                        </span>
                        <div className="ck-hub-card-body">
                            <strong>{t(`hub.${item.key}Title`)}</strong>
                            <p>{t(`hub.${item.key}Copy`)}</p>
                            <span className="ck-hub-card-tag">
                                {item.free ? t("hub.noSignup") : item.key === "exams" ? t("hub.examsCta") : t("hub.open")}
                            </span>
                        </div>
                        <span className="ck-hub-card-arrow" aria-hidden="true">
                            →
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
}
