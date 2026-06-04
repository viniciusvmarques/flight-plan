/**
 * Mesmos IDs da amostra fixa — espelho de backend/lib/fixed-exam-sample.js
 */
export const FIXED_SAMPLE_QUESTION_IDS = {
  CMS: ["CMS-REGCMS-0001", "CMS-EMGCMS-0001", "CMS-SBVCMS-0001", "CMS-SEGCMS-0001", "CMS-AERCMS-0001"],
  "PP-A": ["PP-A-NAV-0001", "PP-A-REG-0001", "PP-A-MET-0001", "PP-A-TEV-0001", "PP-A-CTE-0001"],
};

export function sampleIdsMatch(license, questionIds) {
  const expected = FIXED_SAMPLE_QUESTION_IDS[license];
  if (!expected || !Array.isArray(questionIds) || questionIds.length !== expected.length) return false;
  return expected.every((id, index) => questionIds[index] === id);
}
