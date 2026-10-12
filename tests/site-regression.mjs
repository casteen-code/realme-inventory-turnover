import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import { join, posix } from 'node:path';
import { root, output, publicationFiles } from '../sites-build.mjs';

async function files(directory, prefix = '') {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = prefix + entry.name;
    assert.equal(entry.isSymbolicLink(), false, `Published symlink: ${name}`);
    if (entry.isDirectory()) result.push(...await files(join(directory, entry.name), name + '/'));
    else result.push(name);
  }
  return result.sort();
}

const expected = [...publicationFiles.map(([, target]) => target), '.nojekyll', 'deployment.json'].sort();
assert.deepEqual(await files(output), expected, 'Only the explicit publication allowlist may reach the website');
const manifest = JSON.parse(await readFile(join(output, 'deployment.json'), 'utf8'));
assert.equal(manifest.application, 'realme-inventory-turnover');
assert.equal(manifest.applicationVersion, JSON.parse(await readFile(join(root, 'package.json'), 'utf8')).version);
assert.deepEqual(Object.keys(manifest.files).sort(), publicationFiles.map(([, target]) => target).sort());
for (const [source, target] of publicationFiles) {
  const built = await readFile(join(output, target));
  assert.deepEqual(built, await readFile(join(root, source)), `Build changed ${source}`);
  assert.equal(createHash('sha256').update(built).digest('hex'), manifest.files[target], `Invalid digest: ${target}`);
}
for (const entry of ['index.html', 'inventory-turnover.html']) {
  const html = await readFile(join(output, entry), 'utf8');
  assert.match(html, /库存周转管理/);
  assert.doesNotMatch(html, /dashboard\.enc\.json|tiktok-dashboard|campaign-motion-studio/);
  const resources = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(match => match[1]);
  assert.equal(resources.filter(resource => resource.split('?')[0].endsWith('.js')).length, 3);
  for (const resource of resources) {
    assert.doesNotMatch(resource, /^(?:https?:)?\/\//, 'The tool must load its dependencies locally');
    const clean = resource.split(/[?#]/)[0];
    if (!clean) continue;
    const normalized = posix.normalize(clean);
    assert.ok(!normalized.startsWith('../') && !normalized.startsWith('/'), `Escaping resource: ${resource}`);
    assert.equal((await lstat(join(output, normalized))).isFile(), true, `Missing ${resource}`);
  }
}
const app = await readFile(join(output, 'inventory-turnover.js'), 'utf8');
assert.match(app, /turnover\.v3\.\$\{name\}/, 'Keep existing localStorage keys on migration');
assert.match(app, /indexedDB\.open\('realme-turnover-stable-v1', 1\)/, 'Keep existing browser database and schema');
assert.match(app, new RegExp(`APP_VERSION = 'v${manifest.applicationVersion.replaceAll('.', '\\.')}';`));
const workflows = (await readdir(join(root, '.github/workflows'))).filter(name => /\.ya?ml$/.test(name));
assert.deepEqual(workflows, ['pages.yml'], 'Exactly one repository workflow controls publishing');
console.log(`Site regression passed: ${expected.length} allowlisted files, two entry points, local resources, checksums and preserved browser storage`);
