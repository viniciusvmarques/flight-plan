import { PC_IFR_SUBJECTS } from "./exam-pc-ifr-subjects.js";
import { CMS_SUBJECTS } from "./exam-cms-subjects.js";
import { buildSubjectQuestionBank } from "./exam-bank-core.js";

const EXTRA_COURSES = [
  {
    key: "PC-IFR",
    title: "Piloto Comercial / IFR",
    shortTitle: "PC/IFR",
    description:
      "Simulado PC/IFR com ênfase em navegação rádio (NDB, VOR, DME, ILS), cartas, espera, planejamento de rota e performance — alinhado ao programa ANAC de navegação por instrumentos.",
    subjects: PC_IFR_SUBJECTS,
  },
  {
    key: "CMS",
    title: "Comissário de Voo",
    shortTitle: "Comissário",
    description: "Simulados para comissário de voo, emergência, segurança, primeiros socorros e regulamentação.",
    subjects: CMS_SUBJECTS,
  },
];

export const EXTRA_EXAM_COURSES = EXTRA_COURSES.map((course) => ({
  key: course.key,
  title: course.title,
  shortTitle: course.shortTitle,
  description: course.description,
  freeEnabled: false,
  subjects: course.subjects.map(({ key, label }) => ({ key, label })),
}));

export const EXTRA_EXAM_QUESTIONS = EXTRA_COURSES.flatMap((course) =>
  buildSubjectQuestionBank(course.subjects, course.key, course.title)
);
