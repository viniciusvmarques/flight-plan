import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import BrandMark from "../components/BrandMark";

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetBanner, setResetBanner] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  useEffect(() => {
    if (location.state?.resetOk) setResetBanner(true);
  }, [location.state]);

  const canSubmit = useMemo(() => email.trim() && password.trim(), [email, password]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setUnverifiedEmail("");
    if (!canSubmit) return;

    try {
      setLoading(true);
      await login({ email, password });
      nav("/");
    } catch (err) {
      if (err?.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(err?.email || email);
      }
      setError(err?.message || "Falha ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card" role="region" aria-label="Entrar">
        <div className="auth-head">
          <button type="button" className="auth-back" onClick={() => nav(-1)}>
            ← Voltar
          </button>
          <div className="auth-brand" onClick={() => nav("/")} role="button" tabIndex={0}>
            <BrandMark size={46} />
          </div>
          <div className="auth-spacer" />
        </div>

        <div className="auth-body">
          <h1>Entrar</h1>
          <p>Acesse sua conta para salvar briefings, favoritos e planejamento.</p>

          {resetBanner && (
            <div className="auth-success auth-banner">
              Senha redefinida com sucesso. Entre com a nova senha.
            </div>
          )}

          <form onSubmit={onSubmit} className="auth-form">
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

            <label>
              <span>Senha</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>

            {error && <div className="auth-error">⚠ {error}</div>}

            {unverifiedEmail ? (
              <div className="auth-info">
                Sua conta ainda está pendente de confirmação.{" "}
                <Link to="/verify-email" state={{ email: unverifiedEmail }}>
                  Reenviar link de ativação
                </Link>
              </div>
            ) : null}

            <button className="btn-primary" disabled={loading || !canSubmit}>
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <div className="auth-links">
              <button type="button" className="btn-ghost" onClick={() => nav("/forgot")}
                title="Recuperar senha">
                Esqueci minha senha
              </button>
              <Link to="/register">Criar conta</Link>
            </div>
          </form>

          <div className="auth-hint">Login com e-mail e senha (backend Prisma + Postgres).</div>
        </div>
      </div>

    </div>
  );
}
