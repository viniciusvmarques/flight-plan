import { PC_IFR_SUBJECTS } from "./exam-pc-ifr-subjects.js";

function topic(topicName, reference, stems, correct, distractors, explanation) {
  return { topic: topicName, reference, stems, correct, distractors, explanation };
}

const CABIN_CREW_SUBJECTS = [
  {
    key: "REGCMS",
    label: "Regulamentação do Comissário",
    topics: [
      topic("Funções e responsabilidades", "RBAC 63/121/135", ["a principal responsabilidade do comissário durante a operação é:", "em situação normal de voo, o comissário deve priorizar:", "a atuação do comissário em cabine está relacionada principalmente a:"], "Segurança dos passageiros, cumprimento de procedimentos e apoio à operação da cabine.", ["Controle técnico dos motores da aeronave.", "Definição do plano de voo ATS.", "Comando da navegação por instrumentos."], "O comissário atua na segurança de cabine, prevenção, orientação e resposta a emergências."),
      topic("Briefing e coordenação", "Procedimentos de cabine", ["o briefing de tripulação antes do voo serve para:", "a comunicação entre cabine e cabine de comando deve ser:", "informações críticas de segurança devem ser repassadas:"], "Alinhar procedimentos, funções, ameaças, equipamentos e ações em caso de anormalidade.", ["Substituir o treinamento obrigatório.", "Definir a rota meteorológica da aeronave.", "Eliminar a necessidade de checklist."], "Briefing eficiente reduz ruído operacional e melhora resposta coordenada."),
      topic("Embarque e passageiros especiais", "Atendimento e segurança no embarque", ["durante o embarque, atenção a passageiros com necessidades especiais visa:", "acomodação de bagagem de mão deve considerar:", "passageiro em saída de emergência deve:"], "Garantir segurança, acessibilidade, evacuação e cumprimento dos requisitos operacionais.", ["Aumentar a velocidade de cruzeiro.", "Substituir a inspeção externa da aeronave.", "Permitir bloqueio de corredores em voo curto."], "Embarque seguro evita obstruções, riscos em evacuação e problemas de atendimento."),
      topic("Disciplina operacional", "Conduta profissional de cabine", ["a disciplina operacional do comissário inclui:", "procedimentos padronizados são importantes porque:", "desvio de procedimento sem justificativa pode:"], "Cumprir normas, reportar anormalidades e manter postura compatível com segurança de voo.", ["Dispensar comunicação com a tripulação.", "Permitir improvisação em todos os procedimentos.", "Eliminar responsabilidade individual."], "Padronização e disciplina sustentam segurança e qualidade operacional."),
    ],
  },
  {
    key: "EMGCMS",
    label: "Emergência e Sobrevivência",
    topics: [
      topic("Evacuação", "Procedimentos de evacuação", ["em uma evacuação, o comando do comissário deve ser:", "antes de abrir uma saída de emergência, deve-se verificar:", "durante evacuação, bagagens de mão devem ser:"], "Claros, firmes e voltados à saída segura e rápida dos passageiros.", ["Longos e explicativos para cada passageiro.", "Dados apenas após recolher pertences pessoais.", "Substituídos por silêncio para evitar pânico."], "Evacuação exige comandos curtos, avaliação externa e fluxo sem obstruções."),
      topic("Fogo e fumaça", "Combate a fogo em cabine", ["ao identificar fumaça na cabine, a primeira atitude é:", "combate a fogo a bordo exige:", "após extinguir fogo em equipamento, deve-se:"], "Informar, localizar fonte, aplicar procedimento e monitorar reignição conforme treinamento.", ["Abrir imediatamente todas as portas em voo.", "Aguardar o pouso sem comunicar.", "Cobrir a fonte com material inflamável."], "Fogo em cabine exige ação rápida, comunicação e monitoramento."),
      topic("Sobrevivência", "Sobrevivência no mar e selva", ["em sobrevivência no mar, prioridade inicial inclui:", "após pouso forçado em área remota, o grupo deve:", "uso de equipamentos de sinalização serve para:"], "Organizar pessoas, preservar recursos, sinalizar posição e reduzir riscos imediatos.", ["Separar todos individualmente para buscar ajuda.", "Consumir todos os recursos no primeiro momento.", "Abandonar equipamentos de sinalização."], "Sobrevivência depende de organização, abrigo, sinalização, água e liderança."),
      topic("Despressurização", "Emergências de altitude e oxigênio", ["em despressurização, a prioridade imediata é:", "máscaras de oxigênio em cabine devem ser usadas:", "sinais de hipóxia exigem:"], "Garantir oxigênio, seguir procedimentos e orientar passageiros conforme a situação.", ["Servir refeições para acalmar passageiros.", "Aguardar autorização individual de cada passageiro.", "Desligar comunicação com a cabine de comando."], "Oxigênio e orientação rápida são essenciais em perda de pressurização."),
    ],
  },
  {
    key: "SBVCMS",
    label: "Primeiros Socorros",
    topics: [
      topic("Avaliação inicial", "Primeiros socorros - avaliação primária", ["diante de passageiro inconsciente, a avaliação inicial deve verificar:", "a abordagem de primeiros socorros a bordo deve priorizar:", "antes de prestar atendimento, o comissário deve observar:"], "Segurança da cena, responsividade, respiração e necessidade de acionar apoio.", ["Preferência alimentar do passageiro.", "Somente o número do assento.", "A cor da bagagem despachada."], "Avaliação primária organiza atendimento e identifica risco imediato à vida."),
      topic("RCP e DEA", "Suporte básico de vida", ["em parada cardiorrespiratória suspeita, a ação adequada é:", "o DEA deve ser utilizado:", "compressões torácicas eficazes devem buscar:"], "Acionar ajuda, iniciar RCP conforme treinamento e utilizar DEA quando disponível.", ["Aguardar necessariamente a chegada ao destino.", "Oferecer líquido ao passageiro inconsciente.", "Movimentar o passageiro sem avaliar respiração."], "RCP precoce e DEA aumentam chance de sobrevivência."),
      topic("Mal súbito em voo", "Emergências clínicas em cabine", ["em caso de mal súbito, a coleta de informações deve incluir:", "passageiro com dor torácica deve ser tratado como:", "comunicação de emergência médica à cabine de comando deve conter:"], "Sintomas, início, antecedentes, medicações, sinais observados e evolução.", ["Apenas destino final do passageiro.", "Somente preferência por assento.", "Informação de entretenimento usado a bordo."], "Informações objetivas ajudam decisão operacional e eventual apoio médico."),
      topic("Ferimentos e sangramentos", "Hemorragias e curativos", ["em sangramento externo, a medida inicial costuma ser:", "uso de luvas no atendimento serve para:", "ferimento com objeto encravado deve ser tratado por:"], "Pressão direta, proteção individual e acionamento de apoio conforme gravidade.", ["Remover sempre qualquer objeto profundamente encravado.", "Lavar com bebida quente para acelerar coagulação.", "Ignorar quando o passageiro estiver sentado."], "Controle de sangramento e biossegurança reduzem risco ao passageiro e à tripulação."),
    ],
  },
  {
    key: "SEGCMS",
    label: "Segurança e AVSEC",
    topics: [
      topic("Interferência ilícita", "AVSEC", ["conduta suspeita em cabine deve ser tratada com:", "em ameaça à segurança, o comissário deve:", "procedimentos AVSEC buscam principalmente:"], "Discrição, comunicação adequada e cumprimento dos procedimentos de segurança.", ["Divulgação pública imediata no sistema de áudio.", "Confronto físico sem avaliação de risco.", "Ignorar se o voo estiver próximo do destino."], "AVSEC exige prevenção, comunicação discreta e resposta coordenada."),
      topic("Artigos perigosos", "Transporte aéreo de artigos perigosos", ["artigos perigosos em bagagem de mão representam risco porque:", "ao suspeitar de item proibido, o comissário deve:", "regras de artigos perigosos servem para:"], "Podem causar fogo, vazamento, explosão, intoxicação ou outro risco à operação.", ["Aumentam a autonomia da aeronave.", "Melhoram o balanceamento da cabine.", "Substituem equipamentos de emergência."], "Controle de artigos perigosos reduz riscos de eventos graves a bordo."),
      topic("Passageiro indisciplinado", "Gerenciamento de passageiro disruptivo", ["passageiro indisciplinado deve ser gerenciado com:", "o registro de ocorrência envolvendo passageiro disruptivo é importante para:", "medidas de contenção devem ser consideradas:"], "Técnicas graduais, comunicação com a tripulação e preservação da segurança.", ["Exposição desnecessária do passageiro aos demais.", "Improviso sem comunicação com ninguém.", "Liberação de acesso à cabine de comando."], "Gerenciamento graduado reduz escalada e protege passageiros e tripulação."),
      topic("Cabine segura", "Procedimentos críticos de decolagem e pouso", ["cabine preparada para decolagem e pouso significa:", "durante fases críticas, o comissário deve priorizar:", "verificação de cabine antes do pouso busca:"], "Passageiros, bagagens, assentos, cintos e equipamentos em condição segura.", ["Serviço de bordo completo até o toque.", "Liberação de circulação no corredor.", "Abertura preventiva das portas."], "Fases críticas exigem cabine segura e tripulação focada em emergência potencial."),
    ],
  },
  {
    key: "AERCMS",
    label: "Conhecimentos Gerais de Aviação",
    topics: [
      topic("Partes da aeronave", "Conhecimentos gerais de aeronaves", ["a fuselagem de uma aeronave tem como função principal:", "superfícies de comando são usadas para:", "portas e saídas de emergência devem ser conhecidas pelo comissário para:"], "Acomodar pessoas/carga e integrar estruturas e sistemas da aeronave.", ["Gerar combustível durante o voo.", "Substituir o sistema de comunicação.", "Controlar exclusivamente a meteorologia."], "Conhecer a aeronave ajuda o comissário a orientar passageiros e atuar em emergência."),
      topic("Fases de voo", "Operação básica de voo", ["decolagem e pouso são fases críticas porque:", "durante cruzeiro, a cabine deve permanecer monitorada para:", "em turbulência, o procedimento de cabine deve priorizar:"], "Há maior necessidade de atenção, configuração segura e resposta rápida a anormalidades.", ["O serviço de bordo tem prioridade absoluta.", "As saídas devem permanecer destravadas.", "Todos devem ficar em pé para equilíbrio."], "Fases de voo têm riscos e procedimentos específicos para a cabine."),
      topic("Meteorologia para cabine", "Noções de meteorologia aplicada à cabine", ["turbulência prevista deve ser considerada pela cabine para:", "condições meteorológicas adversas podem afetar:", "orientação de cintos em turbulência visa:"], "Planejar serviço, circulação, segurança dos passageiros e comunicação adequada.", ["Alterar a rota sem participação da cabine de comando.", "Substituir a inspeção de equipamentos.", "Garantir que não haverá emergência médica."], "Comissários usam meteorologia para preparar a cabine e prevenir lesões."),
      topic("Comunicação a bordo", "Comunicação operacional e atendimento", ["anúncios de segurança devem ser:", "comunicação com passageiros em anormalidade deve buscar:", "informação repassada à cabine de comando deve ser:"], "Claros, objetivos, calmos e adequados ao procedimento aplicável.", ["Ambíguos para evitar compreensão excessiva.", "Longos e técnicos em todas as fases.", "Baseados em rumores de passageiros."], "Comunicação clara reduz pânico, melhora cumprimento de instruções e apoia a operação."),
    ],
  },
];

