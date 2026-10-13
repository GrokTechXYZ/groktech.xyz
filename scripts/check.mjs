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
  assert(!html.includes('\u2014'), `${name}: em dash found in page source`);
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
    const entities = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(([, source]) => {
      const data = JSON.parse(source);
      return data['@graph'] || [data];
    });
    const business = entities.find(entity => entity['@type'] === 'Organization');
    assert(business?.legalName === 'GrokTech LLC' && business?.foundingDate === '2021', 'Business identity or founding year missing');
    assert(business?.email === 'contact@groktech.xyz', 'Business email is stale');
    assert(business?.name === 'GrokTech', 'Public business identity is missing');
  }
}
const page = await readFile(resolve(root, 'index.html'), 'utf8');
const css = await readFile(resolve(root, 'assets/css/site.css'), 'utf8');
for (const match of css.matchAll(/url\((?:"([^"]*)"|'([^']*)'|([^\s)]*))\)/g)) {
  const value = match[1] ?? match[2] ?? match[3];
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
for (const file of ['assets/js/site.js', 'assets/js/experience.js', 'assets/js/sound.js']) {
  const syntax = spawnSync(process.execPath, ['--check', resolve(root, file)], { encoding: 'utf8' });
  assert(syntax.status === 0, syntax.stderr || `${file}: JavaScript syntax check failed`);
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`Site checks passed: ${references} local references, fragments, metadata, contact paths and JavaScript syntax.`);
