import { readFile, access, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { htmlFiles } from './html-files.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://groktech.xyz';
const failures = [];
let references = 0;
const assert = (condition, message) => { if (!condition) failures.push(message); };
const publicFiles = await htmlFiles(root);
const pages = new Map(await Promise.all([...publicFiles, 'scripts/social-card.html'].map(async name => [name, await readFile(resolve(root, name), 'utf8')])));
const pageUrl = name => origin + '/' + name.replace(/(^|\/)index\.html$/, '$1');
const localFile = pathname => decodeURIComponent(pathname.slice(1)) + (pathname.endsWith('/') ? 'index.html' : '');
const idsIn = html => [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const titles = new Set();
const descriptions = new Set();
const sitemap = await readFile(resolve(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert(new Set(sitemapUrls).size === sitemapUrls.length, 'Duplicate sitemap entries');
for (const url of sitemapUrls) {
  assert(url.startsWith(origin + '/'), `Unexpected sitemap origin: ${url}`);
  assert(pages.has(localFile(new URL(url).pathname)), `Sitemap target missing: ${url}`);
}
for (const [name, html] of pages) {
  const url = pageUrl(name);
  const ids = idsIn(html);
  assert(!html.includes('\u2014'), `${name}: em dash found in page source`);
  assert(new Set(ids).size === ids.length, `${name}: duplicate IDs`);
  assert((html.match(/<h1\b/g) || []).length === 1, `${name}: expected one primary heading`);
  assert(!/localhost|127\.0\.0\.1/.test(html), `${name}: local preview URL in production markup`);
  for (const [, attribute, value] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
    const target = new URL(value.replaceAll('&amp;', '&'), url);
    if (target.origin !== origin) continue;
    const path = localFile(target.pathname);
    references++;
    try {
      await access(resolve(root, path));
      if (target.hash) {
        const targetHtml = pages.get(path);
        assert(targetHtml && idsIn(targetHtml).includes(decodeURIComponent(target.hash.slice(1))), `${name}: missing anchor ${value}`);
      }
      if (target.searchParams.has('v')) {
        const digest = createHash('sha256').update(await readFile(resolve(root, path))).digest('hex').slice(0, 12);
        assert(target.searchParams.get('v') === digest, `${name}: stale fingerprint for ${path}; run node scripts/version-assets.mjs`);
      }
    } catch { failures.push(`${name}: missing ${attribute} target ${path}`); }
  }
  for (const [, labels] of html.matchAll(/aria-labelledby="([^"]+)"/g)) {
    for (const id of labels.split(/\s+/)) assert(ids.includes(id), `${name}: missing label ${id}`);
  }
  if (name === '404.html' || name.startsWith('scripts/')) continue;
  assert(/href="https:\/\/calendly\.com\/groktech"/.test(html), `${name}: booking destination missing`);
  assert(/href="mailto:contact@groktech\.xyz"/.test(html), `${name}: email destination missing`);
  assert(html.includes(`rel="canonical" href="${url}"`), `${name}: self-referencing canonical URL missing`);
  assert(html.includes(`property="og:url" content="${url}"`), `${name}: share URL does not match canonical`);
  assert(!/<meta\b[^>]*content="[^"]*noindex/i.test(html), `${name}: public page marked noindex`);
  assert(sitemapUrls.includes(url), `${name}: missing from sitemap`);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert(title && !titles.has(title), `${name}: missing or duplicate title`);
  assert(description && !descriptions.has(description), `${name}: missing or duplicate description`);
  titles.add(title); descriptions.add(description);
  try {
    const entities = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(([, source]) => {
      const data = JSON.parse(source);
      assert(data['@context'] === 'https://schema.org', `${name}: invalid schema context`);
      return data['@graph'] || [data];
    });
    const business = entities.find(entity => entity['@type'] === 'Organization');
    assert(business?.legalName === 'GrokTech LLC' && business?.foundingDate === '2021', `${name}: business identity or founding year missing`);
    assert(business?.email === 'contact@groktech.xyz', `${name}: business email is stale`);
    assert(business?.name === 'GrokTech', `${name}: public business identity missing`);
    const webPage = entities.find(entity => entity['@type'] === 'WebPage');
    assert(webPage?.url === url, `${name}: structured page URL does not match canonical`);
    if (name !== 'index.html') {
      const breadcrumb = entities.find(entity => entity['@type'] === 'BreadcrumbList');
      assert(breadcrumb?.itemListElement?.at(-1)?.item === url, `${name}: breadcrumb destination mismatch`);
      const service = entities.find(entity => entity['@type'] === 'Service');
      assert(service?.url === url && service?.provider?.['@id'] === business?.['@id'], `${name}: service identity mismatch`);
    }
  } catch (error) { failures.push(`${name}: invalid structured data: ${error.message}`); }
}
const page = pages.get('index.html');
for (const service of ['people', 'programming', 'automation', 'operations', 'networking', 'infrastructure', 'cloud']) {
  assert(idsIn(page).includes(`service-${service}`), `Missing service: ${service}`);
}
for (const file of (await readdir(resolve(root, 'assets/css'))).filter(file => file.endsWith('.css'))) {
  const css = await readFile(resolve(root, 'assets/css', file), 'utf8');
  for (const match of css.matchAll(/url\((?:"([^"]*)"|'([^']*)'|([^\s)]*))\)/g)) {
    const value = match[1] ?? match[2] ?? match[3];
    if (value.startsWith('data:')) continue;
    if (value.startsWith('#')) { assert(page.includes(`id="${value.slice(1)}"`), `${file}: missing SVG paint target ${value}`); continue; }
    references++;
    try { await access(resolve(root, 'assets/css', value.split('?')[0])); }
    catch { failures.push(`${file}: missing asset ${value}`); }
  }
}
assert((await readFile(resolve(root, 'CNAME'), 'utf8')).trim() === 'groktech.xyz', 'Custom domain changed');
assert((await readFile(resolve(root, 'robots.txt'), 'utf8')).includes(`Sitemap: ${origin}/sitemap.xml`), 'Robots sitemap reference missing');
for (const file of ['assets/js/site.js', 'assets/js/experience.js', 'assets/js/sound.js', 'assets/js/chat.js', 'scripts/version-assets.mjs', 'scripts/html-files.mjs']) {
  const syntax = spawnSync(process.execPath, ['--check', resolve(root, file)], { encoding: 'utf8' });
  assert(syntax.status === 0, syntax.stderr || `${file}: JavaScript syntax check failed`);
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`Site checks passed: ${publicFiles.length} public HTML files, ${references} local references, cross-page fragments, unique metadata, structured data, sitemap coverage, contact paths and JavaScript syntax.`);
