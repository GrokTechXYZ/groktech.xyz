import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

// Public HTML stays editable as static files. Discover nested service pages too.
export async function htmlFiles(root, directory = '') {
  const files = [];
  for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['assets', 'scripts', 'node_modules'].includes(entry.name)) continue;
    const name = directory ? `${directory}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await htmlFiles(root, name));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(name);
  }
  return files.sort();
}
