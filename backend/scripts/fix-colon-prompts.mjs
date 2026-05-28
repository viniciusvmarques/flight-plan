/**
 * Converte enunciados terminados em ":" nos arquivos de matérias para perguntas com "?".
 * Uso: node backend/scripts/fix-colon-prompts.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const libDir = path.join(__dirname, "../lib");
const files = ["exam-pp-subjects.js", "exam-pc-ifr-subjects.js", "exam-cms-subjects.js"];

function colonToQuestion(text) {
  let value = text.trim();
  if (!value.endsWith(":")) return text;
  value = value.slice(0, -1).trim();

  const rules = [
    [/^O METAR representa$/i, "O que o METAR representa"],
    [/^No METAR, o vento é informado como$/i, "No METAR, como o vento é informado"],
    [/^A TAF fornece$/i, "O que a TAF fornece"],
    [/^Grupo TEMPO na TAF indica$/i, "O que o grupo TEMPO na TAF indica"],
    [/^Grupo BECMG na TAF sugere$/i, "O que o grupo BECMG na TAF sugere"],
    [/^(.+) representa$/i, "O que representa $1"],
    [/^(.+) indica$/i, "O que indica $1"],
    [/^(.+) exige$/i, "O que exige $1"],
    [/^(.+) pode exigir$/i, "O que pode exigir $1"],
    [/^(.+) deve evitar$/i, "O que deve evitar $1"],
    [/^(.+) segue$/i, "O que segue $1"],
    [/^(.+) reduz$/i, "O que reduz $1"],
    [/^Se o piloto não compreender uma instrução, deve$/i, "O que o piloto deve fazer se não compreender uma instrução"],
    [/^(.+) deve incluir$/i, "O que deve incluir $1"],
    [/^(.+) deve ser$/i, "Como deve ser $1"],
    [/^(.+) devem ser$/i, "Como devem ser $1"],
    [/^(.+) é responsabilidade$/i, "De quem é a responsabilidade por $1"],
    [/^(.+) afeta$/i, "O que afeta $1"],
    [/^(.+) fazem parte de$/i, "Do que fazem parte $1"],
    [/^(.+) implica$/i, "O que implica $1"],
    [/^(.+) inclui$/i, "O que inclui $1"],
    [/^(.+) fornece$/i, "O que fornece $1"],
    [/^(.+) sugere$/i, "O que sugere $1"],
    [/^(.+) usa$/i, "O que usa $1"],
    [/^(.+) controla$/i, "O que controla $1"],
    [/^(.+) mostra$/i, "O que mostra $1"],
    [/^(.+) permite$/i, "O que permite $1"],
    [/^(.+) ajuda a$/i, "Como ajuda $1"],
    [/^(.+) serve para$/i, "Para que serve $1"],
    [/^(.+) tende a$/i, "O que tende a ocorrer em $1"],
    [/^(.+) pode causar$/i, "O que pode causar $1"],
    [/^(.+) pode$/i, "O que pode ocorrer em $1"],
    [/^(.+), em geral$/i, "O que significa $1, em geral"],
    [/^(.+) Isso implica$/i, "O que implica o fato de que $1"],
    [/^O comissário de voo atua na interface entre passageiros e operação\. Isso implica$/i, "O que implica a atuação do comissário na interface entre passageiros e operação"],
    [/^Segundo a regulamentação aplicável ao comissário, sua função na tripulação de cabine inclui$/i, "O que inclui a função do comissário na tripulação de cabine, segundo a regulamentação"],
    [/^A comunicação entre a tripulação de cabine e a cabine de comando deve ser$/i, "Como deve ser a comunicação entre a tripulação de cabine e a cabine de comando"],
  ];

  for (const [pattern, replacement] of rules) {
    if (pattern.test(value)) {
      value = value.replace(pattern, replacement);
      break;
    }
  }

  if (!value.endsWith("?")) value = `${value}?`;
  return value;
}

for (const file of files) {
  const filePath = path.join(libDir, file);
  let content = fs.readFileSync(filePath, "utf8");
  let changes = 0;

  content = content.replace(/"([^"\n]+):",/g, (match, inner) => {
    const next = colonToQuestion(`${inner}:`);
    if (next === `${inner}:`) return match;
    changes += 1;
    return `"${next}",`;
  });

  fs.writeFileSync(filePath, content, "utf8");
  console.log(file, changes, "prompts updated");
}
