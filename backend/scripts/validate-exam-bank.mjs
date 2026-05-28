import { EXAM_QUESTIONS } from "../lib/exam-question-bank.js";
import { EXTRA_EXAM_QUESTIONS } from "../lib/exam-extra-question-bank.js";

const all = [...EXAM_QUESTIONS, ...EXTRA_EXAM_QUESTIONS];
const badIndex = all.filter((q) => q.correctIndex < 0);
const badColon = all.filter((q) => /:\s*$/.test(String(q.question).trim()) || /:\?\s*$/.test(String(q.question).trim()));
const badNoQuestion = all.filter((q) => !String(q.question).trim().endsWith("?"));

console.log({
  pp: EXAM_QUESTIONS.length,
  extra: EXTRA_EXAM_QUESTIONS.length,
  total: all.length,
  badIndex: badIndex.length,
  badColon: badColon.length,
  badNoQuestion: badNoQuestion.length,
  sample: all[0]?.question,
  sampleReg: all.find((q) => q.subject === "REG")?.question,
});

if (badIndex.length || badColon.length || badNoQuestion.length) {
  console.error("BAD colon", badColon.slice(0, 3).map((q) => q.question));
  console.error("BAD no ?", badNoQuestion.slice(0, 3).map((q) => q.question));
  process.exit(1);
}
