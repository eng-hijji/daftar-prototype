import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const staticRoot = path.resolve('.next/static');
const buildId = (await readFile('.next/BUILD_ID', 'utf8')).trim();

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(fullPath);
    return [fullPath];
  }));
  return nested.flat();
}

const files = (await listFiles(staticRoot))
  .map((file) => `/_next/static/${path.relative(staticRoot, file).split(path.sep).join('/')}`)
  .sort();

if (files.length === 0) {
  throw new Error('No production Next.js assets found to precache.');
}

await writeFile(
  'public/precache-manifest.json',
  `${JSON.stringify({ buildId, files }, null, 2)}\n`,
  'utf8',
);

console.log(`Generated offline precache manifest for ${files.length} Next.js assets.`);
