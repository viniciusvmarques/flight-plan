import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Sidebar({ onBrief, children }) {
    const { user, logout } = useAuth();
    const nav = useNavigate();

    const [origin, setOrigin] = useState("");
    const [dest, setDest] = useState("");
    const [alternate, setAlternate] = useState("");

    useEffect(() => {
        try {
            const raw = localStorage.getItem("fp_last_briefing");
            if (!raw) return;
            const j = JSON.parse(raw);
            if (j?.origin?.icao) setOrigin(j.origin.icao);
            if (j?.dest?.icao) setDest(j.dest.icao);
            if (j?.alternate?.icao) setAlternate(j.alternate.icao);
        } catch {
            /* ignore */
        }
    }, []);

    function onSubmit(e) {
        e.preventDefault();
        if (!onBrief) return;
        onBrief(origin, dest, alternate);
    }

    const plan = user?.plan ? String(user.plan).toUpperCase() : "FREE";

    return (
        <aside className="fp-sidebar" aria-label="Briefing e rota">
            <div className="fp-sidebar-inner">
                <div className="fp-sidebar-head">
                    <div className="fp-sidebar-eyebrow">Painel Operacional</div>
                    <div className="fp-sidebar-caption">Monte a rota, gere o briefing e acompanhe o planejamento do voo.</div>
                </div>

                <form className="fp-brief-form" onSubmit={onSubmit}>
                    <h2 className="fp-sidebar-title">Nova rota</h2>
                    <p className="fp-sidebar-lead">Informe ICAO de 4 letras e gere o briefing operacional.</p>

                    <div className="field">
                        <label htmlFor="fp-origin">A · Origem *</label>
                        <input
                            id="fp-origin"
                            className="input"
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                            placeholder="SBSP"
                            maxLength={4}
                            autoComplete="off"
                            spellCheck={false}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="fp-dest">B · Destino</label>
                        <input
                            id="fp-dest"
                            className="input"
                            value={dest}
                            onChange={(e) => setDest(e.target.value.toUpperCase())}
                            placeholder="SBGR"
                            maxLength={4}
                            autoComplete="off"
                            spellCheck={false}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="fp-alt">C · Alternativa</label>
                        <input
                            id="fp-alt"
                            className="input"
                            value={alternate}
                            onChange={(e) => setAlternate(e.target.value.toUpperCase())}
                            placeholder="SBMT"
                            maxLength={4}
                            autoComplete="off"
                            spellCheck={false}
                        />
                    </div>

                    <button type="submit" className="primary">
                        Gerar briefing operacional
                    </button>
                </form>

                {children}

                <div className="fp-sidebar-account">
                    {user ? (
                        <>
                            <div className="fp-account-row">
                                <span className="fp-account-email" title={user.email}>
                                    {user.email}
                                </span>
                                <span className={`fp-plan-pill fp-plan-pill--${plan === "PRO" ? "pro" : "free"}`}>{plan}</span>
                            </div>
                            <div className="fp-account-actions">
                                <Link className="fp-link-btn" to="/perfil">
                                    Perfil
                                </Link>
                                <Link className="fp-link-btn" to="/assinatura">
                                    Plano
                                </Link>
                                <button
                                    type="button"
                                    className="fp-link-btn fp-link-btn--ghost"
                                    onClick={() => {
                                        logout();
                                        nav("/");
                                    }}
                                >
                                    Sair
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="fp-sidebar-lead">Entre para salvar briefings, sincronizar favoritos e continuar o planejamento.</p>
                            <div className="fp-account-actions">
                                <Link className="fp-link-btn fp-link-btn--primary" to="/login">
                                    Entrar
                                </Link>
                                <Link className="fp-link-btn" to="/register">
                                    Criar conta
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </aside>
    );
}
