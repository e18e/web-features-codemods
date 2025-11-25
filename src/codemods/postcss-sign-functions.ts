import {parse, Lang, type Edit} from '@ast-grep/napi';
import type {Options, CodeMod} from '../shared.js';
import {
  removeDefaultImportedSymbol,
  createDefaultImportedSymbolRule
} from '../typescript-utils.js';

const IMPORT_PATH = '@csstools/postcss-sign-functions';

export const codemod: CodeMod = {
  test(options: Options): boolean {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    return root.has(createDefaultImportedSymbolRule(IMPORT_PATH));
  },
  apply(options: Options): string {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();
    const edits: Edit[] = [];

    removeDefaultImportedSymbol(IMPORT_PATH, root, edits, {
      pattern: '$NAME($$$_)'
    });

    return root.commitEdits(edits);
  }
};
