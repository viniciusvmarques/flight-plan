import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandMark from "../components/BrandMark";
import { api } from "../services/apiClient";

export default function ForgotPassword() {
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);

    const canSubmit = useMemo(() => email.trim().length > 3, [email]);

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        if (!canSubmit) return;
        try {
            setLoading(true);
            await api("/auth/forgot-password", {
                method: "POST",
                body: { email: email.trim() },
                auth: false,
            });
            setDone(true);
        } catch (err) {
            setError(err?.message || "Não foi possível enviar o pedido.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-wrap">
            <div className="auth-card" role="region" aria-label="Recuperar senha">
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
                    <h1>Esqueci minha senha</h1>
                    <p>
                        Informe o e-mail da sua conta. Se ele existir, enviamos um link para você criar uma nova senha.
                    </p>

                    {done ? (
                        <div className="auth-success">
                            Se existir uma conta com esse e-mail, você receberá instruções em alguns minutos. Verifique também o spam.
                            {import.meta.env.DEV && (
                                <div className="auth-info auth-info--inline">
                                    <strong>Ambiente dev:</strong> sem SMTP no servidor, o link de redefinição é impresso no{" "}
                                    <strong>terminal do backend</strong>.
                                </div>
                            )}
                        </div>
                    ) : (
                        <form className="auth-form" onSubmit={onSubmit}>
                            <label>
                                <span>E-mail</span>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seuemail@exemplo.com"
                                    type="email"
                                    autoComplete="email"
                                    required
                                />
                            </label>

                            {error && <div className="auth-error">⚠ {error}</div>}

                            <button className="btn-primary" type="submit" disabled={loading || !canSubmit}>
                                {loading ? "Enviando..." : "Enviar link"}
                            </button>
                        </form>
                    )}

                    <div className="auth-links auth-links--compact">
                        <Link to="/login">Voltar ao login</Link>
                        <Link to="/register">Criar conta</Link>
                    </div>

                    <div className="auth-hint">Por segurança, não informamos se o e-mail está cadastrado.</div>
                </div>
            </div>
        </div>
    );
}
