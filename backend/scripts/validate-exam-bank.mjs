import { EXAM_QUESTIONS } from "../lib/exam-question-bank.js";
import { EXTRA_EXAM_QUESTIONS } from "../lib/exam-extra-question-bank.js";

const all = [...EXAM_QUESTIONS, ...EXTRA_EXAM_QUESTIONS];
const bad = all.filter((q) => q.correctIndex < 0 || !String(q.question).includes("?"));
console.log({
  pp: EXAM_QUESTIONS.length,
  extra: EXTRA_EXAM_QUESTIONS.length,
  total: all.length,
  bad: bad.length,
  sample: all[0]?.question,
});
if (bad.length) {
  console.error("BAD", bad.slice(0, 3));
  process.exit(1);
}
