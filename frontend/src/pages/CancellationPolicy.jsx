import { useNavigate } from "react-router-dom";
import { legalVersions, siteProfile } from "../content/siteProfile";

export default function CancellationPolicy() {
    const nav = useNavigate();

    return (
        <div className="auth-wrap">
            <div className="legal-card legal-card--wide">
                <div className="legal-back">
                    <button type="button" className="auth-back" onClick={() => nav(-1)}>
                        ← Voltar
                    </button>
                </div>

                <div className="legal-meta">
                    <span className="chip">Política comercial</span>
                    <span className="chip">Versão {legalVersions.cancellation}</span>
                </div>

                <h1>Cancelamento, renovação e cobrança</h1>
                <p>
                    Esta política resume como funcionam o teste gratuito, a renovação recorrente, o cancelamento e o suporte comercial da {siteProfile.brandName}.
                </p>

                <h2>Plano e período de teste</h2>
                <p>
                    O plano Pro é comercializado em cobrança recorrente, com condição promocional inicial de {siteProfile.trialLabel}, sujeita às regras da plataforma de pagamento e à política comercial vigente.
                </p>

                <h2>Renovação recorrente</h2>
                <p>
                    Ao contratar o plano Pro, a assinatura é renovada automaticamente ao fim de cada ciclo, salvo cancelamento prévio realizado pelo próprio usuário na área de assinatura ou no portal da cobrança.
                </p>

                <h2>Cancelamento</h2>
                <ul>
                    <li>Quando o cancelamento é programado, o acesso premium permanece ativo até o fim do ciclo já pago ou do período de teste em vigor.</li>
                    <li>Após o encerramento do ciclo, a conta retorna ao plano FREE, com limitação aos recursos gratuitos disponíveis.</li>
                    <li>O histórico comercial e mensagens transacionais podem ser mantidos para fins de suporte, segurança e cumprimento de obrigações legais.</li>
                </ul>

                <h2>Falhas de pagamento</h2>
                <p>
                    Em caso de falha de cobrança, a assinatura pode entrar em estado pendente ou vencido. Nessa situação, recursos premium podem ser restringidos até a regularização financeira.
                </p>

                <h2>Reembolso e arrependimento</h2>
                <p>{siteProfile.refundSummary}</p>

                <h2>Contato comercial</h2>
                <p>
                    Para pedidos de suporte comercial, cancelamento, exercício de direitos do consumidor ou dúvidas sobre cobrança, utilize o canal {siteProfile.supportEmail}.
                </p>

                <div className="auth-info legal-note">
                    Cancelamentos, dúvidas comerciais e tratativas relacionadas à assinatura são centralizados pelo canal oficial de suporte.
                </div>
            </div>
        </div>
    );
}
