import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import BrandMark from "../components/BrandMark";
import { api } from "../services/apiClient";

export default function ResetPassword() {
    const nav = useNavigate();
    const [params] = useSearchParams();
    const token = params.get("token") || "";

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [hint, setHint] = useState("");

    useEffect(() => {
        if (!token) {
            setHint(
                "Use o link completo enviado por e-mail. Em desenvolvimento, copie a URL exibida no terminal do backend."
            );
        } else {
            setHint("");
        }
    }, [token]);

    const canSubmit = useMemo(() => password.length >= 6 && password === confirm, [password, confirm]);

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        if (!token) {
            setError("Link incompleto. Abra o endereço que veio no e-mail ou no terminal do backend.");
            return;
        }
        if (!canSubmit) return;
        try {
            setLoading(true);
            await api("/auth/reset-password", {
                method: "POST",
                body: { token, password },
                auth: false,
            });
            nav("/login", { replace: true, state: { resetOk: true } });
        } catch (err) {
            setError(err?.message || "Não foi possível redefinir a senha.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-wrap">
            <div className="auth-card" role="region" aria-label="Nova senha">
                <div className="auth-head">
                    <button type="button" className="auth-back" onClick={() => nav("/login")}>
                        ← Voltar
                    </button>
                    <div className="auth-brand" onClick={() => nav("/")} role="button" tabIndex={0}>
                        <BrandMark size={46} />
                    </div>
                    <div className="auth-spacer" />
                </div>

                <div className="auth-body">
                    <h1>Nova senha</h1>
                    <p>Escolha uma senha com pelo menos 6 caracteres.</p>

                    {hint && <div className="auth-info">{hint}</div>}

                    <form className="auth-form" onSubmit={onSubmit}>
                        <label>
                            <span>Nova senha</span>
                            <input
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                autoComplete="new-password"
                                minLength={6}
                                required
                            />
                        </label>
                        <label>
                            <span>Confirmar senha</span>
                            <input
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                type="password"
                                autoComplete="new-password"
                                minLength={6}
                                required
                            />
                        </label>

                        {error && <div className="auth-error">⚠ {error}</div>}

                        <button className="btn-primary" type="submit" disabled={loading || !canSubmit}>
                            {loading ? "Salvando..." : "Salvar nova senha"}
                        </button>
                    </form>

                    <div className="auth-links auth-links--compact">
                        <Link to="/login">Ir ao login</Link>
                        <Link to="/forgot">Pedir novo link</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
