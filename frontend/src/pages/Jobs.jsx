import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AviationShell from "../components/AviationShell";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext.jsx";

const STORAGE_KEY = "mq_jobs_board_v2";

const EMPTY_SEEKER = {
    fullName: "",
    location: "",
    experience: "",
    licenses: "",
    hours: "",
    headline: "",
    contactEmail: "",
    contactPhone: "",
    photoName: "",
    photoPreview: "",
};

const EMPTY_HIRING = {
    companyName: "",
    roleTitle: "",
    location: "",
    workMode: "presencial",
    contractType: "clt",
    aircraft: "",
    description: "",
    requirements: "",
    contactEmail: "",
    contactPhone: "",
    contactOther: "",
};

const DEMO_BOARD = {
    seeded: true,
    jobs: [
        {
            id: "demo-job-1",
            createdAt: "2026-07-20T12:00:00.000Z",
            companyName: "SkyLink Taxi Aéreo",
            roleTitle: "Primeiro oficial — King Air 350",
            location: "Congonhas, SP",
            workMode: "presencial",
            contractType: "clt",
            aircraft: "BE300 / King Air 350",
            description:
                "Operação executiva e aeromédica sob RBAC 135. Escala 15x15 com base em SBSP. Treinamento em tipo oferecido para candidatos com experiência multi motor.",
            requirements: "CMA 1ª classe · PC/IFR · MEL · 500 h totais · 100 h multi · Inglês operacional",
            contactEmail: "rh@skylink.exemplo",
            contactPhone: "+55 11 90000-1001",
            contactOther: "",
            demo: true,
        },
        {
            id: "demo-job-2",
            createdAt: "2026-07-18T09:30:00.000Z",
            companyName: "Atlantic Cargo BR",
            roleTitle: "Comandante — ATR 72",
            location: "Confins, MG",
            workMode: "presencial",
            contractType: "pj",
            aircraft: "ATR 72",
            description:
                "Linha de carga noturna com foco em pontualidade e CRM. Preferência para quem já voou turboélice pressurizado em malha nacional.",
            requirements: "CMA 1ª · PLA ou PC com experiência PIC · Type ATR desejável · 2.000 h totais",
            contactEmail: "talent@atlantic.exemplo",
            contactPhone: "",
            contactOther: "Formulário RH no site da empresa",
            demo: true,
        },
        {
            id: "demo-job-3",
            createdAt: "2026-07-15T15:10:00.000Z",
            companyName: "Horizon Instruction",
            roleTitle: "Instrutor de voo — C172 / PA28",
            location: "Jundiaí, SP · híbrido",
            workMode: "hibrido",
            contractType: "pj",
            aircraft: "C172 / PA28",
            description:
                "Escola com turma PP/PC. Aulas teóricas presenciais e briefing remoto. Carga horária flexível para quem está construindo horas.",
            requirements: "INVA · CMA 2ª ou 1ª · Experiência de instrução é diferencial",
            contactEmail: "escola@horizon.exemplo",
            contactPhone: "+55 11 90000-2244",
            contactOther: "",
            demo: true,
        },
    ],
    seekers: [
        {
            id: "demo-seeker-1",
            createdAt: "2026-07-19T11:00:00.000Z",
            fullName: "Ana Ribeiro",
            headline: "PC/IFR · buscando FO turboélice",
            location: "Campinas, SP",
            licenses: "PC · IFR · MLA",
            hours: "780 h",
            experience:
                "Formada em 2022. Experiência em instrução C172 e voos de traslado. Busco transição para FO em operação 135 ou regional.",
            contactEmail: "ana.ribeiro@exemplo.com",
            contactPhone: "+55 19 98888-0000",
            photoPreview: "",
            demo: true,
        },
        {
            id: "demo-seeker-2",
            createdAt: "2026-07-12T08:20:00.000Z",
            fullName: "Diego Martins",
            headline: "PLA · ATR / Embraer",
            location: "Recife, PE",
            licenses: "PLA · IFR · Type ATR",
            hours: "4.200 h",
            experience:
                "Comandante ATR com experiência em malha Nordeste. Aberto a bases no Sudeste e a contratos CLT ou PJ bem estruturados.",
            contactEmail: "diego.martins@exemplo.com",
            contactPhone: "+55 81 97777-1111",
            photoPreview: "",
            demo: true,
        },
    ],
};

