import { PP_SUBJECTS } from "./exam-pp-subjects.js";

const SUBJECTS = PP_SUBJECTS;

function rotate(list, offset) {
  return [...list.slice(offset), ...list.slice(0, offset)];
}

function capitalizeSentence(text) {
  const value = String(text || "").trim();
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function ensureQuestionMark(text) {
  const value = String(text || "").trim();
  if (!value) return "";
  return value.endsWith("?") ? value : `${value}?`;
}

function resolveTopicItem(topicItem, subjectIndex, globalIndex) {
  if (Array.isArray(topicItem.items) && topicItem.items.length) {
    return topicItem.items[(subjectIndex + globalIndex) % topicItem.items.length];
  }
  return {
    prompt: topicItem.stems[(subjectIndex + globalIndex) % topicItem.stems.length],
    correct: topicItem.correct,
    distractors: topicItem.distractors,
  };
}

function makeQuestion(subject, topicItem, subjectIndex, globalIndex) {
  const item = resolveTopicItem(topicItem, subjectIndex, globalIndex);
  const prompt = ensureQuestionMark(item.prompt || item.stem || "");
  const correctOption = capitalizeSentence(item.correct);
  const options = rotate(
    [correctOption, ...(item.distractors || []).map((option) => capitalizeSentence(option))],
    globalIndex % 4
  );

  return {
    id: `${subject.key}-${String(globalIndex + 1).padStart(4, "0")}`,
    license: "PP-A",
    licenseLabel: "Piloto Privado Avião",
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
