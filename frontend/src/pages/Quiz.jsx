import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import Card from "../components/Card";
import GrowthPageHero from "../components/GrowthPageHero";
import GrowthCtaBar from "../components/GrowthCtaBar";
import { useI18n } from "../i18n/I18nContext.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

const COURSES = [
    { key: "CMS", labelKey: "quiz.cms", descKey: "hub.examsCopy" },
    { key: "PP-A", labelKey: "quiz.pp", descKey: "hub.quizCopy" },
];

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

    const questions = session?.questions || [];
    const current = questions[index];
    const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

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

    return (
        <div className="main-shell">
            <AppHeader compact />
            <main className="main-scroll growth-page">
                <GrowthPageHero
                    kicker={t("quiz.nav")}
                    title={t("quiz.heroTitle")}
                    copy={t("quiz.heroCopy")}
                    statValue="5"
                    statLabel={t("quiz.subtitle")}
                />

                {error ? <div className="form-error">{error}</div> : null}

                {!session ? (
                    <Card title={t("quiz.startTitle")}>
                        <div className="growth-course-pick">
                            {COURSES.map((course) => (
                                <button
                                    key={course.key}
                                    type="button"
                                    className={`exam-course-card ${license === course.key ? "exam-course-card--active" : ""}`}
                                    onClick={() => setLicense(course.key)}
                                >
                                    <span>{course.key === "CMS" ? "CMS" : "PP"}</span>
                                    <strong>{t(course.labelKey)}</strong>
                                    <small>{course.key === "CMS" ? t("hub.examsCopy") : t("hub.quizCopy")}</small>
                                </button>
                            ))}
                        </div>
                        <GrowthCtaBar
                            primaryLabel={loading ? t("common.loading") : t("quiz.startButton")}
                            onPrimary={startSample}
                            primaryDisabled={loading}
                        />
                    </Card>
                ) : result ? (
                    <div className="growth-stack">
                        <Card title={t("quiz.resultTitle")}>
                            <div className="exam-result-hero">
                                <div>
                                    <span className={result.passed ? "exam-pass" : "exam-fail"}>
                                        {result.passed ? t("exams.approved") : t("exams.failed")}
                                    </span>
                                    <h2>{t("exams.percentScore", { percent: result.percent })}</h2>
                                    <p>
                                        {t("exams.correctCount", {
                                            correct: result.correctAnswers,
                                            total: result.totalQuestions,
                                        })}
                                    </p>
                                </div>
                            </div>
                        </Card>
                        <GrowthCtaBar
                            secondaryLabel={t("quiz.tryAgain")}
                            primaryLabel={t("quiz.createAccount")}
                            onSecondary={() => {
                                setSession(null);
                                setResult(null);
                            }}
                            onPrimary={() => nav("/register")}
                        />
                    </div>
                ) : (
                    <Card
                        title={t("quiz.questionTitle", { current: index + 1, total: questions.length })}
                        actions={
                            <span className="growth-quiz-progress">
                                {t("exams.answered", { answered: answeredCount, total: questions.length })}
                            </span>
                        }
                    >
                        <div className="growth-quiz-dots" aria-hidden="true">
                            {questions.map((q, i) => (
                                <button
                                    key={q.id}
                                    type="button"
                                    className={[
                                        "growth-quiz-dot",
                                        i === index ? "growth-quiz-dot--active" : "",
                                        answers[q.id] != null ? "growth-quiz-dot--done" : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}
                                    onClick={() => setIndex(i)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        {current ? (
                            <div className="exam-test-window">
                                <article className="exam-question-card exam-question-card--single">
                                    <p className="exam-question-text">{current.question}</p>
                                    <div className="exam-option-list">
                                        {current.options.map((option, optionIndex) => (
                                            <label
                                                key={`${current.id}-${option}`}
                                                className={`exam-option exam-option--selectable ${answers[current.id] === optionIndex ? "exam-option--selected" : ""}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={current.id}
                                                    checked={answers[current.id] === optionIndex}
                                                    onChange={() =>
                                                        setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }))
                                                    }
                                                />
                                                <span>{String.fromCharCode(65 + optionIndex)}</span>
                                                <p>{option}</p>
                                            </label>
                                        ))}
                                    </div>
                                </article>
                                <div className="exam-window-actions">
                                    <button type="button" className="secondary" disabled={index === 0} onClick={() => setIndex((v) => v - 1)}>
                                        {t("exams.previous")}
                                    </button>
                                    {index < questions.length - 1 ? (
                                        <button
                                            type="button"
                                            className="primary"
                                            disabled={answers[current.id] == null}
                                            onClick={() => setIndex((v) => v + 1)}
                                        >
                                            {t("exams.next")}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="primary"
                                            disabled={loading || answeredCount < questions.length}
                                            onClick={finishSample}
                                        >
                                            {t("quiz.finish")}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </Card>
                )}
            </main>
            <AppFooter />
        </div>
    );
}
