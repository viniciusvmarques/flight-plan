import { useRef } from "react";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function ExamShareCard({ result, courseLabel }) {
    const { t } = useI18n();
    const cardRef = useRef(null);

    function buildShareUrl() {
        const params = new URLSearchParams({
            percent: String(result?.percent ?? 0),
            passed: result?.passed ? "1" : "0",
            correct: String(result?.correctAnswers ?? 0),
            total: String(result?.totalQuestions ?? 0),
            course: courseLabel || "Marquisa",
        });
        return `${window.location.origin}/result/share?${params.toString()}`;
    }

    async function shareResult() {
        const url = buildShareUrl();
        const text = t("share.shareText", {
            percent: result?.percent ?? 0,
            course: courseLabel || "Marquisa",
        });
        if (navigator.share) {
            try {
                await navigator.share({ title: "Marquisa", text, url });
                return;
            } catch {
                /* fallback */
            }
        }
        await navigator.clipboard.writeText(`${text}\n${url}`);
        alert(t("share.copied"));
    }

    return (
        <div className="exam-share-wrap">
            <div ref={cardRef} className="exam-share-card">
                <span className="exam-share-kicker">MARQUISA</span>
                <strong className={result?.passed ? "exam-pass" : "exam-fail"}>
                    {result?.passed ? t("exams.approved") : t("exams.failed")}
                </strong>
                <h3>{t("exams.percentScore", { percent: result?.percent ?? 0 })}</h3>
                <p>{courseLabel}</p>
                <small>
                    {t("exams.correctCount", {
                        correct: result?.correctAnswers ?? 0,
                        total: result?.totalQuestions ?? 0,
                    })}
                </small>
            </div>
            <button type="button" className="secondary" onClick={shareResult}>
                {t("share.button")}
            </button>
        </div>
    );
}
