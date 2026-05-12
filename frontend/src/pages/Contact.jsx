import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandMark from "../components/Brandmark";
import { api } from "../services/apiClient";
import { contactSubjects, siteProfile } from "../content/siteProfile";

export default function Contact() {
    const nav = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", subject: contactSubjects[0], message: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const hasOperationalBase = Boolean(siteProfile.cityCountry);

    const canSubmit = useMemo(() => {
        return form.name.trim().length >= 2 && form.email.trim().length >= 5 && form.subject.trim().length >= 3 && form.message.trim().length >= 20;
    }, [form]);

    function updateField(key, value) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (!canSubmit) return;
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await api("/api/contact", {
                method: "POST",
                body: form,
            });
            setSuccess(response?.message || "Recebemos sua mensagem e retornaremos em breve.");
            setForm({ name: "", email: "", subject: contactSubjects[0], message: "" });
        } catch (err) {
            setError(err?.message || "Não foi possível enviar sua mensagem agora.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-wrap">
            <div className="auth-card auth-card--wide" role="region" aria-label="Contato e suporte">
                <div className="auth-head">
                    <button type="button" className="auth-back" onClick={() => nav(-1)}>
                        ← Voltar
                    </button>
                    <div className="auth-brand" onClick={() => nav("/")} role="button" tabIndex={0}>
                        <BrandMark size={46} />
                    </div>
                    <div className="auth-spacer" />
                </div>

                <div className="auth-body auth-grid">
                    <div className="auth-pane">
                        <div>
                            <h1>Contato e suporte</h1>
                            <p>Use este canal para suporte técnico, cobrança, cancelamento, privacidade e assuntos institucionais.</p>
                        </div>

                        {error ? <div className="auth-error">{error}</div> : null}
                        {success ? <div className="auth-success">{success}</div> : null}

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <label>
                                <span>Nome</span>
                                <input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Seu nome" required />
                            </label>

                            <label>
                                <span>E-mail</span>
                                <input
                                    value={form.email}
                                    onChange={(e) => updateField("email", e.target.value)}
                                    placeholder="seuemail@exemplo.com"
                                    type="email"
                                    required
                                />
                            </label>

                            <label>
                                <span>Assunto</span>
                                <select className="input auth-select" value={form.subject} onChange={(e) => updateField("subject", e.target.value)}>
                                    {contactSubjects.map((subject) => (
                                        <option key={subject} value={subject}>
                                            {subject}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                <span>Mensagem</span>
                                <textarea
                                    className="auth-textarea"
                                    value={form.message}
                                    onChange={(e) => updateField("message", e.target.value)}
                                    placeholder="Descreva seu pedido com contexto suficiente para nossa equipe responder."
                                    rows={7}
                                    required
                                />
                            </label>

                            <button className="btn-primary" type="submit" disabled={loading || !canSubmit}>
                                {loading ? "Enviando..." : "Enviar mensagem"}
                            </button>
                        </form>
                    </div>

                    <div className="auth-pane auth-pane--soft">
                        <h2>Atendimento</h2>
                        <div className="legal-meta-list">
                            <div>
                                <strong>Suporte:</strong> {siteProfile.supportEmail}
                            </div>
                            <div>
                                <strong>Privacidade:</strong> {siteProfile.privacyEmail}
                            </div>
                            <div>
                                <strong>Horário:</strong> {siteProfile.supportHours}
                            </div>
                            {hasOperationalBase ? (
                                <div>
                                    <strong>Base operacional:</strong> {siteProfile.cityCountry}
                                </div>
                            ) : null}
                        </div>

                        <div className="auth-info">
                            Este canal não substitui comunicação operacional crítica, despacho de voo ou atendimento emergencial.
                        </div>

                        <p className="muted">{siteProfile.companyNotice}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