function createId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function loadBoard() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            saveBoard(DEMO_BOARD);
            return DEMO_BOARD;
        }
        const parsed = JSON.parse(raw);
        return {
            seeded: Boolean(parsed?.seeded),
            seekers: Array.isArray(parsed?.seekers) ? parsed.seekers : [],
            jobs: Array.isArray(parsed?.jobs) ? parsed.jobs : [],
        };
    } catch {
        return { seeded: false, seekers: [], jobs: [] };
    }
}

function saveBoard(board) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
    } catch {
        /* ignore */
    }
}

function relativeTime(iso, locale) {
    const ts = Date.parse(iso);
    if (!Number.isFinite(ts)) return "";
    const diffMin = Math.round((Date.now() - ts) / 60000);
    if (diffMin < 60) return locale?.startsWith("en") ? `${Math.max(1, diffMin)}m ago` : `há ${Math.max(1, diffMin)} min`;
    const diffH = Math.round(diffMin / 60);
    if (diffH < 48) return locale?.startsWith("en") ? `${diffH}h ago` : `há ${diffH} h`;
    const diffD = Math.round(diffH / 24);
    return locale?.startsWith("en") ? `${diffD}d ago` : `há ${diffD} d`;
}

function workModeLabel(mode, t) {
    if (mode === "remoto") return t("jobs.workRemote");
    if (mode === "hibrido") return t("jobs.workHybrid");
    return t("jobs.workOnsite");
}

function contractLabel(type, t) {
    if (type === "pj") return "PJ";
    if (type === "estagio") return t("jobs.contractIntern");
    return "CLT";
}

