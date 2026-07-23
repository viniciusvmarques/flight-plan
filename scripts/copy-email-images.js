const fs = require("fs");
const path = require("path");

const srcDir = String.raw`C:\Users\awavi\.cursor\projects\empty-window\assets`;
const destDir = String.raw`C:\Users\awavi\Desktop\flight-plan\frontend\public\emails`;

fs.mkdirSync(destDir, { recursive: true });

for (const name of ["email-aviation-hero.png", "email-aviation-daynight.png"]) {
  const from = path.join(srcDir, name);
  const to = path.join(destDir, name);
  if (!fs.existsSync(from)) {
    console.error("MISSING", from);
    process.exitCode = 1;
    continue;
  }
  fs.copyFileSync(from, to);
  console.log("OK", name, fs.statSync(to).size);
}
