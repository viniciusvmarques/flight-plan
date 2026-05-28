import { PP_SUBJECTS } from "./exam-pp-subjects.js";
import { buildSubjectQuestionBank, publicQuestion, resultQuestion } from "./exam-bank-core.js";

export const EXAM_SUBJECTS = PP_SUBJECTS.map(({ key, label }) => ({ key, label }));
export const EXAM_QUESTIONS = buildSubjectQuestionBank(PP_SUBJECTS, "PP-A", "Piloto Privado Avião");

export { publicQuestion, resultQuestion };
