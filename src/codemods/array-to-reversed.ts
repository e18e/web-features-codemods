import {parse, Lang, type Edit, type NapiConfig} from '@ast-grep/napi';
import type {Options, CodeMod} from '../shared.js';

const arrayToReversedRule: NapiConfig = {
  rule: {
    any: [
      {
        pattern: '$ARRAY.concat().reverse()'
      },
      {
        pattern: '$ARRAY.slice().reverse()'
      },
      {
        pattern: '$ARRAY.slice(0).reverse()'
      },
      {
        pattern: '[...$ARRAY].reverse()'
      }
    ]
  }
};

export const codemod: CodeMod = {
  test(options: Options): boolean {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    return root.has(arrayToReversedRule);
  },
  apply(options: Options): string {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    const nodes = root.findAll(arrayToReversedRule);
    const edits: Edit[] = [];

    for (const node of nodes) {
      const array = node.getMatch('ARRAY');
      if (array) {
        const edit = node.replace(`${array.text()}.toReversed()`);
        edits.push(edit);
      }
    }

    return root.commitEdits(edits);
  }
};
