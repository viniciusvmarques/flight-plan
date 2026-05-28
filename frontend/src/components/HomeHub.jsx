import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
const DEFAULT_QUESTIONS_BANK = 6000;

const HUB_ITEMS = [
    { key: "weather", icon: "WX", path: "/weather", accent: false },
    { key: "flightComputer", icon: "E6", path: "/computador", accent: false },
    { key: "tools", icon: "FX", path: "/tools", accent: false },
    { key: "quiz", icon: "Q5", path: "/quiz", accent: true },
    { key: "exams", icon: "AN", path: "/#simulados", accent: true },
];

export default function HomeHub() {
    const nav = useNavigate();
    const { t } = useI18n();

    return (
        <section className="home-hub" aria-label={t("hub.title")}>
            <div className="home-hub-head">
                <div className="home-hub-copy">
                    <span className="home-hub-badge">{t("hub.badge")}</span>
                    <h2>{t("hub.title")}</h2>
                    <p>{t("hub.subtitle")}</p>
                </div>
            </div>

            <div className="home-hub-grid home-hub-grid--5">
                {HUB_ITEMS.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        className={`home-hub-card ${item.accent ? "home-hub-card--accent" : ""}`}
                        onClick={() => nav(item.path)}
                    >
                        <span className="home-hub-card-icon" aria-hidden="true">
                            {item.icon}
                        </span>
                        <div className="home-hub-card-body">
                            <strong>{t(`hub.${item.key}Title`)}</strong>
                            <p>{t(`hub.${item.key}Copy`)}</p>
                        </div>
                        <span className="home-hub-card-tag">
                            {item.key === "quiz" ? t("hub.noSignup") : item.key === "exams" ? t("hub.examsCta") : t("hub.free")}
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
