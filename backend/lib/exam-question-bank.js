import { PP_SUBJECTS } from "./exam-pp-subjects.js";

const SUBJECTS = PP_SUBJECTS;

const OPERATIONAL_CASES = [
  "aeronave de instrução em voo local no período da manhã",
  "navegação escola entre dois aeródromos controlados",
  "voo visual com alternado já definido no planejamento",
  "trecho de treinamento com vento lateral previsto",
  "preparação de decolagem após consulta de boletins atualizados",
  "aproximação para aeródromo não controlado em condições visuais",
  "voo de cheque com avaliação de tomada de decisão",
  "briefing pré-voo com aluno e instrutor a bordo",
  "navegação curta com mudança de meteorologia no destino",
  "operação diurna com tráfego conhecido na terminal",
  "trecho de cruzeiro com necessidade de recalcular estimados",
  "planejamento com combustível limitado e margem operacional",
  "revisão de pane simulada durante instrução",
  "voo de readaptação com consulta de cartas e NOTAM",
  "saída de aeródromo com restrição operacional publicada",
  "exercício de fonia com órgão ATS em espaço controlado",
  "avaliação de teto e visibilidade antes da partida",
  "treinamento de circuito de tráfego com vento variável",
  "deslocamento entre aeródromos com alternado próximo",
  "voo solo supervisionado dentro dos limites autorizados",
  "planejamento de rota com checkpoints visuais definidos",
  "operação de instrução com aeronave leve a pistão",
  "voo em área de treinamento com retorno ao aeródromo de origem",
  "navegação visual com acompanhamento de consumo horário",
  "preparação operacional em dia de alta temperatura",
  "estudo de navegação visual e estimada para PP",
  "resolução de problema de rota VFR com carta",
  "planejamento de subida e cruzeiro entre aeródromos",
  "cálculo de vento cruzado na etapa de navegação",
  "leitura de carta antes de voo solo supervisionado",
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

function variantContext(index, globalIndex) {
  const operation = OPERATIONAL_CASES[(index + globalIndex) % OPERATIONAL_CASES.length];
  const altitude = [2500, 3500, 4500, 5500, 6500, 7500][globalIndex % 6];
  const time = ["08:30", "09:45", "11:10", "13:20", "15:05", "16:40"][index % 6];
  const contextStyle = globalIndex % 4;

  if (contextStyle === 0) return `Durante ${operation},`;
  if (contextStyle === 1) return `Em ${operation}, com cruzeiro planejado de ${altitude} ft,`;
  if (contextStyle === 2) return `Antes de uma ${operation}, no briefing das ${time},`;
  return `Considerando ${operation},`;
}

function makeQuestion(subject, topicItem, subjectIndex, globalIndex) {
  const item = resolveTopicItem(topicItem, subjectIndex, globalIndex);
  const scenario = variantContext(subjectIndex, globalIndex);
  const options = rotate([item.correct, ...item.distractors], globalIndex % 4);

  return {
    id: `${subject.key}-${String(globalIndex + 1).padStart(4, "0")}`,
    license: "PP-A",
    licenseLabel: "Piloto Privado Avião",
    subject: subject.key,
    subjectLabel: subject.label,
    topic: topicItem.topic,
    difficulty: ["facil", "media", "media", "dificil"][globalIndex % 4],
    question: `${scenario} ${lowerFirst(item.stem)}`,
    options,
    correctIndex: options.indexOf(item.correct),
    explanation: topicItem.explanation,
    reference: topicItem.reference,
    status: "approved",
  };
}

export function buildExamQuestionBank() {
  const questions = [];
  for (const subject of SUBJECTS) {
    let subjectCount = 0;
    while (subjectCount < 400) {
      for (const topicItem of subject.topics) {
        if (subjectCount >= 400) break;
        questions.push(makeQuestion(subject, topicItem, subjectCount, questions.length));
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
