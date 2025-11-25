import {parse, Lang, type Edit} from '@ast-grep/napi';
import type {Options} from '../shared.js';
import {removeDefaultImportedSymbol} from '../typescript-utils.js';

export function apply(options: Options): string {
  const ast = parse(Lang.TypeScript, options.source);
  const root = ast.root();
  const edits: Edit[] = [];

  removeDefaultImportedSymbol('@csstools/postcss-sign-functions', root, edits, {
    pattern: '$NAME($$$_)'
  });

  return root.commitEdits(edits);
}
