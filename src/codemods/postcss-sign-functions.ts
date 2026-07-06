import {parse, Lang, type Edit} from '@ast-grep/napi';
import type {Options, CodeMod, TestResult} from '../shared.js';
import {
  removeDefaultImportedSymbol,
  createDefaultImportedSymbolRule,
  getRangeForNode
} from '../typescript-utils.js';

const IMPORT_PATH = '@csstools/postcss-sign-functions';

export const codemod: CodeMod = {
  test(options: Options): TestResult {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    const node = root.find(createDefaultImportedSymbolRule(IMPORT_PATH));
    return node
      ? {hasMatch: true, range: getRangeForNode(node)}
      : {hasMatch: false};
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
