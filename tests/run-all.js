/**
 * Test runner entry point — discovers and runs all *.test.js files.
 * Compatible with Node.js ES modules (--experimental-vm-modules not required
 * past Node 18.19+ / 20+).
 */

import { readdir } from 'fs/promises';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { summary } from './runner.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function* findTests(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* findTests(full);
    } else if (entry.isFile() && entry.name.endsWith('.test.js')) {
      yield full;
    }
  }
}

(async () => {
  const files = [];
  for await (const f of findTests(__dirname)) {
    files.push(f);
  }

  for (const file of files.sort()) {
    await import(file);
  }

  summary();
})();
