import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AviationShell from "../components/AviationShell";
import GrowthPageHero from "../components/GrowthPageHero";
import { NAV_TIPS, SUMMARY_CATEGORIES } from "../data/navSummaries";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function ResumosAviacao() {
    const { t } = useI18n();
    const [category, setCategory] = useState("all");
    const [query, setQuery] = useState("");
    const [openId, setOpenId] = useState(NAV_TIPS[0]?.id || "");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return NAV_TIPS.filter((tip) => {
            if (category !== "all" && tip.category !== category) return false;
            if (!q) return true;
            const hay = `${t(tip.titleKey)} ${t(tip.bodyKey)} ${t(tip.tipKey)} ${tip.level}`.toLowerCase();
            return hay.includes(q);
        });
    }, [category, query, t]);

    useEffect(() => {
        if (!filtered.length) return;
        if (!filtered.some((tip) => tip.id === openId)) {
            setOpenId(filtered[0].id);
        }
    }, [filtered, openId]);

    const selected = filtered.find((tip) => tip.id === openId) || filtered[0] || null;

    return (
        <AviationShell>
            <div className="page-shell growth-page experience-surface rs-page">
                <GrowthPageHero
                    kicker={t("summaries.kicker")}
                    title={t("summaries.title")}
                    copy={t("summaries.caption")}
                    statValue={NAV_TIPS.length}
                    statLabel={t("summaries.statLabel")}
                />

                <div className="rs-toolbar">
                    <div className="rs-cats" role="tablist" aria-label={t("summaries.catsLabel")}>
                        {SUMMARY_CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                className={category === cat.id ? "is-active" : ""}
                                onClick={() => setCategory(cat.id)}
                            >
                                {t(cat.labelKey)}
                            </button>
                        ))}
                    </div>
                    <label className="rs-search">
                        <span className="sr-only">{t("summaries.searchLabel")}</span>
                        <input
                            className="input"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t("summaries.searchPlaceholder")}
                        />
                    </label>
                </div>

                <div className="rs-split">
                    <aside className="rs-list" aria-label={t("summaries.listLabel")}>
                        {filtered.length ? (
                            filtered.map((tip) => (
                                <button
                                    key={tip.id}
                                    type="button"
                                    className={`rs-item${selected?.id === tip.id ? " is-selected" : ""}`}
                                    onClick={() => setOpenId(tip.id)}
                                >
                                    <span className="rs-item-level">{tip.level}</span>
                                    <strong>{t(tip.titleKey)}</strong>
                                </button>
                            ))
                        ) : (
                            <p className="rs-empty">{t("summaries.empty")}</p>
                        )}
                    </aside>

                    <article className="rs-detail" aria-live="polite">
                        {selected ? (
                            <>
                                <header className="rs-detail-head">
                                    <span className="rs-item-level">{selected.level}</span>
                                    <h2>{t(selected.titleKey)}</h2>
                                </header>
                                <div className="rs-body">
                                    {t(selected.bodyKey)
                                        .split("\n")
                                        .filter(Boolean)
                                        .map((para, idx) => (
                                            <p key={`${selected.id}-${idx}`}>{para}</p>
                                        ))}
                                </div>
                                <aside className="rs-tip">
                                    <strong>{t("summaries.tipLabel")}</strong>
                                    <p>{t(selected.tipKey)}</p>
                                </aside>
                            </>
                        ) : (
                            <p className="rs-empty">{t("summaries.empty")}</p>
                        )}
                    </article>
                </div>

                <footer className="rs-footer">
                    <p>{t("summaries.disclaimer")}</p>
                    <div className="rs-footer-links">
                        <Link to="/computador">{t("summaries.linkComputer")}</Link>
                        <Link to="/quiz">{t("summaries.linkQuiz")}</Link>
                        <Link to="/simulados">{t("summaries.linkExams")}</Link>
                    </div>
                </footer>
            </div>
        </AviationShell>
    );
}