const EXTRA_COURSES = [
  {
    key: "PC-IFR",
    title: "Piloto Comercial / IFR",
    shortTitle: "PC/IFR",
    description:
      "Simulado PC/IFR com ênfase em navegação rádio (NDB, VOR, DME, ILS), cartas, espera, planejamento de rota e performance — alinhado ao programa ANAC de navegação por instrumentos.",
    subjects: PC_IFR_SUBJECTS,
  },
  { key: "CMS", title: "Comissário de Voo", shortTitle: "Comissário", description: "Simulados para comissário de voo, emergência, segurança, primeiros socorros e regulamentação.", subjects: CABIN_CREW_SUBJECTS },
];

const CONTEXTS = [
  "Durante o planejamento da operação",
  "Em uma situação de prova teórica",
  "Antes da etapa operacional",
  "Ao revisar o procedimento aplicável",
  "Durante uma avaliação de conhecimento",
  "Em cenário de treinamento",
  "Ao identificar uma condição anormal",
  "Na preparação para o despacho",
  "Durante a coordenação da tripulação",
  "Ao cumprir procedimento padronizado",
  "Em uma operação regular",
  "Ao avaliar a segurança da operação",
  "No briefing antes da etapa",
  "Ao acompanhar a execução do procedimento",
  "Durante o gerenciamento de risco",
  "Ao consultar a documentação aplicável",
  "Na tomada de decisão operacional",
  "Em uma ocorrência simulada",
  "Ao revisar limitações e mínimos",
  "Durante o treinamento prático",
  "Em condição operacional adversa",
  "Ao preparar a resposta da tripulação",
  "Durante uma verificação de rotina",
  "Ao aplicar procedimentos de segurança",
  "Em uma situação de coordenação operacional",
  "Ao estudar navegação rádio para PC/IFR",
  "Durante resolução de problema de rota IFR",
  "Na leitura de carta de aproximação IAC",
  "Ao preparar cálculo de vento e tempo de perna",
  "Em exercício de interceptação VOR",
  "Na revisão de procedimento de espera publicado",
  "Ao planejar combustível para alternado IFR",
  "Durante simulado de aproximação por instrumentos",
  "Ao interpretar indicação ADF em rota",
  "Na checagem de DME e segmentos de descida",
];

