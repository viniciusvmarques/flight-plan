const SUBJECTS = [
  {
    key: "REG",
    label: "Regulamentos de Tráfego Aéreo",
    topics: [
      {
        topic: "Regras VFR e responsabilidade do piloto",
        reference: "RBAC 61/91 e ICA 100-12 - regras gerais de voo",
        stems: [
          "Em uma operação VFR, a responsabilidade final pela decisão de prosseguir o voo cabe:",
          "Antes de iniciar um voo VFR, a avaliação das condições meteorológicas e da documentação operacional deve ser feita:",
          "Ao identificar que as condições deixam de atender ao planejamento visual, a conduta mais segura é:",
        ],
        correct: "Ao piloto em comando, que deve avaliar fontes oficiais, condições e limitações da operação.",
        distractors: [
          "Ao passageiro mais experiente, quando houver piloto aluno a bordo.",
          "Exclusivamente ao operador do aeródromo de destino.",
          "Ao serviço de informação de voo, que autoriza a continuidade do VFR.",
        ],
        explanation: "A lógica regulatória atribui ao piloto em comando a responsabilidade pela preparação, condução segura e decisão operacional do voo.",
      },
      {
        topic: "Documentos e preparação do voo",
        reference: "RBAC 91 e práticas de preparação pré-voo",
        stems: [
          "Na preparação pré-voo, a consulta de NOTAM, informações do aeródromo e meteorologia tem por finalidade principal:",
          "Um briefing operacional adequado antes da decolagem deve contemplar:",
          "A verificação de informações atualizadas de aeródromos e espaço aéreo deve ocorrer:",
        ],
        correct: "Identificar restrições, condições e riscos que possam afetar a segurança e a regularidade do voo.",
        distractors: [
          "Substituir integralmente a inspeção pré-voo da aeronave.",
          "Permitir que o voo seja realizado sem análise de combustível.",
          "Eliminar a necessidade de julgamento do piloto em comando.",
        ],
        explanation: "A preparação pré-voo reduz incertezas e apoia a decisão, mas não substitui inspeção, cálculo ou julgamento operacional.",
      },
      {
        topic: "Comunicações e fraseologia",
        reference: "ICA 100-12 e MCA de fraseologia aplicável",
        stems: [
          "A finalidade da fraseologia padronizada nas comunicações aeronáuticas é:",
          "Em fonia aeronáutica, mensagens curtas, claras e padronizadas ajudam principalmente a:",
          "Quando uma instrução recebida não for compreendida, o piloto deve:",
        ],
        correct: "Reduzir ambiguidades e aumentar a segurança na coordenação entre aeronaves e órgãos ATS.",
        distractors: [
          "Aumentar a quantidade de informações transmitidas em cada chamada.",
          "Permitir a substituição do indicativo da aeronave por apelidos locais.",
          "Evitar qualquer necessidade de cotejamento em instruções críticas.",
        ],
        explanation: "Fraseologia padronizada torna a comunicação previsível, objetiva e menos sujeita a interpretações incorretas.",
      },
      {
        topic: "Espaço aéreo e serviços ATS",
        reference: "ICA 100-12 - classes de espaço aéreo e serviços de tráfego aéreo",
        stems: [
          "A entrada em espaço aéreo controlado requer atenção especial porque:",
          "Em áreas onde há prestação de serviço de controle, o piloto deve considerar:",
          "O planejamento de rota que cruza TMA/CTR deve prever:",
        ],
        correct: "Podem existir requisitos de autorização, comunicação, transponder e cumprimento de instruções do órgão ATS.",
        distractors: [
          "Todos os voos VFR são proibidos independentemente de autorização.",
          "A comunicação rádio deixa de ser necessária quando a visibilidade é boa.",
          "O altímetro pode ser ajustado livremente sem referência ao órgão ATS.",
        ],
        explanation: "Espaços controlados possuem regras próprias de coordenação para manter separação e fluxo seguro de tráfego.",
      },
    ],
  },
  {
    key: "MET",
    label: "Meteorologia Aeronáutica",
    topics: [
      {
        topic: "METAR e condições observadas",
        reference: "Códigos METAR/SPECI e meteorologia operacional",
        stems: [
          "Em um METAR, a informação de vento apresentada no início do boletim indica:",
          "A leitura correta de um METAR é importante porque ele representa:",
          "Quando um METAR indica redução significativa de visibilidade, o piloto VFR deve:",
        ],
        correct: "Condições meteorológicas observadas no aeródromo em horário específico.",
        distractors: [
          "Previsão de rota para as próximas 24 horas.",
          "Autorização de decolagem emitida pelo controle.",
          "Condição estimada sem relação com observação local.",
        ],
        explanation: "METAR é uma observação meteorológica codificada do aeródromo, usada como base de consciência situacional.",
      },
      {
        topic: "TAF e previsão",
        reference: "Códigos TAF e previsão meteorológica aeronáutica",
        stems: [
          "O TAF deve ser usado no planejamento porque fornece:",
          "Ao comparar METAR e TAF, uma diferença importante é que:",
          "Em uma navegação, consultar o TAF do destino ajuda a avaliar:",
        ],
        correct: "Previsão codificada das condições meteorológicas esperadas para um aeródromo em determinado período.",
        distractors: [
          "Registro oficial de manutenção da aeronave.",
          "Lista de NOTAMs aplicáveis à rota.",
          "Autorização IFR para aproximação no destino.",
        ],
        explanation: "TAF é previsão. Ele complementa o METAR ao indicar tendência de tempo para o período planejado.",
      },
      {
        topic: "Nuvens, teto e visibilidade",
        reference: "Meteorologia aeronáutica básica - teto, nebulosidade e visibilidade",
        stems: [
          "Para um voo VFR, teto e visibilidade são relevantes porque:",
          "A presença de camada baixa extensa pode impactar o voo visual principalmente por:",
          "Na avaliação meteorológica, visibilidade reduzida deve ser tratada como:",
        ],
        correct: "Afetam a manutenção de referências visuais, separação de obstáculos e cumprimento das regras VFR.",
        distractors: [
          "Afetam apenas aeronaves turbojato em nível de cruzeiro.",
          "Têm importância somente durante voos noturnos IFR.",
          "Eliminam a necessidade de consulta a previsão quando o aeródromo é conhecido.",
        ],
        explanation: "VFR depende de referências visuais adequadas; teto e visibilidade são parâmetros críticos de decisão.",
      },
      {
        topic: "Altimetria e pressão",
        reference: "Meteorologia e altimetria - QNH, altitude e nível de voo",
        stems: [
          "O ajuste altimétrico QNH permite que o altímetro indique aproximadamente:",
          "Uma pressão ajustada incorretamente no altímetro pode causar:",
          "Na preparação de voo, conferir QNH é importante para:",
        ],
        correct: "Altitude em relação ao nível médio do mar quando a aeronave está no solo do aeródromo.",
        distractors: [
          "Altura exata sobre qualquer obstáculo da rota.",
          "Velocidade indicada corrigida para temperatura.",
          "Distância horizontal até o aeródromo de destino.",
        ],
        explanation: "QNH ajusta o altímetro para indicar altitude referida ao nível médio do mar, essencial para separação vertical.",
      },
    ],
  },
  {
    key: "NAV",
    label: "Navegação Aérea Visual",
    topics: [
      {
        topic: "Rumo, proa e deriva",
        reference: "Navegação estimada - rumo, proa, vento e deriva",
        stems: [
          "Com vento lateral vindo da esquerda, para manter a rota desejada a proa deve ser ajustada:",
          "A diferença entre rumo e proa ocorre principalmente porque:",
          "Na navegação estimada, a correção de deriva serve para:",
        ],
        correct: "Para a esquerda da rota, compensando a tendência de deriva para a direita.",
        distractors: [
          "Para a direita da rota, aumentando a deriva causada pelo vento.",
          "Sempre para o norte magnético, independentemente do vento.",
          "Somente após chegar ao destino, pois a correção em rota é proibida.",
        ],
        explanation: "A proa deve apontar contra o vento lateral para que a trajetória resultante acompanhe a rota planejada.",
      },
      {
        topic: "Tempo, distância e velocidade",
        reference: "Navegação aérea - relação distância/velocidade/tempo",
        stems: [
          "Se a distância até um ponto é conhecida e a velocidade no solo foi estimada, o ETE é obtido por:",
          "Em navegação visual, recalcular tempo estimado em rota permite:",
          "A velocidade no solo difere da TAS principalmente pela influência de:",
        ],
        correct: "Dividir a distância pela velocidade no solo e converter o resultado para minutos.",
        distractors: [
          "Multiplicar a altitude pela temperatura externa.",
          "Somar o rumo verdadeiro ao rumo magnético.",
          "Dividir o combustível a bordo pela distância em pés.",
        ],
        explanation: "ETE depende de distância e ground speed. Vento de proa/cauda altera a velocidade no solo.",
      },
      {
        topic: "Cartas e referências visuais",
        reference: "Navegação VFR - cartas, checkpoints e referências",
        stems: [
          "Na navegação VFR, checkpoints bem escolhidos devem ser:",
          "O uso de cartas aeronáuticas no planejamento visual serve para:",
          "Referências visuais em rota devem ser selecionadas considerando:",
        ],
        correct: "Identificáveis, espaçados de forma útil e compatíveis com a escala da carta e a altitude planejada.",
        distractors: [
          "Apenas pontos invisíveis no terreno para evitar distração.",
          "Sempre cidades pequenas sem qualquer característica marcante.",
          "Elementos escolhidos somente após o pouso.",
        ],
        explanation: "Checkpoints bons ajudam a confirmar posição, tempo e progresso do voo com referências visuais confiáveis.",
      },
      {
        topic: "Combustível e autonomia",
        reference: "Planejamento de navegação - autonomia, reservas e alternado",
        stems: [
          "No planejamento de combustível, a reserva final tem a função de:",
          "A autonomia calculada deve ser comparada com o tempo total planejado porque:",
          "Ao planejar alternado, o combustível necessário deve considerar:",
        ],
        correct: "Fornecer margem operacional mínima após o consumo previsto para a rota e etapas planejadas.",
        distractors: [
          "Substituir a necessidade de calcular consumo em cruzeiro.",
          "Permitir decolar sem combustível de táxi.",
          "Ser usada apenas para aumentar a velocidade da aeronave.",
        ],
        explanation: "Reservas e alternado protegem contra variações de vento, espera, desvios e incertezas operacionais.",
      },
    ],
  },
  {
    key: "TEV",
    label: "Teoria de Voo",
    topics: [
      {
        topic: "Sustentação e ângulo de ataque",
        reference: "Aerodinâmica básica - sustentação, arrasto e ângulo de ataque",
        stems: [
          "A sustentação em uma asa é influenciada principalmente por:",
          "O aumento excessivo do ângulo de ataque pode levar:",
          "Em voo, a asa produz sustentação quando:",
        ],
        correct: "Velocidade relativa, densidade do ar, área/forma da asa e ângulo de ataque dentro dos limites.",
        distractors: [
          "Apenas pela cor da pintura da aeronave.",
          "Somente pelo peso dos passageiros, sem relação com o ar.",
          "Exclusivamente pela posição do trem de pouso.",
        ],
        explanation: "Sustentação depende da interação do perfil com o escoamento; ângulo de ataque excessivo pode causar estol.",
      },
      {
        topic: "Estol",
        reference: "Teoria de voo - estol e controle em baixa velocidade",
        stems: [
          "O estol ocorre quando:",
          "Uma característica importante do estol é que ele está diretamente associado:",
          "Para recuperar uma condição de estol, a ação essencial inicial é:",
        ],
        correct: "O ângulo de ataque crítico é excedido e o fluxo se separa de forma significativa da asa.",
        distractors: [
          "A aeronave atinge qualquer velocidade acima da velocidade de cruzeiro.",
          "O altímetro indica exatamente o nível de transição.",
          "O rádio deixa de receber a frequência de torre.",
        ],
        explanation: "Estol é fenômeno aerodinâmico ligado ao ângulo de ataque, não apenas a uma velocidade fixa.",
      },
      {
        topic: "Estabilidade e controles",
        reference: "Teoria de voo - estabilidade longitudinal, lateral e direcional",
        stems: [
          "A estabilidade longitudinal está relacionada principalmente ao movimento em torno do eixo:",
          "O profundor atua principalmente no controle de:",
          "Os ailerons atuam principalmente para controlar:",
        ],
        correct: "Lateral, afetando atitude de arfagem e equilíbrio nariz-acima/nariz-abaixo.",
        distractors: [
          "Vertical, controlando exclusivamente a guinada.",
          "Longitudinal, controlando exclusivamente o rolamento.",
          "De rotação do motor, controlando a mistura.",
        ],
        explanation: "A estabilidade longitudinal envolve arfagem; profundor e estabilizador horizontal têm papel central nesse eixo.",
      },
      {
        topic: "Peso e balanceamento",
        reference: "Teoria de voo - peso, centro de gravidade e performance",
        stems: [
          "Um centro de gravidade fora dos limites pode causar:",
          "O carregamento correto da aeronave é importante porque:",
          "Centro de gravidade muito traseiro tende a:",
        ],
        correct: "Alteração de estabilidade, controle e características de recuperação da aeronave.",
        distractors: [
          "Melhorar sempre a estabilidade em qualquer condição.",
          "Eliminar o arrasto induzido em baixa velocidade.",
          "Substituir a necessidade de calcular combustível.",
        ],
        explanation: "Peso e CG impactam performance, estabilidade e controlabilidade; limites do manual devem ser respeitados.",
      },
    ],
  },
  {
    key: "CTE",
    label: "Conhecimentos Técnicos",
    topics: [
      {
        topic: "Motor a pistão",
        reference: "Conhecimentos técnicos - funcionamento básico de motores aeronáuticos",
        stems: [
          "Em um motor a pistão, o ciclo de quatro tempos inclui:",
          "A finalidade básica do sistema de ignição em motor aeronáutico a pistão é:",
          "Durante a operação do motor, temperaturas e pressões devem ser monitoradas porque:",
        ],
        correct: "Admissão, compressão, combustão/expansão e escapamento.",
        distractors: [
          "Decolagem, cruzeiro, aproximação e pouso.",
          "VHF, transponder, altímetro e bússola.",
          "Táxi, subida, fonia e navegação.",
        ],
        explanation: "Motores a pistão convencionais seguem o ciclo de quatro tempos, base para compreender potência e limitações.",
      },
      {
        topic: "Sistema de combustível",
        reference: "Conhecimentos técnicos - combustível, alimentação e contaminação",
        stems: [
          "A drenagem de combustível antes do voo busca identificar principalmente:",
          "Um sistema de combustível deve ser verificado no pré-voo para:",
          "Água ou impurezas no combustível representam risco porque podem:",
        ],
        correct: "Presença de água, sedimentos ou contaminação que possam afetar o funcionamento do motor.",
        distractors: [
          "Aumentar automaticamente a octanagem do combustível.",
          "Melhorar o resfriamento dos freios durante o táxi.",
          "Substituir a inspeção visual das asas.",
        ],
        explanation: "Combustível contaminado pode causar falha parcial ou total de potência; drenagem e inspeção são barreiras preventivas.",
      },
      {
        topic: "Sistema elétrico",
        reference: "Conhecimentos técnicos - bateria, alternador e cargas elétricas",
        stems: [
          "A função do alternador no sistema elétrico é:",
          "Uma falha de alternador em voo pode exigir:",
          "A bateria da aeronave normalmente serve para:",
        ],
        correct: "Fornecer energia elétrica e manter a bateria carregada durante a operação normal.",
        distractors: [
          "Gerar sustentação adicional nas asas.",
          "Substituir o sistema de combustível.",
          "Controlar diretamente o ângulo de ataque.",
        ],
        explanation: "Alternador e bateria sustentam instrumentos, rádios e sistemas elétricos; falhas exigem gerenciamento de carga.",
      },
      {
        topic: "Instrumentos básicos",
        reference: "Conhecimentos técnicos - instrumentos de voo e limitações",
        stems: [
          "O velocímetro indica principalmente:",
          "O altímetro depende de:",
          "A bússola magnética pode apresentar erros associados a:",
        ],
        correct: "Velocidade indicada baseada na diferença entre pressão dinâmica e estática.",
        distractors: [
          "Velocidade GPS obrigatoriamente igual à ground speed.",
          "Temperatura do óleo corrigida pela altitude.",
          "Distância até a próxima estação VHF.",
        ],
        explanation: "Instrumentos básicos possuem princípios e limitações próprios que o piloto deve compreender para interpretar corretamente.",
      },
    ],
  },
];

