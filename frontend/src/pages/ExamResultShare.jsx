import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AviationShell from "../components/AviationShell";
import Card from "../components/Card";
import GrowthCtaBar from "../components/GrowthCtaBar";
import MarquisaMark from "../components/MarquisaMark";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function ExamResultShare() {
    const nav = useNavigate();
    const [params] = useSearchParams();
    const { t } = useI18n();

    const result = useMemo(() => {
        const hasPayload = ["percent", "passed", "correct", "total"].some((key) => params.get(key) != null);
        const percentRaw = Number(params.get("percent"));
        const correctRaw = Number(params.get("correct"));
        const totalRaw = Number(params.get("total"));
        return {
            hasPayload,
            percent: Number.isFinite(percentRaw) ? percentRaw : 0,
            passed: params.get("passed") === "1",
            correctAnswers: Number.isFinite(correctRaw) ? correctRaw : 0,
            totalQuestions: Number.isFinite(totalRaw) ? totalRaw : 0,
            course: params.get("course") || "Marquisa",
        };
    }, [params]);

    return (
        <AviationShell title={t("share.pageTitle")} subtitle={t("share.pageSubtitle")}>
            <Card title={t("share.cardTitle")}>
                {result.hasPayload ? (
                    <div className="exam-share-card exam-share-card--public">
                        <span className="exam-share-kicker">
                            <MarquisaMark size={14} />
                            <span>MARQUISA</span>
                        </span>
                        <strong className={`exam-share-status ${result.passed ? "exam-pass" : "exam-fail"}`}>
                            {result.passed ? t("exams.approved") : t("exams.failed")}
                        </strong>
                        <h2>{t("exams.percentScore", { percent: result.percent })}</h2>
                        <p className="exam-share-course">{result.course}</p>
                        <small>
                            {t("exams.correctCount", {
                                correct: result.correctAnswers,
                                total: result.totalQuestions,
                            })}
                        </small>
                    </div>
                ) : (
                    <div className="empty-note">{t("share.emptyState")}</div>
                )}
            </Card>
            <GrowthCtaBar
                primaryLabel={t("plannerGate.ctaRegister")}
                onPrimary={() => nav("/register")}
                secondaryLabel={t("plannerGate.openMetar")}
                onSecondary={() => nav("/weather")}
            />
        </AviationShell>
    );
}