function rotate(list, offset) {
  return [...list.slice(offset), ...list.slice(0, offset)];
}

function lowerFirst(value) {
  const text = String(value || "").trim();
  return text ? text.charAt(0).toLowerCase() + text.slice(1) : "";
}

function resolveTopicItem(topicItem, subjectIndex, globalIndex) {
  if (Array.isArray(topicItem.items) && topicItem.items.length) {
    return topicItem.items[(subjectIndex + globalIndex) % topicItem.items.length];
  }
  return {
    stem: topicItem.stems[(subjectIndex + globalIndex) % topicItem.stems.length],
    correct: topicItem.correct,
    distractors: topicItem.distractors,
  };
}

function makeQuestion(course, subject, topicItem, subjectIndex, globalIndex) {
  const context = CONTEXTS[(subjectIndex + globalIndex) % CONTEXTS.length];
  const item = resolveTopicItem(topicItem, subjectIndex, globalIndex);
  const stem = item.stem;
  const options = rotate([item.correct, ...item.distractors], globalIndex % 4);
  return {
    id: `${course.key}-${subject.key}-${String(subjectIndex + 1).padStart(4, "0")}`,
    license: course.key,
    licenseLabel: course.title,
    subject: subject.key,
    subjectLabel: subject.label,
    topic: topicItem.topic,
    difficulty: ["facil", "media", "media", "dificil"][globalIndex % 4],
    question: `${context}, ${lowerFirst(stem)}`,
    options,
    correctIndex: options.indexOf(item.correct),
    explanation: topicItem.explanation,
    reference: topicItem.reference,
    status: "approved",
  };
}

export const EXTRA_EXAM_COURSES = EXTRA_COURSES.map((course) => ({
  key: course.key,
  title: course.title,
  shortTitle: course.shortTitle,
  description: course.description,
  freeEnabled: false,
  subjects: course.subjects.map(({ key, label }) => ({ key, label })),
}));

export const EXTRA_EXAM_QUESTIONS = EXTRA_COURSES.flatMap((course) => {
  const questions = [];
  for (const subject of course.subjects) {
    let subjectIndex = 0;
    while (subjectIndex < 400) {
      for (const topicItem of subject.topics) {
        if (subjectIndex >= 400) break;
        questions.push(makeQuestion(course, subject, topicItem, subjectIndex, questions.length));
        subjectIndex += 1;
      }
    }
  }
  return questions;
});
