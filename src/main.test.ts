import {describe, it, expect} from 'vitest';
import * as codemods from './main.js';
import {readdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('main', () => {
  it('should export all codemods from src/codemods', () => {
    const codemodFiles = readdirSync(join(__dirname, 'codemods')).filter(
      (file) => file.endsWith('.ts') && !file.endsWith('.test.ts')
    );

    const expectedCodemods = codemodFiles.map((file) => {
      const name = file.replace('.ts', '');
      return name
        .split('-')
        .map((part, index) =>
          index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
        )
        .join('');
    });

    for (const codemod of expectedCodemods) {
      expect(codemods).toHaveProperty(codemod);
      const codemodObj = codemods[codemod as keyof typeof codemods];
      expect(typeof codemodObj).toBe('object');
      expect(typeof codemodObj.test).toBe('function');
      expect(typeof codemodObj.apply).toBe('function');
    }
  });
});
