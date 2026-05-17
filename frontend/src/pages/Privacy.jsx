import { useNavigate } from "react-router-dom";
import { legalVersions, siteProfile } from "../content/siteProfile";

export default function Privacy() {
    const nav = useNavigate();
    const hasLegalIdentity = Boolean(siteProfile.legalName && siteProfile.documentId && siteProfile.cityCountry);

    return (
        <div className="auth-wrap">
            <div className="legal-card legal-card--wide">
                <div className="legal-back">
                    <button type="button" className="auth-back" onClick={() => nav(-1)}>
                        ← Voltar
                    </button>
                </div>
                <div className="legal-meta">
                    <span className="chip">Privacidade</span>
                    <span className="chip">Versão {legalVersions.privacy}</span>
                </div>
                <h1>Política de privacidade</h1>
                <p>
                    Esta política resume como tratamos dados pessoais relacionados ao uso da {siteProfile.brandName}, incluindo conta, briefings salvos, favoritos, mensagens de contato e jornada comercial.
                </p>
                <h2>Dados que coletamos</h2>
                <ul>
                    <li>E-mail e senha (hash) para autenticação.</li>
                    <li>Dados opcionais que você salvar no plano PRO (briefings, favoritos), associados à sua conta.</li>
                    <li>Metadados mínimos de segurança e conformidade, como IP, user-agent, consentimentos e registros transacionais.</li>
                    <li>Mensagens enviadas por formulários de contato e registros de e-mails transacionais relevantes para suporte.</li>
                </ul>
                <h2>Uso</h2>
                <p>
                    Utilizamos os dados para prestar o serviço, melhorar a experiência e cumprir obrigações legais. Não vendemos
                    sua lista de e-mails.
                </p>
                <h2>Base legal e finalidades</h2>
                <p>
                    O tratamento pode ocorrer para execução do serviço, cumprimento de obrigações legais e regulatórias, prevenção a fraudes, exercício regular de direitos e atendimento de solicitações do titular, conforme a LGPD.
                </p>
                <h2>Armazenamento</h2>
                <p>
                    Informações ficam em servidores protegidos (ex.: banco PostgreSQL). Senhas são armazenadas com hash; não
                    armazenamos senha em texto puro.
                </p>
                <p>{siteProfile.dataRetentionNotice}</p>
                <h2>Compartilhamento</h2>
                <p>
                    Alguns dados podem ser compartilhados com operadores essenciais ao funcionamento da plataforma, como infraestrutura de hospedagem, e-mail transacional e processamento de pagamentos.
                </p>
                <h2>Seus direitos</h2>
                <p>
                    Você pode solicitar informações, correção ou exclusão de dados da conta, conforme a LGPD, entrando em contato por {siteProfile.privacyEmail}. Usuários logados também podem iniciar a exclusão da própria conta pela página Perfil.
                </p>
                <p>
                    Quando uma solicitação envolver dados necessários para cobrança, prevenção a fraude, suporte, defesa de direitos ou cumprimento de obrigação legal, poderemos manter registros mínimos pelo prazo necessário, sempre limitados à finalidade aplicável.
                </p>
                <h2>Controlador e contato</h2>
                {hasLegalIdentity ? (
                    <p>
                        Controlador identificado como <strong>{siteProfile.legalName}</strong>, documento <strong>{siteProfile.documentId}</strong>, base em <strong>{siteProfile.cityCountry}</strong>.
                    </p>
                ) : (
                    <p>
                        Solicitações relacionadas à privacidade, LGPD e dados pessoais devem ser encaminhadas para <strong>{siteProfile.privacyEmail}</strong>.
                    </p>
                )}
                <div className="auth-info legal-note">{siteProfile.companyNotice}</div>
            </div>
        </div>
    );
}
