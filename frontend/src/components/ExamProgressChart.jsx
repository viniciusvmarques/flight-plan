import { useMemo } from "react";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function ExamProgressChart({ items = [] }) {
    const { t } = useI18n();
    const recent = useMemo(() => {
        return [...items]
            .filter((item) => item.status === "submitted")
            .slice(0, 8)
            .reverse();
    }, [items]);

    if (!recent.length) return <p className="muted">{t("exams.chartEmpty")}</p>;

    const max = Math.max(...recent.map((item) => Number(item.percent) || 0), 1);

    return (
        <div className="exam-progress-chart" aria-label={t("exams.chartTitle")}>
            <div className="exam-progress-chart-bars">
                {recent.map((item) => (
                    <div key={item.id} className="exam-progress-chart-col">
                        <div
                            className={`exam-progress-chart-bar ${item.passed ? "exam-progress-chart-bar--pass" : "exam-progress-chart-bar--fail"}`}
                            style={{ height: `${Math.max(8, (Number(item.percent) / max) * 100)}%` }}
                            title={`${Math.round(item.percent)}%`}
                        />
                        <small>{Math.round(item.percent)}%</small>
                    </div>
                ))}
            </div>
        </div>
    );
}
