import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import Card from "../components/Card";
import { useI18n } from "../i18n/I18nContext.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function Quiz() {
    const nav = useNavigate();
    const { t, locale } = useI18n();
    const [license, setLicense] = useState("CMS");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [session, setSession] = useState(null);
    const [answers, setAnswers] = useState({});
    const [index, setIndex] = useState(0);
    const [result, setResult] = useState(null);

    async function startSample() {
        setLoading(true);
        setError("");
        setResult(null);
        setAnswers({});
        setIndex(0);
        try {
            const res = await fetch(
                `${API}/api/exams/sample?license=${encodeURIComponent(license)}&count=5&locale=${encodeURIComponent(locale)}`
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || t("quiz.loadError"));
            setSession(data);
        } catch (e) {
            setError(e?.message || t("quiz.loadError"));
        } finally {
            setLoading(false);
        }
    }

    async function finishSample() {
        if (!session) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API}/api/exams/sample/score`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    questionIds: session.questionIds,
                    answers,
                    locale,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || t("quiz.scoreError"));
            setResult(data.score);
        } catch (e) {
            setError(e?.message || t("quiz.scoreError"));
        } finally {
            setLoading(false);
        }
    }

    const questions = session?.questions || [];
    const current = questions[index];

    return (
        <div className="main-shell">
            <AppHeader title={t("quiz.title")} subtitle={t("quiz.subtitle")} />
            <main className="main-scroll">
                <section className="public-tool-hero">
                    <h1>{t("quiz.heroTitle")}</h1>
                    <p>{t("quiz.heroCopy")}</p>
                </section>

                {!session ? (
                    <Card title={t("quiz.startTitle")}>
                        <div className="quiz-course-pick">
                            <button type="button" className={license === "CMS" ? "primary" : "secondary"} onClick={() => setLicense("CMS")}>
                                {t("quiz.cms")}
                            </button>
                            <button type="button" className={license === "PP-A" ? "primary" : "secondary"} onClick={() => setLicense("PP-A")}>
                                {t("quiz.pp")}
                            </button>
                        </div>
                        <button className="primary" type="button" disabled={loading} onClick={startSample}>
                            {loading ? t("common.loading") : t("quiz.startButton")}
                        </button>
                        {error ? <div className="form-error">{error}</div> : null}
                    </Card>
                ) : result ? (
                    <Card title={t("quiz.resultTitle")}>
                        <div className="exam-result-hero">
                            <span className={result.passed ? "exam-pass" : "exam-fail"}>
                                {result.passed ? t("exams.approved") : t("exams.failed")}
                            </span>
                            <h2>{t("exams.percentScore", { percent: result.percent })}</h2>
                            <p>{t("exams.correctCount", { correct: result.correctAnswers, total: result.totalQuestions })}</p>
                        </div>
                        <div className="public-tool-cta">
                            <button type="button" className="secondary" onClick={() => { setSession(null); setResult(null); }}>
                                {t("quiz.tryAgain")}
                            </button>
                            <button type="button" className="primary" onClick={() => nav("/register")}>
                                {t("quiz.createAccount")}
                            </button>
                        </div>
                    </Card>
                ) : (
                    <Card title={t("quiz.questionTitle", { current: index + 1, total: questions.length })}>
                        {current ? (
                            <>
                                <p className="exam-question-text">{current.question}</p>
                                <div className="exam-option-list">
                                    {current.options.map((option, optionIndex) => (
                                        <label key={`${current.id}-${option}`} className="exam-option exam-option--selectable">
                                            <input
                                                type="radio"
                                                name={current.id}
                                                checked={answers[current.id] === optionIndex}
                                                onChange={() => setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }))}
                                            />
                                            <span>{String.fromCharCode(65 + optionIndex)}</span>
                                            <p>{option}</p>
                                        </label>
                                    ))}
                                </div>
                                <div className="exam-window-actions">
                                    <button type="button" className="secondary" disabled={index === 0} onClick={() => setIndex((v) => v - 1)}>
                                        {t("exams.previous")}
                                    </button>
                                    {index < questions.length - 1 ? (
                                        <button type="button" className="primary" onClick={() => setIndex((v) => v + 1)}>
                                            {t("exams.next")}
                                        </button>
                                    ) : (
                                        <button type="button" className="primary" disabled={loading} onClick={finishSample}>
                                            {t("quiz.finish")}
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : null}
                        {error ? <div className="form-error">{error}</div> : null}
                    </Card>
                )}
            </main>
            <AppFooter />
        </div>
    );
}
