import { copyFile, lstat, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = dirname(fileURLToPath(import.meta.url));
export const output = join(root, 'dist', 'client');

// Deliberate file-by-file publication. No source directory or private report is copied.
export const publicationFiles = [
  ['inventory-turnover.html', 'index.html'],
  ['inventory-turnover.html', 'inventory-turnover.html'],
  ['inventory-turnover.js', 'inventory-turnover.js'],
  ['sku-core.js', 'sku-core.js'],
  ['vendor/xlsx.full.min.js', 'vendor/xlsx.full.min.js'],
  ['THIRD_PARTY_NOTICES.md', 'THIRD_PARTY_NOTICES.md'],
  ['examples/stock-mks.csv', 'examples/stock-mks.csv'],
  ['examples/stock-pnk.csv', 'examples/stock-pnk.csv'],
  ['examples/stock-bali.csv', 'examples/stock-bali.csv'],
  ['examples/sales-shopee.csv', 'examples/sales-shopee.csv'],
  ['examples/sales-tiktok.csv', 'examples/sales-tiktok.csv']
];

export async function build() {
  // Refuse a symlinked output path before removing generated files.
  for (const directory of [join(root, 'dist'), output]) {
    const info = await lstat(directory).catch(error => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    if (info && (!info.isDirectory() || info.isSymbolicLink())) throw new Error(`Unsafe build directory: ${directory}`);
  }
  for (const [source] of publicationFiles) {
    const info = await lstat(join(root, source));
    if (!info.isFile() || info.isSymbolicLink()) throw new Error(`Only regular source files may be published: ${source}`);
  }
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  const hashes = {};
  for (const [source, target] of publicationFiles) {
    await mkdir(dirname(join(output, target)), { recursive: true });
    await copyFile(join(root, source), join(output, target));
    hashes[target] = createHash('sha256').update(await readFile(join(output, target))).digest('hex');
  }
  await writeFile(join(output, '.nojekyll'), '');
  const { version } = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  await writeFile(join(output, 'deployment.json'), JSON.stringify({
    schemaVersion: 1,
    application: 'realme-inventory-turnover',
    applicationVersion: version,
    commit: process.env.GITHUB_SHA || 'local-preview',
    files: hashes
  }, null, 2) + '\n');
  console.log(`Built ${publicationFiles.length + 2} approved files in dist/client`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
