import { Link, useNavigate } from "react-router-dom";
import BrandMark from "./BrandMark";
import { useAuth } from "../auth/AuthContext";

export default function AppHeader({ kicker = "Marquisa", title = "Centro de operações", subtitle = "" }) {
    const nav = useNavigate();
    const { user } = useAuth();

    return (
        <header className="fp-topbar" role="banner">
            <div className="fp-topbar-inner">
                <button type="button" className="fp-topbar-brand" onClick={() => nav("/")} aria-label="Ir ao briefing">
                    <BrandMark size={38} showText={false} compact />
                    <div className="fp-topbar-titles">
                        <span className="fp-topbar-kicker">{kicker}</span>
                        <span className="fp-topbar-title">{title}</span>
                        {subtitle ? <span className="fp-topbar-sub">{subtitle}</span> : null}
                    </div>
                </button>

                <nav className="fp-topbar-nav" aria-label="Principal">
                    <Link className="fp-nav-link" to="/">
                        Briefing
                    </Link>
                    {user ? (
                        <>
                            <Link className="fp-nav-link" to="/perfil">
                                Conta
                            </Link>
                            <Link className="fp-nav-link" to="/assinatura">
                                Assinatura
                            </Link>
                        </>
                    ) : (
                        <Link className="fp-nav-link fp-nav-link--accent" to="/login">
                            Entrar
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
