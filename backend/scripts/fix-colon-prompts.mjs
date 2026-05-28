/**
 * Corrige enunciados terminados em ":" nos arquivos de matérias.
 * Uso: node backend/scripts/fix-colon-prompts.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { normalizeExamPrompt } from "../lib/exam-bank-core.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const libDir = path.join(__dirname, "../lib");
const files = ["exam-pp-subjects.js", "exam-pc-ifr-subjects.js", "exam-cms-subjects.js"];

for (const file of files) {
  const filePath = path.join(libDir, file);
  let content = fs.readFileSync(filePath, "utf8");
  let changes = 0;

  content = content.replace(/"([^"\n]+):",/g, (match, inner) => {
    const fixed = normalizeExamPrompt(`${inner}:`);
    if (fixed === `${inner}?` || fixed === normalizeExamPrompt(inner)) {
      if (match === `"${fixed}",`) return match;
    }
    changes += 1;
    return `"${fixed}",`;
  });

  fs.writeFileSync(filePath, content, "utf8");
  console.log(file, changes, "prompts fixed");
}
