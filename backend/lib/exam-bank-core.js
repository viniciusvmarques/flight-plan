/**
 * Núcleo compartilhado dos bancos de simulado — perguntas completas, sem prefixo de cenário.
 */

export function q(prompt, correct, distractors) {
  return { prompt: normalizeExamPrompt(prompt), correct, distractors: distractors.slice(0, 3) };
}

export function topic(topicName, reference, items, explanation) {
  return { topic: topicName, reference, items, explanation };
}

function rotate(list, offset) {
  return [...list.slice(offset), ...list.slice(0, offset)];
}

function capitalizeSentence(text) {
  const value = String(text || "").trim();
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Garante enunciado terminado em "?" — nunca ":", ":?" ou ": ?". */
export function normalizeExamPrompt(text) {
  let value = String(text || "").trim();
  if (!value) return "";

  value = value.replace(/\uFF1A/g, ":");

  // Remove sufixos : ?, :?, ::?, etc.
  value = value.replace(/:+\s*\?+\s*$/u, "").trim();
  value = value.replace(/:+\s*$/u, "").trim();
  value = value.replace(/[\s;,.!?]+$/u, "").trim();

  if (!value) return "?";
  return `${value}?`;
}

function resolveTopicItem(topicItem, subjectIndex, globalIndex) {
  if (Array.isArray(topicItem.items) && topicItem.items.length) {
    return topicItem.items[(subjectIndex + globalIndex) % topicItem.items.length];
  }
  return {
    prompt: topicItem.stems?.[(subjectIndex + globalIndex) % topicItem.stems.length] || "",
    correct: topicItem.correct,
    distractors: topicItem.distractors || [],
  };
}

export function makeExamQuestion({ subject, topicItem, subjectIndex, globalIndex, license, licenseLabel, idPrefix }) {
  const item = resolveTopicItem(topicItem, subjectIndex, globalIndex);
  const prompt = normalizeExamPrompt(item.prompt || item.stem || "");
  const correctOption = capitalizeSentence(item.correct);
  const options = rotate(
    [correctOption, ...(item.distractors || []).map((option) => capitalizeSentence(option))],
    globalIndex % 4
  );

  return {
    id: `${idPrefix}-${String(subjectIndex + 1).padStart(4, "0")}`,
    license,
    licenseLabel,
    subject: subject.key,
    subjectLabel: subject.label,
    topic: topicItem.topic,
    difficulty: ["facil", "media", "media", "dificil"][globalIndex % 4],
    question: prompt,
    options,
    correctIndex: options.indexOf(correctOption),
    explanation: topicItem.explanation,
    reference: topicItem.reference,
    status: "approved",
  };
}

export function buildSubjectQuestionBank(subjects, license, licenseLabel, questionsPerSubject = 400) {
  const questions = [];
  for (const subject of subjects) {
    let subjectCount = 0;
    while (subjectCount < questionsPerSubject) {
      for (const topicItem of subject.topics) {
        if (subjectCount >= questionsPerSubject) break;
        questions.push(
          makeExamQuestion({
            subject,
            topicItem,
            subjectIndex: subjectCount,
            globalIndex: questions.length,
            license,
            licenseLabel,
            idPrefix: `${license}-${subject.key}`,
          })
        );
        subjectCount += 1;
      }
    }
  }
  return questions;
}

export function publicQuestion(question) {
  return {
    id: question.id,
    license: question.license,
    subject: question.subject,
    subjectLabel: question.subjectLabel,
    topic: question.topic,
    difficulty: question.difficulty,
    question: normalizeExamPrompt(question.question),
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
