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

/** Evita que todas as questões *-0001 (globalIndex múltiplo de 4) tenham gabarito na letra A. */
function optionRotationOffset(subjectKey, globalIndex) {
  const subjectSeed = String(subjectKey || "")
    .split("")
    .reduce((acc, char) => (acc * 33 + char.charCodeAt(0)) >>> 0, 17);
  return (globalIndex + subjectSeed) % 4;
}

export function withPresentationOptions(question, seed = question?.id, fixedOffset = null) {
  if (!question?.options?.length) return question;
  const correctText = question.options[question.correctIndex];
  let offset = Number.isInteger(fixedOffset) ? fixedOffset : null;
  if (offset === null) {
    let hash = 2166136261;
    for (const char of String(seed || "")) {
      hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    }
    const subjectBump = String(question.subject || "")
      .split("")
      .reduce((acc, char) => (acc * 17 + char.charCodeAt(0)) >>> 0, 3);
    offset = (hash + subjectBump) % question.options.length;
  }
  const options = rotate([...question.options], offset);
  const correctIndex = options.indexOf(correctText);
  return { ...question, options, correctIndex: correctIndex >= 0 ? correctIndex : question.correctIndex };
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
    optionRotationOffset(subject.key, globalIndex)
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

export function publicQuestion(question, presentationSeed = question?.id, fixedOffset = null) {
  const presented = withPresentationOptions(question, presentationSeed, fixedOffset);
  return {
    id: presented.id,
    license: presented.license,
    subject: presented.subject,
    subjectLabel: presented.subjectLabel,
    topic: presented.topic,
    difficulty: presented.difficulty,
    question: normalizeExamPrompt(presented.question),
    options: presented.options,
  };
}

export function resultQuestion(question, selectedIndex = null, presented = null, fixedOffset = null) {
  const view = presented || withPresentationOptions(question, question.id, fixedOffset);
  return {
    id: view.id,
    license: view.license,
    subject: view.subject,
    subjectLabel: view.subjectLabel,
    topic: view.topic,
    difficulty: view.difficulty,
    question: normalizeExamPrompt(view.question),
    options: view.options,
    selectedIndex,
    correctIndex: view.correctIndex,
    correct: selectedIndex === view.correctIndex,
    explanation: view.explanation,
    reference: view.reference,
  };
}
