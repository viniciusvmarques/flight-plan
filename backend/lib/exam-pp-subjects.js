/**
 * Banco temático PP (VFR) — questões autorais alinhadas ao programa de
 * Navegação Visual e Estimada (rumo, vento, cartas, planejamento, subida/descida).
 * Textos originais; não reproduz material de terceiros.
 */

function q(stem, correct, distractors) {
  return { stem, correct, distractors };
}

function topic(topicName, reference, items, explanation) {
  return { topic: topicName, reference, items, explanation };
}

const REF_NAV = "Programa PP — navegação visual e estimada";
const REF_REG = "RBAC 61/91 e ICA 100-12 — VFR";
const REF_MET = "Meteorologia aeronáutica VFR";
const REF_TEV = "Teoria de voo — sustentação e controle";
const REF_CTE = "Conhecimentos técnicos — aeronave leve";

const D = [
  "dispensa consulta meteorológica",
  "substitui julgamento do piloto em comando",
  "autoriza voar sem referências visuais",
];

export const PP_SUBJECTS = [
  {
    key: "NAV",
    label: "Navegação Aérea Visual",
    topics: [
      topic("Rumo, proa e vento cruzado", REF_NAV, [
        q("vento da esquerda em cruzeiro exige, em geral, proa", "à esquerda do rumo desejado para compensar deriva.", D),
        q("a diferença entre rumo e proa ocorre por causa do", "vento que desvia a trajetória em relação à proa.", D),
        q("correção de deriva (WCA) tem por objetivo", "fazer a trajetória no solo coincidir com a rota planejada.", D),
        q("se a proa aponta exatamente para o checkpoint mas há vento lateral, a aeronave", "passará ao lado do ponto previsto, exigindo correção.", D),
        q("rumo magnético é obtido do rumo verdadeiro aplicando", "declinação magnética local com sinal correto.", D),
      ], "Proa compensa vento; rumo é direção da trajetória no mapa."),
      topic("Triângulo de vento e GS", REF_NAV, [
        q("conhecendo TAS e componentes de vento, calcula-se", "proa verdadeira e velocidade solo (GS).", D),
        q("vento de cauda na perna aumenta", "GS e reduz tempo en route.", D),
        q("vento de proa na perna reduz", "GS e aumenta tempo até o próximo ponto.", D),
        q("erro de estimativa de vento no planejamento pode levar a", "chegada com combustível abaixo do previsto.", D),
        q("GS é a velocidade da aeronave em relação ao", "solo, não ao ar.", D),
      ], "Triângulo de vento amarra tempo, combustível e navegação estimada."),
      topic("Tempo, distância e ETE", REF_NAV, [
        q("ETE em minutos é obtido por", "distância da perna dividida pela GS, convertida para tempo.", D),
        q("recalcular ETE em voo após mudança de vento permite", "atualizar ETA e decisão de alternado.", D),
        q("distância medida na carta deve ser corrigida pela", "escala e unidade da carta (NM ou km conforme ferramenta).", D),
        q("ETA considera", "soma dos ETEs das pernas mais táxi e margem.", D),
        q("autonomia restante deve ser comparada com", "tempo até destino mais reserva e alternado.", D),
      ], "Tempo e distância são base da navegação estimada VFR."),
      topic("Cartas e checkpoints", REF_NAV, [
        q("checkpoint eficiente em VFR deve ser", "visível, distinto e compatível com altitude de cruzeiro.", D),
        q("cartas aeronáuticas no planejamento VFR servem para", "medir rumos, distâncias, espaço aéreo e obstáculos.", D),
        q("pilotagem entre checkpoints reduz", "erro acumulado de estimativa de vento.", D),
        q("linha traçada na carta representa", "rumo planejado, não necessariamente proa.", D),
        q("revisar restrições de espaço aéreo na carta evita", "ingresso não autorizado em áreas controladas.", D),
      ], "Carta e checkpoints estruturam rota visual segura."),
      topic("Subida e descida no planejamento", REF_NAV, [
        q("planejamento de subida estima", "distância horizontal até altitude de cruzeiro e combustível da etapa.", D),
        q("top of descent pode ser estimado por", "altitude a perder, GS e razão de descida planejada.", D),
        q("razão de subida insuficiente para obstáculo na rota exige", "alterar rota, peso ou ponto de subida.", D),
        q("descida muito tardia em VFR pode causar", "aproximação alta e circuito desorganizado.", D),
        q("altitude de cruzeiro VFR deve considerar", "obstáculos, nuvem, vento e visibilidade.", D),
      ], "Subida e descida integram planejamento VFR como no material de navegação estimada."),
      topic("Combustível e alternado VFR", REF_NAV, [
        q("reserva de combustível VFR existe para", "imprevistos de vento, espera, desvio ou tráfego.", D),
        q("alternado VFR deve ter", "meteorologia aceitável e serviços compatíveis com a aeronave.", D),
        q("consumo horário usado no planejamento deve ser", "conservador em relação ao histórico da aeronave.", D),
        q("autonomia calculada menor que tempo total planejado indica", "necessidade de reabastecer ou replanejar.", D),
        q("combustível para retorno ou desvio deve ser previsto", "antes da decolagem, não apenas no destino.", D),
      ], "Combustível e alternado fecham margem da navegação visual."),
      topic("Bússola e orientação", REF_NAV, [
        q("bússola magnética sofre aceleração/viragem porque", "campo magnético da Terra combina com campo da aeronave.", D),
        q("em voo reto andando, a bússola tende a indicar", "rumo magnético com menor erro de viragem.", D),
        q("declinação magnética positiva (leste) implica", "MV = RV + declinação (regra de sinal conforme hemisfério).", D),
        q("confiar apenas em bússola sem pilotagem visual pode", "acumular erro, especialmente com vento desconhecido.", D),
        q("orientação por relógio e sol é recurso", "de emergência, não substituto de planejamento.", D),
      ], "Bússola exige técnica; planejamento reduz dependência de improviso."),
      topic("VOR e auxílios em VFR", REF_NAV, [
        q("VOR em VFR pode auxiliar a", "confirmar posição quando checkpoint visual é duvidoso.", D),
        q("identificar estação VOR antes de usar o radial evita", "navegar com auxílio errado.", D),
        q("CDI centralizado com OBS em radial TO indica", "aeronave na semiesfera de afastamento da estação naquela radial.", D),
        q("GNSS portátil em VFR exige", "bateria, carta de backup e consciência de limitações.", D),
        q("auxílio rádio não elimina", "necessidade de manter referências visuais em VFR.", D),
      ], "Auxílios complementam, mas VFR mantém referência visual primária."),
      topic("NOTAM e documentação de rota", REF_NAV, [
        q("NOTAM na preparação VFR informa", "pistas fechadas, auxílios fora e restrições temporárias.", D),
        q("ROTAER ou equivalente fornece", "dados de aeródromos, combustível e procedimentos locais.", D),
        q("plano de voo VFR quando exigido facilita", "busca e salvamento e coordenação ATS.", D),
        q("frequências de aeródromo devem ser anotadas", "no planejamento antes do táxi.", D),
        q("cartas desatualizadas podem omitir", "novos obstáculos ou mudanças de espaço aéreo.", D),
      ], "Documentação atualizada sustenta navegação visual segura."),
      topic("Circuito e navegação local", REF_NAV, [
        q("no circuito de tráfego, referência visual de vento ajuda a", "antecipar deriva na base e final.", D),
        q("entrada no circuito deve respeitar", "altura e procedimento publicado do aeródromo.", D),
        q("navegação local após decolagem exige", "mapa mental da área e limites de treinamento.", D),
        q("perder checkpoint em área conhecida exige", "parar, identificar posição e não prosseguir incerto.", D),
        q("retorno ao aeródromo de origem no planejamento inclui", "combustível e meteorologia na volta.", D),
      ], "Circuito e área local são extensão da navegação estimada."),
    ],
  },
  {
    key: "REG",
    label: "Regulamentos de Tráfego Aéreo",
    topics: [
      topic("Responsabilidade VFR", REF_REG, [
        q("em VFR, decisão de continuar o voo cabe ao", "piloto em comando, com base em condições e regulamento.", D),
        q("condição abaixo do mínimo VFR exige", "não prosseguir ou alternar conforme planejamento.", D),
        q("preparação pré-voo regulamentar inclui", "documentos, meteorologia, NOTAM e condição da aeronave.", D),
        q("passageiro não substitui", "responsabilidade do piloto em comando.", D),
        q("informação ATS não autoriza", "violar regras de voo visual.", D),
      ], "VFR mantém responsabilidade no comandante."),
      topic("Espaço aéreo VFR", REF_REG, [
        q("entrada em CTR/TMA pode exigir", "autorização, comunicação e transponder conforme publicado.", D),
        q("espaço aéreo condicionado implica", "requisitos específicos de comunicação ou equipamento.", D),
        q("planejamento de rota deve evitar", "áreas proibidas e restritas sem permissão.", D),
        q("tráfego em aeródromo controlado segue", "instruções e circuito publicado.", D),
        q("transponder ligado em área onde é exigido", "melhora vigilância ATS.", D),
      ], "Espaço aéreo define coordenação do VFR."),
      topic("Comunicações VFR", REF_REG, [
        q("fraseologia padronizada reduz", "ambiguidade com torre e APP.", D),
        q("se não compreender instrução, o piloto deve", "solicitar repetição ou esclarecimento.", D),
        q("chamada inicial em frequência deve incluir", "identificação da aeronave e posição/intenção.", D),
        q("comunicação em emergência usa", "fraseologia e prioridade adequadas.", D),
        q("radio failure em VFR exige", "procedimento publicado e consciência de tráfego.", D),
      ], "Comunicação clara apoia separação em VFR."),
      topic("Documentos e inspeção", REF_REG, [
        q("documentos de bordo devem estar", "válidos e compatíveis com a operação.", D),
        q("inspeção pré-voo é responsabilidade", "do piloto antes de cada voo.", D),
        q("caderneta e habilitação devem ser", "portadas conforme exigência.", D),
        q("manutenção em dia afeta", "segurança e legalidade do voo.", D),
        q("peso e balanceamento fazem parte da", "preparação regulamentar do voo.", D),
      ], "Documentação e inspeção precedem decolagem VFR."),
    ],
  },
  {
    key: "MET",
    label: "Meteorologia Aeronáutica",
    topics: [
      topic("METAR e decisão VFR", REF_MET, [
        q("METAR representa", "observação no aeródromo em horário específico.", D),
        q("vento no METAR é dado em", "direção de onde o vento sopra e velocidade.", D),
        q("visibilidade reduzida no METAR exige", "reavaliar continuidade VFR.", D),
        q("cavok indica", "ausência de nuvens significativas e boa visibilidade, sujeito a definição local.", D),
        q("METAR isolado deve ser comparado com", "TAF e tendência sinótica.", D),
      ], "METAR é ponto de partida da decisão visual."),
      topic("TAF e planejamento", REF_MET, [
        q("TAF fornece", "previsão para o aeródromo no período de validade.", D),
        q("TEMPO na TAF indica", "condição temporária esperada.", D),
        q("BECMG sugere", "mudança gradual no período.", D),
        q("TAF do destino apoia decisão sobre", "alternado e horário de partida.", D),
        q("previsão pior que METAR atual exige", "margem de combustível e plano B.", D),
      ], "TAF complementa METAR no planejamento VFR."),
      topic("Nuvens e visibilidade VFR", REF_MET, [
        q("teto baixo em camada convectiva pode", "ocultar referências de solo.", D),
        q("VFR exige", "referências visuais ao solo e separação de nuvens conforme regra.", D),
        q("névoa matinal pode dissipar com", "aquecimento, mas exige cautela no planejamento.", D),
        q("CB na rota VFR deve ser", "desviada com ampla margem.", D),
        q("relatório de turbulência leve ainda exige", "cintos e velocidade adequada.", D),
      ], "Nuvens e visibilidade limitam ou permitem VFR."),
      topic("QNH e vento de superfície", REF_MET, [
        q("QNH ajustado no solo faz altímetro indicar", "altitude em relação ao nível médio do mar no aeródromo.", D),
        q("QNH incorreto pode causar", "erro de separação com terreno ou tráfego.", D),
        q("vento de superfície no METAR afeta", "decolagem, pouso e circuito.", D),
        q("rajada na pista aumenta", "componente variável de vento cruzado.", D),
        q("cartão de vento em superfície ajuda a", "antecipar componente na cabeceira.", D),
      ], "Altimetria e vento de superfície fecham briefing VFR."),
    ],
  },
  {
    key: "TEV",
    label: "Teoria de Voo",
    topics: [
      topic("Sustentação e estol", REF_TEV, [
        q("sustentação depende de", "velocidade, densidade, área e ângulo de ataque.", D),
        q("estol ocorre quando", "ângulo de ataque crítico é excedido.", D),
        q("recuperação inicial de estol exige", "reduzir ângulo de ataque e aplicar potência conforme procedimento.", D),
        q("fator de carga em curva nivelada aumenta", "velocidade de estol.", D),
        q("contaminação de asa (gelo/sujeira) prejudica", "sustentação e aumenta velocidade de estol.", D),
      ], "Sustentação e estol são base da segurança em manobra."),
      topic("Estabilidade e controles", REF_TEV, [
        q("profundor controla principalmente", "arfagem em torno do eixo lateral.", D),
        q("ailerons controlam", "rolamento.", D),
        q("leme controla", "guinada.", D),
        q("CG à frente do limite traseiro tende a", "aumentar estabilidade longitudinal.", D),
        q("trim alivia", "forças no profundor em cruzeiro.", D),
      ], "Eixos e superfícies explicam comportamento da aeronave."),
      topic("Performance básica", REF_TEV, [
        q("velocidade de melhor razão de subida relaciona-se a", "máximo ganho de altitude por tempo.", D),
        q("velocidade de melhor ângulo de subida relaciona-se a", "máximo ganho de altitude por distância.", D),
        q("peso maior aumenta", "velocidade de decolagem e pouso.", D),
        q("altitude-density alta reduz", "performance do motor e hélice.", D),
        q("vento de cauda no pouso aumenta", "velocidade sobre o solo e distância de pista.", D),
      ], "Performance liga teoria ao planejamento de pista."),
      topic("Carga e envelope", REF_TEV, [
        q("CG fora do envelope compromete", "controle e recuperação de manobras.", D),
        q("peso acima do máximo estrutural é", "inválido para operação.", D),
        q("carga solta na cabine pode", "deslocar CG em manobra.", D),
        q("tanque cheio desloca CG em relação a", "tanque vazio; deve constar no cálculo.", D),
        q("limite de bagagem no compartimento traseiro existe para", "manter CG dentro do envelope.", D),
      ], "Peso e CG integram teoria e regulamento."),
    ],
  },
  {
    key: "CTE",
    label: "Conhecimentos Técnicos",
    topics: [
      topic("Motor e combustível", REF_CTE, [
        q("ciclo de quatro tempos inclui", "admissão, compressão, combustão/expansão e escape.", D),
        q("drenagem de combustível no pré-voo detecta", "água ou sedimentos.", D),
        q("mistura pobre em alta altitude pode causar", "perda de potência ou roughness.", D),
        q("temperatura do óleo fora do verde exige", "investigar antes de voo prolongado.", D),
        q("carburador com gelo pode ser mitigado por", "aquecimento de carburador conforme manual.", D),
      ], "Motor e combustível exigem verificação no pré-voo."),
      topic("Sistema elétrico", REF_CTE, [
        q("alternador mantém", "carga da bateria e alimenta consumidores.", D),
        q("falha de alternador exige", "reduzir consumo elétrico e planejar pouso.", D),
        q("bateria permite", "partida e energia temporária se alternador falhar.", D),
        q("disjuntor aberto indica", "circuito protegido desligado.", D),
        q("rádio e transponder dependem de", "sistema elétrico saudável.", D),
      ], "Elétrico sustenta comunicação e instrumentos."),
      topic("Instrumentos básicos", REF_CTE, [
        q("velocímetro usa pressão", "dinâmica e estática do pitot-estático.", D),
        q("altímetro sem ajuste correto de QNH indica", "altitude errada em relação ao solo.", D),
        q("VSI mostra", "razão de subida ou descida.", D),
        q("horizonte artificial em VFR auxilia em", "nuvens temporárias ou treinamento de instrumentos.", D),
        q("bloqueio de pitot pode afetar", "indicação de velocidade.", D),
      ], "Instrumentos devem ser entendidos mesmo em VFR."),
      topic("Pré-voo e manutenção", REF_CTE, [
        q("inspeção visual da hélice busca", "trincas, amassados e fixação correta.", D),
        q("controle de superfície livre e correto sentido é", "item crítico do pré-voo.", D),
        q("nível de combustível verificado visualmente deve ser", "cruzado com planejamento.", D),
        q("documento de manutenção em dia permite", "identificar limitações e ADs.", D),
        q("pneu com desgaste irregular sugere", "problema de alinhamento ou pressão.", D),
      ], "Pré-voo técnico fecha preparação do PP."),
    ],
  },
];
