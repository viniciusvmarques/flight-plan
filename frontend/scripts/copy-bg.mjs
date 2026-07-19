import { copyFileSync, existsSync, mkdirSync, statSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const here = dirname(fileURLToPath(import.meta.url));
const fileName = process.argv[2] || "bg-ifr-chart-4k.jpg";
const dest = join(here, "../public/images", fileName);
const sources = [
    `C:/Users/awavi/.cursor/projects/empty-window/assets/${fileName}`,
    join(here, "../../assets", fileName),
];

mkdirSync(dirname(dest), { recursive: true });

const src = sources.find((p) => existsSync(p));
if (!src) {
    if (existsSync(dest)) {
        console.log("[copy-bg] Usando imagem existente:", dest);
        process.exit(0);
    }
    console.warn(`[copy-bg] Aviso: ${fileName} não encontrada — o site sobe mesmo assim.`);
    console.warn("[copy-bg] Copie manualmente para public/images/ se quiser o fundo IFR.");
    process.exit(0);
}

copyFileSync(src, dest);
console.log("[copy-bg] OK", dest, statSync(dest).size, "bytes");
