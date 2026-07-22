import fs from 'fs';
import path from 'path';

const src = 'C:\\Users\\awavi\\.cursor\\projects\\empty-window\\assets\\marquisa-email-logo.png';
const dest1 = 'C:\\Users\\awavi\\Desktop\\flight-plan\\frontend\\public\\marquisa-email-logo.png';
const dest2 = 'C:\\Users\\awavi\\Desktop\\flight-plan\\backend\\assets\\email-logo.png';
const log = 'C:\\Users\\awavi\\Desktop\\flight-plan\\scripts\\copy-email-logo-result.txt';

try {
  if (!fs.existsSync(src)) {
    throw new Error(`Source not found: ${src}`);
  }
  fs.mkdirSync(path.dirname(dest1), { recursive: true });
  fs.mkdirSync(path.dirname(dest2), { recursive: true });
  fs.copyFileSync(src, dest1);
  fs.copyFileSync(src, dest2);
  const srcLen = fs.statSync(src).size;
  const dest1Len = fs.statSync(dest1).size;
  const dest2Len = fs.statSync(dest2).size;
  const out = [
    'SUCCESS',
    `SOURCE: ${srcLen}`,
    `DEST1: ${dest1Len}`,
    `DEST2: ${dest2Len}`,
  ].join('\n');
  fs.writeFileSync(log, out, 'utf8');
  console.log(out);
} catch (err) {
  const out = `FAILURE\n${err?.stack || err?.message || String(err)}`;
  fs.writeFileSync(log, out, 'utf8');
  console.error(out);
  process.exit(1);
}
