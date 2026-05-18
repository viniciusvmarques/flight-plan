import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppFooter from "../components/AppFooter";
import AppHeader from "../components/AppHeader";
import Card from "../components/Card";
import { apiGet, apiPost } from "../services/apiClient";
import { useNotify } from "../ui/NotifyContext.jsx";

function formatTime(seconds) {
    const safe = Math.max(0, Number(seconds || 0));
    const h = Math.floor(safe / 3600);
    const m = Math.floor((safe % 3600) / 60);
    const s = safe % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
}

function subjectName(catalog, key) {
    return catalog?.subjects?.find((item) => item.key === key)?.label || key || "Todas as matérias";
}

export default function Exams() {
    const nav = useNavigate();
    const { toast, confirm } = useNotify();
    const [catalog, setCatalog] = useState(null);
    const [access, setAccess] = useState(null);
    const [history, setHistory] = useState([]);
    const [attempt, setAttempt] = useState(null);
    const [answers, setAnswers] = useState({});
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
            setAccess(accessRes);
            setHistory(historyRes?.items || []);
        } catch (e) {
            setError(e?.message || "Não foi possível carregar os simulados.");
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

    async function startAttempt(mode, subject = null) {
        setError("");
        setSubmitting(true);
        try {
            const res = await apiPost("/api/exams/attempts", { mode, subject });
            const nextAttempt = res?.attempt;
            setAttempt(nextAttempt);
            setAnswers({});
            setRemaining(nextAttempt?.durationSeconds || 0);
            toast("Simulado iniciado. O temporizador já está correndo.", { variant: "success", title: "Simulados ANAC" });
        } catch (e) {
            setError(e?.message || "Não foi possível iniciar o simulado.");
        } finally {
            setSubmitting(false);
        }
    }

    async function openHistoryAttempt(id) {
        setError("");
        try {
            const res = await apiGet(`/api/exams/attempts/${id}`);
            setAttempt(res?.attempt || null);
            setAnswers({});
            setRemaining(0);
        } catch (e) {
            setError(e?.message || "Não foi possível abrir este resultado.");
        }
    }

    async function submitAttempt(auto = false) {
        if (!attempt?.id || attempt.status === "submitted") return;
        if (!auto) {
            const ok = await confirm({
                title: "Finalizar simulado",
                message: `Você respondeu ${answeredCount} de ${questions.length} questões. Depois de finalizar, o gabarito comentado será exibido.`,
                confirmLabel: "Finalizar",
                cancelLabel: "Continuar prova",
            });
            if (!ok) return;
        }

        setSubmitting(true);
        try {
            const res = await apiPost(`/api/exams/attempts/${attempt.id}/submit`, { answers });
            setAttempt(res?.attempt || null);
            setRemaining(0);
            await loadCatalog();
            toast(auto ? "Tempo encerrado. Seu simulado foi corrigido." : "Simulado corrigido com gabarito comentado.", {
                variant: "success",
                title: "Resultado",
            });
        } catch (e) {
            setError(e?.message || "Não foi possível finalizar o simulado.");
        } finally {
            setSubmitting(false);
        }
    }

    function choose(questionId, optionIndex) {
        setAnswers((current) => ({ ...current, [questionId]: optionIndex }));
    }

    return (
        <div className="main-shell exams-shell">
            <AppHeader title="Simulados ANAC" subtitle={isPro ? "Acesso PRO liberado" : "1 prova completa grátis"} />
            <main className="main-scroll exams-page">
                <section className="exam-hero">
                    <div>
                        <p className="exam-kicker">Banco autoral Marquisa</p>
                        <h1>Simulados PP Avião com temporizador, correção e explicação.</h1>
                        <p>
                            Cadastrados fazem 1 prova completa grátis. O plano PRO libera todos os simulados,
                            treino por matéria e histórico de desempenho por R$ 19,90/mês.
                        </p>
                    </div>
                    <div className="exam-hero-stat">
                        <strong>{catalog?.totalQuestions || 2000}</strong>
                        <span>questões autorais</span>
                    </div>
                </section>

                {error ? <div className="form-error">{error}</div> : null}

                {!attempt ? (
                    <div className="exam-layout">
                        <Card title="COMECE UM SIMULADO">
                            <div className="exam-access-banner">
                                <div>
                                    <strong>{isPro ? "PRO ativo: todos os simulados liberados" : "Acesso gratuito: 1 prova completa após cadastro"}</strong>
                                    <p>
                                        {isPro
                                            ? "Você pode treinar por matéria, repetir provas completas e revisar gabaritos comentados."
                                            : freeCompleteUsed
                                              ? "Você já usou a prova completa grátis. Assine o PRO para liberar todo o banco por R$ 19,90/mês."
                                              : "Faça uma prova completa PP Avião com 100 questões. Se gostar, o PRO libera o restante por R$ 19,90/mês."}
                                    </p>
                                </div>
                                {!isPro ? (
                                    <button className="secondary" type="button" onClick={() => nav("/assinatura")}>
                                        Ver plano PRO
                                    </button>
                                ) : null}
                            </div>
                            <div className="exam-actions-panel">
                                <div>
                                    <strong>Simulado completo PP Avião</strong>
                                    <p>100 questões: 20 por matéria, correção por disciplina e indicação de segunda época.</p>
                                </div>
                                <button className="primary" type="button" disabled={loading || submitting || (!isPro && freeCompleteUsed)} onClick={() => startAttempt("complete")}>
                                    {!isPro && freeCompleteUsed ? "Grátis já usado" : "Iniciar completo"}
                                </button>
                            </div>
                            <div className="exam-subject-grid">
                                {(catalog?.subjects || []).map((subject) => (
                                    <button
                                        key={subject.key}
                                        type="button"
                                        className="exam-subject-card"
                                        disabled={loading || submitting || !isPro}
                                        onClick={() => startAttempt("subject", subject.key)}
                                    >
                                        <span>{subject.key}</span>
                                        <strong>{subject.label}</strong>
                                        <small>{isPro ? `20 questões • ${formatTime(subject.durationSeconds)}` : "Disponível no PRO"}</small>
                                    </button>
                                ))}
                            </div>
                        </Card>

                        <Card title="RESULTADOS RECENTES">
                            {history.length ? (
                                <div className="exam-history-list">
                                    {history.map((item) => (
                                        <button key={item.id} type="button" className="exam-history-item" onClick={() => openHistoryAttempt(item.id)}>
                                            <span>
                                                {item.mode === "complete" ? "Completo" : subjectName(catalog, item.subject)}
                                                <small>{new Date(item.startedAt).toLocaleString("pt-BR")}</small>
                                            </span>
                                            <strong className={item.passed ? "exam-pass" : "exam-fail"}>
                                                {item.status === "submitted" ? `${Math.round(item.percent)}%` : "Em aberto"}
                                            </strong>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="muted">Seus resultados corrigidos aparecerão aqui.</p>
                            )}
                        </Card>

                        <Card title="AVISO IMPORTANTE">
                            <p className="muted">
                                {catalog?.disclaimer ||
                                    "Questões autorais de estudo, inspiradas no conteúdo cobrado para PP Avião. A Marquisa não é afiliada à ANAC e não reproduz provas oficiais."}
                            </p>
                        </Card>
                    </div>
                ) : result ? (
                    <div className="exam-layout">
                        <Card
                            title="RESULTADO DO SIMULADO"
                            actions={
                                <button className="secondary" type="button" onClick={() => setAttempt(null)}>
                                    Voltar ao catálogo
                                </button>
                            }
                        >
                            <div className="exam-result-hero">
                                <div>
                                    <span className={result.passed ? "exam-pass" : "exam-fail"}>
                                        {result.passed ? "Aprovado" : "Reprovado"}
                                    </span>
                                    <h2>{result.percent}% de acerto</h2>
                                    <p>
                                        {result.correctAnswers} de {result.totalQuestions} questões corretas.
                                        {!result.passed && result.secondChanceEligible
                                            ? " Você ficou em condição de foco para refazer até duas matérias pendentes."
                                            : null}
                                    </p>
                                </div>
                            </div>
                            <div className="exam-score-grid">
                                {result.bySubject?.map((subject) => (
                                    <div key={subject.key} className="exam-score-card">
                                        <strong>{subject.label}</strong>
                                        <span className={subject.passed ? "exam-pass" : "exam-fail"}>{subject.percent}%</span>
                                        <small>
                                            {subject.correct}/{subject.total} acertos
                                        </small>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card title="GABARITO COMENTADO">
                            <div className="exam-review-list">
                                {result.questions?.map((question, index) => (
                                    <article key={question.id} className="exam-review-item">
                                        <div className="exam-question-head">
                                            <span>Questão {index + 1}</span>
                                            <strong className={question.correct ? "exam-pass" : "exam-fail"}>
                                                {question.correct ? "Correta" : "Revisar"}
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
                                        <small className="muted">Referência de estudo: {question.reference}</small>
                                    </article>
                                ))}
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div className="exam-layout">
                        <Card
                            title={attempt.mode === "complete" ? "SIMULADO COMPLETO" : subjectName(catalog, attempt.subject)}
                            actions={
                                <>
                                    <span className={remaining < 300 ? "exam-timer exam-timer--danger" : "exam-timer"}>{formatTime(remaining)}</span>
                                    <button className="primary" type="button" disabled={submitting} onClick={() => submitAttempt(false)}>
                                        Finalizar e corrigir
                                    </button>
                                </>
                            }
                        >
                            <div className="exam-progress-line">
                                <span>
                                    {answeredCount}/{questions.length} respondidas
                                </span>
                                <progress max={questions.length || 1} value={answeredCount} />
                            </div>
                            <div className="exam-question-list">
                                {questions.map((question, index) => (
                                    <article key={question.id} className="exam-question-card">
                                        <div className="exam-question-head">
                                            <span>
                                                Questão {index + 1} • {question.subjectLabel}
                                            </span>
                                            <small>{question.topic}</small>
                                        </div>
                                        <p>{question.question}</p>
                                        <div className="exam-option-list">
                                            {question.options.map((option, optionIndex) => (
                                                <label key={`${question.id}-${option}`} className="exam-option exam-option--selectable">
                                                    <input
                                                        type="radio"
                                                        name={question.id}
                                                        checked={answers[question.id] === optionIndex}
                                                        onChange={() => choose(question.id, optionIndex)}
                                                    />
                                                    <span>{String.fromCharCode(65 + optionIndex)}</span>
                                                    <p>{option}</p>
                                                </label>
                                            ))}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}
            </main>
            <AppFooter />
        </div>
    );
}
