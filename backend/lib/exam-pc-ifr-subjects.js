/**
 * Banco temático PC/IFR — questões autorais alinhadas ao programa de
 * navegação rádio / IFR (NDB, VOR, DME, ILS, cartas, espera, planejamento).
 * Não reproduz texto de obras de terceiros.
 */

function q(stem, correct, distractors) {
  return { stem, correct, distractors };
}

function topic(topicName, reference, items, explanation) {
  return { topic: topicName, reference, items, explanation };
}

const REF_NAV = "Programa PC/IFR — navegação rádio e cartas";
const REF_REG = "RBAC 61/91, ICA 100-12 e MCA 100-11";
const REF_MET = "Meteorologia aeronáutica IFR";
const REF_PERF = "Manual de voo — performance e planejamento";
const REF_TEC = "Instrumentos e sistemas de voo IFR";

const D_NAV = [
  "uso exclusivo de mapa rodoviário",
  "dispensa de identificar o auxílio",
  "substitui o plano de voo IFR",
];

export const PC_IFR_SUBJECTS = [
  {
    key: "NAVIFR",
    label: "Navegação IFR",
    topics: [
      topic("NDB e ADF", REF_NAV, [
        q("no ADF, o ângulo medido do nariz da aeronave até a estação NDB é o", "rumo relativo (RB).", D_NAV),
        q("para obter rumo magnético da estação com ADF, usa-se a relação", "RB combinado com rumo magnético da aeronave (MB ≈ RB + MH).", D_NAV),
        q("identificar a estação NDB em voo IFR antes de navegar é necessário para", "confirmar o auxílio correto e evitar navegação para estação errada.", D_NAV),
        q("o RB no ADF é referenciado a partir do", "nariz da aeronave, não do eixo da pista.", D_NAV),
        q("navegação NDB com vento forte usando apenas homing tende a", "aumentar distância percorrida por curvar continuamente para o alvo.", D_NAV),
      ], "ADF trabalha com RB; vento exige tracking e identificação da estação."),
      topic("VOR e radiais", REF_NAV, [
        q("uma radial VOR é uma linha que", "sai da estação em direção magnética publicada.", D_NAV),
        q("com OBS em 090° e indicação TO centralizada, a aeronave está na semiesfera", "leste da estação, voando afastando-se ao longo da radial 090°.", D_NAV),
        q("CDI desviado à direita com flag TO indica correção inicial de", "proa para a direita até centralizar o CDI.", D_NAV),
        q("interceptar radial VOR com ângulo de 30° a 45° serve para", "facilitar captura suave sem overshoot excessivo.", D_NAV),
        q("flag FROM na indicação VOR significa que a aeronave está na semiesfera", "oposta àquela indicada pelo OBS para a mesma radial.", D_NAV),
      ], "Radiais e OBS definem posição e correções em navegação VOR."),
      topic("DME e ILS", REF_NAV, [
        q("a leitura DME representa, em geral,", "distância em linha reta (slant range) até o transponder.", D_NAV),
        q("em altitude baixa próxima à estação, DME pode", "indicar distância ligeiramente maior que a horizontal real.", D_NAV),
        q("o localizer do ILS fornece referência", "lateral em relação ao eixo de pista.", D_NAV),
        q("o glide path do ILS orienta a descida no", "plano vertical publicado até o trecho final.", D_NAV),
        q("marcadores OM/MM em ILS auxiliam a", "confirmar posição no segmento final de aproximação.", D_NAV),
      ], "DME e ILS são auxílios centrais em terminal e aproximação."),
      topic("Cartas IAC e segmentos", REF_NAV, [
        q("no segmento inicial de aproximação, o piloto deve observar", "altitudes mínimas, curso, distâncias e auxílios até o fixo final.", D_NAV),
        q("o ponto de aproximação perdida (MAP) indica onde", "inicia-se a subida de arremetida se não houver continuidade visual.", D_NAV),
        q("altitude mínima publicada em segmento de IAC protege contra", "obstáculos e terreno no trecho correspondente.", D_NAV),
        q("em aproximação não precisão, o controle de curso no final pode usar", "VOR, NDB, GNSS ou radial conforme publicado na IAC.", D_NAV),
        q("gradiente de aproximação perdida deve ser comparado com", "capacidade de subida da aeronave no peso e configuração atuais.", D_NAV),
      ], "IAC segmenta o procedimento e define limites de continuidade."),
      topic("SID, STAR e enroute", REF_NAV, [
        q("uma SID padroniza", "trajetórias de saída e reduz carga de coordenação no terminal.", D_NAV),
        q("restrições de altitude em STAR devem ser", "integradas ao plano de descida e à autorização ATS.", D_NAV),
        q("em carta enroute IFR, a MEA garante", "separação com obstáculos e, em geral, comunicação ATS na aerovia.", D_NAV),
        q("a MOCA pode ser menor que a MEA porque", "garante apenas proteção de obstáculo, não necessariamente comunicação.", D_NAV),
        q("divergir de rota publicada sem autorização pode causar", "conflito de tráfego e violação de espaço aéreo.", D_NAV),
      ], "Procedimentos publicados organizam terminal e rota IFR."),
      topic("Espera IFR", REF_NAV, [
        q("entrada direta em espera é adequada quando", "o ângulo de chegada ao fixo permite alinhar a perna de entrada.", D_NAV),
        q("em espera abaixo de 14 000 ft, tempo de perna em linha reta costuma ser", "1 minuto com vento e 1,5 minuto contra o vento (regra clássica de treino).", D_NAV),
        q("durante espera IFR, altitude atribuída deve ser mantida até", "nova autorização ou término da espera conforme procedimento.", D_NAV),
        q("espera prolongada impacta combustível porque", "consome autonomia sem progresso na rota.", D_NAV),
        q("vento forte na espera exige", "correções de tempo e rumo para manter proteção do fixo.", D_NAV),
      ], "Espera organiza fluxo e deve ser planejada no combustível."),
      topic("Triângulo de vento e planejamento", REF_NAV, [
        q("conhecer vento em rota IFR permite calcular", "proa verdadeira, GS e tempo de perna com maior precisão.", D_NAV),
        q("GS menor que TAS em perna indica, em geral,", "componente de vento contra a aeronave.", D_NAV),
        q("erro de vento no planejamento pode causar", "chegada com combustível abaixo do previsto ou fora da janela operacional.", D_NAV),
        q("no planejamento de descida IFR, deve-se considerar", "distância, altitude a perder, GS e restrições de procedimento.", D_NAV),
        q("combustível de rota IFR deve incluir", "táxi, pernas, aproximação, alternado, reserva e contingências.", D_NAV),
      ], "Planejamento de navegação amarra vento, tempo e combustível."),
      topic("GNSS e RNAV", REF_NAV, [
        q("perda de RAIM prevista no voo pode exigir", "rota alternativa, auxílio convencional ou adiamento.", D_NAV),
        q("waypoint fly-over em RNAV significa que a aeronave deve", "sobrevoar o ponto antes de iniciar curva para proteção de obstáculo.", D_NAV),
        q("em aproximação RNAV, MDA/DA publicado refere-se a", "altitude mínima de decisão para continuidade ou arremetida.", D_NAV),
        q("GNSS certificado para IFR difere de receptor portátil porque", "atende requisitos de integridade e instalação aprovados.", D_NAV),
        q("antes de usar GNSS como primário, verifica-se", "RAIM, banco de procedimentos, NOTAM e compatibilidade da aeronave.", D_NAV),
      ], "GNSS exige integridade e procedimento publicado."),
      topic("Aproximação perdida e MSA", REF_NAV, [
        q("ao iniciar aproximação perdida, prioridade é", "subida positiva e cumprimento do procedimento publicado.", D_NAV),
        q("MSA na carta de aproximação fornece", "altitude mínima de segurança em setor ao redor do auxílio.", D_NAV),
        q("atingir MDA sem requisitos visuais de continuidade implica", "arremetida conforme IAC ou instrução ATS.", D_NAV),
        q("comunicar aproximação perdida ao ATS ajuda", "na separação de tráfego e sequenciamento.", D_NAV),
        q("subida tardia na aproximação perdida aumenta risco de", "proximidade com obstáculos e terreno.", D_NAV),
      ], "Arremetida protege contra obstáculo quando não há continuidade visual."),
      topic("Problemas de navegação — tempo e distância", REF_NAV, [
        q("tempo de perna em rota IFR é obtido por", "distância dividida pela GS efetiva na perna.", D_NAV),
        q("autonomia restante após perna deve ser comparada com", "combustível para alternado, espera e reserva.", D_NAV),
        q("correção de vento antes da decolagem reduz", "surpresa de ETA e consumo na chegada.", D_NAV),
        q("diferença entre rumo magnético e curso verdadeiro relaciona-se a", "declinação magnética local.", D_NAV),
        q("em planejamento PC, gráfico de subida do manual serve para", "verificar se obstáculos da saída são ultrapassados com margem.", D_NAV),
      ], "Cálculos de tempo, distância e subida sustentam planejamento IFR."),
    ],
  },
  {
    key: "REGIFR",
    label: "Regulamentos IFR e Operações",
    topics: [
      topic("Autorização e responsabilidade", REF_REG, [
        q("autorização IFR do controle", "organiza tráfego, mas não elimina responsabilidade do comandante pela segurança.", D_NAV),
        q("quando não for possível cumprir autorização IFR, deve-se", "comunicar e solicitar alternativa compatível com a aeronave.", D_NAV),
        q("plano de voo IFR deve permitir", "identificação da aeronave, rota, níveis, alternado e tempos.", D_NAV),
        q("alternado IFR deve ser", "operacionalmente utilizável, não apenas listado.", D_NAV),
        q("perda de comunicação em IFR exige aplicar", "procedimento de falha de comunicação e última autorização conhecida.", D_NAV),
      ], "Regulamento IFR estrutura coordenação sem transferir responsabilidade."),
      topic("Mínimos e habilitação", REF_REG, [
        q("mínimos de aproximação publicados protegem", "contra obstáculo até decisão de pouso ou arremetida.", D_NAV),
        q("continuar abaixo do mínimo sem referência visual exigida é", "inaceitável e exige arremetida.", D_NAV),
        q("habilitação IFR pressupõe domínio de", "procedimentos, meteorologia IFR, navegação e limites da aeronave.", D_NAV),
        q("recenticidade em IFR visa", "manter competência em aproximação e procedimentos.", D_NAV),
        q("separação vertical em FIR controlada baseia-se em", "níveis atribuídos e altímetros corretamente ajustados.", D_NAV),
      ], "Mínimos e habilitação amarram segurança em IMC."),
      topic("Plano e espaço aéreo", REF_REG, [
        q("alteração relevante de rota em IFR deve ser", "coordenada com ATS quando aplicável.", D_NAV),
        q("documentos e cartas de bordo devem estar", "atualizados para a rota e procedimentos.", D_NAV),
        q("NOTAM deve ser consultado para", "restrições, auxílios fora e mudanças de procedimento.", D_NAV),
        q("entrada em TMA sem autorização pode gerar", "conflito de separação.", D_NAV),
        q("fraseologia padronizada reduz", "ambiguidade com o controle.", D_NAV),
      ], "Coordenação ATS depende de plano e documentação corretos."),
      topic("Alternado e comunicação", REF_REG, [
        q("combustível para alternado protege contra", "indisponibilidade do destino.", D_NAV),
        q("confirmação de nível autorizado evita", "erro de separação vertical.", D_NAV),
        q("relato de anormalidade ao ATS deve ser", "objetivo e oportuno.", D_NAV),
        q("operação remunerada PC exige observar", "limites da licença, habilitações e MANEX.", D_NAV),
        q("treinamento periódico IFR reduz", "erro em IMC e aproximação.", D_NAV),
      ], "Alternado e comunicação são pilares do IFR regulamentar."),
    ],
  },
  {
    key: "METIFR",
    label: "Meteorologia IFR",
    topics: [
      topic("Teto, visibilidade e neblina", REF_MET, [
        q("teto abaixo do mínimo no destino exige", "alternado, espera ou arremetida planejada.", D_NAV),
        q("neblina com visibilidade reduzida", "limita continuidade visual na aproximação.", D_NAV),
        q("BR no METAR indica", "nevoeiro ou névoa com visibilidade reduzida.", D_NAV),
        q("TEMPO na TAF descreve", "condição temporária dentro do período de validade.", D_NAV),
        q("SIGMET de turbulência severa implica", "replanejar rota ou nível para evitar a área.", D_NAV),
      ], "Meteorologia define janela operacional IFR."),
      topic("Gelo, CB e vento", REF_MET, [
        q("gelo estrutural em rota IFR", "degrada performance e exige saída da condição ou anti-gelo.", D_NAV),
        q("cumulonimbus na rota deve ser", "evitado ou contornado com margem ampla.", D_NAV),
        q("QNH incorreto pode causar", "erro de separação vertical e proximidade com terreno.", D_NAV),
        q("vento de cauda forte na aproximação", "aumenta velocidade sobre o solo e distância de pouso.", D_NAV),
        q("temperatura abaixo de ISA em rota", "pode reduzir altitude verdadeira em nível de voo.", D_NAV),
      ], "Ameaças meteorológicas exigem margem no planejamento."),
      topic("TAF e produtos", REF_MET, [
        q("BECMG na TAF indica", "mudança gradual prevista no período.", D_NAV),
        q("PROB na TAF comunica", "probabilidade de fenômeno ou condição.", D_NAV),
        q("AIRMET alerta sobre", "fenômenos de intensidade moderada para rotas menores.", D_NAV),
        q("inversão de temperatura pode produzir", "névoa ou camada de turbulência baixa.", D_NAV),
        q("frente fria pode trazer", "bandas de nuvens convectivas e mudança de vento.", D_NAV),
      ], "Produtos meteorológicos complementam decisão IFR."),
      topic("Altimetria operacional", REF_MET, [
        q("cruzamento da altitude de transição exige", "ajuste de altímetro conforme procedimento local.", D_NAV),
        q("FL em cruzeiro usa", "1013,2 hPa como referência padrão.", D_NAV),
        q("METAR de superfície isolado não substitui", "análise de TAF, SIGMET e cartas.", D_NAV),
        q("turbulência em camada nubosa stratiforme pode", "ocorrer sem CB visível.", D_NAV),
        q("redução rápida de teto na TAF exige", "revisão de alternado antes da decolagem.", D_NAV),
      ], "Altimetria e tendência orientam nível e alternado."),
    ],
  },
  {
    key: "PERFPC",
    label: "Performance e Planejamento PC",
    topics: [
      topic("Peso, pista e combustível", REF_PERF, [
        q("peso acima do máximo certificado", "torna a operação inválida e degrada performance.", D_NAV),
        q("pista molhada tende a", "aumentar distância de pouso e risco de aquaplanagem.", D_NAV),
        q("reserva de combustível IFR cobre", "imprevistos de rota, espera e alternado.", D_NAV),
        q("performance calculada abaixo do exigido pelo procedimento exige", "reduzir peso, adiar voo ou alterar plano.", D_NAV),
        q("pressão comercial não autoriza", "violar mínimos, peso ou procedimento publicado.", D_NAV),
      ], "Performance e combustível limitam decisão operacional PC."),
      topic("Decolagem e manual", REF_PERF, [
        q("CG fora do envelope afeta", "estabilidade e controle em todas as fases.", D_NAV),
        q("altitude-density alta reduz", "performance de motor e hélice ou turbina.", D_NAV),
        q("extrapolar manual além dos limites publicados é", "inaceitável na operação profissional.", D_NAV),
        q("decolagem IFR com obstáculo na saída exige", "verificar gradiente e procedimento OEI no manual.", D_NAV),
        q("cultura de segurança em PC prioriza", "dados técnicos e limites sobre conveniência.", D_NAV),
      ], "Manual de voo e peso definem viabilidade da operação."),
      topic("Planejamento integrado PC", REF_PERF, [
        q("briefing de tripulação deve alinhar", "rota, combustível, mínimos e papéis.", D_NAV),
        q("NOTAM no despacho evita", "surpresa com auxílio fora ou pista fechada.", D_NAV),
        q("margem operacional saudável inclui", "tempo, combustível e performance conservadores.", D_NAV),
        q("alternar cedo em deterioração meteorológica é", "decisão conservadora recomendada.", D_NAV),
        q("tanque cheio não dispensa", "cálculo de autonomia para alternado e reserva.", D_NAV),
      ], "Planejamento PC integra tripulação, NOTAM e margens."),
    ],
  },
  {
    key: "TECIFR",
    label: "Conhecimentos Técnicos IFR",
    topics: [
      topic("Instrumentos e sistemas", REF_TEC, [
        q("em IMC, controle de atitude primário usa", "horizonte artificial com scan de suporte.", D_NAV),
        q("bloqueio estático pode fazer o altímetro", "congelar na altitude do bloqueio.", D_NAV),
        q("RMI apresenta", "rumo magnético da estação sem integrar proa automaticamente.", D_NAV),
        q("modo C no transponder fornece", "altitude Mode C ao radar quando disponível.", D_NAV),
        q("piloto automático em IFR exige", "monitoramento ativo e prontidão para assumir manualmente.", D_NAV),
      ], "Instrumentos e automação exigem scan e procedimentos de falha."),
      topic("Pitot, HSI e ergonomia", REF_TEC, [
        q("aquecimento de pitot previne", "perda de indicação de velocidade por gelo.", D_NAV),
        q("HSI integra", "proa, curso selecionado e indicação VOR/NDB.", D_NAV),
        q("código 7700 indica", "emergência geral.", D_NAV),
        q("GPS IFR certificado atende", "requisitos de integridade da instalação aprovada.", D_NAV),
        q("iluminação adequada do painel reduz", "fadiga e erro de leitura em voo noturno.", D_NAV),
      ], "Sistemas de bordo devem estar operacionais e compreendidos."),
      topic("Falhas e TCAS", REF_TEC, [
        q("falha parcial de instrumentos exige", "procedimento de falha e uso de redundância.", D_NAV),
        q("TCAS RA em cruzeiro deve ser", "cumprida conforme treinamento, comunicando ATS.", D_NAV),
        q("transponder inoperante pode exigir", "não entrar em espaço onde o equipamento é obrigatório.", D_NAV),
        q("VOR deve ser verificado", "conforme MANEX e tolerâncias publicadas.", D_NAV),
        q("checklist de falha de pitot-estático inclui", "identificar fonte e usar instrumentos remanescentes.", D_NAV),
      ], "Falhas exigem procedimento; TCAS e transponder apoiam separação."),
    ],
  },
];
