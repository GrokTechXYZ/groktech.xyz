import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
for (const file of ['index.html', '404.html']) {
  let html = await readFile(resolve(root, file), 'utf8');
  const pattern = /\b(href|src)="((?:\/?assets\/[^"?]+\.(?:css|js|svg|png)|favicon\.ico))(?:\?[^\"]*)?"/g;
  for (const match of [...html.matchAll(pattern)]) {
    const digest = createHash('sha256').update(await readFile(resolve(root, match[2].replace(/^\//, '')))).digest('hex').slice(0, 12);
    html = html.replace(match[0], `${match[1]}="${match[2]}?v=${digest}"`);
  }
  await writeFile(resolve(root, file), html);
}
console.log('Versioned HTML references to local visual and runtime assets.');