function rotate(list, offset) {
  return [...list.slice(offset), ...list.slice(0, offset)];
}

function buildOptions(topic, variantIndex) {
  const correctIndex = variantIndex % 4;
  const options = rotate([topic.correct, ...topic.distractors], correctIndex);
  return {
    options,
    correctIndex: options.indexOf(topic.correct),
  };
}

function makeQuestion(subject, topic, index, globalIndex) {
  const stem = topic.stems[index % topic.stems.length];
  const scenario = [
    "Considere uma operação de treinamento em aviação geral.",
    "Durante o planejamento de um voo local de instrução.",
    "Em uma navegação VFR de escola de aviação.",
    "Ao revisar o briefing antes da decolagem.",
    "Em uma situação típica de prova teórica.",
  ][Math.floor(index / topic.stems.length) % 5];
  const { options, correctIndex } = buildOptions(topic, globalIndex);

  return {
    id: `${subject.key}-${String(globalIndex + 1).padStart(4, "0")}`,
    license: "PP-A",
    subject: subject.key,
    subjectLabel: subject.label,
    topic: topic.topic,
    difficulty: ["facil", "media", "media", "dificil"][globalIndex % 4],
    question: `${scenario} ${stem}`,
    options,
    correctIndex,
    explanation: topic.explanation,
    reference: topic.reference,
    status: "approved",
  };
}

export function buildExamQuestionBank() {
  const questions = [];
  for (const subject of SUBJECTS) {
    let subjectCount = 0;
    while (subjectCount < 400) {
      for (const topic of subject.topics) {
        if (subjectCount >= 400) break;
        questions.push(makeQuestion(subject, topic, subjectCount, questions.length));
        subjectCount += 1;
      }
    }
  }
  return questions;
}

export const EXAM_SUBJECTS = SUBJECTS.map(({ key, label }) => ({ key, label }));
export const EXAM_QUESTIONS = buildExamQuestionBank();

export function publicQuestion(question) {
  return {
    id: question.id,
    license: question.license,
    subject: question.subject,
    subjectLabel: question.subjectLabel,
    topic: question.topic,
    difficulty: question.difficulty,
    question: question.question,
    options: question.options,
  };
}

export function resultQuestion(question, selectedIndex = null) {
  return {
    ...publicQuestion(question),
    selectedIndex,
    correctIndex: question.correctIndex,
    correct: selectedIndex === question.correctIndex,
    explanation: question.explanation,
    reference: question.reference,
  };
}
