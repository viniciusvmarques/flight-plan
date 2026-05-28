import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppFooter from "../components/AppFooter";
import AppHeader from "../components/AppHeader";
import ExamProgressChart from "../components/ExamProgressChart";
import ExamShareCard from "../components/ExamShareCard";
import Card from "../components/Card";
import { apiGet, apiPost } from "../services/apiClient";
import { useNotify } from "../ui/NotifyContext.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";

function formatTime(seconds) {
    const safe = Math.max(0, Number(seconds || 0));
    const h = Math.floor(safe / 3600);
    const m = Math.floor((safe % 3600) / 60);
    const s = safe % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
}

function translatedValue(t, key, fallback) {
    const value = t(key);
    return value === key ? fallback : value;
}

function subjectName(catalog, key, t) {
    const allSubjects = catalog?.courses?.flatMap((course) => course.subjects || []) || catalog?.subjects || [];
    const fallback = allSubjects.find((item) => item.key === key)?.label || key || t("exams.allSubjects");
    return translatedValue(t, `exams.subjects.${key}`, fallback);
}

function courseTitle(course, t) {
    return translatedValue(t, `exams.courses.${course?.key}.title`, course?.title || "");
}

function courseShortTitle(course, t) {
    return translatedValue(t, `exams.courses.${course?.key}.shortTitle`, course?.shortTitle || course?.title || "");
}

