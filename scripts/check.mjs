import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
let references = 0;
const assert = (condition, message) => { if (!condition) failures.push(message); };
for (const name of ['index.html', '404.html', 'scripts/social-card.html']) {
  const html = await readFile(resolve(root, name), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert(new Set(ids).size === ids.length, `${name}: duplicate IDs`);
  assert((html.match(/<h1\b/g) || []).length === 1, `${name}: expected one primary heading`);
  assert(!/localhost|127\.0\.0\.1/.test(html), `${name}: local preview URL in production markup`);
  for (const [, attribute, value] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
    if (value.startsWith('#')) {
      assert(ids.includes(value.slice(1)), `${name}: missing anchor ${value}`);
      continue;
    }
    const url = new URL(value, 'https://groktech.xyz/');
    if (url.origin !== 'https://groktech.xyz') continue;
    const path = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    references++;
    try {
      await access(resolve(root, path));
      if (url.searchParams.has('v')) {
        const digest = createHash('sha256').update(await readFile(resolve(root, path))).digest('hex').slice(0, 12);
        assert(url.searchParams.get('v') === digest, `${name}: stale fingerprint for ${path}; run node scripts/version-assets.mjs`);
      }
    } catch { failures.push(`${name}: missing ${attribute} target ${path}`); }
  }
  for (const [, labels] of html.matchAll(/aria-labelledby="([^"]+)"/g)) {
    for (const id of labels.split(/\s+/)) assert(ids.includes(id), `${name}: missing label ${id}`);
  }
  if (name === 'index.html') {
    assert(/href="https:\/\/calendly\.com\/groktech"/.test(html), 'Booking destination missing');
    assert(/href="mailto:contact@groktech\.xyz"/.test(html), 'Email destination missing');
    assert(/rel="canonical" href="https:\/\/groktech\.xyz\/"/.test(html), 'Canonical URL missing');
    for (const service of ['people', 'programming', 'automation', 'operations', 'networking', 'infrastructure', 'cloud']) {
      assert(ids.includes(`service-${service}`), `Missing service: ${service}`);
    }
    for (const [, source] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      const data = JSON.parse(source);
      assert(data.name === 'GrokTech LLC' && data.foundingDate === '2021', 'Business metadata changed');
    }
  }
}
const page = await readFile(resolve(root, 'index.html'), 'utf8');
const css = await readFile(resolve(root, 'assets/css/site.css'), 'utf8');
for (const [, value] of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) {
  if (value.startsWith('data:')) continue;
  if (value.startsWith('#')) {
    assert(page.includes(`id="${value.slice(1)}"`), `Stylesheet: missing SVG paint target ${value}`);
    continue;
  }
  references++;
  try { await access(resolve(root, 'assets/css', value.split('?')[0])); }
  catch { failures.push(`Stylesheet: missing asset ${value}`); }
}
assert((await readFile(resolve(root, 'CNAME'), 'utf8')).trim() === 'groktech.xyz', 'Custom domain changed');
assert((await readFile(resolve(root, 'sitemap.xml'), 'utf8')).includes('<loc>https://groktech.xyz/</loc>'), 'Homepage missing from sitemap');
const syntax = spawnSync(process.execPath, ['--check', resolve(root, 'assets/js/site.js')], { encoding: 'utf8' });
assert(syntax.status === 0, syntax.stderr || 'JavaScript syntax check failed');
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`Site checks passed: ${references} local references, fragments, metadata, contact paths and JavaScript syntax.`);
