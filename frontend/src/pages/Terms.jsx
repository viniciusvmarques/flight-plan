import { useNavigate } from "react-router-dom";
import { legalVersions, siteProfile } from "../content/siteProfile";

export default function Terms() {
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
                    <span className="chip">Termos de uso</span>
                    <span className="chip">Versão {legalVersions.terms}</span>
                </div>
                <h1>Termos de uso</h1>
                <p>
                    A {siteProfile.brandName} é uma ferramenta de apoio à decisão para pilotos e operadores, com foco em briefing meteorológico, acompanhamento de rota e planejamento didático. Ao utilizar o serviço, você concorda em fazê-lo por sua conta e risco, respeitando estes termos.
                </p>
                <div className="auth-info legal-note">{siteProfile.operationalDisclaimer}</div>
                <h2>Uso</h2>
                <ul>
                    <li>O conteúdo é informativo e educacional; não substitui briefing oficial, NOTAM, cartas ou despacho.</li>
                    <li>Você é responsável por validar dados operacionais junto às fontes oficiais (ANAC, DECEA, AIS/MET).</li>
                    <li>É proibido usar o serviço para fins ilegais ou para sobrecarregar os sistemas (scraping abusivo).</li>
                </ul>
                <h2>Conta</h2>
                <p>
                    Você deve manter suas credenciais em sigilo. Podemos suspender contas em caso de uso indevido ou fraude.
                </p>
                <h2>Assinaturas e recursos pagos</h2>
                <p>
                    Recursos premium podem depender de cobrança recorrente via plataforma terceirizada. Condições comerciais, cancelamento e renovação são tratadas também na política comercial específica da área de assinatura.
                </p>
                <h2>Limitação de responsabilidade</h2>
                <p>
                    A responsabilidade final por planejamento, despacho, performance, documentação e decisão operacional permanece com o usuário e, quando aplicável, com o operador responsável. A plataforma não garante disponibilidade contínua nem adequação a uma operação específica.
                </p>
                <h2>Propriedade intelectual</h2>
                <p>
                    Interface, identidade visual, textos, fluxos e organização do produto pertencem à operação da {siteProfile.brandName}, ressalvados dados de terceiros e fontes públicas licenciadas.
                </p>
                <h2>Contato e identificação</h2>
                {hasLegalIdentity ? (
                    <p>
                        Operação identificada como <strong>{siteProfile.legalName}</strong>, documento <strong>{siteProfile.documentId}</strong>, base em <strong>{siteProfile.cityCountry}</strong>. Contato principal: <strong>{siteProfile.supportEmail}</strong>.
                    </p>
                ) : (
                    <p>
                        Contato principal para suporte, assuntos comerciais e dúvidas institucionais: <strong>{siteProfile.supportEmail}</strong>.
                    </p>
                )}
                <h2>Alterações</h2>
                <p>Podemos atualizar estes termos; o uso continuado após mudanças constitui aceitação.</p>
            </div>
        </div>
    );
}