export default function Exams() {
    const nav = useNavigate();
    const { toast, confirm } = useNotify();
    const { t, locale } = useI18n();
    const [catalog, setCatalog] = useState(null);
    const [selectedCourseKey, setSelectedCourseKey] = useState("PP-A");
    const [access, setAccess] = useState(null);
    const [history, setHistory] = useState([]);
    const [attempt, setAttempt] = useState(null);
    const [answers, setAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [remaining, setRemaining] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function loadCatalog() {
        setError("");
        setLoading(true);
        try {
            const [catalogRes, historyRes] = await Promise.all([
                apiGet("/api/exams/catalog"),
                apiGet("/api/exams/attempts").catch(() => ({ items: [] })),
            ]);
            const accessRes = await apiGet("/api/exams/access").catch(() => null);
            setCatalog(catalogRes);
            setSelectedCourseKey((current) => (catalogRes?.courses?.some((course) => course.key === current) ? current : catalogRes?.courses?.[0]?.key || "PP-A"));
            setAccess(accessRes);
            setHistory(historyRes?.items || []);
        } catch (e) {
            setError(e?.message || t("exams.loadError"));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCatalog();
    }, []);

    useEffect(() => {
        if (!attempt || attempt.status === "submitted") return undefined;
        const tick = setInterval(() => {
            setRemaining((value) => {
                if (value <= 1) {
                    clearInterval(tick);
                    submitAttempt(true);
                    return 0;
                }
                return value - 1;
            });
        }, 1000);
        return () => clearInterval(tick);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attempt?.id, attempt?.status]);

    const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
    const questions = attempt?.questions || [];
    const result = attempt?.score || null;
    const isPro = !!access?.isPro;
    const freeCompleteUsed = !!access?.freeCompleteUsed;
    const courses = catalog?.courses || [];
    const selectedCourse = courses.find((course) => course.key === selectedCourseKey) || courses[0] || null;
    const selectedSubjects = selectedCourse?.subjects || catalog?.subjects || [];
    const freeEligibleCourses = access?.freeEligibleCourses || ["PP-A", "CMS"];
    const selectedCourseIsFree = freeEligibleCourses.includes(selectedCourse?.key);
    const selectedCourseFreeUsed = !!access?.freeCompleteUsedByCourse?.[selectedCourse?.key];
    const currentQuestion = questions[currentQuestionIndex] || questions[0] || null;
    const subjectGroups = useMemo(() => {
        const map = new Map();
        questions.forEach((question, index) => {
            const key = question.subject || "GERAL";
            if (!map.has(key)) {
                map.set(key, {
                    key,
                    label: question.subjectLabel || subjectName(catalog, key, t),
                    items: [],
                });
            }
            map.get(key).items.push({ question, index });
        });
        return Array.from(map.values());
    }, [questions, catalog, t]);
    const currentSubjectGroup =
        subjectGroups.find((group) => group.key === currentQuestion?.subject) || subjectGroups[0] || { items: [] };
    const currentSubjectQuestionIndex = Math.max(
        0,
        currentSubjectGroup.items.findIndex((item) => item.index === currentQuestionIndex)
    );

    useEffect(() => {
        if (!questions.length) return;
        if (currentQuestionIndex >= questions.length) setCurrentQuestionIndex(questions.length - 1);
    }, [questions.length, currentQuestionIndex]);

    async function startAttempt(mode, subject = null) {
        setError("");
        setSubmitting(true);
        try {
            const res = await apiPost("/api/exams/attempts", { license: selectedCourse?.key || "PP-A", mode, subject, locale });
            const nextAttempt = res?.attempt;
            setAttempt(nextAttempt);
            setAnswers({});
            setCurrentQuestionIndex(0);
            setRemaining(nextAttempt?.durationSeconds || 0);
            toast(t("exams.startedToast"), { variant: "success", title: t("exams.title") });
        } catch (e) {
            setError(e?.message || t("exams.startError"));
        } finally {
            setSubmitting(false);
        }
    }

    async function openHistoryAttempt(id) {
        setError("");
        try {
            const res = await apiGet(`/api/exams/attempts/${id}?locale=${encodeURIComponent(locale)}`);
            setAttempt(res?.attempt || null);
            setAnswers({});
            setCurrentQuestionIndex(0);
            setRemaining(0);
        } catch (e) {
            setError(e?.message || t("exams.openResultError"));
        }
    }

    async function submitAttempt(auto = false) {
        if (!attempt?.id || attempt.status === "submitted") return;
        if (!auto) {
            const ok = await confirm({
                title: t("exams.finishTitle"),
                message: t("exams.finishMessage", { answered: answeredCount, total: questions.length }),
                confirmLabel: t("exams.finishConfirm"),
                cancelLabel: t("exams.continueExam"),
            });
            if (!ok) return;
        }

        setSubmitting(true);
        try {
            const res = await apiPost(`/api/exams/attempts/${attempt.id}/submit`, { answers, locale });
            setAttempt(res?.attempt || null);
            setRemaining(0);
            await loadCatalog();
            toast(auto ? t("exams.timeEndedToast") : t("exams.correctedToast"), {
                variant: "success",
                title: t("exams.resultToastTitle"),
            });
        } catch (e) {
            setError(e?.message || t("exams.submitError"));
        } finally {
            setSubmitting(false);
        }
    }

    function choose(questionId, optionIndex) {
        setAnswers((current) => ({ ...current, [questionId]: optionIndex }));
    }

    return (
        <div className="main-shell exams-shell">
            <AppHeader title={t("exams.title")} subtitle={isPro ? t("exams.subtitlePro") : t("exams.subtitleFree")} />
            <main className="main-scroll exams-page exam-surface">
                <section className="exam-hero">
                    <div>
                        <p className="exam-kicker">{t("exams.kicker")}</p>
                        <h1>{t("exams.heroTitle")}</h1>
                        <p>{t("exams.heroCopy")}</p>
                    </div>
                    <div className="exam-hero-stat">
                        <strong>{catalog?.totalQuestions || 6000}</strong>
                        <span>{t("exams.questionsAuthored")}</span>
                    </div>
                </section>

                {error ? <div className="form-error">{error}</div> : null}

                {!attempt ? (
                    <div className="exam-layout">
                        <Card title={t("exams.startTitle")}>
                            <div className="exam-course-grid">
                                {courses.map((course) => (
                                    <button
                                        key={course.key}
                                        type="button"
                                        className={`exam-course-card ${course.key === selectedCourse?.key ? "exam-course-card--active" : ""}`}
                                        onClick={() => setSelectedCourseKey(course.key)}
                                    >
                                        <span>{courseShortTitle(course, t)}</span>
                                        <strong>{courseTitle(course, t)}</strong>
                                        <small>{t("exams.questionsPerComplete", { total: course.totalQuestions, count: course.completeExam?.questionCount || 100 })}</small>
                                        {!isPro && !freeEligibleCourses.includes(course.key) ? <em>PRO</em> : null}
                                    </button>
                                ))}
                            </div>
                            <div className="exam-access-banner">
                                <div>
                                    <strong>{isPro ? t("exams.proAllCourses") : t("exams.freeAccess")}</strong>
                                    <p>
                                        {isPro
                                            ? t("exams.proAccessCopy")
                                            : selectedCourseIsFree && selectedCourseFreeUsed
                                              ? t("exams.freeCourseUsedCopy")
                                            : freeCompleteUsed
                                              ? t("exams.freeUsedCopy")
                                              : t("exams.freeAvailableCopy")}
                                    </p>
                                </div>
                                {!isPro ? (
                                    <button className="secondary" type="button" onClick={() => nav("/assinatura")}>
                                        {t("exams.viewPro")}
                                    </button>
                                ) : null}
                            </div>
                            <div className="exam-actions-panel">
                                <div>
                                    <strong>{t("exams.completeExam", { course: courseShortTitle(selectedCourse, t) || courseShortTitle({ key: "PP-A" }, t) })}</strong>
                                    <p>{t("exams.completeExamCopy", { count: selectedCourse?.completeExam?.questionCount || 100 })}</p>
                                </div>
                                <button
                                    className={!isPro && (!selectedCourseIsFree || selectedCourseFreeUsed) ? "btn-primary" : "primary"}
                                    type="button"
                                    disabled={loading || submitting}
                                    onClick={() => (!isPro && (!selectedCourseIsFree || selectedCourseFreeUsed) ? nav("/assinatura") : startAttempt("complete"))}
                                >
                                    {!isPro && (!selectedCourseIsFree || selectedCourseFreeUsed) ? t("exams.subscribePro") : t("exams.startComplete")}
                                </button>
                            </div>
                            <div className="exam-subject-grid">
                                {selectedSubjects.map((subject) => (
                                    <button
                                        key={subject.key}
                                        type="button"
                                        className={`exam-subject-card ${!isPro ? "exam-subject-card--locked" : ""}`}
                                        disabled={loading || submitting}
                                        onClick={() => (isPro ? startAttempt("subject", subject.key) : nav("/assinatura"))}
                                    >
                                        <span>{subject.key}</span>
                                        <strong>{subjectName(catalog, subject.key, t)}</strong>
                                        <small>{isPro ? t("exams.subjectMeta", { time: formatTime(subject.durationSeconds) }) : t("exams.availablePro")}</small>
                                    </button>
                                ))}
                            </div>
                        </Card>

                        <Card title={t("exams.recentResults")}>
                            <ExamProgressChart items={history} />
                            {history.length ? (
                                <div className="exam-history-list">
                                    {history.map((item) => (
                                        <button key={item.id} type="button" className="exam-history-item" onClick={() => openHistoryAttempt(item.id)}>
                                            <span>
                                                {item.mode === "complete" ? t("exams.complete", { license: item.license || "" }) : subjectName(catalog, item.subject, t)}
                                                <small>{new Date(item.startedAt).toLocaleString(locale)}</small>
                                            </span>
                                            <strong className={item.passed ? "exam-pass" : "exam-fail"}>
                                                {item.status === "submitted" ? `${Math.round(item.percent)}%` : t("exams.open")}
                                            </strong>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="muted">{t("exams.emptyResults")}</p>
                            )}
                        </Card>

                        <Card title={t("exams.importantNotice")}>
                            <p className="muted">
                                {t("exams.disclaimer")}
                            </p>
                        </Card>
                    </div>
                ) : result ? (
                    <div className="exam-layout">
                        <Card
                            title={t("exams.resultTitle")}
                            actions={
                                <button className="secondary" type="button" onClick={() => setAttempt(null)}>
                                    {t("exams.backCatalog")}
                                </button>
                            }
                        >
                            <div className="exam-result-hero">
                                <div>
                                    <span className={result.passed ? "exam-pass" : "exam-fail"}>
                                        {result.passed ? t("exams.approved") : t("exams.failed")}
                                    </span>
                                    <h2>{t("exams.percentScore", { percent: result.percent })}</h2>
                                    <p>
                                        {t("exams.correctCount", { correct: result.correctAnswers, total: result.totalQuestions })}
                                        {!result.passed && result.secondChanceEligible
                                            ? t("exams.secondChance")
                                            : null}
                                    </p>
                                </div>
                            </div>
                            <ExamShareCard
                                result={result}
                                courseLabel={courseShortTitle(
                                    catalog?.courses?.find((c) => c.key === attempt?.license) || { key: attempt?.license },
                                    t
                                )}
                            />
                            <div className="exam-score-grid">
                                        {result.bySubject?.map((subject) => (
                                    <div key={subject.key} className="exam-score-card">
                                        <strong>{subjectName(catalog, subject.key, t)}</strong>
                                        <span className={subject.passed ? "exam-pass" : "exam-fail"}>{subject.percent}%</span>
                                        <small>
                                            {t("exams.subjectHits", { correct: subject.correct, total: subject.total })}
                                        </small>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card title={t("exams.answerKey")}>
                            <div className="exam-review-list">
                                {result.questions?.map((question, index) => (
                                    <article key={question.id} className="exam-review-item exam-prose">
                                        <div className="exam-question-head">
                                            <span>{t("exams.question", { number: index + 1 })}</span>
                                            <strong className={question.correct ? "exam-pass" : "exam-fail"}>
                                                {question.correct ? t("exams.correct") : t("exams.review")}
                                            </strong>
                                        </div>
                                        <p>{question.question}</p>
                                        <div className="exam-option-list">
                                            {question.options.map((option, optionIndex) => (
                                                <div
                                                    key={`${question.id}-${option}`}
                                                    className={[
                                                        "exam-option",
                                                        optionIndex === question.correctIndex ? "exam-option--correct" : "",
                                                        optionIndex === question.selectedIndex && optionIndex !== question.correctIndex
                                                            ? "exam-option--wrong"
                                                            : "",
                                                    ].join(" ")}
                                                >
                                                    <span>{String.fromCharCode(65 + optionIndex)}</span>
                                                    <p>{option}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="exam-explanation">{question.explanation}</p>
                                        <small className="muted">{t("exams.reference", { reference: question.reference })}</small>
                                    </article>
                                ))}
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div className="exam-layout">
                        <Card
                            title={attempt.mode === "complete" ? t("exams.examCompleteTitle") : subjectName(catalog, attempt.subject, t)}
                            actions={
                                <>
                                    <span className={remaining < 300 ? "exam-timer exam-timer--danger" : "exam-timer"}>{formatTime(remaining)}</span>
                                    <button className="primary" type="button" disabled={submitting} onClick={() => submitAttempt(false)}>
                                        {t("exams.finishAndCorrect")}
                                    </button>
                                </>
                            }
                        >
                            <div className="exam-progress-line">
                                <span>
                                    {t("exams.answered", { answered: answeredCount, total: questions.length })}
                                </span>
                                <progress max={questions.length || 1} value={answeredCount} />
                            </div>
                            {currentQuestion ? (
                                <div className="exam-test-window">
                                    <article className="exam-question-card exam-question-card--single exam-prose">
                                        <div className="exam-question-head">
                                            <span>
                                                {t("exams.questionOf", { current: currentSubjectQuestionIndex + 1, total: currentSubjectGroup.items.length })}
                                            </span>
                                            <small>
                                                {subjectName(catalog, currentQuestion.subject, t)} • {currentQuestion.topic}
                                            </small>
                                        </div>
                                        <p className="exam-question-text">{currentQuestion.question}</p>
                                        <div className="exam-option-list">
                                            {currentQuestion.options.map((option, optionIndex) => (
                                                <label key={`${currentQuestion.id}-${option}`} className="exam-option exam-option--selectable">
                                                    <input
                                                        type="radio"
                                                        name={currentQuestion.id}
                                                        checked={answers[currentQuestion.id] === optionIndex}
                                                        onChange={() => choose(currentQuestion.id, optionIndex)}
                                                    />
                                                    <span>{String.fromCharCode(65 + optionIndex)}</span>
                                                    <p>{option}</p>
                                                </label>
                                            ))}
                                        </div>
                                    </article>

                                    {subjectGroups.length > 1 ? (
                                        <div className="exam-subject-tabs" aria-label={t("exams.subjectsAria")}>
                                            {subjectGroups.map((group) => {
                                                const answeredInGroup = group.items.filter((item) => answers[item.question.id] !== undefined).length;
                                                return (
                                                    <button
                                                        key={group.key}
                                                        type="button"
                                                        className={[
                                                            "exam-subject-tab",
                                                            group.key === currentSubjectGroup.key ? "exam-subject-tab--active" : "",
                                                        ].join(" ")}
                                                        onClick={() => setCurrentQuestionIndex(group.items[0]?.index || 0)}
                                                    >
                                                        <strong>{group.key}</strong>
                                                        <span>
                                                            {answeredInGroup}/{group.items.length}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : null}

                                    <div className="exam-window-actions">
                                        <button
                                            className="secondary"
                                            type="button"
                                            disabled={currentQuestionIndex === 0}
                                            onClick={() => setCurrentQuestionIndex((value) => Math.max(0, value - 1))}
                                        >
                                            {t("exams.previous")}
                                        </button>
                                        <button
                                            className="secondary"
                                            type="button"
                                            disabled={currentQuestionIndex >= questions.length - 1}
                                            onClick={() => setCurrentQuestionIndex((value) => Math.min(questions.length - 1, value + 1))}
                                        >
                                            {t("exams.next")}
                                        </button>
                                        <button className="primary" type="button" disabled={submitting} onClick={() => submitAttempt(false)}>
                                            {t("exams.finishExam")}
                                        </button>
                                    </div>

                                    <div className="exam-question-nav" aria-label={t("exams.questionsAria")}>
                                        {currentSubjectGroup.items.map((item, index) => (
                                            <button
                                                key={item.question.id}
                                                type="button"
                                                className={[
                                                    "exam-question-nav-item",
                                                    item.index === currentQuestionIndex ? "exam-question-nav-item--active" : "",
                                                    answers[item.question.id] !== undefined ? "exam-question-nav-item--answered" : "",
                                                ].join(" ")}
                                                onClick={() => setCurrentQuestionIndex(item.index)}
                                            >
                                                {index + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </Card>
                    </div>
                )}
            </main>
            <AppFooter />
        </div>
    );
}
