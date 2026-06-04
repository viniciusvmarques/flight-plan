import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { EXAM_QUESTIONS, EXAM_SUBJECTS } from "../lib/exam-question-bank.js";
import { EXTRA_EXAM_COURSES, EXTRA_EXAM_QUESTIONS } from "../lib/exam-extra-question-bank.js";
import { normalizeExamPrompt } from "../lib/exam-bank-core.js";
import { publicQuestion } from "../lib/exam-question-bank.js";
import { FIXED_SAMPLE_QUESTION_IDS, FIXED_SAMPLE_SESSION_ID } from "../lib/fixed-exam-sample.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const EXAM_COURSES = [
  { key: "PP-A", title: "Piloto Privado - Avião", subjects: EXAM_SUBJECTS },
  ...EXTRA_EXAM_COURSES.map((course) => ({ key: course.key, title: course.title, subjects: course.subjects })),
];

const ALL_EXAM_QUESTIONS = [...EXAM_QUESTIONS, ...EXTRA_EXAM_QUESTIONS].map((question) => ({
  ...question,
  question: normalizeExamPrompt(question.question),
}));

const EXAM_QUESTION_BY_ID = new Map(ALL_EXAM_QUESTIONS.map((question) => [question.id, question]));

function getExamCourse(license) {
  const normalized = String(license || "PP-A").trim().toUpperCase();
  return EXAM_COURSES.find((course) => course.key === normalized) || EXAM_COURSES[0];
}

const payload = {};

for (const license of Object.keys(FIXED_SAMPLE_QUESTION_IDS)) {
  const course = getExamCourse(license);
  const questionIds = FIXED_SAMPLE_QUESTION_IDS[license];
  const questions = questionIds.map((id) => EXAM_QUESTION_BY_ID.get(id)).filter(Boolean);
  payload[license] = {
    sessionId: `${FIXED_SAMPLE_SESSION_ID}:${license}:sample-v1`,
    license: course.key,
    courseTitle: course.title,
    questionIds,
    questions: questions.map((question) => publicQuestion(question)),
  };
}

const outPath = path.resolve(__dirname, "../../frontend/public/fixed-sample.json");
fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Wrote ${outPath}`);
