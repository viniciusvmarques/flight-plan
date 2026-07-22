export const legalContent = {
    "pt-BR": {
        termsIntro:
            "A Marquisa é uma ferramenta de apoio à decisão para pilotos e operadores, com foco em briefing meteorológico, acompanhamento de rota e planejamento didático. Ao utilizar o serviço, você concorda em fazê-lo por sua conta e risco, respeitando estes termos.",
        use: [
            "O conteúdo é informativo e educacional; não substitui briefing oficial, NOTAM, cartas ou despacho.",
            "Você é responsável por validar dados operacionais junto às fontes oficiais, como ANAC, DECEA e AIS/MET.",
            "É proibido usar o serviço para fins ilegais ou para sobrecarregar sistemas.",
        ],
        account:
            "Você deve manter suas credenciais em sigilo. Podemos suspender contas em caso de uso indevido ou fraude. A exclusão da conta pode ser solicitada pelo Perfil, observadas retenções legais descritas na Política de Privacidade.",
        paid:
            "Recursos premium podem depender de cobrança recorrente por plataforma terceirizada. Condições de cancelamento, renovação, reembolso e arrependimento seguem a política comercial publicada.",
        liability:
            "A responsabilidade final por planejamento, despacho, performance, documentação e decisão operacional permanece com o usuário e, quando aplicável, com o operador responsável.",
        intellectual:
            "Interface, identidade visual, textos, fluxos e organização do produto pertencem à operação da Marquisa, ressalvados dados de terceiros e fontes públicas licenciadas.",
        privacyIntro:
            "Esta política resume como tratamos dados pessoais relacionados ao uso da Marquisa, incluindo conta, briefings salvos, favoritos, mensagens de contato e jornada comercial.",
        data: [
            "E-mail e senha com hash para autenticação.",
            "Dados opcionais salvos no plano Pro, como briefings, favoritos e perfis de aeronave.",
            "Metadados mínimos de segurança e conformidade, como IP, user-agent, consentimentos e registros transacionais.",
            "Mensagens enviadas por formulários de contato e registros de e-mails transacionais relevantes para suporte.",
        ],
        usePrivacy:
            "Utilizamos os dados para prestar o serviço, melhorar a experiência, prevenir fraude, atender solicitações e cumprir obrigações legais. Não vendemos listas de e-mails.",
        sharing:
            "Alguns dados podem ser compartilhados com operadores essenciais, como hospedagem, e-mail transacional e processamento de pagamentos.",
        rights:
            "Você pode solicitar acesso, correção ou exclusão de dados conforme a LGPD pelo e-mail de privacidade. Usuários logados também podem iniciar a exclusão pelo Perfil.",
        cancellationIntro:
            "Esta política resume como funcionam teste gratuito, renovação recorrente, cancelamento e suporte comercial da Marquisa.",
        cancellationItems: [
            "O cancelamento deve ser feito pelo usuário no portal de assinatura ou solicitado pelo canal oficial de suporte.",
            "Quando programado, o acesso premium permanece ativo até o fim do ciclo já pago ou período de teste.",
            "Após o encerramento, a conta retorna ao plano Free.",
            "Histórico comercial e mensagens transacionais podem ser mantidos para suporte, segurança e obrigações legais.",
        ],
        refundItems: [
            "Cancelamento interrompe renovações futuras; não significa automaticamente reembolso de ciclo já iniciado.",
            "Cobrança duplicada, erro operacional, falha técnica relevante ou cobrança após cancelamento devem ser enviados ao suporte com comprovante.",
            "Quando aprovado, o reembolso é processado pelo provedor de pagamento e pode depender de prazos bancários/cartão.",
        ],
        invoiceNotice:
            "No momento, a contratação da Marquisa é realizada com disponibilização de comprovante/recibo de pagamento. A emissão de Nota Fiscal de Serviço ainda não está disponível.",
        companyNotice:
            "Para solicitações institucionais, comerciais ou relacionadas à LGPD, utilize os canais oficiais publicados nesta página.",
        operationIdentity: (legalName, documentId, cityCountry, supportEmail) =>
            `Operação identificada como ${legalName}, documento ${documentId}, base em ${cityCountry}. Contato principal: ${supportEmail}.`,
        controllerIdentity: (legalName, documentId, cityCountry) =>
            `Controlador identificado como ${legalName}, documento ${documentId}, base em ${cityCountry}.`,
        privacyRequests: (email) =>
            `Solicitações relacionadas à privacidade, LGPD e dados pessoais devem ser encaminhadas para ${email}.`,
        storage:
            "Informações ficam em servidores protegidos. Senhas são armazenadas com hash; não armazenamos senha em texto puro.",
        changes: "Podemos atualizar estes termos; o uso continuado após mudanças constitui aceitação.",
        planTrial: (trialLabel) =>
            `O plano Pro é comercializado em cobrança recorrente, com condição promocional inicial de ${trialLabel}, sujeita às regras da plataforma de pagamento e à política comercial vigente.`,
        recurring:
            "Ao contratar o plano Pro, a assinatura é renovada automaticamente ao fim de cada ciclo, salvo cancelamento prévio realizado pelo próprio usuário na área de assinatura ou no portal da cobrança.",
        paymentFailures:
            "Em caso de falha de cobrança, a assinatura pode entrar em estado pendente ou vencido. Nessa situação, recursos premium podem ser restringidos até a regularização financeira.",
        commercialContact: (email) =>
            `Para pedidos de suporte, cancelamento, direitos do consumidor ou dúvidas sobre cobrança, utilize o canal ${email}.`,
        commercialNote:
            "Cancelamentos, dúvidas sobre assinatura e tratativas comerciais são centralizados pelo canal oficial de suporte.",
    },
    en: {
        termsIntro:
            "Marquisa is a decision-support tool for pilots and operators, focused on weather briefing, route monitoring and didactic flight planning. By using the service, you agree to use it at your own risk and under these terms.",
        use: [
            "The content is informational and educational; it does not replace official briefing, NOTAMs, charts or dispatch.",
            "You are responsible for validating operational data with official sources, including ANAC, DECEA and AIS/MET where applicable.",
            "You may not use the service for illegal purposes or to overload systems.",
        ],
        account:
            "You must keep your credentials confidential. We may suspend accounts in case of misuse or fraud. Account deletion can be requested from the Profile page, subject to lawful retention described in the Privacy Policy.",
        paid:
            "Premium resources may depend on recurring billing through a third-party platform. Cancellation, renewal, refund and withdrawal conditions follow the published commercial policy.",
        liability:
            "Final responsibility for planning, dispatch, performance, documentation and operational decisions remains with the user and, when applicable, the responsible operator.",
        intellectual:
            "The interface, visual identity, texts, flows and product organization belong to Marquisa, except for third-party data and licensed public sources.",
        privacyIntro:
            "This policy summarizes how we process personal data related to Marquisa, including account data, saved briefings, favorites, contact messages and commercial journey.",
        data: [
            "Email and hashed password for authentication.",
            "Optional Pro-plan data, such as briefings, favorites and aircraft profiles.",
            "Minimum security and compliance metadata, such as IP, user-agent, consents and transactional records.",
            "Contact-form messages and transactional email records relevant to support.",
        ],
        usePrivacy:
            "We use data to provide the service, improve experience, prevent fraud, answer requests and comply with legal obligations. We do not sell email lists.",
        sharing:
            "Some data may be shared with essential processors such as hosting, transactional email and payment processing providers.",
        rights:
            "You may request access, correction or deletion of data through the privacy email. Logged-in users can also start account deletion from the Profile page.",
        cancellationIntro:
            "This policy summarizes how the trial, recurring renewal, cancellation and commercial support work for Marquisa.",
        cancellationItems: [
            "Cancellation must be done by the user in the subscription portal or requested through official support.",
            "When scheduled, premium access remains active until the end of the paid cycle or trial period.",
            "After the cycle ends, the account returns to the Free plan.",
            "Commercial history and transactional messages may be retained for support, security and legal obligations.",
        ],
        refundItems: [
            "Cancellation stops future renewals; it does not automatically refund an already-started cycle.",
            "Duplicate charges, operational error, relevant technical failure or charge after cancellation must be sent to support with proof.",
            "When approved, refunds are processed by the payment provider and may depend on bank/card deadlines.",
        ],
        invoiceNotice:
            "At this time, Marquisa subscriptions include a payment receipt. Service invoice (Nota Fiscal) issuance is not yet available.",
        companyNotice:
            "For institutional, commercial or privacy requests, use the official channels published on this page.",
        operationIdentity: (legalName, documentId, cityCountry, supportEmail) =>
            `Operation identified as ${legalName}, document ${documentId}, based in ${cityCountry}. Main contact: ${supportEmail}.`,
        controllerIdentity: (legalName, documentId, cityCountry) =>
            `Controller identified as ${legalName}, document ${documentId}, based in ${cityCountry}.`,
        privacyRequests: (email) =>
            `Privacy, data-protection and personal-data requests should be sent to ${email}.`,
        storage:
            "Information is stored on protected servers. Passwords are stored with hashing; we do not store plain-text passwords.",
        changes: "We may update these terms; continued use after changes means acceptance.",
        planTrial: (trialLabel) =>
            `The Pro plan is sold with recurring billing and an initial promotional condition of ${trialLabel}, subject to payment-platform rules and the current commercial policy.`,
        recurring:
            "When subscribing to Pro, the subscription renews automatically at the end of each cycle unless cancelled beforehand in the subscription area or billing portal.",
        paymentFailures:
            "If payment fails, the subscription may become pending or past due. Premium resources may be restricted until the payment is resolved.",
        commercialContact: (email) =>
            `For support, cancellation, consumer-rights requests or billing questions, use ${email}.`,
        commercialNote:
            "Cancellations, subscription questions and commercial follow-up are handled through the official support channel.",
    },
    es: {
        termsIntro:
            "Marquisa es una herramienta de apoyo a la decisión para pilotos y operadores, enfocada en briefing meteorológico, seguimiento de ruta y planificación didáctica. Al usar el servicio, aceptas hacerlo bajo tu responsabilidad y estos términos.",
        use: [
            "El contenido es informativo y educativo; no sustituye briefing oficial, NOTAM, cartas o despacho.",
            "Eres responsable de validar datos operacionales con fuentes oficiales, incluyendo ANAC, DECEA y AIS/MET cuando aplique.",
            "Está prohibido usar el servicio para fines ilegales o para sobrecargar sistemas.",
        ],
        account:
            "Debes mantener tus credenciales en secreto. Podemos suspender cuentas por uso indebido o fraude. La eliminación de cuenta puede solicitarse desde Perfil, con las retenciones legales descritas en la Política de Privacidad.",
        paid:
            "Los recursos premium pueden depender de cobro recurrente por una plataforma externa. Cancelación, renovación, reembolso y arrepentimiento siguen la política comercial publicada.",
        liability:
            "La responsabilidad final por planificación, despacho, performance, documentación y decisión operacional permanece con el usuario y, cuando aplique, con el operador responsable.",
        intellectual:
            "La interfaz, identidad visual, textos, flujos y organización del producto pertenecen a Marquisa, excepto datos de terceros y fuentes públicas licenciadas.",
        privacyIntro:
            "Esta política resume cómo tratamos datos personales relacionados con Marquisa, incluyendo cuenta, briefings guardados, favoritos, mensajes de contacto y jornada comercial.",
        data: [
            "Email y contraseña con hash para autenticación.",
            "Datos opcionales del plan Pro, como briefings, favoritos y perfiles de aeronave.",
            "Metadatos mínimos de seguridad y conformidad, como IP, user-agent, consentimientos y registros transaccionales.",
            "Mensajes de formularios de contacto y registros de emails transaccionales relevantes para soporte.",
        ],
        usePrivacy:
            "Usamos los datos para prestar el servicio, mejorar la experiencia, prevenir fraude, responder solicitudes y cumplir obligaciones legales. No vendemos listas de emails.",
        sharing:
            "Algunos datos pueden compartirse con operadores esenciales, como hospedaje, email transaccional y procesamiento de pagos.",
        rights:
            "Puedes solicitar acceso, corrección o eliminación de datos por el email de privacidad. Usuarios conectados también pueden iniciar la eliminación desde Perfil.",
        cancellationIntro:
            "Esta política resume cómo funcionan la prueba, renovación recurrente, cancelación y soporte comercial de Marquisa.",
        cancellationItems: [
            "La cancelación debe hacerla el usuario en el portal de suscripción o solicitarse por el soporte oficial.",
            "Cuando se programa, el acceso premium permanece activo hasta el fin del ciclo pagado o prueba.",
            "Después del ciclo, la cuenta vuelve al plan Gratis.",
            "Historial comercial y mensajes transaccionales pueden mantenerse para soporte, seguridad y obligaciones legales.",
        ],
        refundItems: [
            "La cancelación interrumpe renovaciones futuras; no reembolsa automáticamente un ciclo ya iniciado.",
            "Cobro duplicado, error operacional, falla técnica relevante o cobro después de cancelación deben enviarse al soporte con comprobante.",
            "Cuando se aprueba, el reembolso es procesado por el proveedor de pago y puede depender de plazos bancarios/tarjeta.",
        ],
        invoiceNotice:
            "Por ahora, la contratación de Marquisa incluye comprobante/recibo de pago. La emisión de factura fiscal aún no está disponible.",
        companyNotice:
            "Para solicitudes institucionales, comerciales o de privacidad, use los canales oficiales publicados en esta página.",
        operationIdentity: (legalName, documentId, cityCountry, supportEmail) =>
            `Operación identificada como ${legalName}, documento ${documentId}, con base en ${cityCountry}. Contacto principal: ${supportEmail}.`,
        controllerIdentity: (legalName, documentId, cityCountry) =>
            `Controlador identificado como ${legalName}, documento ${documentId}, con base en ${cityCountry}.`,
        privacyRequests: (email) =>
            `Las solicitudes de privacidad y datos personales deben enviarse a ${email}.`,
        storage:
            "La información se almacena en servidores protegidos. Las contraseñas se guardan con hash; no almacenamos contraseñas en texto plano.",
        changes: "Podemos actualizar estos términos; el uso continuado después de cambios constituye aceptación.",
        planTrial: (trialLabel) =>
            `El plan Pro se comercializa con cobro recurrente y una condición promocional inicial de ${trialLabel}, sujeta a las reglas de la plataforma de pago y la política comercial vigente.`,
        recurring:
            "Al contratar Pro, la suscripción se renueva automáticamente al final de cada ciclo salvo cancelación previa en el área de suscripción o portal de cobro.",
        paymentFailures:
            "En caso de falla de pago, la suscripción puede quedar pendiente o vencida. Los recursos premium pueden restringirse hasta la regularización.",
        commercialContact: (email) =>
            `Para soporte, cancelación, derechos del consumidor o dudas de cobro, utilice ${email}.`,
        commercialNote:
            "Cancelaciones, dudas de suscripción y gestiones comerciales se centralizan en el canal oficial de soporte.",
    },
};

export function getLegalContent(locale) {
    const raw = String(locale || "").toLowerCase();
    if (raw.startsWith("en")) return legalContent.en;
    if (raw.startsWith("es")) return legalContent.es;
    return legalContent["pt-BR"];
}