function matchesQuery(item, query, locationQuery) {
    const q = String(query || "").trim().toLowerCase();
    const loc = String(locationQuery || "").trim().toLowerCase();
    const hay = [
        item.roleTitle,
        item.companyName,
        item.fullName,
        item.headline,
        item.aircraft,
        item.licenses,
        item.description,
        item.experience,
        item.requirements,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    const place = String(item.location || "").toLowerCase();
    if (q && !hay.includes(q)) return false;
    if (loc && !place.includes(loc)) return false;
    return true;
}

function ApplyGate({ t, nextPath = "/empregos" }) {
    return (
        <div className="jb-apply-gate">
            <Link className="primary" to={`/login?next=${encodeURIComponent(nextPath)}`}>
                {t("jobs.applyCta")}
            </Link>
            <p>
                {t("jobs.applyHint")}{" "}
                <Link to={`/register?next=${encodeURIComponent(nextPath)}`}>{t("common.register")}</Link>
            </p>
        </div>
    );
}

export default function Jobs() {
    const { t, locale } = useI18n();
    const { user } = useAuth();
    const nav = useNavigate();
    const canSeeContact = Boolean(user);
    const [params, setParams] = useSearchParams();

    const view = params.get("modo") === "contratando" || params.get("modo") === "procurando" ? params.get("modo") : "buscar";
    const boardKind = params.get("lista") === "candidatos" ? "candidatos" : "vagas";

    const [board, setBoard] = useState(() => loadBoard());
    const [query, setQuery] = useState("");
    const [locationQuery, setLocationQuery] = useState("");
    const [workFilter, setWorkFilter] = useState("todos");
    const [selectedId, setSelectedId] = useState("");
    const [seeker, setSeeker] = useState(EMPTY_SEEKER);
    const [hiring, setHiring] = useState(EMPTY_HIRING);
    const [note, setNote] = useState("");

    const list = boardKind === "candidatos" ? board.seekers : board.jobs;

    useEffect(() => {
        if (user) return;
        if (view === "contratando") {
            nav(`/login?next=${encodeURIComponent("/empregos?modo=contratando")}`, { replace: true });
            return;
        }
        if (view === "procurando") {
            nav(`/login?next=${encodeURIComponent("/empregos?modo=procurando")}`, { replace: true });
        }
    }, [view, user, nav]);

    const filtered = useMemo(() => {
        return list.filter((item) => {
            if (!matchesQuery(item, query, locationQuery)) return false;
            if (boardKind === "vagas" && workFilter !== "todos" && item.workMode !== workFilter) return false;
            return true;
        });
    }, [list, query, locationQuery, workFilter, boardKind]);

    useEffect(() => {
        if (!filtered.length) {
            setSelectedId("");
            return;
        }
        if (!filtered.some((item) => item.id === selectedId)) {
            setSelectedId(filtered[0].id);
        }
    }, [filtered, selectedId]);

    const selected = filtered.find((item) => item.id === selectedId) || null;

    function goBrowse(kind = boardKind) {
        const next = new URLSearchParams();
        if (kind === "candidatos") next.set("lista", "candidatos");
        setParams(next);
        setNote("");
    }

    function goForm(modo) {
        setNote("");
        if (!user && (modo === "contratando" || modo === "procurando")) {
            nav(`/login?next=${encodeURIComponent(`/empregos?modo=${modo}`)}`);
            return;
        }
        setParams({ modo });
    }

    function updateSeeker(key, value) {
        setSeeker((current) => ({ ...current, [key]: value }));
    }

    function updateHiring(key, value) {
        setHiring((current) => ({ ...current, [key]: value }));
    }

    function onPhotoChange(event) {
        const file = event.target.files?.[0];
        if (!file) {
            updateSeeker("photoName", "");
            updateSeeker("photoPreview", "");
            return;
        }
        if (!file.type.startsWith("image/") || file.size > 1.5 * 1024 * 1024) {
            setNote(file.type.startsWith("image/") ? t("jobs.photoTooLarge") : t("jobs.photoInvalid"));
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            updateSeeker("photoName", file.name);
            updateSeeker("photoPreview", String(reader.result || ""));
        };
        reader.readAsDataURL(file);
    }

    const seekerReady =
        seeker.fullName.trim().length >= 2 &&
        seeker.location.trim().length >= 2 &&
        seeker.experience.trim().length >= 20 &&
        (seeker.contactEmail.trim().length >= 5 || seeker.contactPhone.trim().length >= 8);

    const hiringReady =
        hiring.companyName.trim().length >= 2 &&
        hiring.roleTitle.trim().length >= 2 &&
        hiring.description.trim().length >= 30 &&
        (hiring.contactEmail.trim().length >= 5 ||
            hiring.contactPhone.trim().length >= 8 ||
            hiring.contactOther.trim().length >= 5);

    function publishSeeker(event) {
        event.preventDefault();
        if (!user) {
            nav(`/login?next=${encodeURIComponent("/empregos?modo=procurando")}`);
            return;
        }
        if (!seekerReady) return;
        const entry = { id: createId("seeker"), createdAt: new Date().toISOString(), ...seeker };
        const next = { ...board, seekers: [entry, ...board.seekers] };
        saveBoard(next);
        setBoard(next);
        setSeeker(EMPTY_SEEKER);
        setNote(t("jobs.seekerPublished"));
        setSelectedId(entry.id);
        goBrowse("candidatos");
    }

    function publishHiring(event) {
        event.preventDefault();
        if (!user) {
            nav(`/login?next=${encodeURIComponent("/empregos?modo=contratando")}`);
            return;
        }
        if (!hiringReady) return;
        const entry = { id: createId("job"), createdAt: new Date().toISOString(), ...hiring };
        const next = { ...board, jobs: [entry, ...board.jobs] };
        saveBoard(next);
        setBoard(next);
        setHiring(EMPTY_HIRING);
        setNote(t("jobs.jobPublished"));
        setSelectedId(entry.id);
        goBrowse("vagas");
    }

    function removeSelected() {
        if (!selected) return;
        const next =
            boardKind === "candidatos"
                ? { ...board, seekers: board.seekers.filter((item) => item.id !== selected.id) }
                : { ...board, jobs: board.jobs.filter((item) => item.id !== selected.id) };
        saveBoard(next);
        setBoard(next);
        setNote(t("jobs.entryRemoved"));
    }

    function resetDemo() {
        saveBoard(DEMO_BOARD);
        setBoard(DEMO_BOARD);
        setSelectedId(DEMO_BOARD.jobs[0]?.id || "");
        setQuery("");
        setLocationQuery("");
        setWorkFilter("todos");
        goBrowse("vagas");
        setNote(t("jobs.demoReset"));
    }

    return (
        <AviationShell>
            <div className="page-shell jb-page">
                <header className="jb-top">
                    <div className="jb-top-copy">
                        <h1>{t("jobs.title")}</h1>
                        <p>{t("jobs.captionModern")}</p>
                    </div>
                    <div className="jb-top-actions">
                        <button type="button" className="secondary" onClick={() => goForm("procurando")}>
                            {t("jobs.ctaProfile")}
                        </button>
                        <button type="button" className="primary" onClick={() => goForm("contratando")}>
                            {t("jobs.ctaPostJob")}
                        </button>
                    </div>
                </header>

                {view === "buscar" ? (
                    <>
                        <form
                            className="jb-search"
                            onSubmit={(event) => {
                                event.preventDefault();
                            }}
                        >
                            <label className="jb-search-field">
                                <span>{t("jobs.searchKeyword")}</span>
                                <input
                                    className="input"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder={t("jobs.searchKeywordPlaceholder")}
                                />
                            </label>
                            <label className="jb-search-field">
                                <span>{t("jobs.searchLocation")}</span>
                                <input
                                    className="input"
                                    value={locationQuery}
                                    onChange={(e) => setLocationQuery(e.target.value)}
                                    placeholder={t("jobs.searchLocationPlaceholder")}
                                />
                            </label>
                            <button type="submit" className="primary jb-search-submit">
                                {t("jobs.searchAction")}
                            </button>
                        </form>

                        <div className="jb-toolbar">
                            <div className="jb-kind-toggle" role="tablist">
                                <button
                                    type="button"
                                    className={`jb-chip${boardKind === "vagas" ? " is-active" : ""}`}
                                    onClick={() => goBrowse("vagas")}
                                >
                                    {t("jobs.jobsTab", { count: board.jobs.length })}
                                </button>
                                <button
                                    type="button"
                                    className={`jb-chip${boardKind === "candidatos" ? " is-active" : ""}`}
                                    onClick={() => goBrowse("candidatos")}
                                >
                                    {t("jobs.seekersTab", { count: board.seekers.length })}
                                </button>
                            </div>

                            {boardKind === "vagas" ? (
                                <div className="jb-filters">
                                    {["todos", "presencial", "hibrido", "remoto"].map((mode) => (
                                        <button
                                            key={mode}
                                            type="button"
                                            className={`jb-chip${workFilter === mode ? " is-active" : ""}`}
                                            onClick={() => setWorkFilter(mode)}
                                        >
                                            {mode === "todos"
                                                ? t("jobs.filterAll")
                                                : workModeLabel(mode, t)}
                                        </button>
                                    ))}
                                </div>
                            ) : null}

                            <button type="button" className="jb-linkish" onClick={resetDemo}>
                                {t("jobs.reloadDemo")}
                            </button>
                        </div>

                        <div className="jb-split">
                            <aside className="jb-list-pane" aria-label={t("jobs.resultsLabel")}>
                                <div className="jb-results-count">
                                    {t("jobs.resultsCount", { count: filtered.length })}
                                </div>
                                {!filtered.length ? (
                                    <p className="empty-note">{t("jobs.noResults")}</p>
                                ) : (
                                    <div className="jb-card-list">
                                        {filtered.map((item) => {
                                            const active = item.id === selectedId;
                                            if (boardKind === "vagas") {
                                                return (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        className={`jb-result-card${active ? " is-active" : ""}`}
                                                        onClick={() => setSelectedId(item.id)}
                                                    >
                                                        <div className="jb-result-title-row">
                                                            <strong>{item.roleTitle}</strong>
                                                            {item.demo ? <span className="jb-tag jb-tag--demo">{t("jobs.demoTag")}</span> : null}
                                                        </div>
                                                        <span className="jb-result-company">{item.companyName}</span>
                                                        <span className="jb-result-meta">
                                                            {item.location}
                                                            {item.aircraft ? ` · ${item.aircraft}` : ""}
                                                        </span>
                                                        <div className="jb-tags">
                                                            <span className="jb-tag">{workModeLabel(item.workMode, t)}</span>
                                                            <span className="jb-tag">{contractLabel(item.contractType, t)}</span>
                                                        </div>
                                                        <span className="jb-result-time">{relativeTime(item.createdAt, locale)}</span>
                                                    </button>
                                                );
                                            }
                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    className={`jb-result-card${active ? " is-active" : ""}`}
                                                    onClick={() => setSelectedId(item.id)}
                                                >
                                                    <div className="jb-result-title-row">
                                                        <strong>{item.fullName}</strong>
                                                        {item.demo ? <span className="jb-tag jb-tag--demo">{t("jobs.demoTag")}</span> : null}
                                                    </div>
                                                    <span className="jb-result-company">{item.headline || t("jobs.profileBasic")}</span>
                                                    <span className="jb-result-meta">
                                                        {item.location}
                                                        {item.hours ? ` · ${item.hours}` : ""}
                                                    </span>
                                                    <div className="jb-tags">
                                                        {(item.licenses || "")
                                                            .split(/[·,|]/)
                                                            .map((part) => part.trim())
                                                            .filter(Boolean)
                                                            .slice(0, 3)
                                                            .map((tag) => (
                                                                <span key={tag} className="jb-tag">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                    </div>
                                                    <span className="jb-result-time">{relativeTime(item.createdAt, locale)}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </aside>

                            <section className="jb-detail-pane" aria-live="polite">
                                {!selected ? (
                                    <div className="jb-detail-empty">
                                        <strong>{t("jobs.selectHintTitle")}</strong>
                                        <p>{t("jobs.selectHintCopy")}</p>
                                    </div>
                                ) : boardKind === "vagas" ? (
                                    <article className="jb-detail">
                                        <header className="jb-detail-head">
                                            <div>
                                                <p className="jb-detail-company">{selected.companyName}</p>
                                                <h2>{selected.roleTitle}</h2>
                                                <p className="jb-detail-meta">
                                                    {selected.location}
                                                    {selected.aircraft ? ` · ${selected.aircraft}` : ""}
                                                    {` · ${relativeTime(selected.createdAt, locale)}`}
                                                </p>
                                                <div className="jb-tags">
                                                    <span className="jb-tag">{workModeLabel(selected.workMode, t)}</span>
                                                    <span className="jb-tag">{contractLabel(selected.contractType, t)}</span>
                                                </div>
                                            </div>
                                            <button type="button" className="secondary" onClick={removeSelected}>
                                                {t("jobs.remove")}
                                            </button>
                                        </header>

                                        <div className="jb-detail-section">
                                            <h3>{t("jobs.sectionDescription")}</h3>
                                            <p>{selected.description}</p>
                                        </div>
                                        {selected.requirements ? (
                                            <div className="jb-detail-section">
                                                <h3>{t("jobs.sectionRequirements")}</h3>
                                                <p>{selected.requirements}</p>
                                            </div>
                                        ) : null}

                                        <div className="jb-detail-section">
                                            <h3>{t("jobs.sectionApply")}</h3>
                                            {canSeeContact ? (
                                                <div className="jb-contact">
                                                    {selected.contactEmail ? (
                                                        <p>
                                                            <span>{t("jobs.contactEmail")}</span>
                                                            <strong>{selected.contactEmail}</strong>
                                                        </p>
                                                    ) : null}
                                                    {selected.contactPhone ? (
                                                        <p>
                                                            <span>{t("jobs.contactPhone")}</span>
                                                            <strong>{selected.contactPhone}</strong>
                                                        </p>
                                                    ) : null}
                                                    {selected.contactOther ? (
                                                        <p>
                                                            <span>{t("jobs.contactOther")}</span>
                                                            <strong>{selected.contactOther}</strong>
                                                        </p>
                                                    ) : null}
                                                </div>
                                            ) : (
                                                <ApplyGate t={t} nextPath="/empregos" />
                                            )}
                                        </div>
                                    </article>
                                ) : (
                                    <article className="jb-detail">
                                        <header className="jb-detail-head">
                                            <div className="jb-detail-person">
                                                {selected.photoPreview ? (
                                                    <img src={selected.photoPreview} alt="" className="jb-avatar" />
                                                ) : (
                                                    <span className="jb-avatar jb-avatar--empty" aria-hidden />
                                                )}
                                                <div>
                                                    <h2>{selected.fullName}</h2>
                                                    <p className="jb-detail-company">{selected.headline || t("jobs.profileBasic")}</p>
                                                    <p className="jb-detail-meta">
                                                        {selected.location}
                                                        {selected.hours ? ` · ${selected.hours}` : ""}
                                                        {` · ${relativeTime(selected.createdAt, locale)}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <button type="button" className="secondary" onClick={removeSelected}>
                                                {t("jobs.remove")}
                                            </button>
                                        </header>
                                        {selected.licenses ? (
                                            <div className="jb-tags" style={{ marginBottom: 14 }}>
                                                {selected.licenses
                                                    .split(/[·,|]/)
                                                    .map((part) => part.trim())
                                                    .filter(Boolean)
                                                    .map((tag) => (
                                                        <span key={tag} className="jb-tag">
                                                            {tag}
                                                        </span>
                                                    ))}
                                            </div>
                                        ) : null}
                                        <div className="jb-detail-section">
                                            <h3>{t("jobs.sectionExperience")}</h3>
                                            <p>{selected.experience}</p>
                                        </div>
                                        <div className="jb-detail-section">
                                            <h3>{t("jobs.sectionContact")}</h3>
                                            {canSeeContact ? (
                                                <div className="jb-contact">
                                                    {selected.contactEmail ? (
                                                        <p>
                                                            <span>{t("jobs.contactEmail")}</span>
                                                            <strong>{selected.contactEmail}</strong>
                                                        </p>
                                                    ) : null}
                                                    {selected.contactPhone ? (
                                                        <p>
                                                            <span>{t("jobs.contactPhone")}</span>
                                                            <strong>{selected.contactPhone}</strong>
                                                        </p>
                                                    ) : null}
                                                </div>
                                            ) : (
                                                <ApplyGate t={t} nextPath="/empregos?lista=candidatos" />
                                            )}
                                        </div>
                                    </article>
                                )}
                            </section>
                        </div>
                    </>
                ) : null}

                {view === "procurando" && user ? (
                    <section className="jb-form-shell">
                        <div className="jb-form-head">
                            <div>
                                <h2>{t("jobs.seekerFormTitle")}</h2>
                                <p>{t("jobs.seekerFormLead")}</p>
                            </div>
                            <button type="button" className="secondary" onClick={() => goBrowse("candidatos")}>
                                {t("jobs.back")}
                            </button>
                        </div>
                        <form className="jb-form" onSubmit={publishSeeker}>
                            <div className="jb-form-grid">
                                <label className="jb-field">
                                    <span>{t("jobs.fullName")}</span>
                                    <input className="input" value={seeker.fullName} onChange={(e) => updateSeeker("fullName", e.target.value)} required />
                                </label>
                                <label className="jb-field">
                                    <span>{t("jobs.headline")}</span>
                                    <input
                                        className="input"
                                        value={seeker.headline}
                                        onChange={(e) => updateSeeker("headline", e.target.value)}
                                        placeholder={t("jobs.headlinePlaceholder")}
                                    />
                                </label>
                                <label className="jb-field">
                                    <span>{t("jobs.location")}</span>
                                    <input className="input" value={seeker.location} onChange={(e) => updateSeeker("location", e.target.value)} required />
                                </label>
                                <label className="jb-field">
                                    <span>{t("jobs.hours")}</span>
                                    <input className="input" value={seeker.hours} onChange={(e) => updateSeeker("hours", e.target.value)} />
                                </label>
                                <label className="jb-field jb-field--full">
                                    <span>{t("jobs.licenses")}</span>
                                    <input className="input" value={seeker.licenses} onChange={(e) => updateSeeker("licenses", e.target.value)} />
                                </label>
                                <label className="jb-field">
                                    <span>{t("jobs.contactEmail")}</span>
                                    <input className="input" type="email" value={seeker.contactEmail} onChange={(e) => updateSeeker("contactEmail", e.target.value)} />
                                </label>
                                <label className="jb-field">
                                    <span>{t("jobs.contactPhone")}</span>
                                    <input className="input" value={seeker.contactPhone} onChange={(e) => updateSeeker("contactPhone", e.target.value)} />
                                </label>
                                <label className="jb-field jb-field--full">
                                    <span>{t("jobs.experience")}</span>
                                    <textarea className="input jb-textarea" rows={5} value={seeker.experience} onChange={(e) => updateSeeker("experience", e.target.value)} required />
                                </label>
                                <label className="jb-field jb-field--full">
                                    <span>{t("jobs.photo")}</span>
                                    <input className="input" type="file" accept="image/*" onChange={onPhotoChange} />
                                </label>
                            </div>
                            <button className="primary" type="submit" disabled={!seekerReady}>
                                {t("jobs.publishSeeker")}
                            </button>
                        </form>
                    </section>
                ) : null}

                {view === "contratando" && user ? (
                    <section className="jb-form-shell">
                        <div className="jb-form-head">
                            <div>
                                <h2>{t("jobs.hiringFormTitle")}</h2>
                                <p>{t("jobs.hiringFormLead")}</p>
                            </div>
                            <button type="button" className="secondary" onClick={() => goBrowse("vagas")}>
                                {t("jobs.back")}
                            </button>
                        </div>
                        <form className="jb-form" onSubmit={publishHiring}>
                            <div className="jb-form-grid">
                                <label className="jb-field">
                                    <span>{t("jobs.companyName")}</span>
                                    <input className="input" value={hiring.companyName} onChange={(e) => updateHiring("companyName", e.target.value)} required />
                                </label>
                                <label className="jb-field">
                                    <span>{t("jobs.roleTitle")}</span>
                                    <input className="input" value={hiring.roleTitle} onChange={(e) => updateHiring("roleTitle", e.target.value)} required />
                                </label>
                                <label className="jb-field">
                                    <span>{t("jobs.jobLocation")}</span>
                                    <input className="input" value={hiring.location} onChange={(e) => updateHiring("location", e.target.value)} />
                                </label>
                                <label className="jb-field">
                                    <span>{t("jobs.aircraft")}</span>
                                    <input
                                        className="input"
                                        value={hiring.aircraft}
                                        onChange={(e) => updateHiring("aircraft", e.target.value)}
                                        placeholder={t("jobs.aircraftPlaceholder")}
                                    />
                                </label>
                                <label className="jb-field">
                                    <span>{t("jobs.workMode")}</span>
                                    <select className="input" value={hiring.workMode} onChange={(e) => updateHiring("workMode", e.target.value)}>
                                        <option value="presencial">{t("jobs.workOnsite")}</option>
                                        <option value="hibrido">{t("jobs.workHybrid")}</option>
                                        <option value="remoto">{t("jobs.workRemote")}</option>
                                    </select>
                                </label>
                                <label className="jb-field">
                                    <span>{t("jobs.contractType")}</span>
                                    <select className="input" value={hiring.contractType} onChange={(e) => updateHiring("contractType", e.target.value)}>
                                        <option value="clt">CLT</option>
                                        <option value="pj">PJ</option>
                                        <option value="estagio">{t("jobs.contractIntern")}</option>
                                    </select>
                                </label>
                                <label className="jb-field jb-field--full">
                                    <span>{t("jobs.jobDescription")}</span>
                                    <textarea className="input jb-textarea" rows={5} value={hiring.description} onChange={(e) => updateHiring("description", e.target.value)} required />
                                </label>
                                <label className="jb-field jb-field--full">
                                    <span>{t("jobs.requirements")}</span>
                                    <textarea
                                        className="input jb-textarea"
                                        rows={3}
                                        value={hiring.requirements}
                                        onChange={(e) => updateHiring("requirements", e.target.value)}
                                        placeholder={t("jobs.requirementsPlaceholder")}
                                    />
                                </label>
                                <label className="jb-field">
                                    <span>{t("jobs.contactEmail")}</span>
                                    <input className="input" type="email" value={hiring.contactEmail} onChange={(e) => updateHiring("contactEmail", e.target.value)} />
                                </label>
                                <label className="jb-field">
                                    <span>{t("jobs.contactPhone")}</span>
                                    <input className="input" value={hiring.contactPhone} onChange={(e) => updateHiring("contactPhone", e.target.value)} />
                                </label>
                                <label className="jb-field jb-field--full">
                                    <span>{t("jobs.contactOther")}</span>
                                    <input className="input" value={hiring.contactOther} onChange={(e) => updateHiring("contactOther", e.target.value)} />
                                </label>
                            </div>
                            <button className="primary" type="submit" disabled={!hiringReady}>
                                {t("jobs.publishJob")}
                            </button>
                        </form>
                    </section>
                ) : null}

                {note ? <p className="jb-toast">{note}</p> : null}
            </div>
        </AviationShell>
    );
}
