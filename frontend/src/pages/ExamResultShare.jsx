import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import Card from "../components/Card";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function ExamResultShare() {
    const nav = useNavigate();
    const [params] = useSearchParams();
    const { t } = useI18n();

    const result = useMemo(() => {
        return {
            percent: Number(params.get("percent") || 0),
            passed: params.get("passed") === "1",
            correctAnswers: Number(params.get("correct") || 0),
            totalQuestions: Number(params.get("total") || 0),
            course: params.get("course") || "Marquisa",
        };
    }, [params]);

    return (
        <div className="main-shell">
            <AppHeader title={t("share.pageTitle")} subtitle={t("share.pageSubtitle")} />
            <main className="main-scroll">
                <Card title={t("share.cardTitle")}>
                    <div className="exam-share-card exam-share-card--public">
                        <span className="exam-share-kicker">MARQUISA</span>
                        <strong className={result.passed ? "exam-pass" : "exam-fail"}>
                            {result.passed ? t("exams.approved") : t("exams.failed")}
                        </strong>
                        <h2>{t("exams.percentScore", { percent: result.percent })}</h2>
                        <p>{result.course}</p>
                        <small>
                            {t("exams.correctCount", {
                                correct: result.correctAnswers,
                                total: result.totalQuestions,
                            })}
                        </small>
                    </div>
                    <div className="public-tool-cta">
                        <button type="button" className="primary" onClick={() => nav("/quiz")}>
                            {t("hub.quizTitle")}
                        </button>
                        <button type="button" className="secondary" onClick={() => nav("/register")}>
                            {t("quiz.createAccount")}
                        </button>
                    </div>
                </Card>
            </main>
            <AppFooter />
        </div>
    );
}
