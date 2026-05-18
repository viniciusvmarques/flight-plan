function topic(topicName, reference, stems, correct, distractors, explanation) {
  return { topic: topicName, reference, stems, correct, distractors, explanation };
}

const PC_IFR_SUBJECTS = [
  {
    key: "REGIFR",
    label: "Regulamentos IFR e Operações",
    topics: [
      topic("Regras IFR e autorização", "RBAC 61/91 e ICA 100-12", ["em operação IFR, a autorização de tráfego deve ser compreendida como:", "antes de ingressar em espaço aéreo controlado em IFR, o piloto deve:", "quando uma autorização IFR não puder ser cumprida, a conduta correta é:"], "Uma autorização condicionada ao controle de tráfego, sem dispensar o piloto de manter a operação segura.", ["Uma garantia de separação contra terreno em qualquer fase do voo.", "Uma permissão para ignorar limitações da aeronave.", "Uma substituição integral do planejamento de combustível."], "A autorização IFR organiza fluxo e separação, mas não elimina responsabilidades do piloto."),
      topic("Mínimos operacionais", "Procedimentos IFR e mínimos publicados", ["em uma aproximação por instrumentos, os mínimos publicados servem para:", "ao atingir a altitude mínima sem referências visuais requeridas, o piloto deve:", "a decisão de prosseguir abaixo dos mínimos depende principalmente de:"], "Definir limites mínimos para continuidade segura da aproximação conforme procedimento e referências visuais.", ["Autorizar descida ilimitada quando o piloto conhece o aeródromo.", "Substituir a necessidade de alternado no planejamento.", "Permitir pouso mesmo sem qualquer referência externa."], "Mínimos IFR orientam a decisão de pouso ou arremetida e protegem contra obstáculos."),
      topic("Plano de voo IFR", "MCA 100-11 e planejamento ATS", ["um plano IFR corretamente preenchido deve informar:", "a rota e o nível pretendido em um plano IFR são importantes porque:", "alterações relevantes no planejamento IFR devem ser tratadas por:"], "Dados de identificação, rota, nível, regras de voo, autonomia, alternado e demais informações operacionais.", ["Apenas o aeródromo de partida, sem detalhes de rota.", "Somente o nome do piloto e o número de passageiros.", "A meteorologia estimada sem relação com a aeronave."], "O plano IFR apoia coordenação ATS, busca e salvamento e gerenciamento de fluxo."),
      topic("Alternado IFR", "Planejamento IFR - alternado e autonomia", ["na escolha de alternado IFR, o piloto deve considerar:", "um alternado adequado para IFR precisa ser analisado quanto a:", "a previsão meteorológica do alternado é relevante porque:"], "Meteorologia, procedimentos disponíveis, operação do aeródromo, combustível e compatibilidade com a aeronave.", ["Apenas a distância em linha reta até o destino.", "Somente a preferência comercial do passageiro.", "Exclusivamente a existência de restaurante no terminal."], "O alternado IFR deve ser realmente utilizável se o destino ficar indisponível."),
    ],
  },
  {
    key: "METIFR",
    label: "Meteorologia IFR",
    topics: [
      topic("Nebulosidade e teto IFR", "Meteorologia aeronáutica IFR", ["em planejamento IFR, teto baixo no destino influencia diretamente:", "a análise de camada de nuvens em uma aproximação IFR é relevante para:", "condição abaixo dos mínimos no destino exige:"], "A escolha de procedimento, alternado, combustível e possibilidade de arremetida.", ["Apenas a seleção da pintura da aeronave.", "Somente o conforto acústico da cabine.", "Exclusivamente o cálculo de peso básico vazio."], "Teto e visibilidade são decisivos para aproximação e alternado."),
      topic("Gelo e trovoadas", "Meteorologia operacional - gelo, CB e turbulência", ["a presença de cumulonimbus na rota IFR deve ser tratada como:", "formação de gelo em voo por instrumentos pode causar:", "ao planejar rota com previsão de trovoadas, o piloto deve:"], "Risco operacional relevante, exigindo desvio, espera, alternado ou replanejamento.", ["Condição irrelevante para aeronaves leves.", "Fenômeno que melhora a sustentação da aeronave.", "Sinal de que a comunicação rádio será dispensável."], "CB, gelo e turbulência afetam controle, performance e segurança."),
      topic("TAF e tendência", "Códigos TAF, TEMPO, BECMG e PROB", ["em TAF, grupos de mudança são usados para:", "a interpretação de TEMPO em previsão IFR indica:", "ao avaliar BECMG no período do voo, o piloto deve:"], "Indicar mudanças previstas nas condições meteorológicas dentro do período de validade.", ["Registrar a manutenção programada da aeronave.", "Autorizar automaticamente aproximação abaixo dos mínimos.", "Cancelar a necessidade de consulta a NOTAM."], "TAF com grupos de mudança ajuda a prever janela de operação, alternado e combustível."),
      topic("Altimetria IFR", "Altimetria, QNH e níveis de voo", ["em voo IFR, ajuste altimétrico correto é essencial para:", "ao cruzar a altitude de transição, o ajuste do altímetro deve:", "erro de ajuste altimétrico pode resultar em:"], "Manter separação vertical adequada e cumprir altitudes ou níveis autorizados.", ["Aumentar automaticamente a velocidade verdadeira.", "Eliminar necessidade de vigilância de tráfego.", "Corrigir falhas do sistema elétrico."], "Altimetria incorreta compromete separação vertical e segurança contra obstáculos."),
    ],
  },
  {
    key: "NAVIFR",
    label: "Navegação IFR",
    topics: [
      topic("Rádio navegação", "VOR, NDB, GNSS e radiais", ["a interceptação de uma radial VOR requer:", "em navegação por instrumentos, identificação positiva do auxílio serve para:", "ao usar GNSS em IFR, o piloto deve confirmar:"], "Sintonizar, identificar o auxílio e estabelecer proa de interceptação compatível com a posição.", ["Usar qualquer frequência próxima sem identificação.", "Desconsiderar indicação de curso durante a aproximação.", "Voar apenas por referência visual ao terreno."], "Navegação IFR exige identificação e acompanhamento correto dos auxílios."),
      topic("Saídas e chegadas IFR", "SID, STAR e cartas IFR", ["uma SID publicada tem como finalidade:", "uma STAR auxilia principalmente na:", "restrições de altitude e velocidade em cartas IFR devem ser:"], "Padronizar trajetórias, reduzir carga de trabalho e organizar separação do tráfego.", ["Substituir a autorização do controle em todos os casos.", "Permitir descida sem observância de mínimos.", "Cancelar a necessidade de comunicação bilateral."], "Procedimentos publicados organizam fluxo e devem ser lidos junto com autorização ATS."),
      topic("Aproximação por instrumentos", "IAC - procedimentos IFR", ["em uma aproximação não precisão, o piloto deve observar:", "o segmento final de aproximação exige atenção especial a:", "o ponto de aproximação perdida representa:"], "Curso, altitudes mínimas, gradiente, tempo/distância e ponto de aproximação perdida.", ["Apenas a cor das luzes internas da cabine.", "Somente a autonomia restante após o pouso.", "Exclusivamente o número de passageiros."], "Cartas de aproximação trazem limites e pontos críticos para continuidade ou arremetida."),
      topic("Espera IFR", "Procedimentos de espera", ["em procedimento de espera, o piloto deve cumprir:", "a entrada em espera depende principalmente de:", "a velocidade em espera deve respeitar:"], "Curso, perna, altitude, sentido de curva, tempo/distância e autorização recebida.", ["Somente a preferência de rumo do piloto.", "Qualquer órbita visual ao redor do aeródromo.", "A maior velocidade possível para economizar tempo."], "Espera IFR é procedimento padronizado para separar tráfego e organizar fluxo."),
    ],
  },
  {
    key: "PERFPC",
    label: "Performance e Planejamento PC",
    topics: [
      topic("Peso e balanceamento", "Manual de voo - peso e CG", ["em operação comercial, peso e balanceamento devem ser verificados para:", "CG fora do envelope pode afetar:", "o peso máximo de decolagem é limitado por:"], "Garantir que a aeronave opere dentro do envelope aprovado e com performance suficiente.", ["Apenas definir a tarifa cobrada do passageiro.", "Eliminar a necessidade de inspeção pré-voo.", "Corrigir automaticamente erro de navegação."], "Peso e CG influenciam pista requerida, subida, estabilidade e controle."),
      topic("Performance de pista", "Performance de decolagem e pouso", ["a distância de decolagem aumenta quando há:", "pista contaminada ou molhada exige:", "temperatura elevada e altitude de pressão alta tendem a:"], "Avaliação conservadora da performance e comparação com pista disponível.", ["Redução automática da distância de decolagem.", "Dispensa do cálculo de peso.", "Aumento garantido de razão de subida."], "Performance depende de peso, vento, pista, pressão, temperatura e configuração."),
      topic("Combustível IFR", "Planejamento de combustível IFR", ["o combustível IFR deve contemplar:", "reserva e alternado no planejamento IFR servem para:", "consumo maior que o previsto em rota exige:"], "Táxi, rota, aproximação, alternado, reserva, contingências e margens aplicáveis.", ["Somente o consumo até o destino em ar calmo.", "Apenas combustível visual de circuito.", "Exclusivamente combustível para acionamento."], "Planejamento IFR exige margem para espera, alternado, desvios e aproximação perdida."),
      topic("Decisão operacional", "Gerenciamento de risco PC/IFR", ["em operação PC, a decisão de alternar deve considerar:", "pressão comercial durante mau tempo deve ser tratada como:", "quando a aeronave não atende à performance requerida, o piloto deve:"], "Risco operacional, mínimos, combustível, performance, condição da aeronave e segurança.", ["Motivo para reduzir margens abaixo do mínimo.", "Autorização para ignorar limitações do manual.", "Fator que elimina responsabilidade do comandante."], "Operação profissional exige decisões conservadoras e aderentes a limites técnicos e legais."),
    ],
  },
  {
    key: "TECIFR",
    label: "Conhecimentos Técnicos IFR",
    topics: [
      topic("Instrumentos giroscópicos", "Instrumentos de voo IFR", ["falha de instrumento giroscópico em IFR pode exigir:", "o horizonte artificial auxilia principalmente em:", "comparação cruzada de instrumentos serve para:"], "Uso de redundância, cross-check e procedimentos adequados para manter controle da aeronave.", ["Desligar todos os instrumentos remanescentes.", "Prosseguir sem referência de atitude.", "Cancelar a necessidade de comunicação."], "IFR depende de interpretação consistente dos instrumentos e reconhecimento de falhas."),
      topic("Sistema pitot-estático", "Pitot-estático - velocímetro, altímetro e VSI", ["bloqueio no sistema pitot-estático pode afetar:", "aquecimento de pitot é usado para:", "leituras inconsistentes de velocidade devem levar o piloto a:"], "Indicações de velocidade, altitude ou razão de subida, exigindo diagnóstico e procedimento.", ["Alterar apenas a frequência do transponder.", "Melhorar automaticamente a razão de subida.", "Eliminar a necessidade de atitude e potência."], "Pitot-estático é crítico para instrumentos básicos, especialmente em IMC."),
      topic("Transponder e vigilância", "Equipamentos ATS - transponder", ["o transponder auxilia o ATS por:", "código transponder incorreto pode causar:", "modo altitude no transponder permite:"], "Fornecer identificação e, quando disponível, informação de altitude ao controle de tráfego.", ["Substituir a navegação da aeronave.", "Gerar autorização automática de pouso.", "Corrigir erro de ajuste de potência."], "Transponder melhora vigilância ATS e consciência de tráfego."),
      topic("Automação IFR", "Uso operacional de piloto automático", ["o piloto automático em IFR deve ser usado como:", "dependência excessiva de automação pode causar:", "antes de acoplar modos de navegação, o piloto deve:"], "Auxílio para reduzir carga de trabalho, mantendo monitoramento ativo e capacidade manual.", ["Substituto integral do comandante.", "Garantia de separação contra qualquer obstáculo.", "Permissão para abandonar o cross-check."], "Automação ajuda, mas exige monitoramento e prontidão para assumir."),
    ],
  },
];

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
  { key: "PC-IFR", title: "Piloto Comercial / IFR", shortTitle: "PC/IFR", description: "Treino avançado para Piloto Comercial, IFR e navegação por instrumentos.", subjects: PC_IFR_SUBJECTS },
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
];

function rotate(list, offset) {
  return [...list.slice(offset), ...list.slice(0, offset)];
}

function lowerFirst(value) {
  const text = String(value || "").trim();
  return text ? text.charAt(0).toLowerCase() + text.slice(1) : "";
}

function makeQuestion(course, subject, topicItem, subjectIndex, globalIndex) {
  const context = CONTEXTS[(subjectIndex + globalIndex) % CONTEXTS.length];
  const stem = topicItem.stems[subjectIndex % topicItem.stems.length];
  const options = rotate([topicItem.correct, ...topicItem.distractors], globalIndex % 4);
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
    correctIndex: options.indexOf(topicItem.correct),
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
